# Manus 复刻（前端原型）- v0.1 Beta

这是一个轻量级的 **Manus 风格工作台** 原型，聚焦以下体验：

- 左侧任务列表（待办 / 进行中 / 已完成）
- 全球大模型厂商清单（可视化展示多家模型能力）
- Skills 能力标签（展示可编排能力模块）
- 通讯平台连接（Slack / Discord / Teams / Telegram / WhatsApp / 飞书 / 钉钉）
- Google 账号接入（前端模拟 OAuth 接入状态）
- 中间 AI 对话区 + 右侧执行日志（模拟自动化执行轨迹）

> 说明：这是 UI/交互原型，不连接真实模型与外部工具。

## 发布信息

- 当前发布：`v0.1 Beta`（测试版）
- 发布日期：2026-04-08
- 发布范围：前端静态原型（无后端依赖）

## 本地运行

```bash
python3 -m http.server 8080
```

然后访问：

- <http://localhost:8080>

## 目录结构

- `index.html`：页面骨架（任务、厂商、skills、平台、账号状态）
- `styles.css`：界面样式
- `app.js`：交互逻辑（任务状态、聊天、日志、平台连接、Google接入）

## 可继续扩展

- 接入真实 LLM API，并按任务动态路由模型
- 将平台连接改为真实 Webhook / Bot Token 配置
- 使用 Google OAuth 2.0 完成真实登录与授权
- 增加多 Agent 协作视图与执行回放
