// Seleziona gli elementi dell'ombrellone e dell'ombra dal DOM
const umbrella = document.getElementById('umbrella');
const shadow = document.getElementById('umbrella-shadow');

// Ascolta il clic sull'ombrellone
umbrella.addEventListener('click', () => {
    
    // Controlla se l'ombrellone è attualmente chiuso
    if (umbrella.classList.contains('closed')) {
        // Apri l'ombrellone e allarga l'ombra
        umbrella.classList.remove('closed');
        umbrella.classList.add('open');
        shadow.classList.add('expanded');
    } else {
        // Chiudi l'ombrellone e rimpicciolisci l'ombra
        umbrella.classList.remove('open');
        umbrella.classList.add('closed');
        shadow.classList.remove('expanded');
    }
});