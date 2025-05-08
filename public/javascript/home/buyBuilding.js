function buyBuilding(index) {
    fetch(`/buy-building/${index}`, {
        method: 'POST'
    })
    .then(res => {
        if (!res.ok) throw new Error(res.statusText);
        return res.json();
    })
    .then(data => {
        if (data.error) {
            alert(data.error);
            return;
        }
        
        document.querySelectorAll('.building-count')[index].textContent = data.amount;
        document.querySelectorAll('.columndouble h3, .columndoubleLong h3')[index].innerHTML = 
            `${data.name} price: ${data.price.toFixed(1)}`;
        
        document.querySelector('#cookieCount').innerText = data.totalCookies;
        document.querySelector('#cpsDisplay').innerText = data.cps;
    })
}