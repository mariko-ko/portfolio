/**
 * skills-filter.js - タグ絞り込み（スキル検索）機能
 */
document.addEventListener('DOMContentLoaded', () => {
  const filterContainer = document.getElementById('skills-filter-list');
  const allBtn = document.getElementById('filter-btn-all');
  const resultCountEl = document.getElementById('skills-result-count');
  const emptyStateEl = document.getElementById('skills-empty-state');
  const cards = Array.from(document.querySelectorAll('.case-section[data-tags]'));

  if (!cards.length) return;

  /**
   * タグ文字列の正規化（先頭の#除去、トリム）
   */
  function normalizeTag(tag) {
    if (!tag) return '';
    return tag.replace(/^#/, '').trim();
  }

  /**
   * URLクエリパラメータからアクティブタグの配列を取得
   * 対応形式:
   * - ?tag=BX
   * - ?tag=BX,UI
   * - ?tags=BX,UI
   * - ?tag=BX&tag=UI
   */
  function getActiveTagsFromURL() {
    const params = new URLSearchParams(window.location.search);
    const tags = [];

    // ?tags=... の取得（カンマ区切り対応）
    const tagsParam = params.get('tags');
    if (tagsParam) {
      tagsParam.split(',').forEach((t) => {
        const norm = normalizeTag(decodeURIComponent(t));
        if (norm && !tags.includes(norm)) tags.push(norm);
      });
    }

    // ?tag=... の取得（複数指定およびカンマ区切り対応）
    const allTagParams = params.getAll('tag');
    allTagParams.forEach((item) => {
      item.split(',').forEach((t) => {
        const norm = normalizeTag(decodeURIComponent(t));
        if (norm && !tags.includes(norm)) tags.push(norm);
      });
    });

    return tags;
  }

  /**
   * URLパラメータを更新（pushStateまたはreplaceState）
   */
  function updateURL(activeTags, push = true) {
    const currentUrl = new URL(window.location.href);
    currentUrl.searchParams.delete('tags');
    currentUrl.searchParams.delete('tag');

    if (activeTags.length === 1) {
      currentUrl.searchParams.set('tag', activeTags[0]);
    } else if (activeTags.length > 1) {
      currentUrl.searchParams.set('tags', activeTags.join(','));
    }

    const newUrl = currentUrl.pathname + (currentUrl.search ? currentUrl.search : '') + currentUrl.hash;
    if (push) {
      window.history.pushState({ activeTags }, '', newUrl);
    } else {
      window.history.replaceState({ activeTags }, '', newUrl);
    }
  }

  /**
   * フィルタリングとハイライトの適用
   */
  function applyFilter(activeTags) {
    let visibleCount = 0;

    // 1. 各カードの表示/非表示判定（AND条件）
    cards.forEach((card) => {
      const rawTags = card.getAttribute('data-tags') || '';
      const cardTags = rawTags.split(',').map(normalizeTag);

      let isMatch = true;
      if (activeTags.length > 0) {
        // AND条件: 指定されたすべてのタグをカードが保持しているか
        isMatch = activeTags.every((reqTag) => cardTags.includes(reqTag));
      }

      if (isMatch) {
        card.classList.remove('is-hidden');
        visibleCount++;
      } else {
        card.classList.add('is-hidden');
      }

      // カード内タグのハイライト状態更新
      const tagElements = card.querySelectorAll('.tag');
      tagElements.forEach((tagEl) => {
        const tagText = normalizeTag(tagEl.textContent);
        if (activeTags.includes(tagText)) {
          tagEl.classList.add('is-active');
        } else {
          tagEl.classList.remove('is-active');
        }
      });
    });

    // 2. 冒頭フィルターバーのアクティブ状態更新
    if (allBtn) {
      if (activeTags.length === 0) {
        allBtn.classList.add('is-active');
      } else {
        allBtn.classList.remove('is-active');
      }
    }

    if (filterContainer) {
      const filterButtons = filterContainer.querySelectorAll('.skills-filter-btn[data-filter-tag]');
      filterButtons.forEach((btn) => {
        const btnTag = normalizeTag(btn.getAttribute('data-filter-tag'));
        if (activeTags.includes(btnTag)) {
          btn.classList.add('is-active');
        } else {
          btn.classList.remove('is-active');
        }
      });
    }

    // 3. 件数表示の更新
    if (resultCountEl) {
      if (activeTags.length === 0) {
        resultCountEl.innerHTML = `全 <strong>${cards.length}</strong> 件の実績`;
      } else {
        resultCountEl.innerHTML = `絞り込み結果: <strong>${visibleCount}</strong> / ${cards.length} 件`;
      }
    }

    // 4. 該当なしメッセージ
    if (emptyStateEl) {
      if (visibleCount === 0) {
        emptyStateEl.classList.add('is-visible');
      } else {
        emptyStateEl.classList.remove('is-visible');
      }
    }
  }

  /**
   * タグ選択時の処理
   * - 複数選択状態からタップされた場合は、単一選択へ上書きリセット
   * - 単一選択時に同タグをタップした場合は、トグル解除（ALLへ）
   * - 単一選択時に別タグをタップした場合は、そのタグへの単一選択
   */
  function handleTagClick(targetTag) {
    const norm = normalizeTag(targetTag);
    const currentActive = getActiveTagsFromURL();

    let nextActive = [];

    if (currentActive.length > 1) {
      // 複数選択状態からは、タップされたタグ1つのみで上書きリセット
      nextActive = [norm];
    } else if (currentActive.length === 1 && currentActive[0] === norm) {
      // 同一タグの再タップ: トグル解除してALLへ
      nextActive = [];
    } else {
      // 単一選択へ切り替え
      nextActive = [norm];
    }

    updateURL(nextActive, true);
    applyFilter(nextActive);
  }

  // --- イベント登録 ---

  // 「すべて」ボタン押下
  if (allBtn) {
    allBtn.addEventListener('click', () => {
      updateURL([], true);
      applyFilter([]);
    });
  }

  // 冒頭フィルターボタン押下
  if (filterContainer) {
    filterContainer.addEventListener('click', (e) => {
      const btn = e.target.closest('.skills-filter-btn[data-filter-tag]');
      if (!btn) return;
      const tag = btn.getAttribute('data-filter-tag');
      handleTagClick(tag);
    });
  }

  // 各カード内のタグ押下（イベント委譲）
  document.addEventListener('click', (e) => {
    // 冒頭フィルターバー内のタグは除外
    if (e.target.closest('#skills-filter-list') || e.target.closest('#filter-btn-all')) {
      return;
    }

    const tagEl = e.target.closest('.tag');
    if (!tagEl) return;

    // カード内タグの場合
    if (tagEl.closest('.case-section')) {
      e.preventDefault();
      const tagText = normalizeTag(tagEl.textContent);
      handleTagClick(tagText);
    }
  });

  // ブラウザの戻る・進む（popstate）対応
  window.addEventListener('popstate', () => {
    const activeTags = getActiveTagsFromURL();
    applyFilter(activeTags);
  });

  // 初期ロード時の実行
  const initialTags = getActiveTagsFromURL();
  applyFilter(initialTags);
});
