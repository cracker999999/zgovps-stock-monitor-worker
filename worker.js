export default {
  async scheduled(event, env, ctx) {
    await checkStock(env);
  },
  async fetch(request, env, ctx) {
    return await checkStock(env);
  }
};

async function checkStock(env) {
  const url = "https://clients.zgovps.com/?cmd=cart&action=add&affid=153&id=53";
  const headers = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
  };

  console.log(`[${new Date().toISOString()}] Checking stock for URL: ${url}`);

  try {
    const response = await fetch(url, { headers });
    const text = await response.text();

    console.log("Page content received. Length:", text.length);

    // Extract errors variable for better logging
    const errorMatch = text.match(/var errors = (\[.*?\]);/);
    if (errorMatch) {
      console.log("Errors found on page:", errorMatch[1]);
    } else {
      console.log("No 'var errors' found on page.");
    }

    // Specific check for Starter plan
    // We look for the specific phrase indicating the Starter plan is unavailable.
    const isStarterOOS = text.includes("Starter plan is currently unavailable");

    if (isStarterOOS) {
      console.log("Status: Starter plan is Out of Stock.");
      return new Response("Starter plan is Out of Stock.", { status: 200 });
    } else {
      // Double check: if we see "currently unavailable" but NOT Starter plan, it might be Standard plan or something else.
      if (text.includes("currently unavailable")) {
        console.log("Status: 'currently unavailable' found, but NOT for Starter plan. Assuming In Stock for Starter.");
      }
      
      console.log("Status: Starter plan appears to be In Stock!");
      await sendTelegramNotification(env, "🚨 ZgoCloud VPS 库存监控 \n\n检测到 Starter Plan 可能有货! \n直达链接: " + url);
      return new Response("In Stock! Notification sent.", { status: 200 });
    }
  } catch (error) {
    console.error("Error checking stock:", error);
    return new Response("Error checking stock: " + error.message, { status: 500 });
  }
}

async function sendTelegramNotification(env, message) {
  const botToken = env.TELEGRAM_BOT_TOKEN;
  const chatId = env.TELEGRAM_CHAT_ID;

  if (!botToken || !chatId) {
    console.log("Telegram Bot Token or Chat ID not set.");
    return;
  }

  const url = `https://api.telegram.org/bot${botToken}/sendMessage`;
  const body = {
    chat_id: chatId,
    text: message
  };

  try {
    const resp = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    });
    const respText = await resp.text();
    console.log("Telegram response:", respText);
  } catch (e) {
    console.error("Failed to send Telegram message:", e);
  }
}
