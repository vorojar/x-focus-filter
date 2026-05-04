# Changelog

## [1.5.0] - 2026-05-04

### Added
- **帖子内容复制按钮** — 操作栏新增复制按钮（与回复、转帖、喜欢、书签同行），点击复制用户名、正文和卡片链接

### Changed
- **Badge 重构为极简角标** — 从大胶囊改为小圆点 + 数字角标，点击切换开关，大幅减少占用空间

## [1.4.0] - 2026-04-11

### Added
- **移动端触屏拖动** — 浮动指示器支持 touchstart/touchmove/touchend，手机端可拖动
- **移动端下载按钮常驻** — 触屏设备上视频/图片下载按钮始终可见（`@media (hover: none)`）

### Changed
- 拖动逻辑重构为 onDragStart/onDragMove/onDragEnd 公共函数，鼠标和触屏复用
- 更新商店描述，涵盖视频/图片下载和移动端支持
- Version bumped to 1.4.0

## [1.3.0] - 2026-04-05

### Added
- **视频下载按钮** — 视频右下角悬停显示下载按钮，点击直接下载最高画质 mp4
- **图片下载按钮** — 图片右下角悬停显示下载按钮，自动获取原图质量（`name=orig`）
- 通过拦截 Twitter API 响应自动捕获视频 URL，支持时间线和推文详情页
- 多图推文支持逐张下载，文件名自动编号
- 下载状态反馈：加载动画 + 完成提示

### Changed
- `host_permissions` 新增 `video.twimg.com` 和 `pbs.twimg.com`
- Version bumped to 1.3.0

## [1.2.0] - 2026-03-22

### Added
- **Options page** — full settings page with built-in category keyword viewer, custom category CRUD, import/export
- **Custom categories** — create your own keyword groups to extend filtering
- **Keyword visibility** — view all keywords in each built-in category (read-only, expandable)
- **Import/Export** — backup and restore config as JSON file
- **Floating badge toggle** — show/hide the status badge from options page
- **Ad filtering** — automatically detect and hide promoted/ad tweets
- **Hide reason display** — peek mode now shows why each tweet was hidden (e.g. "blacklist: nsfw", "no match")
- **Gear icon** in popup header to open options page

### Changed
- `shouldShowTweet` now returns reason info for better debugging
- Popup `doSave` preserves options page settings (showBadge, filterAds, customCategories)
- Version bumped to 1.2.0
