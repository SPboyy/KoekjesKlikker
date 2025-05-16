const cookieCountEl = document.getElementById('cookieCount');
const cpsDisplayEl = document.getElementById('cpsDisplay');
const cookieBtn = document.getElementById('cookieBtn');

function updateStats() {
    fetch('/get-stats')
        .then(res => res.json())
        .then(data => {
            document.getElementById('cookieCount').textContent = data.total;
            document.getElementById('cpsDisplay').textContent = data.cps;
        })
        .catch(err => console.error('Error fetching stats:', err));
}

// Elke seconde de teller verversen
setInterval(updateStats, 1000);
