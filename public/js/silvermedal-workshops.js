/**
 * Silver Medal — Workshops calendar (client)
 * --------------------------------------------------------------------------
 * Renders the "Upcoming Workshops" section on the Silver Medal landing page.
 * Pulls events from the codecamp app's /api/workshops endpoint, which is the
 * single integration point for the future Facebook / Meta Graph API sync
 * (see server/boot/workshops.js). Keeping the fetch server-side means the
 * Meta page access token is never exposed to the browser.
 *
 * Event shape (normalized server-side):
 *   {
 *     id, title, category: 'writing'|'health'|'coding',
 *     start (ISO), end (ISO|null), location, description,
 *     url (RSVP / event link), source ('seed'|'meta')
 *   }
 */
(function () {
  'use strict';

  var ENDPOINT = '/api/workshops';
  var grid = document.getElementById('workshops-grid');
  var status = document.getElementById('workshops-status');
  var filterBar = document.querySelector('.workshop-filter');
  if (!grid || !status) {
    return;
  }

  var allEvents = [];
  var activeCategory = 'all';

  function escapeHtml(value) {
    return String(value == null ? '' : value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function formatWhen(startIso, endIso) {
    var start = new Date(startIso);
    if (isNaN(start.getTime())) {
      return '';
    }
    var dateOpts = { weekday: 'short', month: 'short', day: 'numeric' };
    var timeOpts = { hour: 'numeric', minute: '2-digit' };
    var label = start.toLocaleDateString(undefined, dateOpts) +
      ' · ' + start.toLocaleTimeString(undefined, timeOpts);
    if (endIso) {
      var end = new Date(endIso);
      if (!isNaN(end.getTime())) {
        label += ' – ' + end.toLocaleTimeString(undefined, timeOpts);
      }
    }
    return label;
  }

  function cardFor(ev) {
    var category = ['writing', 'health', 'coding'].indexOf(ev.category) > -1 ?
      ev.category : 'coding';
    var col = document.createElement('div');
    col.className = 'col-md-6 col-lg-4 workshop-col';
    col.setAttribute('data-category', category);

    var rsvp = ev.url ?
      '<a class="btn btn-sm btn-outline-primary rounded-pill px-3 mt-auto align-self-start" ' +
      'href="' + escapeHtml(ev.url) + '" target="_blank" rel="noopener">RSVP</a>' :
      '';

    col.innerHTML =
      '<div class="card h-100 workshop-card cat-' + category + '">' +
        '<div class="card-body d-flex flex-column p-4">' +
          '<span class="badge badge-' + category + ' rounded-pill align-self-start mb-2 text-uppercase">' +
            escapeHtml(category) +
          '</span>' +
          '<h5 class="card-title fw-bold">' + escapeHtml(ev.title) + '</h5>' +
          '<p class="small text-primary fw-semibold mb-2">' +
            escapeHtml(formatWhen(ev.start, ev.end)) +
          '</p>' +
          (ev.location ?
            '<p class="small text-muted mb-2">📍 ' + escapeHtml(ev.location) + '</p>' : '') +
          '<p class="card-text text-muted small mb-3">' + escapeHtml(ev.description) + '</p>' +
          rsvp +
        '</div>' +
      '</div>';
    return col;
  }

  function render() {
    grid.innerHTML = '';
    var visible = allEvents.filter(function (ev) {
      return activeCategory === 'all' || ev.category === activeCategory;
    });

    if (!visible.length) {
      status.textContent = 'No workshops scheduled in this category yet — check back soon.';
      status.style.display = '';
      return;
    }
    status.style.display = 'none';
    visible.forEach(function (ev) {
      grid.appendChild(cardFor(ev));
    });
  }

  function setActiveCategory(category) {
    activeCategory = category;
    if (filterBar) {
      filterBar.querySelectorAll('button[data-category]').forEach(function (btn) {
        btn.classList.toggle('active', btn.getAttribute('data-category') === category);
      });
    }
    render();
  }

  if (filterBar) {
    filterBar.addEventListener('click', function (e) {
      var btn = e.target.closest('button[data-category]');
      if (btn) {
        setActiveCategory(btn.getAttribute('data-category'));
      }
    });
  }

  fetch(ENDPOINT, { headers: { Accept: 'application/json' }, credentials: 'same-origin' })
    .then(function (res) {
      if (!res.ok) {
        throw new Error('Request failed: ' + res.status);
      }
      return res.json();
    })
    .then(function (data) {
      allEvents = (data && data.events ? data.events : []).slice().sort(function (a, b) {
        return new Date(a.start) - new Date(b.start);
      });
      render();
    })
    .catch(function () {
      status.textContent = 'Workshops are temporarily unavailable. Please check back soon.';
    });
})();
