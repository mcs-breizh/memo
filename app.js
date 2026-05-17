/* global state */
let allLinks = [];
let allTags = {};
let activeTags = new Set();
let activeStatus = 'all';
let searchQuery = '';

/* normalise a string for accent-insensitive search */
function normalise(str) {
  return (str || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
}

/* compute filtered links */
function getFiltered() {
  const q = normalise(searchQuery);
  return allLinks.filter(link => {
    /* text search */
    if (q) {
      const haystack = normalise(link.title) + ' ' + normalise(link.summary) + ' ' + normalise(link.notes);
      if (!haystack.includes(q)) return false;
    }
    /* status filter */
    if (activeStatus !== 'all' && link.status !== activeStatus) return false;
    /* tag filter (intersection) */
    if (activeTags.size > 0) {
      const linkTags = new Set(link.tags || []);
      for (const t of activeTags) {
        if (!linkTags.has(t)) return false;
      }
    }
    return true;
  });
}

/* count filtered links per tag (respecting current search + status) */
function countPerTag() {
  const counts = {};
  const q = normalise(searchQuery);
  for (const link of allLinks) {
    /* apply search and status but NOT tag filter */
    if (q) {
      const haystack = normalise(link.title) + ' ' + normalise(link.summary) + ' ' + normalise(link.notes);
      if (!haystack.includes(q)) continue;
    }
    if (activeStatus !== 'all' && link.status !== activeStatus) continue;
    for (const t of (link.tags || [])) {
      counts[t] = (counts[t] || 0) + 1;
    }
  }
  return counts;
}

/* render tag buttons */
function renderTags() {
  const container = document.getElementById('tags-container');
  const counts = countPerTag();
  const tagKeys = Object.keys(allTags).sort((a, b) => {
    const diff = (counts[b] || 0) - (counts[a] || 0);
    return diff !== 0 ? diff : a.localeCompare(b);
  });
  if (tagKeys.length === 0) {
    container.innerHTML = '';
    return;
  }
  container.innerHTML = tagKeys.map(key => {
    const label = allTags[key] || key;
    const count = counts[key] || 0;
    const active = activeTags.has(key) ? ' active' : '';
    return `<button class="tag-btn${active}" data-tag="${key}" aria-pressed="${activeTags.has(key)}">${label} <span class="tag-count">${count}</span></button>`;
  }).join('');

  container.querySelectorAll('.tag-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const tag = btn.dataset.tag;
      if (activeTags.has(tag)) {
        activeTags.delete(tag);
      } else {
        activeTags.add(tag);
      }
      render();
    });
  });
}

/* render link cards */
function renderLinks(filtered) {
  const container = document.getElementById('links-container');

  if (allLinks.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <p>Aucun lien enregistré pour le moment.</p>
      </div>`;
    return;
  }

  if (filtered.length === 0) {
    container.innerHTML = `<p class="no-results">Aucun lien ne correspond aux filtres sélectionnés.</p>`;
    return;
  }

  container.innerHTML = filtered.map(link => {
    const tags = (link.tags || []).map(t => {
      const label = allTags[t] || t;
      return `<span class="tag-badge">${label}</span>`;
    }).join('');

    const statusClass = link.status === 'read' ? 'status-read' : 'status-unread';
    const statusLabel = link.status === 'read' ? 'Lu' : 'À lire';
    const hasNotes = link.notes && link.notes.trim() !== '';

    const notesBlock = hasNotes ? `
      <details class="notes-details">
        <summary>Notes</summary>
        <p class="notes-text">${escapeHtml(link.notes)}</p>
      </details>` : '';

    return `
      <article class="link-card">
        <div class="link-card-header">
          <a href="${escapeHtml(link.url)}" target="_blank" rel="noopener noreferrer" class="link-title">${escapeHtml(link.title)}<span class="sr-only"> (nouvel onglet)</span></a>
          <span class="status-badge ${statusClass}" role="img" aria-label="${statusLabel}"></span>
        </div>
        ${link.summary ? `<p class="link-summary">${escapeHtml(link.summary)}</p>` : ''}
        <div class="link-meta">
          <div class="link-tags">${tags}</div>
        </div>
        ${notesBlock}
      </article>`;
  }).join('');
}

/* render counter */
function renderCounter(filtered) {
  const el = document.getElementById('counter');
  if (allLinks.length === 0) {
    el.textContent = '';
    return;
  }
  el.textContent = `${filtered.length} lien${filtered.length !== 1 ? 's' : ''} affiché${filtered.length !== 1 ? 's' : ''} sur ${allLinks.length}`;
}

/* full render pass */
function render() {
  const filtered = getFiltered();
  renderTags();
  renderLinks(filtered);
  renderCounter(filtered);
}

/* escape HTML to prevent XSS */
function escapeHtml(str) {
  return (str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/* wire up search input */
function initSearch() {
  const input = document.getElementById('search-input');
  input.addEventListener('input', () => {
    searchQuery = input.value;
    render();
  });
}

/* wire up status buttons */
function initStatusFilter() {
  document.querySelectorAll('.status-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.status-btn').forEach(b => {
        b.classList.remove('active');
        b.setAttribute('aria-pressed', 'false');
      });
      btn.classList.add('active');
      btn.setAttribute('aria-pressed', 'true');
      activeStatus = btn.dataset.status;
      render();
    });
  });
}

/* bootstrap */
async function init() {
  try {
    const [linksRes, tagsRes] = await Promise.all([
      fetch('data/links.json'),
      fetch('data/tags.json'),
    ]);
    allLinks = await linksRes.json();
    allTags = await tagsRes.json();
  } catch (e) {
    allLinks = [];
    allTags = {};
    console.error('Failed to load data:', e);
  }

  initSearch();
  initStatusFilter();
  render();
}

document.addEventListener('DOMContentLoaded', init);
