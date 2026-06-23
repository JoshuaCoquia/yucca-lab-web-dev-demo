// v1-basic/script.js — progressive enhancement over the static DOM.
// No frameworks, no build step. Manipulates existing DOM nodes by hand.

(function () {
  'use strict';

  // ── DOM references ──────────────────────────────────────────────────────────
  var grid        = document.querySelector('.post-grid');
  var searchInput = document.getElementById('search-input');
  var sortSelect  = document.getElementById('sort-select');
  var globalTotal = document.querySelector('[data-testid="global-total"]');

  // ── Collect all cards once ──────────────────────────────────────────────────
  // NodeList → Array so we can use sort/filter helpers.
  var cards = Array.prototype.slice.call(
    document.querySelectorAll('[data-testid="post-card"]')
  );

  // ── localStorage persistence ────────────────────────────────────────────────
  var STORAGE_KEY = 'v1-likes';

  function loadLikes() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    } catch (e) {
      return {};
    }
  }

  function saveLikes(likes) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(likes));
    } catch (e) {
      // storage unavailable — degrade silently
    }
  }

  // ── Restore persisted like counts on page load ──────────────────────────────
  function restoreLikes() {
    var likes = loadLikes();
    var total = 0;

    cards.forEach(function (card) {
      var slug = card.querySelector('[data-testid="read-link"]').getAttribute('href');
      var count = likes[slug] || 0;
      card.querySelector('[data-testid="like-count"]').textContent = count;
      total += count;
    });

    globalTotal.textContent = total;
  }

  // ── Like button wiring ──────────────────────────────────────────────────────
  function wireLikeButtons() {
    cards.forEach(function (card) {
      var btn   = card.querySelector('[data-testid="like-button"]');
      var count = card.querySelector('[data-testid="like-count"]');

      btn.addEventListener('click', function () {
        // Read the slug from the read-link href so it is unique per card.
        var slug = card.querySelector('[data-testid="read-link"]').getAttribute('href');
        var likes = loadLikes();

        // Increment per-card count.
        var newCount = (likes[slug] || 0) + 1;
        likes[slug] = newCount;
        count.textContent = newCount;

        // Recompute and update the global total from all stored likes
        // (avoids drift if multiple cards have been liked).
        var newTotal = 0;
        cards.forEach(function (c) {
          var s = c.querySelector('[data-testid="read-link"]').getAttribute('href');
          newTotal += likes[s] || 0;
        });
        globalTotal.textContent = newTotal;

        saveLikes(likes);
      });
    });
  }

  // ── Search: hide/show cards whose title matches the query ───────────────────
  function applySearch(query) {
    var q = query.trim().toLowerCase();

    cards.forEach(function (card) {
      var title = card.getAttribute('data-title') || '';
      var visible = !q || title.toLowerCase().indexOf(q) !== -1;
      card.style.display = visible ? '' : 'none';
    });
  }

  // ── Sort: reorder DOM nodes inside the grid ─────────────────────────────────
  function applySort(value) {
    var sorted = cards.slice(); // shallow copy — keeps original array intact

    if (value === 'oldest') {
      sorted.sort(function (a, b) {
        return a.getAttribute('data-date').localeCompare(b.getAttribute('data-date'));
      });
    } else if (value === 'title') {
      sorted.sort(function (a, b) {
        return a.getAttribute('data-title').localeCompare(b.getAttribute('data-title'));
      });
    } else {
      // newest (default) — descending date
      sorted.sort(function (a, b) {
        return b.getAttribute('data-date').localeCompare(a.getAttribute('data-date'));
      });
    }

    // Re-append in the new order; appendChild moves existing nodes (no clone needed).
    sorted.forEach(function (card) {
      grid.appendChild(card);
    });
  }

  // ── Event listeners ─────────────────────────────────────────────────────────
  searchInput.addEventListener('input', function () {
    applySearch(searchInput.value);
  });

  sortSelect.addEventListener('change', function () {
    applySort(sortSelect.value);
  });

  // ── Init ────────────────────────────────────────────────────────────────────
  restoreLikes();
  wireLikeButtons();
  // Apply the default sort (newest) on load so the order is consistent.
  applySort(sortSelect.value);
}());
