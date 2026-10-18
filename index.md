---
layout: default
title: 首页
description: 记录软件设计、翻译与技术写作。
---
<section class="page-intro">
  <h1>文章</h1>
  <p>我是徐振旭，译者、技术文档工程师。这里记录软件设计、翻译和技术写作。可以先看<a href="{{ '/about/' | relative_url }}">关于我</a>。</p>
</section>

{% if site.posts.size > 0 %}
<ul class="post-list">
  {% for post in site.posts %}
  <li class="post-card">
    <div class="post-card-head">
      <h2><a href="{{ post.url | relative_url }}">{{ post.title }}</a></h2>
      <time datetime="{{ post.date | date_to_xmlschema }}">{{ post.date | date: "%Y-%m-%d" }}</time>
    </div>
    {% if post.description %}
    <p class="post-excerpt">{{ post.description }}</p>
    {% elsif post.excerpt %}
    <p class="post-excerpt">{{ post.excerpt | strip_html | normalize_whitespace | truncate: 140 }}</p>
    {% endif %}
    {% if post.tags.size > 0 %}
    <div class="tags">
      {% for tag in post.tags %}
      <a class="tag" href="{{ '/tags/' | relative_url }}#{{ tag | replace: ' ', '-' }}">{{ tag }}</a>
      {% endfor %}
    </div>
    {% endif %}
  </li>
  {% endfor %}
</ul>
{% else %}
<p>还没有文章。</p>
{% endif %}
