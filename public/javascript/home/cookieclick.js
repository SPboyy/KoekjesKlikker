document.addEventListener('DOMContentLoaded', () => {
    const cookieCountEl = document.getElementById('cookieCount');
    const cpsDisplayEl = document.getElementById('cpsDisplay');
    const fingerBtn = document.getElementById('fingerButton');
    const cookiesPerClickDisplay = document.getElementById('cookiesPerClickDisplay');
    const fingerPriceDisplay = document.getElementById('fingerPriceDisplay');
    const mainCookieBtn = document.getElementById('cookieClickBtn');

    let currentCookiesPerClick = 1;
    let currentCookiesPerClickPrice = 10;
    let currentCookieCount = 0;

    function updateStats(initialLoad = false) {
        fetch('/get-stats')
            .then(res => {
                if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
                return res.json();
            })
            .then(data => {
                currentCookieCount = parseFloat(data.total);
                currentCookiesPerClick = parseFloat(data.cookiesPerClick);
                currentCookiesPerClickPrice = parseFloat(data.cookiesPerClickPrice);

                if (cookieCountEl) cookieCountEl.textContent = currentCookieCount.toFixed(1);
                if (cpsDisplayEl) cpsDisplayEl.textContent = parseFloat(data.cps).toFixed(1);
                if (cookiesPerClickDisplay) cookiesPerClickDisplay.textContent = `Cookies per click ${currentCookiesPerClick.toFixed(0)}`;
                if (fingerPriceDisplay) fingerPriceDisplay.textContent = `Prijs: ${currentCookiesPerClickPrice.toFixed(0)}`;

                if (fingerBtn) {
                    fingerBtn.disabled = currentCookieCount < currentCookiesPerClickPrice;

                    if (initialLoad && !fingerBtn.dataset.listenerAttached) {
                        fingerBtn.addEventListener('click', upgradeCookiesPerClick);
                        fingerBtn.dataset.listenerAttached = "true";
                    }
                }

                if (initialLoad && mainCookieBtn && !mainCookieBtn.dataset.listenerAttached) {
                    mainCookieBtn.addEventListener('click', addCookie);
                    mainCookieBtn.dataset.listenerAttached = "true";
                }
            })
            .catch(err => console.error('Error fetching stats:', err));
    }

    function upgradeCookiesPerClick() {
        fetch('/upgrade-cookies-per-click', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({})
        })
        .then(res => {
            if (!res.ok) {
                if (res.status === 400) {
                    return res.json().then(err => {
                        alert(err.error);
                        throw new Error(err.error);
                    });
                }
                throw new Error(`HTTP error! status: ${res.status}`);
            }
            return res.json();
        })
        .then(data => {
            currentCookiesPerClick = parseFloat(data.newCookiesPerClick);
            currentCookiesPerClickPrice = parseFloat(data.newCookiesPerClickPrice);
            currentCookieCount = parseFloat(data.totalCookies);

            if (cookiesPerClickDisplay) cookiesPerClickDisplay.textContent = `Cookies per click ${currentCookiesPerClick.toFixed(0)}`;
            if (fingerPriceDisplay) fingerPriceDisplay.textContent = `Prijs: ${currentCookiesPerClickPrice.toFixed(0)}`;
            if (cookieCountEl) cookieCountEl.textContent = currentCookieCount.toFixed(1);
            if (fingerBtn) fingerBtn.disabled = currentCookieCount < currentCookiesPerClickPrice;

            console.log("Cookies per click succesvol geüpgraded naar:", currentCookiesPerClick);
        })
        .catch(err => console.error('Fout bij upgraden cookies per click:', err.message));
    }

    function addCookie() {
        fetch('/add-cookie', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ amount: currentCookiesPerClick })
        })
        .then(res => {
            if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
            return res.json();
        })
        .then(data => {
            currentCookieCount = parseFloat(data.total);
            if (cookieCountEl) cookieCountEl.textContent = currentCookieCount.toFixed(1);
            if (fingerBtn) fingerBtn.disabled = currentCookieCount < currentCookiesPerClickPrice;
        })
        .catch(err => console.error('Error adding cookie:', err));
    }

    // Eerste keer laden en starten
    updateStats(true);
    setInterval(() => updateStats(false), 2000);
});