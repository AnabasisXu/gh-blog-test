# 徐振旭的博客

个人博客，Astro + [AstroPaper](https://github.com/satnaing/astro-paper) 主题。

- 站点地址：https://anabasisxu.github.io/gh-blog-test/
- 文章目录：`src/content/posts/`
- 站点信息：`astro-paper.config.ts`（标题、作者、社交链接、分页）
- 界面文案：`src/i18n/lang/zh-CN.ts`
- 关于页：`src/content/pages/about.md`

## 本地构建

需要 Node 24 或更高版本。

```bash
npm ci
npm run build   # 输出到 dist/
npm run preview # 本地预览 dist/
npm run dev     # 热重载开发
```

`npm run build` 依次执行类型检查、Astro 构建、Pagefind 搜索索引和索引拷贝。

## 写作

新文章放在 `src/content/posts/` 下，文件名就是 URL 里的 slug。front matter：

```yaml
---
title: "文章标题"
author: 徐振旭
pubDatetime: 2026-11-08T10:00:00+08:00
featured: false
draft: false
tags:
  - 标签
description: "一句话摘要"
---
```

写作和发布用 fish 函数 `blog` 封装，函数文件：

/root/.config/fish/functions/blog.fish

- `blog new "标题" --slug english-slug --tags "标签1,标签2" --desc "摘要"`
- `blog ls`、`blog show`、`blog edit`、`blog rm`
- `blog check` 校验 front matter 和日期
- `blog publish` 提交并推送 `main`，由 GitHub Actions 构建部署

## 部署

推送到 `main` 触发 `.github/workflows/deploy.yml`：`npm ci` → `npm run build` → 上传 `dist/` 到 GitHub Pages。

站点发布在子路径 `/gh-blog-test/`，对应 `astro.config.ts` 里的 `base`。

## 许可

主题来自 AstroPaper（MIT），见 `LICENSE`。
