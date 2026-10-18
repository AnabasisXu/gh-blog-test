---
layout: default
title: 标签
permalink: /tags/
description: 按标签浏览文章。
---
<section class="page-intro">
  <h1>标签</h1>
  <p>同一个标签下的文章放在一起。</p>
</section>

{% if site.tags.size > 0 %}
{% assign sorted_tags = site.tags | sort %}
<div class="tag-cloud">
  {% for tag in sorted_tags %}
  {% assign tag_name = tag[0] %}
  {% assign tag_posts = tag[1] %}
  <a class="tag tag-cloud-item" href="#{{ tag_name | replace: ' ', '-' }}">{{ tag_name }} <span class="tag-count">{{ tag_posts.size }}</span></a>
  {% endfor %}
</div>

{% for tag in sorted_tags %}
{% assign tag_name = tag[0] %}
{% assign tag_posts = tag[1] %}
<section class="tag-section" id="{{ tag_name | replace: ' ', '-' }}">
  <h2>{{ tag_name }}</h2>
  <ul class="post-list compact">
    {% for post in tag_posts %}
    <li class="post-card">
      <div class="post-card-head">
        <h3><a href="{{ post.url | relative_url }}">{{ post.title }}</a></h3>
        <time datetime="{{ post.date | date_to_xmlschema }}">{{ post.date | date: "%Y-%m-%d" }}</time>
      </div>
    </li>
    {% endfor %}
  </ul>
</section>
{% endfor %}
{% else %}
<p>还没有标签。</p>
{% endif %}
