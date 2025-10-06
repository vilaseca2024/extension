document.addEventListener('DOMContentLoaded', async () => {
  const container = document.getElementById('list-container');
  const emptyP = document.getElementById('empty');

  try {
    const resp = await fetch(chrome.runtime.getURL('urls.json'));
    const data = await resp.json();

    if (!Array.isArray(data) || data.length === 0) {
      emptyP.textContent = 'No hay enlaces configurados';
      return;
    }

    emptyP.style.display = 'none';

    data.forEach(area => {
      const areaDiv = document.createElement('div');
      areaDiv.className = 'area';

      // header
      const header = document.createElement('div');
      header.className = 'area-header';
      header.textContent = area.area;

      const arrow = document.createElement('span');
      arrow.textContent = '▶';
      arrow.className = 'arrow';
      header.appendChild(arrow);

      // links
      const linksDiv = document.createElement('div');
      linksDiv.className = 'links';

      area.links.forEach(link => {
        const a = document.createElement('a');
        a.textContent = link.title || link.url;
        a.href = '#';
        a.addEventListener('click', (e) => {
          e.preventDefault();
          chrome.tabs.create({ url: link.url });
        });
        linksDiv.appendChild(a);
      });

      // toggle
      header.addEventListener('click', () => {
        const isOpen = linksDiv.style.display === 'block';
        linksDiv.style.display = isOpen ? 'none' : 'block';
        arrow.classList.toggle('open', !isOpen);
      });

      areaDiv.appendChild(header);
      areaDiv.appendChild(linksDiv);
      container.appendChild(areaDiv);
    });

  } catch (err) {
    emptyP.textContent = 'Error cargando urls.json: ' + err.message;
  }
});
