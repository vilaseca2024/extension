// popup.js
document.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('list-container');
  const empty = document.getElementById('empty');
  const headerLogo = document.getElementById('header-logo');

  const runtimeGet = (path) => {
    return (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.getURL)
      ? chrome.runtime.getURL(path)
      : path;
  };

  // Try to show header icon if present
  (async function tryHeaderLogo() {
    if (!headerLogo) return;
    if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.getURL) {
      try {
        const url = runtimeGet('icon.png');
        const res = await fetch(url, { method: 'GET' });
        if (res.ok) {
          headerLogo.src = url;
          headerLogo.style.display = 'block';
        }
      } catch (e) { /* ignore */ }
    } else {
      headerLogo.onload = () => headerLogo.style.display = 'block';
      headerLogo.onerror = () => headerLogo.style.display = 'none';
    }
  })();

  const jsonPath = (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.getURL)
    ? chrome.runtime.getURL('links.json')
    : 'links.json';

  fetch(jsonPath)
    .then(resp => {
      if (!resp.ok) throw new Error('HTTP ' + resp.status);
      return resp.json();
    })
    .then(data => renderLinks(Array.isArray(data) ? data : []))
    .catch(err => {
      console.error('Error al cargar links.json:', err);
      container.innerHTML = '<p id="empty">No fue posible cargar enlaces (ver consola).</p>';
    });

  function makeLinkIconSVG(size = 16) {
    return `
      <svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" aria-hidden="true" xmlns="http://www.w3.org/2000/svg">
        <path d="M14 3h7v7" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M10 14L21 3" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M21 21H3V3" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    `;
  }

  function toRuntimeIfRelative(path) {
    if (!path) return '';
    if (/^(https?:|data:|blob:)/i.test(path)) return path;
    return runtimeGet(path);
  }

  function renderLinks(links) {
    if (!links || links.length === 0) {
      container.innerHTML = '<p id="empty">No hay enlaces guardados</p>';
      return;
    }

    container.innerHTML = '';
    links.forEach((link, idx) => {
      const a = document.createElement('a');
      a.href = link.url || '#';
      a.target = '_blank';
      a.className = 'link-item';
      a.rel = 'noopener noreferrer';
      a.style.textDecoration = 'none';

      // logo area
      const logoWrap = document.createElement('div');
      logoWrap.className = 'logo-img';

      if (link.logo) {
        const img = document.createElement('img');
        img.alt = link.title ? `${link.title} logo` : 'logo';
        img.src = toRuntimeIfRelative(link.logo);
        // staggered animation delay
        img.style.animationDelay = `${idx * 0.08}s`;
        img.onerror = () => {
          img.remove();
          const span = document.createElement('span');
          span.className = 'logo-emoji';
          span.textContent = link.icon || '🔗';
          span.style.animationDelay = `${idx * 0.08}s`;
          logoWrap.appendChild(span);
        };
        logoWrap.appendChild(img);
      } else {
        const span = document.createElement('span');
        span.className = 'logo-emoji';
        span.textContent = link.icon || '🔗';
        span.style.animationDelay = `${idx * 0.08}s`;
        logoWrap.appendChild(span);
      }

      const text = document.createElement('div');
      text.className = 'link-text';
      const title = document.createElement('div');
      title.className = 'link-title';
      title.textContent = link.title || link.url || 'Enlace';
      const url = document.createElement('div');
      url.className = 'link-url';
      try {
        url.textContent = (new URL(link.url)).hostname;
      } catch (e) {
        url.textContent = link.url || '';
      }
      text.appendChild(title);
      text.appendChild(url);

      const badge = document.createElement('button');
      badge.className = 'badge-button';
      badge.setAttribute('aria-label', `Abrir ${title.textContent}`);
      badge.innerHTML = makeLinkIconSVG(14);

      badge.addEventListener('click', (ev) => {
        ev.stopPropagation();
        ev.preventDefault();
        try { window.open(a.href, '_blank', 'noopener'); } catch (err) { window.location.href = a.href; }
      });

      a.appendChild(logoWrap);
      a.appendChild(text);
      a.appendChild(badge);

      container.appendChild(a);

      // small entry animation
      a.style.opacity = '0';
      a.style.transform = 'translateY(8px)';
      setTimeout(() => {
        a.style.transition = 'opacity 300ms ease, transform 320ms cubic-bezier(.2,.9,.3,1)';
        a.style.opacity = '1';
        a.style.transform = 'translateY(0)';
      }, idx * 60);

      // keyboard accessibility
      a.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          try { window.open(a.href, '_blank', 'noopener'); } catch (err) { window.location.href = a.href; }
        }
      });
    });
  }
});
