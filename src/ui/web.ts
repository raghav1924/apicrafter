import http from 'node:http';
import { URL } from 'node:url';
import { MockServer } from '../server/mock-server.js';
import { log, colors } from '../utils/logger.js';

export class WebStudio {
  public static serve(mockServer: MockServer, port = 5050): void {
    const store = mockServer.getStore();

    const server = http.createServer(async (req, res) => {
      const parsedUrl = new URL(req.url || '/', `http://${req.headers.host || 'localhost'}`);
      const pathname = parsedUrl.pathname;
      const method = (req.method || 'GET').toUpperCase();

      // Studio REST APIs
      if (pathname === '/api/studio/collections' && method === 'GET') {
        const collections = store.getCollections();
        const payload: Record<string, any> = {};
        for (const col of collections) {
          payload[col] = {
            schema: store.getSchema(col),
            count: (store.getAll(col) || []).length,
            items: store.getAll(col),
          };
        }
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(payload));
        return;
      }

      if (pathname === '/api/studio/chaos' && method === 'POST') {
        let body = '';
        req.on('data', chunk => body += chunk);
        req.on('end', () => {
          try {
            const data = JSON.parse(body || '{}');
            mockServer.updateChaos(data);
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: true, chaos: mockServer.getChaos() }));
          } catch {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Invalid JSON' }));
          }
        });
        return;
      }

      if (pathname === '/api/studio/reset' && method === 'POST') {
        store.reset();
        log.info(`Reset in-memory collections to default seed state.`);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true }));
        return;
      }

      // Render Dashboard HTML
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(this.renderHtml(mockServer));
    });

    server.listen(port, () => {
      log.success(`ApiCrafter Visual Studio: ${colors.bold}${colors.cyan}http://localhost:${port}${colors.reset}`);
      console.log(`${colors.dim}Manage in-memory database rows, endpoints, and live chaos parameters.${colors.reset}\n`);
    });
  }

  private static renderHtml(mockServer: MockServer): string {
    const chaos = mockServer.getChaos();

    return `<!DOCTYPE html>
<html lang="en" class="dark">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>ApiCrafter — Interactive Mock Studio</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Geist+Mono:wght@400;500;600&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
  <style>
    :root {
      --bg: #09090b;
      --card-bg: #121215;
      --card-border: #27272a;
      --text: #f4f4f5;
      --text-muted: #a1a1aa;
      --accent: #06b6d4;
      --success: #10b981;
      --danger: #ef4444;
      --warning: #f59e0b;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      background-color: var(--bg);
      color: var(--text);
      font-family: 'Inter', sans-serif;
      min-height: 100vh;
      display: flex;
      flex-direction: column;
    }
    header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1rem 1.75rem;
      border-bottom: 1px solid var(--card-border);
      background: #0d0d10;
    }
    .brand { display: flex; align-items: center; gap: 0.75rem; }
    .brand-icon {
      font-size: 1.3rem;
      background: rgba(6, 182, 212, 0.1);
      border: 1px solid rgba(6, 182, 212, 0.25);
      border-radius: 8px;
      padding: 0.25rem 0.5rem;
    }
    .brand h1 { font-size: 1.15rem; font-weight: 700; letter-spacing: -0.02em; }
    .brand p { font-size: 0.75rem; color: var(--text-muted); }
    .actions { display: flex; gap: 0.75rem; align-items: center; }
    .btn {
      background: #27272a;
      border: 1px solid #3f3f46;
      color: #fff;
      padding: 0.4rem 0.8rem;
      border-radius: 6px;
      font-size: 0.8rem;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 0.35rem;
      font-weight: 500;
    }
    .btn:hover { background: #3f3f46; }
    .btn-danger { background: rgba(239, 68, 68, 0.15); border-color: rgba(239, 68, 68, 0.3); color: #f87171; }
    .btn-danger:hover { background: rgba(239, 68, 68, 0.25); }

    .main-grid {
      display: grid;
      grid-template-columns: 280px 1fr 320px;
      flex: 1;
      overflow: hidden;
    }
    .sidebar {
      background: var(--card-bg);
      border-right: 1px solid var(--card-border);
      padding: 1.25rem;
      display: flex;
      flex-direction: column;
      gap: 1.25rem;
    }
    .section-title {
      font-size: 0.75rem;
      font-weight: 600;
      color: var(--text-muted);
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }
    .nav-item {
      padding: 0.6rem 0.8rem;
      border-radius: 6px;
      font-family: 'Geist Mono', monospace;
      font-size: 0.85rem;
      cursor: pointer;
      display: flex;
      justify-content: space-between;
      align-items: center;
      background: #18181b;
      border: 1px solid var(--card-border);
      transition: all 0.1s ease;
    }
    .nav-item:hover, .nav-item.active {
      border-color: var(--accent);
      color: var(--accent);
    }
    .badge {
      font-size: 0.7rem;
      padding: 0.15rem 0.45rem;
      background: #27272a;
      border-radius: 4px;
      color: var(--text-muted);
    }

    .center-panel {
      padding: 1.5rem;
      overflow-y: auto;
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }
    .card {
      background: var(--card-bg);
      border: 1px solid var(--card-border);
      border-radius: 10px;
      padding: 1.25rem;
    }
    .table-container { overflow-x: auto; }
    table {
      width: 100%;
      border-collapse: collapse;
      font-size: 0.8rem;
      font-family: 'Geist Mono', monospace;
    }
    th {
      text-align: left;
      padding: 0.6rem;
      color: var(--text-muted);
      border-bottom: 1px solid var(--card-border);
      font-weight: 600;
    }
    td {
      padding: 0.6rem;
      border-bottom: 1px solid #1c1c20;
      color: #d4d4d8;
    }

    .chaos-panel {
      background: var(--card-bg);
      border-left: 1px solid var(--card-border);
      padding: 1.25rem;
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }
    .control-group { display: flex; flex-direction: column; gap: 0.4rem; }
    .control-label { font-size: 0.8rem; font-weight: 500; display: flex; justify-content: space-between; }
    input[type=range] { width: 100%; accent-color: var(--accent); }

    pre {
      background: #09090b;
      border: 1px solid var(--card-border);
      border-radius: 6px;
      padding: 0.75rem;
      font-family: 'Geist Mono', monospace;
      font-size: 0.75rem;
      color: #38bdf8;
      overflow-x: auto;
    }
    footer {
      padding: 1rem 1.5rem;
      border-top: 1px solid var(--card-border);
      text-align: center;
      font-size: 0.75rem;
      color: var(--text-muted);
      background: #09090b;
    }
  </style>
</head>
<body>
  <header>
    <div class="brand">
      <div class="brand-icon">🛠️</div>
      <div>
        <h1>ApiCrafter Studio</h1>
        <p>Stateful REST Mock Server & Chaos Simulator</p>
      </div>
    </div>
    <div class="actions">
      <button class="btn btn-danger" onclick="resetDatabase()">↺ Reset State</button>
      <a href="https://jatinsh.netlify.app/" target="_blank" class="btn" style="text-decoration:none;">Jatin Sharma ↗</a>
    </div>
  </header>

  <div class="main-grid">
    <aside class="sidebar">
      <div class="section-title">Collections</div>
      <div id="collection-list" style="display:flex; flex-direction:column; gap:0.5rem;"></div>

      <div class="section-title" style="margin-top: 1rem;">Live Endpoint</div>
      <pre><code id="endpoint-url">GET /api/users</code></pre>
    </aside>

    <main class="center-panel">
      <div class="card">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1rem;">
          <div>
            <h2 id="active-collection-title" style="font-size: 1.1rem; font-weight: 700; font-family: 'Geist Mono';">/api/users</h2>
            <p id="active-collection-subtitle" style="font-size: 0.75rem; color: var(--text-muted);">Stateful in-memory CRUD table</p>
          </div>
          <span class="badge" id="row-count">0 items</span>
        </div>

        <div class="table-container">
          <table id="data-table">
            <thead><tr id="table-head"></tr></thead>
            <tbody id="table-body"></tbody>
          </table>
        </div>
      </div>

      <div class="card">
        <div class="section-title" style="margin-bottom:0.5rem;">Quick Fetch Snippet</div>
        <pre><code id="fetch-snippet">fetch('http://localhost:5000/api/users').then(res => res.json())</code></pre>
      </div>
    </main>

    <aside class="chaos-panel">
      <div class="section-title">Chaos & Latency Injector</div>

      <div class="control-group">
        <div class="control-label">
          <span>Artificial Latency</span>
          <span id="delay-val">${chaos.delayMs}ms</span>
        </div>
        <input type="range" id="delay-slider" min="0" max="2500" step="50" value="${chaos.delayMs}" oninput="updateChaosUI()" onchange="saveChaos()" />
        <div style="font-size: 0.7rem; color: var(--text-muted);">Simulate real-world 3G, 4G, or satellite loading spinners.</div>
      </div>

      <div class="control-group">
        <div class="control-label">
          <span>Random Failure Rate</span>
          <span id="error-val">${Math.round(chaos.errorRate * 100)}%</span>
        </div>
        <input type="range" id="error-slider" min="0" max="100" step="5" value="${Math.round(chaos.errorRate * 100)}" oninput="updateChaosUI()" onchange="saveChaos()" />
        <div style="font-size: 0.7rem; color: var(--text-muted);">Randomly injects HTTP 500/503/429 errors to test UI boundaries.</div>
      </div>

      <div class="card" style="margin-top:auto; font-size:0.75rem; color:var(--text-muted); line-height:1.4;">
        💡 <strong>Stateful Mutations:</strong> Standard <code style="color:var(--accent);">POST</code>, <code style="color:var(--accent);">PUT</code>, and <code style="color:var(--accent);">DELETE</code> requests update this live database immediately.
      </div>
    </aside>
  </div>

  <footer>
    ApiCrafter is open-source software created by <a href="https://jatinsh.netlify.app/" target="_blank" style="color: var(--accent); text-decoration: none;">Jatin Sharma</a> • Distributed under MIT License
  </footer>

  <script>
    let collectionsData = {};
    let activeCollection = 'users';

    async function loadStudio() {
      try {
        const res = await fetch('/api/studio/collections');
        collectionsData = await res.json();
        renderNav();
        renderTable();
      } catch (err) {}
    }

    function renderNav() {
      const container = document.getElementById('collection-list');
      const keys = Object.keys(collectionsData);
      if (keys.length === 0) return;

      container.innerHTML = keys.map(k => \`
        <div class="nav-item \${k === activeCollection ? 'active' : ''}" onclick="selectCollection('\${k}')">
          <span>/\${k}</span>
          <span class="badge">\${collectionsData[k].count}</span>
        </div>
      \`).join('');
    }

    function selectCollection(name) {
      activeCollection = name;
      renderNav();
      renderTable();
    }

    function renderTable() {
      const col = collectionsData[activeCollection];
      if (!col) return;

      document.getElementById('active-collection-title').textContent = '/api/' + activeCollection;
      document.getElementById('endpoint-url').textContent = 'GET /api/' + activeCollection;
      document.getElementById('row-count').textContent = col.count + ' items';
      document.getElementById('fetch-snippet').textContent = "fetch('http://localhost:5000/api/" + activeCollection + "')\\n  .then(res => res.json())\\n  .then(data => console.log(data));";

      const head = document.getElementById('table-head');
      const body = document.getElementById('table-body');

      if (col.items.length === 0) {
        head.innerHTML = '<th>No data</th>';
        body.innerHTML = '<tr><td style="text-align:center; padding:2rem;">Collection is empty. POST new items to populate.</td></tr>';
        return;
      }

      const keys = Object.keys(col.items[0]);
      head.innerHTML = keys.map(k => '<th>' + k + '</th>').join('');

      body.innerHTML = col.items.map(row => \`
        <tr>
          \${keys.map(k => '<td>' + (typeof row[k] === 'object' ? JSON.stringify(row[k]) : row[k]) + '</td>').join('')}
        </tr>
      \`).join('');
    }

    function updateChaosUI() {
      document.getElementById('delay-val').textContent = document.getElementById('delay-slider').value + 'ms';
      document.getElementById('error-val').textContent = document.getElementById('error-slider').value + '%';
    }

    async function saveChaos() {
      const delayMs = parseInt(document.getElementById('delay-slider').value, 10);
      const errorRate = parseInt(document.getElementById('error-slider').value, 10) / 100;
      await fetch('/api/studio/chaos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ delayMs, errorRate })
      });
    }

    async function resetDatabase() {
      await fetch('/api/studio/reset', { method: 'POST' });
      loadStudio();
    }

    setInterval(loadStudio, 2000);
    loadStudio();
  </script>
</body>
</html>`;
  }
}
