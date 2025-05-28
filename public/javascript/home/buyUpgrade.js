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

    // Debugging: check wat de backend terugstuurt
    console.log('Upgrade response:', data);

    // Zorg dat totalCookies en cps als number worden behandeld
    const totalCookiesNum = Number(data.totalCookies);
    const cpsNum = Number(data.cps);

    // Update totaal cookies display
    const cookieCountElement = document.getElementById('cookieCount');
    if (cookieCountElement) {
      cookieCountElement.textContent = totalCookiesNum.toFixed(1);
    }

    // Update cookies per second (CPS) display
    const cpsElement = document.getElementById('cpsCount');
    if (cpsElement) {
      cpsElement.textContent = cpsNum.toFixed(1);
    }

    // Update gebouwen prijzen en aantallen
    if (data.buildings && Array.isArray(data.buildings)) {
      data.buildings.forEach((building, index) => {
        const priceElement = document.getElementById(`buildingPrice${index}`);
        const amountElement = document.getElementById(`buildingAmount${index}`);

        if (priceElement) {
          priceElement.textContent = building.price;
        }
        if (amountElement) {
          amountElement.textContent = building.amount;
        }
      });
    }

    // Update upgrade buttons (prijzen)
    if (data.upgrades && Array.isArray(data.upgrades)) {
      data.upgrades.forEach(upgrade => {
        const upgradeButton = document.getElementById(`upgradeBtn-${upgrade.buildingId}-${upgrade.type}`);
        if (upgradeButton) {
          upgradeButton.textContent = `Buy ${upgrade.type} (${upgrade.price} cookies)`;
        }
      });
    }

  } catch (error) {
    console.error('Failed to buy upgrade:', error);
    alert('Er is een fout opgetreden bij het kopen van de upgrade.');
  }
}
