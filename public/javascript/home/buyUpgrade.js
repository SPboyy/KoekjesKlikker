async function buyUpgrade(buildingId, type) {
    try {
        const response = await fetch(`/buy-upgrade/${buildingId}/${type}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            const errorData = await response.json();
            alert(`Error: ${errorData.error}`);
            return;
        }

        const data = await response.json();

        if (data.success) {
            // Update buildings UI (aantal en prijs)
            if (data.building) {
                const buildingCounts = document.querySelectorAll('.building-count');
                const priceDisplays = document.querySelectorAll('.columndouble h3, .columndoubleLong h3');

                buildingCounts[data.building.id].textContent = data.building.amount;
                priceDisplays[data.building.id].textContent = `${data.building.name} price: ${data.building.price.toFixed(1)}`;
            }

            // Update cookies en CPS display
            const cookieCount = document.getElementById('cookieCount');
            const cpsDisplay = document.getElementById('cpsDisplay');

            if (cookieCount) cookieCount.textContent = parseFloat(data.currentCookies).toFixed(1);
            if (cpsDisplay) cpsDisplay.textContent = parseFloat(data.cps).toFixed(1);

            // Update upgrades UI
           if (data.upgrades && Array.isArray(data.upgrades)) {
    data.upgrades.forEach(upgrade => {
        const priceElementId = `${upgrade.type}-price-${upgrade.buildingId}`;
        const priceElement = document.getElementById(priceElementId);
        if (priceElement) {
            priceElement.textContent = `${upgrade.type.charAt(0).toUpperCase() + upgrade.type.slice(1)} price: ${upgrade.price.toFixed(1)}`;
        }
    });
}
        }
    } catch (error) {
        console.error('Failed to buy upgrade:', error);
    }
}
