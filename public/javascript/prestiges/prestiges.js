const nodes = {
  'node-0': { x: 350, y: 400, connectedTo: ['node-1', 'node-2', 'node-3', 'node-4'] },
  'node-1': { x: 200, y: 300, connectedTo: ['node-5'] },
  'node-2': { x: 350, y: 250, connectedTo: ['node-6'] },
  'node-3': { x: 500, y: 300, connectedTo: ['node-7'] },
  'node-4': { x: 350, y: 500, connectedTo: ['node-8', 'node-9'] },
  'node-5': { x: 100, y: 200, connectedTo: [] },
  'node-6': { x: 350, y: 150, connectedTo: [] },
  'node-7': { x: 600, y: 200, connectedTo: [] },
  'node-8': { x: 250, y: 600, connectedTo: [] },
  'node-9': { x: 450, y: 600, connectedTo: ['node-10', 'node-11'] },
  'node-10': { x: 350, y: 700, connectedTo: [] },
  'node-11': { x: 550, y: 700, connectedTo: [] },
};

const NODE_WIDTH = 100;
const NODE_HEIGHT = 40;

function positionNodes() {
  const container = document.getElementById('prestige-container');
  const containerRect = container.getBoundingClientRect();

  const centerX = containerRect.width / 2;
  const centerY = containerRect.height / 2;

  nodes['node-0'].x = centerX;
  nodes['node-0'].y = centerY;

  const relativePositions = {
    'node-1': { x: -150, y: -100 },
    'node-2': { x: 0, y: -150 },
    'node-3': { x: 150, y: -100 },
    'node-4': { x: 0, y: 100 },
    'node-5': { x: -250, y: -200 },
    'node-6': { x: 0, y: -250 },
    'node-7': { x: 250, y: -200 },
    'node-8': { x: -100, y: 200 },
    'node-9': { x: 100, y: 200 },
    'node-10': { x: 0, y: 300 },
    'node-11': { x: 200, y: 300 },
  };

  Object.entries(relativePositions).forEach(([id, offset]) => {
    const x = centerX + offset.x;
    const y = centerY + offset.y;
    nodes[id].x = x;
    nodes[id].y = y;

    const el = document.getElementById(id);
    if (el) {
      el.style.left = `${x - NODE_WIDTH / 2}px`;
      el.style.top = `${y - NODE_HEIGHT / 2}px`;
    }
  });

  const startNode = document.getElementById('node-0');
  if (startNode) {
    startNode.style.left = `${centerX - NODE_WIDTH / 2}px`;
    startNode.style.top = `${centerY - NODE_HEIGHT / 2}px`;
  }
}

function createConnections() {
  const container = document.getElementById('prestige-container');

  // Verwijder bestaande verbindingen
  document.querySelectorAll('.connection').forEach(line => line.remove());

  Object.entries(nodes).forEach(([fromId, fromNode]) => {
    fromNode.connectedTo.forEach(toId => {
      const toNode = nodes[toId];
      const fromEl = document.getElementById(fromId);
      const toEl = document.getElementById(toId);

      if (!fromEl || !toEl) return;

      const fromCenterX = fromNode.x;
      const fromCenterY = fromNode.y;
      const toCenterX = toNode.x;
      const toCenterY = toNode.y;

      const dx = toCenterX - fromCenterX;
      const dy = toCenterY - fromCenterY;
      const angle = Math.atan2(dy, dx);

      // Correcte positie aan de rand van nodes
      const startX = fromCenterX + Math.cos(angle) * (NODE_WIDTH / 2);
      const startY = fromCenterY + Math.sin(angle) * (NODE_HEIGHT / 2);
      const endX = toCenterX - Math.cos(angle) * (NODE_WIDTH / 2);
      const endY = toCenterY - Math.sin(angle) * (NODE_HEIGHT / 2);

      const length = Math.hypot(endX - startX, endY - startY);
      const rotation = (Math.atan2(endY - startY, endX - startX) * 180) / Math.PI;

      const line = document.createElement('div');
      line.className = 'connection';
      line.style.width = `${length}px`;
      line.style.left = `${startX}px`;
      line.style.top = `${startY}px`;
      line.style.transformOrigin = '0 0';
      line.style.transform = `rotate(${rotation}deg)`;

      const fromStatus = fromEl.className;
      const toStatus = toEl.className;

      if (fromStatus.includes('active') && toStatus.includes('active')) {
        line.style.backgroundColor = '#a96e41';
        line.style.opacity = '1';
      } else if (fromStatus.includes('active') || toStatus.includes('active')) {
        line.style.backgroundColor = '#d49a63';
        line.style.opacity = '0.5';
      } else if (fromStatus.includes('faded') && toStatus.includes('faded')) {
        line.style.backgroundColor = '#999';
        line.style.opacity = '0.3';
      } else {
        line.style.display = 'none';
      }

      container.appendChild(line);
    });
  });
}

function unlockNode(id) {
  const el = document.getElementById(id);
  if (!el || el.classList.contains('active')) return;

  const isStartNode = id === 'node-0';

  // Check of node verbonden is met een actieve node
  const isConnectedToActive = Object.entries(nodes).some(([nodeId, data]) => {
    return data.connectedTo.includes(id) &&
           document.getElementById(nodeId)?.classList.contains('active');
  });

  if (isStartNode || isConnectedToActive) {
    el.classList.remove('locked', 'unlocked', 'faded', 'hidden');
    el.classList.add('active');
    updateVisibility();
    createConnections();

    saveUnlockedNodes();
  } else {
    alert('Je moet eerst de vorige node ontgrendelen!');
  }
}

function saveUnlockedNodes() {
  const activeNodes = Array.from(document.querySelectorAll(".prestige-node.active"))
    .map(el => el.id);

  const t0 = performance.now();
  console.log("[💾] Opslaan van actieve nodes gestart", activeNodes);

  fetch("http://localhost:3000/prestige/save", {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ unlockedNodes: activeNodes })
  })
  .then(res => res.json())
  .then(data => {
    const t1 = performance.now();
    if (!data.success) {
      console.error("❌ Fout bij opslaan van prestige nodes");
    } else {
      console.log(`[✅] Opslaan voltooid in ${(t1 - t0).toFixed(2)} ms`);
    }
  })
  .catch(err => {
    const t1 = performance.now();
    console.error(`[⚠️] Netwerkfout (${(t1 - t0).toFixed(2)} ms):`, err);
  });
}

function updateVisibility() {
  const queue = [];
  const visited = new Set();
  const distances = {};

  // Voeg actieve nodes toe aan queue met afstand 0
  Object.keys(nodes).forEach(id => {
    const el = document.getElementById(id);
    if (el && el.classList.contains('active')) {
      queue.push(id);
      distances[id] = 0;
      visited.add(id);
    }
  });

  // BFS om afstand tot actieve nodes te bepalen (max 1)
  while (queue.length > 0) {
    const current = queue.shift();
    const distance = distances[current];

    if (distance >= 1) continue;

    nodes[current].connectedTo.forEach(neighbor => {
      if (!visited.has(neighbor)) {
        visited.add(neighbor);
        distances[neighbor] = distance + 1;
        queue.push(neighbor);
      }
    });
  }

  // Stel klassen in op basis van afstand
  Object.keys(nodes).forEach(id => {
    const el = document.getElementById(id);
    if (!el) return;

    if (el.classList.contains('active')) return;

    el.classList.remove('hidden', 'faded', 'unlocked');

    const d = distances[id];
    if (d === 0) {
      el.classList.add('unlocked');
    } else if (d === 1) {
      el.classList.add('faded');
    } else {
      el.classList.add('hidden');
    }
  });

  // Speciaal voor node-0 als niet actief
  const node0 = document.getElementById('node-0');
  if (node0 && !node0.classList.contains('faded')) {
    node0.classList.remove('hidden', 'unlocked');
    node0.classList.add('faded');
  }

  createConnections();
}

function fullyPrestige() {
    fetch('/prestigeSuccessfully', { method: 'POST' })
        .then(response => {
            if (!response.ok) {
                throw new Error('Fout bij resetten van progressie');
            }
            return response.json();
        })
        .catch(error => {
            console.error('Fout:', error);
        });
}

function returnToHome() {
  console.log("[🏠] Gebruiker keert terug naar homepagina");
  closePopup();
  const start = performance.now();
  fullyPrestige();
  window.location.href = "/";
  const end = performance.now();
  console.log(`[➡️] Redirect uitgevoerd in ${(end - start).toFixed(2)} ms (NB: pagina laadt daarna extern)`);
}

function closePopup() {
  document.getElementById('reincarnate-confirm').classList.add('hidden');
}

window.onload = function () {
console.log("unlockedNodes:", unlockedNodes);

  const startTime = performance.now();
  console.log("[⏱️] Begin met laden en positioneren van nodes");

  positionNodes();

  const node0 = document.getElementById('node-0');
  node0?.classList.remove('locked', 'hidden', 'unlocked', 'active', 'faded');

  if (typeof unlockedNodes !== 'undefined' && unlockedNodes.includes('node-0')) {
    node0?.classList.add('active');
  } else {
    node0?.classList.add('faded');
  }

  if (typeof unlockedNodes !== 'undefined') {
    unlockedNodes.forEach(id => {
      if (id === 'node-0') return;
      const el = document.getElementById(id);
      if (el) {
        el.classList.remove('locked', 'hidden', 'unlocked', 'faded');
        el.classList.add('active');
      }
    });
  }

  // Zet overige nodes (niet active) op hidden
  Object.keys(nodes).forEach(id => {
    if (id === 'node-0') return;
    const el = document.getElementById(id);
    if (el && !el.classList.contains('active')) {
      el.className = 'prestige-node hidden';
    }
  });

  updateVisibility();

  console.log(`[✅] Alles geladen in ${(performance.now() - startTime).toFixed(2)} ms`);

  // Event listeners
  document.getElementById('confirm-return-yes')?.addEventListener('click', returnToHome);
  document.getElementById('reincarnate-button')?.addEventListener('click', () => {
    document.getElementById('reincarnate-confirm')?.classList.remove('hidden');
  });
  document.getElementById('confirm-no')?.addEventListener('click', closePopup);
  document.getElementById('node-0')?.addEventListener('click', () => unlockNode('node-0'));

  window.addEventListener("click", (event) => {
    const popup = document.getElementById("reincarnate-confirm");
    if (event.target === popup) closePopup();
  });
};