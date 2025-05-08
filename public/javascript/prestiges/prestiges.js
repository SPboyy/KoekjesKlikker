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

function positionNodes() {
    const NODE_WIDTH = 100;
    const NODE_HEIGHT = 40;

    const container = document.getElementById('prestige-container');
    const containerRect = container.getBoundingClientRect();

    // Bepaal het midden van het scherm/container
    const centerX = containerRect.width / 2;
    const centerY = containerRect.height / 2;

    // Zet node-0 exact in het midden
    nodes['node-0'].x = centerX;
    nodes['node-0'].y = centerY;

    // Verplaats andere nodes relatief t.o.v. het midden
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
        el.style.left = `${x - NODE_WIDTH / 2}px`;
        el.style.top = `${y - NODE_HEIGHT / 2}px`;
    });

    // Plaats node-0 (start node)
    const startNode = document.getElementById('node-0');
    startNode.style.left = `${centerX - NODE_WIDTH / 2}px`;
    startNode.style.top = `${centerY - NODE_HEIGHT / 2}px`;

    // Verwijder oude lijnen en maak opnieuw verbindingen
    document.querySelectorAll('.connection').forEach(line => line.remove());
    createConnections();
}

function createConnections() {
    const container = document.getElementById('prestige-container');
    const NODE_WIDTH = 100;
    const NODE_HEIGHT = 40;

    Object.entries(nodes).forEach(([fromId, fromNode]) => {
        fromNode.connectedTo.forEach(toId => {
            const toNode = nodes[toId];
            const fromEl = document.getElementById(fromId);
            const toEl = document.getElementById(toId);

            if (!fromEl || !toEl) return;

            // Calculate center points of nodes
            const fromCenterX = fromNode.x;
            const fromCenterY = fromNode.y;
            const toCenterX = toNode.x;
            const toCenterY = toNode.y;

            // Calculate angle between nodes
            const dx = toCenterX - fromCenterX;
            const dy = toCenterY - fromCenterY;
            const angle = Math.atan2(dy, dx);

            // Calculate start and end points (edge of nodes)
            const startX = fromCenterX + Math.cos(angle) * (NODE_WIDTH/2);
            const startY = fromCenterY + Math.sin(angle) * (NODE_HEIGHT/2);
            const endX = toCenterX - Math.cos(angle) * (NODE_WIDTH/2);
            const endY = toCenterY - Math.sin(angle) * (NODE_HEIGHT/2);

            // Calculate line length and rotation
            const length = Math.sqrt(Math.pow(endX - startX, 2) + Math.pow(endY - startY, 2));
            const rotation = Math.atan2(endY - startY, endX - startX) * 180 / Math.PI;

            // Create line element
            const line = document.createElement('div');
            line.className = 'connection';
            line.style.width = `${length}px`;
            line.style.left = `${startX}px`;
            line.style.top = `${startY}px`;
            line.style.transformOrigin = '0 0';
            line.style.transform = `rotate(${rotation}deg)`;

            // Set line style based on node states
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
    if (el.classList.contains('active')) return;

    const isStartNode = id === 'node-0';
    const isConnectedToActive = Object.entries(nodes).some(([nodeId, data]) => {
        return data.connectedTo.includes(id) &&
               document.getElementById(nodeId).classList.contains('active');
    });

    if (isStartNode || isConnectedToActive) {
        el.classList.remove('locked', 'unlocked', 'faded', 'hidden');
        el.classList.add('active');
        updateVisibility();
        createConnections();
    } else {
        alert('Je moet eerst de vorige node ontgrendelen!');
    }
}

function updateVisibility() {
    const queue = [];
    const visited = new Set();
    const distances = {};
    const startNode = document.getElementById('node-0');

    startNode.classList.remove('locked', 'hidden', 'unlocked');
    startNode.classList.add('faded');

    Object.keys(nodes).forEach(id => {
        const el = document.getElementById(id);
        if (el.classList.contains('active')) {
            queue.push(id);
            distances[id] = 0;
            visited.add(id);
        } else if (id !== 'node-0') {
            el.classList.remove('unlocked', 'faded');
            el.classList.add('hidden');
        }
    });

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

    Object.keys(nodes).forEach(id => {
        const el = document.getElementById(id);
        if (el.classList.contains('active') || id === 'node-0') return;

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

    createConnections();
}

document.getElementById('reincarnate-button').onclick = function () {
    document.getElementById('reincarnate-confirm').classList.remove('hidden');
};

document.getElementById('confirm-no').onclick = function () {
    document.getElementById('reincarnate-confirm').classList.add('hidden');
};

document.getElementById('confirm-yes').onclick = function () {
    confirmPrestige();
};

function confirmPrestige() {
    closePopup();
    window.location.href = "/";
}

function closePopup() {
    document.getElementById('reincarnate-confirm').classList.add('hidden');
}

window.addEventListener("click", function (event) {
    const popup = document.getElementById("reincarnate-confirm");
    if (event.target === popup) {
        closePopup();
    }
});

window.onload = function() {
    positionNodes();
    const startNode = document.getElementById('node-0');
    startNode.className = 'prestige-node faded';

    Object.keys(nodes).forEach(id => {
        if (id !== 'node-0') {
            const el = document.getElementById(id);
            el.className = 'prestige-node hidden';
        }
    });
    
    updateVisibility();
};