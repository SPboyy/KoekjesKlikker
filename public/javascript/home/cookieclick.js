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

    function updateStats() {
        fetch('/get-stats')
            .then(res => {
                if (!res.ok) {
                    throw new Error(`HTTP error! status: ${res.status}`);
                }
                return res.json();
            })
            .then(data => {
                currentCookieCount = parseFloat(data.total);
                cookieCountEl.textContent = currentCookieCount.toFixed(1);
                cpsDisplayEl.textContent = parseFloat(data.cps).toFixed(1);
                
                currentCookiesPerClick = parseFloat(data.cookiesPerClick);
                cookiesPerClickDisplay.textContent = `Cookies per click ${currentCookiesPerClick.toFixed(0)}`; // Gebruik .toFixed(0) of .toFixed(1) hier
                
                currentCookiesPerClickPrice = parseFloat(data.cookiesPerClickPrice);
                fingerPriceDisplay.textContent = `Prijs: ${currentCookiesPerClickPrice.toFixed(0)}`;

                if (fingerBtn) {
                    fingerBtn.disabled = currentCookieCount < currentCookiesPerClickPrice;
                }
            })
            .catch(err => console.error('Error fetching stats:', err));
    }

    setInterval(updateStats, 2000);

    if (fingerBtn) {
        fingerBtn.addEventListener('click', () => {
            if (currentCookieCount < currentCookiesPerClickPrice) {
                alert('Niet genoeg koekjes om deze upgrade te kopen!');
                return;
            }

            fetch('/upgrade-cookies-per-click', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({})
            })
            .then(res => {
                if (!res.ok) {
                    if (res.status === 400) {
                        return res.json().then(errorData => { throw new Error(errorData.error); });
                    }
                    throw new Error(`HTTP error! status: ${res.status}`);
                }
                return res.json();
            })
            .then(data => {
                currentCookiesPerClick = parseFloat(data.newCookiesPerClick);
                cookiesPerClickDisplay.textContent = `Cookies per click ${currentCookiesPerClick.toFixed(0)}`; // Gebruik .toFixed(0) of .toFixed(1) hier
                
                currentCookiesPerClickPrice = parseFloat(data.newCookiesPerClickPrice);
                fingerPriceDisplay.textContent = `Prijs: ${currentCookiesPerClickPrice.toFixed(0)}`;

                currentCookieCount = parseFloat(data.totalCookies);
                cookieCountEl.textContent = currentCookieCount.toFixed(1);
                
                if (fingerBtn) {
                    fingerBtn.disabled = currentCookieCount < currentCookiesPerClickPrice;
                }
                console.log("Cookies per click succesvol geüpgraded naar:", currentCookiesPerClick);
            })
            .catch(err => console.error('Fout bij upgraden cookies per click:', err.message));
        });
    } else {
        console.warn("fingerButton met ID 'fingerButton' niet gevonden in de DOM (controleer ID in HTML)");
    }

    if (mainCookieBtn) {
        mainCookieBtn.addEventListener('click', () => {
            fetch('/add-cookie', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                // GEEN amount meer sturen. Server moet de hoeveelheid bepalen.
                body: JSON.stringify({}) // Stuur een leeg object of helemaal geen body als je wilt
            })
            .then(res => {
                if (!res.ok) {
                    throw new Error(`HTTP error! status: ${res.status}`);
                }
                return res.json();
            })
            .then(data => {
                // Client update de UI met data van de server
                cookieCountEl.textContent = parseFloat(data.total).toFixed(1);
                currentCookieCount = parseFloat(data.total); // Update de lokale client state
                if (fingerBtn) {
                    fingerBtn.disabled = currentCookieCount < currentCookiesPerClickPrice;
                }
            })
            .catch(err => console.error('Error adding cookie:', err));
        });
    } else {
        console.warn("Hoofd 'cookieClickBtn' niet gevonden in de DOM (controleer ID in HTML)");
    }

    updateStats();
});