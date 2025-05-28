function logout() {
    fetch("/logout", {
        method: "GET",
        credentials: "include"
    })
    .then(response => {
        if (response.redirected) {
            localStorage.clear();
            window.location.href = response.url;
        } else {
            console.error("Logout mislukt of niet doorgestuurd.");
        }
    })
    .catch((err) => {
        console.error("Logout fout:", err);
    });
}