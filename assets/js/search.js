(function () {
  const input = document.getElementById('search-input');
  if (!input) return;

  const status = document.getElementById('search-status');
  const results = document.getElementById('search-results');
  const indexUrl = input.dataset.index;
  let posts = [];
  let ready = false;

  function escapeHtml(value) {
    return String(value == null ? '' : value).replace(/[&<>"']/g, function (ch) {
      return {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
      }[ch];
    });
  }

  function normalize(value) {
    return String(value == null ? '' : value).toLowerCase();
  }

  function render() {
    const query = input.value.trim();

    if (!query) {
      results.innerHTML = '';
      status.textContent = ready ? '输入关键词开始搜索。' : '正在加载搜索索引…';
      return;
    }

    if (!ready) {
      status.textContent = '正在加载搜索索引…';
      return;
    }

    const terms = normalize(query).split(/\s+/).filter(Boolean);
    const matched = posts.filter(function (post) {
      const haystack = normalize([
        post.title,
        post.description,
        (post.tags || []).join(' '),
        post.content
      ].join(' '));
      return terms.every(function (term) {
        return haystack.indexOf(term) !== -1;
      });
    });

    if (matched.length === 0) {
      results.innerHTML = '';
      status.textContent = '没有找到与“' + query + '”匹配的文章。';
      return;
    }

    status.textContent = '找到 ' + matched.length + ' 篇文章。';
    results.innerHTML = matched.map(function (post) {
      const tags = (post.tags || []).map(function (tag) {
        return '<span class="tag">' + escapeHtml(tag) + '</span>';
      }).join('');
      return [
        '<li class="post-card">',
        '  <div class="post-card-head">',
        '    <h2><a href="' + escapeHtml(post.url) + '">' + escapeHtml(post.title) + '</a></h2>',
        '    <time>' + escapeHtml(post.date) + '</time>',
        '  </div>',
        '  <p class="post-excerpt">' + escapeHtml(post.summary) + '</p>',
        tags ? '  <div class="tags">' + tags + '</div>' : '',
        '</li>'
      ].join('\n');
    }).join('\n');
  }

  fetch(indexUrl)
    .then(function (response) {
      if (!response.ok) throw new Error('HTTP ' + response.status);
      return response.json();
    })
    .then(function (data) {
      posts = Array.isArray(data) ? data : [];
      ready = true;
      render();
    })
    .catch(function () {
      status.textContent = '搜索索引加载失败，请刷新页面重试。';
    });

  input.addEventListener('input', render);
})();
