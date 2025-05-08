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
        showToast("Failed to add cookie"); 
    }
});

function showToast(message) {
    const toast = document.createElement('div');
    toast.className = 'toast-notification';
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
}