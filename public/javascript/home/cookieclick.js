const cookieCountEl = document.getElementById('cookieCount');
const cpsDisplayEl = document.getElementById('cpsDisplay');
const cookieBtn = document.getElementById('cookieBtn');

cookieBtn.addEventListener('click', async () => {
    try {
        const response = await fetch('/add-cookie', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        cookieCountEl.textContent = data.total;
        cpsDisplayEl.textContent = data.cps;
        
    } catch (error) {
        console.error("Cookie click error:", error);
    }
});

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
