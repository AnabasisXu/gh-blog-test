# gh-blog-test

徐振旭的个人博客，Jekyll + GitHub Pages 构建。

- 站点地址：https://anabasisxu.github.io/gh-blog-test/
- 新文章：在 `_posts/` 下创建 `YYYY-MM-DD-slug.md`，front matter 写 `title`、`date`、`description`、`tags`，推送到 `main`。
- 搜索索引：`search.json` 由 Liquid 在构建时生成，前端脚本在 `assets/js/search.js`。
- 标签页：`tags.md`，按 `site.tags` 自动分组。
- RSS：`feed.xml`；站点地图：`sitemap.xml`。
- 本地没有 Ruby，构建由 GitHub Pages 完成。
