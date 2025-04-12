// Función para cargar el contenido de los componentes
function loadComponent(url, containerId) {
    fetch(url)
        .then(response => response.text())
        .then(html => {
            document.getElementById(containerId).innerHTML = html;
        })
        .catch(error => console.error('Error:', error));
}

loadComponent('../components/button.html', 'button-container');
loadComponent('../components/card.html', 'card-container');