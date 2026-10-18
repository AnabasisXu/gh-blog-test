---
layout: default
title: 搜索
permalink: /search/
description: 搜索文章标题、标签和正文。
---
<section class="page-intro">
  <h1>搜索</h1>
  <p>输入关键词，匹配标题、标签和正文。多个关键词用空格分开。</p>
</section>

<form class="search-form" role="search" onsubmit="return false;">
  <label class="visually-hidden" for="search-input">搜索文章</label>
  <input
    id="search-input"
    type="search"
    placeholder="例如：Taskwarrior、翻译、Jekyll"
    autocomplete="off"
    autofocus
    data-index="{{ '/search.json' | relative_url }}">
</form>

<p id="search-status" class="search-status">正在加载搜索索引…</p>
<ul id="search-results" class="post-list search-results"></ul>

<script src="{{ '/assets/js/search.js' | relative_url }}" defer></script>
