---
layout: post
title: 第一篇文章：GitHub Pages 博客已跑通
date: 2026-10-18 21:30:00 +0800
description: GitHub Pages + Jekyll 的最小博客已经跑通，记录创建过程、验证结果和后续写作方式。
tags: ["GitHub Pages", "Jekyll", "博客"]
---
这是一篇用来验证整条链路的测试文章。页面由 GitHub Pages 内置的 Jekyll 构建，仓库里只有 Markdown、布局模板和一份 CSS。

## 验证点

- Markdown 渲染正常
- 文章列表出现在首页
- 中文内容、日期、代码块显示正常

```bash
git clone https://github.com/AnabasisXu/gh-blog-test.git
cd gh-blog-test
```

后续新增文章只需要在 `_posts/` 下按 `YYYY-MM-DD-标题.md` 命名，推送到 `main` 分支，GitHub 会自动重新构建。
