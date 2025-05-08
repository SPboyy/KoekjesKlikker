document.getElementById('cookieBtn').addEventListener('click', () => {
    fetch('/add-cookie', {
        method: 'POST'
    })
    .then(res => res.json())
    .then(data => {
        document.querySelector('#cookieCount').innerText = data.total;
        document.querySelector('#cpsDisplay').innerText = data.cps;
    })
    .catch(err => {
        console.error("Error adding cookie:", err);
        alert("Failed to add cookie. Please try again.");
    });
});
