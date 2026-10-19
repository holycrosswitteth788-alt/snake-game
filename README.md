# 贪吃蛇在线玩

纯静态网页版贪吃蛇小游戏，无框架、无外部依赖、单页加载。

## 本地预览

直接双击 `index.html` 即可，或在项目目录启动一个静态服务器：

```bash
python -m http.server 8000
```

然后访问 http://localhost:8000/

## 部署到 GitHub Pages

1. 在 GitHub 新建仓库，仓库名必须为 `snake-game`（与 URL 对应）
2. 推送代码：

```bash
git init
git add .
git commit -m "feat: 贪吃蛇小游戏"
git branch -M main
git remote add origin https://github.com/holycrosswitteth788-alt/snake-game.git
git push -u origin main
```

3. 仓库 Settings → Pages → Source 选 `Deploy from a branch` → Branch 选 `main` / `root` → Save
4. 等 1-2 分钟，访问 `https://holycrosswitteth788-alt.github.io/snake-game/`

## 上线后必做的 SEO 动作

| 步骤 | 位置 | 说明 |
| --- | --- | --- |
| 提交 sitemap | Google Search Console | 添加资源 → 网址前缀 `https://holycrosswitteth788-alt.github.io/snake-game/` → 提交 sitemap.xml |
| 提交 sitemap | Bing Webmaster Tools | 可从 GSC 直接导入 |
| 提交网址 | 百度搜索资源平台 | 需先验证站点归属（推荐 CNAME 或 HTML 标签验证） |
| 验证 robots | 各平台 robots 测试工具 | 确认未误拦截 |

## 站点地址

- 线上地址：https://holycrosswitteth788-alt.github.io/snake-game/
- 代码仓库：https://github.com/holycrosswitteth788-alt/snake-game

若以后修改 GitHub 用户名或仓库名，需同步更新三处：`index.html` 的 canonical / og:url / JSON-LD 的 url、`robots.txt` 的 Sitemap 行、`sitemap.xml` 的 `<loc>`。

## 文件说明

```
index.html              页面结构 + 正文内容 + 结构化数据
assets/style.css        霓虹暗黑主题样式
assets/game.js          游戏逻辑（键盘 / 触屏按钮 / 滑动三种操作）
favicon.svg             站点图标
manifest.webmanifest    PWA 配置，支持添加到主屏幕
robots.txt              爬虫规则
sitemap.xml             站点地图
404.html                404 页面
```
