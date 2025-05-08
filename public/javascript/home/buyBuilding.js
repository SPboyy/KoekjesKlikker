function buyBuilding(index) {
    fetch(`/buy-building/${index}`, {
        method: 'POST'
    })
    .then(res => {
        if (!res.ok) throw new Error('Network response was not ok');
        return res.json();
    })
    .then(data => {
        if (data.error) {
            showToast(data.error);
            return;
        }
        
        const buildingCounts = document.querySelectorAll('.building-count');
        const priceDisplays = document.querySelectorAll('.columndouble h3, .columndoubleLong h3');
        
        buildingCounts[index].textContent = data.amount;
        priceDisplays[index].textContent = `${data.name} price: ${data.price.toFixed(1)}`;
        
        const cookieCount = document.getElementById('cookieCount');
        const cpsDisplay = document.getElementById('cpsDisplay');
        cookieCount.textContent = data.totalCookies;
        cpsDisplay.textContent = data.cps;
    })
    .catch(err => {
        console.error('Building purchase error:', err);
        showToast('Purchase failed. Please try again.');
    });
}

function showToast(message) {
    const toast = document.createElement('div');
    toast.className = 'toast-message';
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
}