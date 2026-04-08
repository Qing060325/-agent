# Changelog

## v0.1-beta - 2026-04-08

### Added
- Manus 风格三栏工作台（任务 / 对话 / 执行日志）
- 全球大模型厂商清单与模型信息展示
- Skills 能力标签展示
- 多通讯平台连接模拟（Slack、Discord、Teams、Telegram、WhatsApp、飞书、钉钉）
- Google 账号接入（前端模拟 OAuth）
- 发布标识与版本展示（v0.1 Beta）

### Changed
- 渲染任务/厂商/技能/平台列表时使用 `DocumentFragment`，减少多次 DOM 重排
- 日志与消息增加条目上限，避免长时间使用导致页面节点持续膨胀
- 统一时间格式化器，减少重复创建本地化时间字符串的开销
