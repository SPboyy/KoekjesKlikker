function openDeletePopup() {
    const popup = document.getElementById('popup-delete');
    popup.style.display = 'flex'; 
}

function closeDeletePopup() {
    const popup = document.getElementById('popup-delete');
    popup.style.display = 'none';
}

function confirmDelete() {
    fetch('/delete-progress', { 
        method: 'POST',
        credentials: 'include'
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Fout bij resetten van progressie');
        }
        return response.json();
    })
    .then(data => {
        location.reload(); 
    })
    .catch(error => {
        console.error('Fout:', error);
        alert('Er is een fout opgetreden bij het resetten.');
    });

    closeDeletePopup();
}
