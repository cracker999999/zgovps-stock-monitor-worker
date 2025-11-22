# ZgoCloud VPS 库存监控脚本

这是一个运行在 Cloudflare Workers 上的脚本，用于监控 ZgoCloud 指定 VPS 的库存状态，并在有货时通过 Telegram 发送通知。

## 准备工作

1.  **Telegram Bot**:
    *   在 Telegram 中搜索 `@BotFather`。
    *   发送 `/newbot` 创建一个新机器人。
    *   记录下 `HTTP API Token` (例如: `123456789:ABCdef...`)。

2.  **Telegram Chat ID**:
    *   给你的机器人发送一条消息。
    *   访问 `https://api.telegram.org/bot<YOUR_BOT_TOKEN>/getUpdates`。
    *   找到 `result` -> `message` -> `chat` -> `id` (例如: `123456789`)。

3.  **Cloudflare 账号**:
    *   注册并登录 Cloudflare。

## 部署方法

### 方法一：使用本地 Wrangler (推荐)

我们已经在当前目录下安装了本地 Wrangler，无需全局安装。

1.  安装依赖 (如果尚未安装):
    ```bash
    npm install
    ```

2.  初始化:
    ```bash
    npm init -y
    ```

3.  本地安装 Wrangler:
    ```bash
    npm install -D wrangler
    ```

4.  登录 Cloudflare:
    ```bash
    npx wrangler login
    ```

5.  部署 Worker:
    ```bash
    npx wrangler deploy
    ```

6.  设置环境变量 (替换为你自己的 Token 和 ID):
    ```bash
    npx wrangler secret put TELEGRAM_BOT_TOKEN
    # 输入你的 Bot Token
    npx wrangler secret put TELEGRAM_CHAT_ID
    # 输入你的 Chat ID
    ```

### 方法二：直接在 Cloudflare Dashboard 创建

1.  登录 Cloudflare Dashboard，进入 **Workers & Pages**。
2.  点击 **Create Application** -> **Create Worker**。
3.  命名为 `zgovps-stock-monitor` (或任意名称)，点击 **Deploy**。
4.  点击 **Edit code**。
5.  将 `worker.js` 的内容复制粘贴到编辑器中，覆盖原有代码。
6.  点击 **Save and deploy**。
7.  返回 Worker 的设置页面，点击 **Settings** -> **Variables**。
8.  添加两个环境变量：
    *   `TELEGRAM_BOT_TOKEN`: 你的 Bot Token
    *   `TELEGRAM_CHAT_ID`: 你的 Chat ID
    *   建议点击 "Encrypt" 按钮加密存储。
9.  点击 **Triggers** -> **Cron Triggers** -> **Add Cron Trigger**。
10. 设置频率为 `* * * * *` (每分钟一次)，点击 **Add Trigger**。

## 测试

你可以直接访问 Worker 的 URL (例如 `https://zgovps-stock-monitor.your-subdomain.workers.dev`) 来手动触发检查。如果显示 "Out of Stock." 说明脚本运行正常但当前无货。

## 注意事项

*   Cloudflare Workers 免费版每天有 100,000 次请求限制，每分钟一次的频率每天消耗 1440 次，完全够用。
*   脚本逻辑是检查页面源码中是否包含 "currently unavailable" 或 "Out of Stock"。
