const rainBtn = document.getElementById('rainBtn');
const toggleFoldBtn = document.getElementById('toggleFoldBtn'); // Pulsante unico unificato
const singBtn = document.getElementById('singBtn');
const bladeBtn = document.getElementById('bladeBtn');
const sprayBtn = document.getElementById('sprayBtn');

const umbrella = document.getElementById('umbrella-svg');
const canopy = document.getElementById('umbrella-canopy');
const canopyGroup = document.getElementById('canopy-group');
const beak = document.getElementById('beak');
const blade = document.getElementById('blade');
const rainContainer = document.getElementById('rainContainer');
const subtext = document.getElementById('subtext');
const rainbowStop1 = document.getElementById('rainbowStop1');
const tipLine = document.querySelector('line[stroke="#d4af37"]');
const svgElement = document.getElementById('umbrella-svg');

let isStorming = false;
let isBladeDrawn = false;
let isFolded = true; // Inizia ripiegato/chiuso di default-
let splashInterval;

// Stato iniziale grafico accoppiato
canopyGroup.setAttribute("class", "folded");

let audioCtx = null;
let alarmInterval = null;
let currentAlarm = null;

function getAudioContext() {
    if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    return audioCtx;
}

function playClickSound(isOpenSound) {
    const ctx = getAudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.type = 'triangle';
    if (isOpenSound) {
        osc.frequency.setValueAtTime(600, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(150, ctx.currentTime + 0.08);
    } else {
        osc.frequency.setValueAtTime(350, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(80, ctx.currentTime + 0.12);
    }

    gain.gain.setValueAtTime(0.25, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + (isOpenSound ? 0.08 : 0.12));

    osc.connect(gain);
    gain.connect(ctx.destination);
    
    osc.start();
    osc.stop(ctx.currentTime + (isOpenSound ? 0.08 : 0.12));
}

function playAlarmSound() {
    const ctx = getAudioContext();
    let nodeOsc = ctx.createOscillator();
    let nodeGain = ctx.createGain();
    nodeOsc.type = 'sine';
    nodeGain.gain.setValueAtTime(0.18, ctx.currentTime);
    
    nodeOsc.connect(nodeGain);
    nodeGain.connect(ctx.destination);
    nodeOsc.start();

    let highTone = true;
    alarmInterval = setInterval(() => {
        nodeOsc.frequency.setValueAtTime(highTone ? 980 : 720, ctx.currentTime);
        highTone = !highTone;
    }, 250);

    return { osc: nodeOsc, gain: nodeGain };
}

function createHeavyRain() {
    rainContainer.innerHTML = '';
    const dropCount = 350; 
    for (let i = 0; i < dropCount; i++) {
        const drop = document.createElement('div');
        drop.classList.add('drop');
        drop.style.left = (Math.random() * 145 - 25) + 'vw'; 
        drop.style.animationDuration = (Math.random() * 0.3 + 0.22) + 's';
        drop.style.animationDelay = Math.random() * 1.5 + 's';
        rainContainer.appendChild(drop);
    }
}

function startSplashes() {
    splashInterval = setInterval(() => {
        if(isFolded) return;
        const stageRect = document.querySelector('.stage').getBoundingClientRect();
        for(let k = 0; k < 2; k++) {
            const splash = document.createElement('div');
            splash.classList.add('splash');
            const randomWidth = (Math.random() * (stageRect.width * 0.7)) + (stageRect.width * 0.15);
            const x = stageRect.left + randomWidth;
            const y = stageRect.top + (stageRect.height * 0.18) + (Math.sin((randomWidth / stageRect.width) * Math.PI) * 20);

            splash.style.left = x + 'px';
            splash.style.top = y + 'px';
            const size = Math.random() * 4 + 2;
            splash.style.width = size + 'px';
            splash.style.height = size + 'px';

            const moveX = (Math.random() * 60 - 30) + 'px';
            const moveY = (Math.random() * -40 - 10) + 'px';
            splash.style.setProperty('--mx', moveX);
            splash.style.setProperty('--my', moveY);

            document.body.appendChild(splash);
            setTimeout(() => splash.remove(), 400);
        }
    }, 40);
}

// GESTIONE UNIFICATA DELLO STATO DELLA CUPOLA (Interruttore ON/OFF)
function setCanopyState(folding) {
    if (isFolded === folding) return;
    
    isFolded = folding;
    playClickSound(!isFolded);

    if (isFolded) {
        canopyGroup.setAttribute("class", "folded");
        toggleFoldBtn.textContent = "Apri Ombrello ☂️";
        toggleFoldBtn.classList.remove('active');
        subtext.textContent = "Ombrello: Sistema di Autodifesa.";
    } else {
        canopyGroup.removeAttribute("class");
        toggleFoldBtn.textContent = "Chiudi Ombrello ☂️";
        toggleFoldBtn.classList.add('active');
        subtext.textContent = "Cupola in assetto di protezione.";
    }
}

// ASCOLTATORE DEL PULSANTE UNICO
toggleFoldBtn.addEventListener('click', () => {
    if (isStorming) {
        subtext.textContent = "⚠️ Impossibile chiudere l'ombrello durante una tempesta!";
        subtext.style.color = "#ff4757";
        setTimeout(() => subtext.style.color = "#ffffff", 2000);
        return;
    }
    setCanopyState(!isFolded); // Inverte lo stato corrente (se è aperto chiude, se è chiuso apre)
});

// METEO
rainBtn.addEventListener('click', () => {
    isStorming = !isStorming;
    if (isStorming) {
        setCanopyState(false); // Forza l'apertura automatica in caso di pioggia
        createHeavyRain();
        startSplashes();
        document.body.classList.add('stormy');
        umbrella.classList.remove('hover-effect');
        umbrella.classList.add('storm-effect');
        canopy.style.fill = "url(#canopyRainRealism)";
        rainbowStop1.classList.add('rainbow-canopy');
        rainBtn.textContent = "Placa il Vento ☀️";
        rainBtn.classList.add('active');
        subtext.textContent = "🌪️ Tempesta rilevata! Apertura d'emergenza automatica.";
    } else {
        rainContainer.innerHTML = '';
        clearInterval(splashInterval);
        document.body.classList.remove('stormy');
        umbrella.classList.remove('storm-effect');
        umbrella.classList.add('hover-effect');
        rainbowStop1.classList.remove('rainbow-canopy');
        canopy.style.fill = "url(#canopyRealism)";
        rainBtn.textContent = "Attiva Tempesta 🌪️";
        rainBtn.classList.remove('active');
        setCanopyState(true); // Si richiude automaticamente al ritorno del sole
    }
});

// LAMA
bladeBtn.addEventListener('click', () => {
    isBladeDrawn = !isBladeDrawn;
    if(isBladeDrawn) {
        if(isFolded) setCanopyState(false);
        blade.classList.add('drawn');
        bladeBtn.textContent = "Rinfodera Lama 🛡️";
        bladeBtn.classList.add('active');
        subtext.textContent = "⚔️ ALLARME: Meccanismo di sicurezza e difesa attivato.";
        subtext.style.color = "#ff4757";
        currentAlarm = playAlarmSound();
    } else {
        blade.classList.remove('drawn');
        bladeBtn.textContent = "Estrrai Lama ⚔️";
        bladeBtn.classList.remove('active');
        subtext.style.color = "#ffffff";
        subtext.textContent = "Sistema Ombrello Tattico - Dispositivi di Autodifesa Integrati";
        if (currentAlarm) {
            clearInterval(alarmInterval);
            currentAlarm.osc.stop();
            currentAlarm.osc.disconnect();
            currentAlarm.gain.disconnect();
            currentAlarm = null;
        }
    }
});

// SPRAY PEPERONCINO
sprayBtn.addEventListener('click', () => {
    if(isFolded) setCanopyState(false);
    subtext.textContent = "🔥 Dispositivo di contrasto attivato. Spray al peperoncino nebulizzato.";
    subtext.style.color = "#ffa502";
    sprayBtn.disabled = true;

    let tempAlarm = playAlarmSound();
    setTimeout(() => {
        clearInterval(alarmInterval);
        tempAlarm.osc.stop();
        tempAlarm.osc.disconnect();
        tempAlarm.gain.disconnect();
    }, 1500);

    // 1. Recupera gli elementi della punta dorata e del contenitore SVG
    const svgElement = document.getElementById('umbrella-svg');
    const tipLine = document.querySelector('line[stroke="#d4af37"]');

    if (svgElement && tipLine) {
        // 2. Crea un punto SVG virtuale posizionato sulle coordinate x1 e y1 della tua punta
        const pt = svgElement.createSVGPoint();
        pt.x = 100; // Valore x1 della punta
        pt.y = -5;  // Valore y1 della punta

        // 3. Trasforma il punto SVG in pixel reali dello schermo (coerente con il viewport del browser)
        const exactScreenPos = pt.matrixTransform(tipLine.getScreenCTM());

        // 4. Avvia il ciclo per generare le gocce
        for (let i = 0; i < 40; i++) {
            setTimeout(() => {
                const drop = document.createElement('div');
                drop.classList.add('pepper-drop');
                
                // Posiziona le particelle sul punto esatto appena calcolato
                drop.style.left = exactScreenPos.x + 'px';
                drop.style.top = exactScreenPos.y + 'px';
                
                const size = Math.random() * 6 + 4;
                drop.style.width = size + 'px';
                drop.style.height = size + 'px';
                drop.style.animationDelay = (Math.random() * 0.2) + 's';
                document.body.appendChild(drop);
                setTimeout(() => drop.remove(), 600);
            }, i * 8);
        }
    }

    setTimeout(() => {
        sprayBtn.disabled = false;
        subtext.style.color = "#ffffff";
        subtext.textContent = isStorming ? "🌪️ Il vento sta cambiando!" : "Sistema Ombrello Tattico - Dispositivi di Autodifesa Integrati";
    }, 2000);
});

// VOCALE
singBtn.addEventListener('click', () => {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.resume();
    window.speechSynthesis.cancel();
    
    const songText = "Attenzione! Questo ombrello è protetto da dispositivi di sicurezza integrati per l'autodifesa personale.";
    const utterance = new SpeechSynthesisUtterance(songText);
    utterance.lang = 'it-IT';
    utterance.pitch = 1.05; 
    utterance.rate = 0.95;

    utterance.onstart = () => {
        if (beak) beak.classList.add('talking-beak');
        subtext.textContent = "🔊 Vocale: Misure di sicurezza e protocollo di emergenza attivi.";
        subtext.style.color = "#f1c40f";
        singBtn.disabled = true;
    };

    utterance.onend = () => {
        if (beak) beak.classList.remove('talking-beak');
        subtext.style.color = "#ffffff";
		subtext.textContent = isStorming ? "🌪️ Il vento sta cambiando! 🌪️" : "Sistema Ombrello Tattico - Dispositivi di Autodifesa Integrati";
		singBtn.disabled = false;
	};
	window.utteranceHolder = utterance;
	window.speechSynthesis.speak(utterance);
});