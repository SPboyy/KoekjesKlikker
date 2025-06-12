function updatePrices() {
    fetch('/building-prices')
        .then(res => res.json())
        .then(data => {
            // Update building prijzen
            data.prices.forEach(building => {
                const priceElement = document.querySelector(`#building-price-${building.id}`);
                const amountElement = document.querySelector(`#building-amount-${building.id}`);
                if (priceElement) priceElement.textContent = `Price: ${building.price}`;
                if (amountElement) amountElement.textContent = building.amount;
            });

            // Update upgrades
            data.upgrades.forEach(upgrade => {
                const idSuffix = `${upgrade.buildingId}`;
                if (upgrade.type === 'multiplier') {
                    const priceEl = document.querySelector(`#multiplier-price-${idSuffix}`);
                    if (priceEl) priceEl.textContent = `Multiplier price: ${upgrade.price}`;
                } else if (upgrade.type === 'discount') {
                    const priceEl = document.querySelector(`#discount-price-${idSuffix}`);
                    if (priceEl) priceEl.textContent = `Discount price: ${upgrade.price}`;
                }
            });
        })
        .catch(err => console.error('Fout bij ophalen prijzen:', err));
}

// Elke 1 seconde updaten
setInterval(updatePrices, 1000);
updatePrices(); // ook meteen bij laden
