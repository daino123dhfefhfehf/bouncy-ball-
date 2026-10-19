// ==========================================
// CONFIGURACIÓN INICIAL Y REFERENCIAS DOM
// ==========================================
const canvas = document.getElementById('miCanvas');
const ctx = canvas ? canvas.getContext('2d') : null;
const mensaje = document.getElementById('mensaje');
const netCountEl = document.getElementById('netCount');
const skinsGrid = document.getElementById('skinsGrid');
const logrosGrid = document.getElementById('logrosGrid');
const dificultadBadge = document.getElementById('dificultadBadge');
const comboContainer = document.getElementById('comboContainer');
const comboCount = document.getElementById('comboCount');
const transicionOverlay = document.getElementById('transicionOverlay');

const modalTienda = document.getElementById('modalTienda');
const btnTienda = document.getElementById('btnTienda');
const cerrarTienda = document.getElementById('cerrarTienda');
const modalLogros = document.getElementById('modalLogros');
const btnLogros = document.getElementById('btnLogros');
const cerrarLogros = document.getElementById('cerrarLogros');
const modalDificultad = document.getElementById('modalDificultad');
const btnReiniciar = document.getElementById('btnReiniciar');
const btnVolverMenu = document.getElementById('btnVolverMenu');
const botonesMenuContainer = document.getElementById('botonesMenuContainer');

if (canvas) {
    canvas.width = 1280;
    canvas.height = 720;
}

// ==========================================
// ESTADO Y VARIABLES GLOBALES
// ==========================================
let nets = parseInt(localStorage.getItem('nets')) || 0;
let recordCombo = parseInt(localStorage.getItem('recordCombo')) || 0;
let skinEquipada = localStorage.getItem('skinEquipada') || 'clasica';
let skinsDesbloqueadas = JSON.parse(localStorage.getItem('skinsDesbloqueadas')) || ['clasica'];
let logrosCompletados = JSON.parse(localStorage.getItem('logrosCompletados')) || [];
let stats = JSON.parse(localStorage.getItem('stats')) || {};
function sumarStat(k) { stats[k] = (stats[k] || 0) + 1; }
function stat(k) { return stats[k] || 0; }

let pantallaActual = "menu"; // "menu", "juego"
let clicksParaEmpezar = 5;
let bolaEnEsperaSaque = true;
let clicksConsecutivos = 0;
let dificultadActual = "facil";

let colorFondoDinamico = "#14141f";
let tiempoMenuFlotar = 0;
let particulas = [];
let ondasExplosion = [];
let portalesVisuales = [];
let fragmentosCristal = [];

let cursorCanvasX = 640;
let cursorCanvasY = 360;

// VARIABLES TNT 🧨
let tntRebotesSeguidos = 0;
let tntEnCooldown = false;
let tntTiempoRestanteCooldown = 0;
let tntTimerInterval = null;

// VARIABLES CHICLE 🫧
let chicleUsosRestantes = 5;
let chicleEnCooldown = false;
let chicleTiempoRestante = 0;
let chicleTimerInterval = null;
let chiclePegada = false;
let chicleTimerSuperficie = null;
let chicleEscalaX = 1;
let chicleEscalaY = 1;
let chicleVelX = 0;
let chicleVelY = 0;

// VARIABLES HABILIDADES NUEVAS
let antiCargas = 1;
let hieloCongelado = 0;
let magmaUltimoBonus = -1000;
let imanAcumulador = 0;
let dragonCarga = 0;
let escalaPantalla = 1;
let fantasmaUltimo = -10000;

// VARIABLES ESPEJO 🪩
let espejoQuiebresSeguidos = 5;
let espejoBlindado = false;
let espejoTiempoBlindaje = 0;
let espejoTimerInterval = null;

// VARIABLES GOKU 🔥
const GOKU_FASES = [
    { nombre: "Goku Base", c1: "#ffffff", c2: "#22f", c3: "#000066" },
    { nombre: "Super Saiyan ⚡", c1: "#ffffff", c2: "#ffd700", c3: "#b8860b" },
    { nombre: "Super Saiyan 2 ⚡🔥", c1: "#ffffff", c2: "#ffee33", c3: "#daa520" },
    { nombre: "Super Saiyan 3 🔥", c1: "#ffffff", c2: "#ffcc00", c3: "#996515" },
    { nombre: "Super Saiyan God 🔴", c1: "#ffffff", c2: "#ff4d4d", c3: "#800000" },
    { nombre: "Super Saiyan Blue 🔵", c1: "#ffffff", c2: "#00d2d3", c3: "#0984e3" },
    { nombre: "Ultra Instinto ⚪✨", c1: "#ffffff", c2: "#a4b0be", c3: "#2f3542" }
];
let gokuIndiceFase = 0;

// ==========================================
// CATÁLOGO DE SKINS
// ==========================================
const HABILIDADES = {
    clasica: "Racha dorada: cada 10 clics ganas +100 Nets extra.",
    fuego: "Inferno: con racha de 10 o más, tus clics ganan el doble.",
    plasma: "Descarga: cada 4 clics suelta un rayo con +120 Nets.",
    minecraft: "Cada rebote explota (+100 Nets). Recarga de 20s tras 5 rebotes.",
    goku: "Cada 5 clics evoluciona (+100). Cada fase suma +25 Nets por clic.",
    espejo: "Cada rebote quiebra el cristal (+300 Nets). Blindaje de 20s tras 5.",
    chicle: "Se pega a las superficies (+75 Nets). Recarga rápida de 12s.",
    iman: "Persigue tu cursor y da +10 Nets cada medio segundo si lo mantienes cerca.",
    antimateria: "Vacío: absorbe 1 caída al suelo sin perder la racha (+100). Gana otra carga cada 10 clics (máx. 2).",
    cuantica: "Cada teletransporte por los portales da +100 Nets.",
    hielocorrupto: "Cada 10 clics congela el tiempo; si haces clic congelada ganas +150.",
    magma: "Quemadura: cada rebote en pared o techo da +60 Nets.",
    meteoro: "Impacto: si haces clic con la bola cayendo rápido ganas +300 Nets.",
    glitch: "Error crítico: 25% de probabilidad de que un clic dé x4 Nets.",
    estrella: "Deseo: todos tus clics ganan el doble y cada 5 clics +250 Nets.",
    tiempo: "Tiempo lento: la bola cae 40% más despacio y cada clic da +30 Nets.",
    midas: "Toque de Midas: cada clic da +75 Nets fijos y además el 0.5% de tus Nets (máx. +1,000).",
    ninja: "Evasión: los clics fallados no rompen tu racha en Difícil. Cada clic da +75 Nets.",
    dragon: "Aliento: cada rebote en pared o techo carga el aliento; con 5 cargas, tu clic da +1,000 Nets.",
    solar: "Supernova: cada 15 clics explota con +1,500 Nets.",
    arcoiris: "Arcoíris: cada 10 de combo sube tu multiplicador de Nets (hasta x10).",
    fantasma: "Atraviesa el suelo: cada 8s te salva de una caída (+150 Nets). Cada clic da +50 Nets.",
    cosmos: "Big Bang: todos tus clics ganan x3 y cada 20 clics explotan con +5,000 Nets."
};

const SKINS = {
    clasica: { nombre: "Clásica Azul", precio: 0, c1: "#ffffff", c2: "#4e54c8", c3: "#1b1f5c", part: 200, tipo: "3d" },
    fuego: { nombre: "Bola de Fuego 🔥", precio: 2500, c1: "#fff200", c2: "#ff3300", c3: "#4a0000", part: 10, tipo: "3d" },
    plasma: { nombre: "Plasma Eléctrico ⚡", precio: 4000, c1: "#ffffff", c2: "#00ffcc", c3: "#004466", part: 140, tipo: "3d" },
    minecraft: { nombre: "Bloque de TNT 🧨", precio: 12000, c1: "#ff3333", c2: "#ffffff", c3: "#333333", part: 0, tipo: "tnt" },
    goku: { nombre: "Goku Saiyan 🔥", precio: 15000, c1: "#ffffff", c2: "#be2edd", c3: "#3a005c", part: 60, tipo: "goku" },
    espejo: { nombre: "Bola Espejo 🪩", precio: 18000, c1: "#ffffff", c2: "#dfe4ea", c3: "#747d8c", part: 210, tipo: "espejo" },
    chicle: { nombre: "Burbuja Chicle 🫧", precio: 12000, c1: "#ffffff", c2: "#ff9ff3", c3: "#f368e0", part: 300, tipo: "chicle" },
    iman: { nombre: "Bola Imán 🧲", precio: 22000, c1: "#ffffff", c2: "#ff4757", c3: "#2f3542", part: 350, tipo: "iman" },
    antimateria: { nombre: "Antimateria 🌀", precio: 26000, c1: "#ffffff", c2: "#a55eea", c3: "#4b7bec", part: 270, tipo: "antimateria" },
    cuantica: { nombre: "Bola Cuántica ⚛️", precio: 28000, c1: "#ffffff", c2: "#00d2d3", c3: "#0984e3", part: 180, tipo: "cuantica" },
    hielocorrupto: { nombre: "Hielo Corrupto 🧊💀", precio: 30000, c1: "#e056fd", c2: "#686de0", c3: "#130f40", part: 280, tipo: "hielocorrupto" },
    magma: { nombre: "Cubo de Magma 🌋", precio: 30000, c1: "#ff5252", c2: "#d32f2f", c3: "#3b0000", part: 15, tipo: "magma" },
    meteoro: { nombre: "Meteoro Alfa ☄️", precio: 36000, c1: "#ffbe76", c2: "#ff4d4d", c3: "#1e272e", part: 12, tipo: "meteoro" },
    glitch: { nombre: "Glitch Overlord 👾", precio: 42000, c1: "#00ff66", c2: "#ff007f", c3: "#111122", part: 120, tipo: "glitch" },
    estrella: { nombre: "Estrella Fugaz 🌠", precio: 50000, c1: "#ffffff", c2: "#70a1ff", c3: "#1e90ff", part: 210, tipo: "estrella" },
    tiempo: { nombre: "Reloj Temporal ⏳", precio: 70000, c1: "#fff3c4", c2: "#d4a017", c3: "#5c3d00", part: 100, tipo: "tiempo" },
    midas: { nombre: "Rey Midas 👑", precio: 100000, c1: "#fff6b0", c2: "#ffd700", c3: "#8a6200", part: 200, tipo: "midas" },
    ninja: { nombre: "Ninja Sombra 🥷", precio: 140000, c1: "#666666", c2: "#c0392b", c3: "#0a0a0a", part: 80, tipo: "ninja" },
    dragon: { nombre: "Dragón Ancestral 🐉", precio: 190000, c1: "#ffd29c", c2: "#e74c3c", c3: "#4a0b0b", part: 220, tipo: "dragon" },
    solar: { nombre: "Supernova Solar ☀️", precio: 250000, c1: "#ffffff", c2: "#ffb300", c3: "#d84315", part: 250, tipo: "solar" },
    arcoiris: { nombre: "Unicornio Arcoíris 🦄", precio: 320000, c1: "#ffffff", c2: "#ff77d8", c3: "#7b61ff", part: 300, tipo: "arcoiris" },
    fantasma: { nombre: "Bola Fantasma 👻", precio: 400000, c1: "#ffffff", c2: "#cfd8ff", c3: "#7c83c9", part: 150, tipo: "fantasma" },
    cosmos: { nombre: "Cosmos Eterno 🌌", precio: 500000, c1: "#ffffff", c2: "#9b59ff", c3: "#12063a", part: 350, tipo: "cosmos" }
};

const LOGROS = [
    { id: 'primeros_pasos', titulo: '¡Primeros Pasos!', desc: 'Consigue 100 Nets acumulados', recompensa: 200, meta: 100 },
    { id: 'combo25', titulo: '¡Maestro del Rebote!', desc: 'Alcanza un combo de 25 clics', recompensa: 2000, meta: 25 },
    { id: 'nets5k', titulo: '¡Inversionista!', desc: 'Acumula 5,000 Nets en total', recompensa: 5000, meta: 5000 },

    // Combos
    { id: 'combo10', titulo: '¡Calentando!', desc: 'Alcanza un combo de 10 clics', recompensa: 500, check: () => recordCombo >= 10 },
    { id: 'combo50', titulo: '¡Imparable!', desc: 'Alcanza un combo de 50 clics', recompensa: 5000, check: () => recordCombo >= 50 },
    { id: 'combo100', titulo: 'Leyenda del Rebote', desc: 'Alcanza un combo de 100 clics', recompensa: 15000, check: () => recordCombo >= 100 },
    { id: 'combo200', titulo: 'Dedos de Acero', desc: 'Alcanza un combo de 200 clics', recompensa: 40000, check: () => recordCombo >= 200 },
    { id: 'dificil30', titulo: 'Valiente', desc: 'Llega a un combo de 30 en dificultad Difícil', recompensa: 10000, check: () => dificultadActual === 'dificil' && clicksConsecutivos >= 30 },

    // Nets y clics
    { id: 'nets25k', titulo: 'Ahorrador', desc: 'Ten 25,000 Nets al mismo tiempo', recompensa: 5000, check: () => nets >= 25000 },
    { id: 'nets100k', titulo: 'Millonario', desc: 'Ten 100,000 Nets al mismo tiempo', recompensa: 20000, check: () => nets >= 100000 },
    { id: 'clics100', titulo: 'Dedo Caliente', desc: 'Haz 100 clics en la bola', recompensa: 500, check: () => stat('clics') >= 100 },
    { id: 'clics1000', titulo: 'Mil Toques', desc: 'Haz 1,000 clics en la bola', recompensa: 3000, check: () => stat('clics') >= 1000 },
    { id: 'clics5000', titulo: 'Máquina de Clics', desc: 'Haz 5,000 clics en la bola', recompensa: 15000, check: () => stat('clics') >= 5000 },

    // Colección de skins
    { id: 'skins3', titulo: 'Coleccionista', desc: 'Desbloquea 3 skins', recompensa: 1500, check: () => skinsDesbloqueadas.length >= 3 },
    { id: 'skins8', titulo: 'Gran Coleccionista', desc: 'Desbloquea 8 skins', recompensa: 8000, check: () => skinsDesbloqueadas.length >= 8 },
    { id: 'skinsTodas', titulo: 'Maestro de Skins', desc: 'Desbloquea todas las skins', recompensa: 50000, check: () => skinsDesbloqueadas.length >= Object.keys(SKINS).length },

    // Habilidades de cada skin
    { id: 'fuego30', titulo: 'Inferno Eterno', desc: 'Llega a un combo de 30 con la Bola de Fuego', recompensa: 5000, check: () => skinEquipada === 'fuego' && clicksConsecutivos >= 30 },
    { id: 'plasma25', titulo: 'Tormenta Eléctrica', desc: 'Suelta 25 descargas con Plasma Eléctrico', recompensa: 3000, check: () => stat('descargas') >= 25 },
    { id: 'tnt50', titulo: 'Demoledor', desc: 'Explota 50 veces con el Bloque de TNT', recompensa: 5000, check: () => stat('explosiones') >= 50 },
    { id: 'gokuMax', titulo: 'Más Allá del Límite', desc: 'Llega a Ultra Instinto con Goku', recompensa: 10000, check: () => skinEquipada === 'goku' && gokuIndiceFase === GOKU_FASES.length - 1 },
    { id: 'espejo25', titulo: 'Rompe Espejos', desc: 'Quiebra el cristal 25 veces con la Bola Espejo', recompensa: 5000, check: () => stat('quiebres') >= 25 },
    { id: 'chicle20', titulo: 'Pegajoso', desc: 'Pégate 20 veces a una superficie con el Chicle', recompensa: 3000, check: () => stat('pegadas') >= 20 },
    { id: 'anti10', titulo: 'Horizonte de Sucesos', desc: 'Absorbe 10 caídas con la Antimateria', recompensa: 4000, check: () => stat('absorbidas') >= 10 },
    { id: 'cuantica30', titulo: 'Viajero Dimensional', desc: 'Cruza 30 portales con la Bola Cuántica', recompensa: 5000, check: () => stat('portales') >= 30 },
    { id: 'hielo10', titulo: 'Cero Absoluto', desc: 'Acierta 10 golpes congelados con el Hielo Corrupto', recompensa: 5000, check: () => stat('congelados') >= 10 },
    { id: 'magma40', titulo: 'Piel de Lava', desc: 'Quema 40 paredes con el Cubo de Magma', recompensa: 4000, check: () => stat('quemaduras') >= 40 },
    { id: 'meteoro15', titulo: 'Lluvia de Meteoros', desc: 'Logra 15 impactos con el Meteoro Alfa', recompensa: 6000, check: () => stat('impactos') >= 15 },
    { id: 'glitch10', titulo: 'Suerte Digital', desc: 'Consigue 10 errores críticos con el Glitch', recompensa: 6000, check: () => stat('criticos') >= 10 },
    { id: 'estrella10', titulo: 'Pide un Deseo', desc: 'Cumple 10 deseos con la Estrella Fugaz', recompensa: 8000, check: () => stat('deseos') >= 10 },

    // Skins legendarias
    { id: 'ninja20', titulo: 'Intocable', desc: 'Evade 20 fallos en Difícil con el Ninja Sombra', recompensa: 8000, check: () => stat('evasiones') >= 20 },
    { id: 'dragon10', titulo: 'Señor de los Dragones', desc: 'Libera 10 alientos con el Dragón Ancestral', recompensa: 10000, check: () => stat('alientos') >= 10 },
    { id: 'solar10', titulo: 'Nacimiento de una Estrella', desc: 'Provoca 10 supernovas con la Supernova Solar', recompensa: 15000, check: () => stat('supernovas') >= 10 },
    { id: 'arco90', titulo: 'Más Allá del Arcoíris', desc: 'Llega al multiplicador x10 con el Unicornio Arcoíris', recompensa: 20000, check: () => skinEquipada === 'arcoiris' && clicksConsecutivos >= 90 },
    { id: 'fantasma10', titulo: 'Alma en Pena', desc: 'Reaparece 10 veces con la Bola Fantasma', recompensa: 15000, check: () => stat('reapariciones') >= 10 },
    { id: 'bigbang10', titulo: 'Creador de Universos', desc: 'Provoca 10 Big Bangs con el Cosmos Eterno', recompensa: 50000, check: () => stat('bigbangs') >= 10 },
    { id: 'cosmosDueno', titulo: 'Dueño del Cosmos', desc: 'Desbloquea el Cosmos Eterno', recompensa: 100000, check: () => skinsDesbloqueadas.includes('cosmos') },

    // Modo Historia
    { id: 'hist1', titulo: 'Aventurero', desc: 'Completa el primer capítulo del Modo Historia', recompensa: 1000, check: () => historiaProgreso.completados.length >= 1 },
    { id: 'hist5', titulo: 'Héroe de Rebotia', desc: 'Completa 5 capítulos del Modo Historia', recompensa: 5000, check: () => historiaProgreso.completados.length >= 5 },
    { id: 'histFin', titulo: 'Leyenda de Rebotia', desc: 'Completa todo el Modo Historia', recompensa: 30000, check: () => historiaProgreso.completados.length >= CAPITULOS.length },
    { id: 'hist20', titulo: 'Explorador de Rebotia', desc: 'Completa 20 capítulos del Modo Historia', recompensa: 20000, check: () => historiaProgreso.completados.length >= 20 },
    { id: 'jefes5', titulo: 'Cazajefes', desc: 'Derrota a 5 jefes del Modo Historia', recompensa: 15000, check: () => jefesDerrotados() >= 5 },
    { id: 'jefesTodos', titulo: 'Rey de los Jefes', desc: 'Derrota a todos los jefes del Modo Historia', recompensa: 60000, check: () => jefesDerrotados() >= Object.keys(JEFES).length }
];

let bola = {
    x: 640,
    y: 360,
    radio: 55,
    vx: 0,
    vy: 0,
    friccion: 0.99,
    gravedadBase: 0.55
};

// ==========================================
// TRANSICIONES Y PROGRESO
// ==========================================
function ejecutarTransicion(callback) {
    if (transicionOverlay) transicionOverlay.classList.add('activo');
    setTimeout(() => {
        if (callback) callback();
        setTimeout(() => {
            if (transicionOverlay) transicionOverlay.classList.remove('activo');
        }, 150);
    }, 400);
}

function guardarProgreso() {
    localStorage.setItem('nets', nets);
    localStorage.setItem('recordCombo', recordCombo);
    localStorage.setItem('skinEquipada', skinEquipada);
    localStorage.setItem('skinsDesbloqueadas', JSON.stringify(skinsDesbloqueadas));
    localStorage.setItem('logrosCompletados', JSON.stringify(logrosCompletados));
    localStorage.setItem('stats', JSON.stringify(stats));
    if (netCountEl) netCountEl.textContent = nets;
    verificarLogros();
}

function verificarLogros() {
    let logroNuevo = false;
    LOGROS.forEach(logro => {
        if (!logrosCompletados.includes(logro.id)) {
            let cumplido = false;
            if (logro.id === 'primeros_pasos' && nets >= 100) cumplido = true;
            if (logro.id === 'combo25' && recordCombo >= 25) cumplido = true;
            if (logro.id === 'nets5k' && nets >= 5000) cumplido = true;
            if (logro.check && logro.check()) cumplido = true;

            if (cumplido) {
                logrosCompletados.push(logro.id);
                nets += logro.recompensa;
                logroNuevo = true;
                if (mensaje) {
                    mensaje.textContent = `🏆 ¡Logro desbloqueado: ${logro.titulo} (+${logro.recompensa} Nets)!`;
                    mensaje.style.color = "#ffd700";
                }
            }
        }
    });
    if (logroNuevo) {
        localStorage.setItem('nets', nets);
        localStorage.setItem('logrosCompletados', JSON.stringify(logrosCompletados));
        if (netCountEl) netCountEl.textContent = nets;
    }
}

// ==========================================
// EFECTOS VISUALES
// ==========================================
function dispararEfectoExplosionHd(x, y) {
    ondasExplosion.push({ x: x, y: y, radioActual: 10, radioMax: 120, opacidad: 1.0 });
    for (let i = 0; i < 40; i++) {
        let angulo = Math.random() * Math.PI * 2;
        let velocidad = Math.random() * 12 + 2;
        let esFuego = Math.random() > 0.3;
        particulas.push({
            x: x, y: y,
            vx: Math.cos(angulo) * velocidad,
            vy: Math.sin(angulo) * velocidad,
            radio: Math.random() * 6 + 2,
            color: esFuego ? (Math.random() > 0.5 ? "#ff3300" : "#ffcc00") : "#555555",
            vida: 1.0, decaida: Math.random() * 0.03 + 0.02
        });
    }
}

function dispararQuiebreEspejo(x, y) {
    for (let i = 0; i < 30; i++) {
        let angulo = Math.random() * Math.PI * 2;
        let velocidad = Math.random() * 10 + 3;
        fragmentosCristal.push({
            x: x, y: y,
            vx: Math.cos(angulo) * velocidad,
            vy: Math.sin(angulo) * velocidad,
            ancho: Math.random() * 12 + 4,
            alto: Math.random() * 8 + 3,
            rotacion: Math.random() * Math.PI,
            vRot: (Math.random() - 0.5) * 0.2,
            vida: 1.0,
            decaida: 0.025
        });
    }
}

function dispararPortalAzulVisual(x, y) {
    portalesVisuales.push({ x: x, y: y, radio: 10, opacidad: 1.0 });
    for (let i = 0; i < 25; i++) {
        particulas.push({
            x: x, y: y,
            vx: (Math.random() - 0.5) * 12,
            vy: (Math.random() - 0.5) * 12,
            radio: Math.random() * 4 + 2,
            color: "#00d2d3",
            vida: 1.0, decaida: 0.04
        });
    }
}

function crearParticulas(x, y) {
    const skin = SKINS[skinEquipada] || SKINS.clasica;
    let cantidad = skin.part || 15;
    if (cantidad <= 0) return;
    for (let i = 0; i < Math.min(cantidad, 25); i++) {
        particulas.push({
            x: x, y: y,
            vx: (Math.random() - 0.5) * 10,
            vy: (Math.random() - 0.5) * 10,
            radio: Math.random() * 5 + 2,
            color: skin.c2, vida: 1.0, decaida: 0.03
        });
    }
}

function actualizarParticulas() {
    for (let i = particulas.length - 1; i >= 0; i--) {
        let p = particulas[i];
        p.x += p.vx; p.y += p.vy;
        p.vida -= p.decaida || 0.03;
        if (p.vida <= 0) particulas.splice(i, 1);
    }
    for (let i = ondasExplosion.length - 1; i >= 0; i--) {
        let o = ondasExplosion[i];
        o.radioActual += 6; o.opacidad -= 0.05;
        if (o.opacidad <= 0) ondasExplosion.splice(i, 1);
    }
    for (let i = portalesVisuales.length - 1; i >= 0; i--) {
        let pv = portalesVisuales[i];
        pv.radio += 2; pv.opacidad -= 0.04;
        if (pv.opacidad <= 0) portalesVisuales.splice(i, 1);
    }
    for (let i = fragmentosCristal.length - 1; i >= 0; i--) {
        let fc = fragmentosCristal[i];
        fc.x += fc.vx;
        fc.y += fc.vy;
        fc.vy += 0.4;
        fc.rotacion += fc.vRot;
        fc.vida -= fc.decaida;
        if (fc.vida <= 0) fragmentosCristal.splice(i, 1);
    }

    // Resorte elástico: solo se usa con la skin chicle
    chicleVelX += (1 - chicleEscalaX) * 0.18;
    chicleVelY += (1 - chicleEscalaY) * 0.18;
    chicleVelX *= 0.72;
    chicleVelY *= 0.72;
    chicleEscalaX += chicleVelX;
    chicleEscalaY += chicleVelY;
}

// ==========================================
// COOLDOWNS Y ESTADOS ESPECIALES
// ==========================================
function activarCooldownTNT() {
    tntEnCooldown = true;
    tntRebotesSeguidos = 0;
    tntTiempoRestanteCooldown = 20;
    clicksConsecutivos = 0;
    if (comboCount) comboCount.textContent = 0;

    if (mensaje) {
        mensaje.textContent = `⚠️ TNT Sobrecargada! Espera ${tntTiempoRestanteCooldown}s`;
        mensaje.style.color = "#ff4757";
    }

    if (tntTimerInterval) clearInterval(tntTimerInterval);
    tntTimerInterval = setInterval(() => {
        tntTiempoRestanteCooldown--;
        if (tntEnCooldown && mensaje && skinEquipada === 'minecraft') {
            mensaje.textContent = `⏳ Recargando TNT... (${tntTiempoRestanteCooldown}s)`;
            mensaje.style.color = "#ffa502";
        }
        if (tntTiempoRestanteCooldown <= 0) {
            clearInterval(tntTimerInterval);
            tntEnCooldown = false;
            if (mensaje && skinEquipada === 'minecraft') {
                mensaje.textContent = "✅ ¡TNT lista de nuevo!";
                mensaje.style.color = "#2ed573";
            }
        }
    }, 1000);
}

function activarCooldownChicle() {
    chicleEnCooldown = true;
    chicleUsosRestantes = 0;
    chicleTiempoRestante = 12;

    if (mensaje) {
        mensaje.textContent = `🫧 ¡Chicle agotado! Cooldown de ${chicleTiempoRestante}s`;
        mensaje.style.color = "#ff4757";
    }

    if (chicleTimerInterval) clearInterval(chicleTimerInterval);
    chicleTimerInterval = setInterval(() => {
        chicleTiempoRestante--;
        if (chicleEnCooldown && mensaje && skinEquipada === 'chicle') {
            mensaje.textContent = `⏳ Recargando chicle... (${chicleTiempoRestante}s)`;
            mensaje.style.color = "#ffa502";
        }
        if (chicleTiempoRestante <= 0) {
            clearInterval(chicleTimerInterval);
            chicleEnCooldown = false;
            chicleUsosRestantes = 5;
            if (mensaje && skinEquipada === 'chicle') {
                mensaje.textContent = "✅ ¡Burbuja lista! (5 usos disponibles)";
                mensaje.style.color = "#2ed573";
            }
        }
    }, 1000);
}

function activarCristalBlindadoEspejo() {
    espejoBlindado = true;
    espejoQuiebresSeguidos = 0;
    espejoTiempoBlindaje = 20;

    if (mensaje) {
        mensaje.textContent = `🛡️ ¡Cristal blindado activado por 30s!`;
        mensaje.style.color = "#747d8c";
    }

    if (espejoTimerInterval) clearInterval(espejoTimerInterval);
    espejoTimerInterval = setInterval(() => {
        espejoTiempoBlindaje--;
        if (espejoBlindado && mensaje && skinEquipada === 'espejo') {
            mensaje.textContent = `🛡️ Cristal Blindado... (${espejoTiempoBlindaje}s restantes)`;
            mensaje.style.color = "#747d8c";
        }
        if (espejoTiempoBlindaje <= 0) {
            clearInterval(espejoTimerInterval);
            espejoBlindado = false;
            espejoQuiebresSeguidos = 5;
            if (mensaje && skinEquipada === 'espejo') {
                mensaje.textContent = "✨ ¡Espejo restaurado y listo para quebrarse!";
                mensaje.style.color = "#2ed573";
            }
        }
    }, 1000);
}

// ==========================================
// MOTOR FÍSICO Y COLISIONES
// ==========================================
function actualizarFisicas() {
    if (!canvas) return;

    if (pantallaActual === "menu") {
        tiempoMenuFlotar += 0.04;
        bola.x = canvas.width / 2;
        bola.y = canvas.height / 2 + Math.sin(tiempoMenuFlotar) * 20;
        return;
    }

    if (pantallaActual === "juego" && bolaEnEsperaSaque) {
        tiempoMenuFlotar += 0.04;
        bola.y = alturaEspera() + Math.sin(tiempoMenuFlotar) * 12;
        return;
    }

    if (skinEquipada === 'iman' && !bolaEnEsperaSaque) {
        let dx = cursorCanvasX - bola.x;
        let dy = cursorCanvasY - bola.y;
        bola.vx += dx * 0.015;
        bola.vy += dy * 0.015;
        if (Math.hypot(dx, dy) < 150) {
            imanAcumulador++;
            if (imanAcumulador >= 30) { imanAcumulador = 0; nets += 10; guardarProgreso(); }
        }
    }

    if (chiclePegada) {
        bola.vx = 0;
        bola.vy = 0;
        return;
    }

    if (hieloCongelado > 0) {
        hieloCongelado--;
        bola.vx = 0;
        bola.vy = 0;
        if (hieloCongelado === 0 && mensaje) { mensaje.textContent = "🧊 La bola se descongeló"; mensaje.style.color = "#686de0"; }
        return;
    }

    let factorDificultad = dificultadActual === "media" ? 1.35 : (dificultadActual === "dificil" ? 1.6 : 1.0);
    const gravedadActual = (bola.gravedadBase + (clicksConsecutivos * 0.015)) * factorDificultad * (skinEquipada === 'tiempo' ? 0.6 : 1) * modH('gravedad', 1);

    bola.vy += gravedadActual;
    const vientoHistoria = modH('viento', 0);
    if (vientoHistoria) bola.vx += Math.sin(performance.now() / 1300) * vientoHistoria;
    bola.vy *= bola.friccion;
    bola.vx *= bola.friccion;
    bola.y += bola.vy;
    bola.x += bola.vx;

    // Colisión Suelo
    if (bola.y + bola.radio >= canvas.height - 10) {
        if (skinEquipada === 'minecraft' && !tntEnCooldown) {
            tntRebotesSeguidos++;
                sumarStat('explosiones');
            nets += 100;
            guardarProgreso();
            dispararEfectoExplosionHd(bola.x, bola.y);
            if (tntRebotesSeguidos >= 5) {
                activarCooldownTNT();
                bolaEnEsperaSaque = true;
                bola.vx = 0; bola.vy = 0; bola.y = alturaEspera();
            } else {
                bola.y = canvas.height - 10 - bola.radio;
                bola.vy *= -1;
            }
        } else if (skinEquipada === 'chicle' && !chicleEnCooldown && chicleUsosRestantes > 0) {
            chicleUsosRestantes--;
            chiclePegada = true;
            nets += 75;
            sumarStat('pegadas');
            guardarProgreso();
            bola.y = canvas.height - 10 - bola.radio;
            chicleEscalaX = 1.4;
            chicleEscalaY = 0.6;
            crearParticulas(bola.x, bola.y);
            if (mensaje) {
                mensaje.textContent = `🫧 ¡Chicle pegado al suelo! (5s) [Usos: ${chicleUsosRestantes}/5]`;
                mensaje.style.color = "#ff9ff3";
            }
            if (chicleTimerSuperficie) clearTimeout(chicleTimerSuperficie);
            chicleTimerSuperficie = setTimeout(() => {
                chiclePegada = false;
                bola.vy = -13;
                chicleEscalaX = 0.7;
                chicleEscalaY = 1.3;
                if (chicleUsosRestantes === 0) activarCooldownChicle();
            }, 5000);
        } else if (skinEquipada === 'fantasma' && performance.now() - fantasmaUltimo >= 8000) {
            fantasmaUltimo = performance.now();
            sumarStat('reapariciones');
            bola.y = canvas.height - 10 - bola.radio;
            bola.vy = -17;
            nets += 150;
            guardarProgreso();
            if (mensaje) { mensaje.textContent = "👻 ¡Atravesaste el suelo y reapareciste! +150 Nets"; mensaje.style.color = "#cfd8ff"; }
        } else if (skinEquipada === 'antimateria' && antiCargas > 0) {
            antiCargas--;
            sumarStat('absorbidas');
            bola.y = canvas.height - 10 - bola.radio;
            bola.vy = -16;
            nets += 100;
            guardarProgreso();
            dispararPortalAzulVisual(bola.x, bola.y);
            if (mensaje) { mensaje.textContent = `🌀 ¡El vacío absorbió la caída! +100 Nets (cargas: ${antiCargas}/2)`; mensaje.style.color = "#a55eea"; }
        } else if (skinEquipada === 'espejo' && !espejoBlindado) {
            bola.y = canvas.height - 10 - bola.radio;
            bola.vy *= -1;
            espejoQuiebresSeguidos--;
            nets += 300;
            guardarProgreso();
            dispararQuiebreEspejo(bola.x, bola.y);
            sumarStat('quiebres');
            if (mensaje) {
                mensaje.textContent = `🪩 ¡Espejo quebrado! +300 Nets (Restantes: ${espejoQuiebresSeguidos}/5)`;
                mensaje.style.color = "#dfe4ea";
            }
            if (espejoQuiebresSeguidos <= 0) activarCristalBlindadoEspejo();
        } else {
            if (skinEquipada === 'minecraft' && tntEnCooldown) {
                bolaEnEsperaSaque = true;
                bola.vx = 0; bola.vy = 0; bola.y = alturaEspera();
            } else {
                clicksConsecutivos = 0;
                if (comboCount) comboCount.textContent = 0;
                bolaEnEsperaSaque = true;
                bola.vx = 0; bola.vy = 0; bola.y = alturaEspera();
                if (mensaje) { 
                    mensaje.textContent = "💥 ¡Racha perdida! Clic en la bola para reintentar"; 
                    mensaje.style.color = "#ff4d4d"; 
                }
                historiaAlCaer();
            }
        }
    }

    // Colisión Pared Izquierda
    if (bola.x - bola.radio < 0) {
        if (skinEquipada === 'cuantica') {
            sumarStat('portales');
            dispararPortalAzulVisual(bola.x, bola.y);
            bola.x = canvas.width - bola.radio - 5;
            nets += 100;
            guardarProgreso();
            if (mensaje) { mensaje.textContent = "⚛️ ¡Portal Cuántico! Teletransporte lateral +100 Nets"; mensaje.style.color = "#00d2d3"; }
        } else if (skinEquipada === 'chicle' && !chicleEnCooldown && chicleUsosRestantes > 0) {
            chicleUsosRestantes--;
            chiclePegada = true;
            nets += 75;
            sumarStat('pegadas');
            guardarProgreso();
            bola.x = bola.radio;
            chicleEscalaX = 0.6;
            chicleEscalaY = 1.4;
            crearParticulas(bola.x, bola.y);
            if (mensaje) {
                mensaje.textContent = `🫧 ¡Chicle pegado a pared izq! (5s) [Usos: ${chicleUsosRestantes}/5]`;
                mensaje.style.color = "#ff9ff3";
            }
            if (chicleTimerSuperficie) clearTimeout(chicleTimerSuperficie);
            chicleTimerSuperficie = setTimeout(() => {
                chiclePegada = false;
                bola.vx = 12;
                chicleEscalaX = 1.3;
                chicleEscalaY = 0.7;
                if (chicleUsosRestantes === 0) activarCooldownChicle();
            }, 5000);
        } else if (skinEquipada === 'espejo' && !espejoBlindado) {
            bola.x = bola.radio;
            bola.vx *= -1;
            espejoQuiebresSeguidos--;
            nets += 300;
            guardarProgreso();
            dispararQuiebreEspejo(bola.x, bola.y);
            sumarStat('quiebres');
            if (mensaje) {
                mensaje.textContent = `🪩 ¡Espejo quebrado en pared izq! +300 Nets (${espejoQuiebresSeguidos}/5)`;
                mensaje.style.color = "#dfe4ea";
            }
            if (espejoQuiebresSeguidos <= 0) activarCristalBlindadoEspejo();
        } else {
            bola.x = bola.radio; 
            bola.vx *= -1;
            if (skinEquipada === 'chicle') { chicleEscalaX = 0.6; chicleEscalaY = 1.4; }
            alRebotarPared(bola.x, bola.y);
            if (skinEquipada === 'minecraft' && !tntEnCooldown) {
                tntRebotesSeguidos++;
                sumarStat('explosiones');
                nets += 100;
                guardarProgreso();
                dispararEfectoExplosionHd(bola.x, bola.y);
                if (tntRebotesSeguidos >= 5) activarCooldownTNT();
            }
        }
    }

    // Colisión Pared Derecha
    if (bola.x + bola.radio > canvas.width) {
        if (skinEquipada === 'cuantica') {
            sumarStat('portales');
            dispararPortalAzulVisual(bola.x, bola.y);
            bola.x = bola.radio + 5;
            nets += 100;
            guardarProgreso();
            if (mensaje) { mensaje.textContent = "⚛️ ¡Portal Cuántico! Teletransporte lateral +100 Nets"; mensaje.style.color = "#00d2d3"; }
        } else if (skinEquipada === 'chicle' && !chicleEnCooldown && chicleUsosRestantes > 0) {
            chicleUsosRestantes--;
            chiclePegada = true;
            nets += 75;
            sumarStat('pegadas');
            guardarProgreso();
            bola.x = canvas.width - bola.radio;
            chicleEscalaX = 0.6;
            chicleEscalaY = 1.4;
            crearParticulas(bola.x, bola.y);
            if (mensaje) {
                mensaje.textContent = `🫧 ¡Chicle pegado a pared der! (5s) [Usos: ${chicleUsosRestantes}/5]`;
                mensaje.style.color = "#ff9ff3";
            }
            if (chicleTimerSuperficie) clearTimeout(chicleTimerSuperficie);
            chicleTimerSuperficie = setTimeout(() => {
                chiclePegada = false;
                bola.vx = -12;
                chicleEscalaX = 1.3;
                chicleEscalaY = 0.7;
                if (chicleUsosRestantes === 0) activarCooldownChicle();
            }, 5000);
        } else if (skinEquipada === 'espejo' && !espejoBlindado) {
            bola.x = canvas.width - bola.radio;
            bola.vx *= -1;
            espejoQuiebresSeguidos--;
            nets += 300;
            guardarProgreso();
            dispararQuiebreEspejo(bola.x, bola.y);
            sumarStat('quiebres');
            if (mensaje) {
                mensaje.textContent = `🪩 ¡Espejo quebrado en pared der! +300 Nets (${espejoQuiebresSeguidos}/5)`;
                mensaje.style.color = "#dfe4ea";
            }
            if (espejoQuiebresSeguidos <= 0) activarCristalBlindadoEspejo();
        } else {
            bola.x = canvas.width - bola.radio; 
            bola.vx *= -1;
            if (skinEquipada === 'chicle') { chicleEscalaX = 0.6; chicleEscalaY = 1.4; }
            alRebotarPared(bola.x, bola.y);
            if (skinEquipada === 'minecraft' && !tntEnCooldown) {
                tntRebotesSeguidos++;
                sumarStat('explosiones');
                nets += 100;
                guardarProgreso();
                dispararEfectoExplosionHd(bola.x, bola.y);
                if (tntRebotesSeguidos >= 5) activarCooldownTNT();
            }
        }
    }

    // Colisión Techo
    if (bola.y - bola.radio < 0) {
        if (skinEquipada === 'cuantica') {
            sumarStat('portales');
            dispararPortalAzulVisual(bola.x, bola.y);
            bola.y = canvas.height - 50 - bola.radio;
            nets += 100;
            guardarProgreso();
            if (mensaje) { mensaje.textContent = "⚛️ ¡Portal Cuántico en techo! +100 Nets"; mensaje.style.color = "#00d2d3"; }
        } else if (skinEquipada === 'espejo' && !espejoBlindado) {
            bola.y = bola.radio;
            bola.vy *= -1;
            espejoQuiebresSeguidos--;
            nets += 300;
            guardarProgreso();
            dispararQuiebreEspejo(bola.x, bola.y);
            sumarStat('quiebres');
            if (mensaje) {
                mensaje.textContent = `🪩 ¡Espejo quebrado en techo! +300 Nets (${espejoQuiebresSeguidos}/5)`;
                mensaje.style.color = "#dfe4ea";
            }
            if (espejoQuiebresSeguidos <= 0) activarCristalBlindadoEspejo();
        } else {
            bola.y = bola.radio; 
            bola.vy *= -1;
            if (skinEquipada === 'chicle') { chicleEscalaX = 1.4; chicleEscalaY = 0.6; }
            alRebotarPared(bola.x, bola.y);
            if (skinEquipada === 'minecraft' && !tntEnCooldown) {
                tntRebotesSeguidos++;
                sumarStat('explosiones');
                nets += 100;
                guardarProgreso();
                dispararEfectoExplosionHd(bola.x, bola.y);
                if (tntRebotesSeguidos >= 5) activarCooldownTNT();
            }
        }
    }
}

// ==========================================
// INTERACCIÓN Y EVOLUCIÓN DE GOKU
// ==========================================
function bonusMagma(x, y) {
    const ahora = performance.now();
    if (skinEquipada !== 'magma' || ahora - magmaUltimoBonus < 400) return;
    magmaUltimoBonus = ahora;
    sumarStat('quemaduras');
    nets += 60;
    guardarProgreso();
    crearParticulas(x, y);
    if (mensaje) { mensaje.textContent = "🌋 ¡Quemadura! +60 Nets"; mensaje.style.color = "#ff5252"; }
}

function alRebotarPared(x, y) {
    bonusMagma(x, y);
    if (skinEquipada === 'dragon' && dragonCarga < 5) {
        dragonCarga++;
        if (mensaje) { mensaje.textContent = dragonCarga >= 5 ? "🐉 ¡Aliento listo! Haz clic para liberarlo" : `🐉 Cargando aliento ${dragonCarga}/5`; mensaje.style.color = "#ff4500"; }
    }
}

function calcularGananciaClic() {
    let g = 50, msg = null, col = "#ffd700";
    const n = clicksConsecutivos;
    switch (skinEquipada) {
        case 'clasica':
            if (n % 10 === 0) { g += 100; msg = "⭐ ¡Racha dorada! +100 Nets"; }
            break;
        case 'fuego':
            if (n >= 10) { g *= 2; msg = "🔥 ¡INFERNO x2!"; col = "#ff7a00"; }
            break;
        case 'plasma':
            if (n % 4 === 0) { g += 120; sumarStat('descargas'); dispararPortalAzulVisual(bola.x, bola.y); msg = "⚡ ¡Descarga eléctrica! +120 Nets"; col = "#00ffcc"; }
            break;
        case 'goku':
            g += 25 * gokuIndiceFase;
            break;
        case 'antimateria':
            if (n % 10 === 0 && antiCargas < 2) { antiCargas++; msg = `🌀 ¡Vacío recargado! (cargas: ${antiCargas}/2)`; col = "#a55eea"; }
            break;
        case 'hielocorrupto':
            if (hieloCongelado > 0) { hieloCongelado = 0; g += 150; sumarStat('congelados'); msg = "🧊 ¡Golpe congelado! +150 Nets"; col = "#e056fd"; }
            if (n % 10 === 0) { hieloCongelado = 100; msg = "🧊 ¡Tiempo congelado! Haz clic para +150 Nets"; col = "#686de0"; }
            break;
        case 'meteoro':
            if (bola.vy > 10) { g += 200; sumarStat('impactos'); dispararEfectoExplosionHd(bola.x, bola.y); msg = "☄️ ¡IMPACTO! +200 Nets"; col = "#ff6a00"; }
            break;
        case 'glitch':
            if (Math.random() < 0.25) { g *= 4; sumarStat('criticos'); msg = "👾 ¡ERROR CRÍTICO! x4 Nets"; col = "#00ff66"; }
            break;
        case 'tiempo':
            g += 30;
            break;
        case 'midas':
            g += 75 + Math.min(1000, Math.floor(nets * 0.005));
            break;
        case 'ninja':
            g += 75;
            break;
        case 'dragon':
            if (dragonCarga >= 5) { dragonCarga = 0; g += 1000; sumarStat('alientos'); dispararEfectoExplosionHd(bola.x, bola.y); msg = "🐉 ¡ALIENTO DE DRAGÓN! +1000 Nets"; col = "#ff4500"; }
            break;
        case 'solar':
            if (n % 15 === 0) { g += 1500; sumarStat('supernovas'); dispararEfectoExplosionHd(bola.x, bola.y); msg = "☀️ ¡SUPERNOVA! +1500 Nets"; col = "#ffb300"; }
            break;
        case 'arcoiris': {
            const m = Math.min(10, 1 + Math.floor(n / 10));
            g *= m;
            if (m > 1) { msg = `🌈 Multiplicador x${m}`; col = "#ff77d8"; }
            break;
        }
        case 'fantasma':
            g += 50;
            break;
        case 'cosmos':
            g *= 3;
            if (n % 20 === 0) { g += 5000; sumarStat('bigbangs'); dispararEfectoExplosionHd(bola.x, bola.y); msg = "🌌 ¡BIG BANG! +5000 Nets"; col = "#9b59ff"; }
            break;
        case 'estrella':
            g *= 2;
            if (n % 5 === 0) { g += 250; sumarStat('deseos'); dispararEfectoExplosionHd(bola.x, bola.y); msg = "🌠 ¡Deseo cumplido! +250 Nets"; col = "#70a1ff"; }
            break;
    }
    if (msg && mensaje) { mensaje.textContent = msg; mensaje.style.color = col; }
    return g;
}

function manejarMovimientoCursor(clientX, clientY) {
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    cursorCanvasX = (clientX - rect.left) * (canvas.width / rect.width);
    cursorCanvasY = (clientY - rect.top) * (canvas.height / rect.height);
}

function manejarAccion(clientX, clientY) {
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const clicX = (clientX - rect.left) * (canvas.width / rect.width);
    const clicY = (clientY - rect.top) * (canvas.height / rect.height);
    const distancia = Math.sqrt(Math.pow(clicX - bola.x, 2) + Math.pow(clicY - bola.y, 2));

    if (distancia <= bola.radio + 15 * escalaPantalla) { 
        if (pantallaActual === "menu") {
            clicksParaEmpezar--; 
            crearParticulas(clicX, clicY);
            if (clicksParaEmpezar <= 0) {
                if (modalDificultad) modalDificultad.style.display = 'flex';
            } else {
                if (mensaje) {
                    mensaje.textContent = `🎯 ¡Te faltan ${clicksParaEmpezar} clics para comenzar!`;
                    mensaje.style.color = "#ffa502";
                }
            }
            return;
        }

        if (pantallaActual === "juego" && bolaEnEsperaSaque) {
            bolaEnEsperaSaque = false;
            if (mensaje) {
                mensaje.textContent = "¡A JUGAR!";
                mensaje.style.color = "#2ed573";
            }
        }

        if (chiclePegada) {
            chiclePegada = false;
            if (chicleTimerSuperficie) clearTimeout(chicleTimerSuperficie);
        }

        clicksConsecutivos++; 
        sumarStat('clics');
        if (historia.activa && !historia.terminado) historia.clics++;
        if (comboCount) comboCount.textContent = clicksConsecutivos;
        
        if (skinEquipada === 'goku') {
            if (clicksConsecutivos % 5 === 0) {
                gokuIndiceFase = (gokuIndiceFase + 1) % GOKU_FASES.length;
                nets += 100;
                dispararEfectoExplosionHd(bola.x, bola.y);
                if (mensaje) {
                    mensaje.textContent = `🔥 ¡EVOLUCIÓN! ${GOKU_FASES[gokuIndiceFase].nombre} (+100 Nets)`;
                    mensaje.style.color = "#ffd700";
                }
            }
        }

        let gananciaNets = calcularGananciaClic();
        nets += gananciaNets;
        if (clicksConsecutivos > recordCombo) recordCombo = clicksConsecutivos;
        crearParticulas(clicX, clicY);
        
        if (skinEquipada === 'chicle') {
            chicleEscalaX = 0.8;
            chicleEscalaY = 1.3;
        }

        bola.vy = -14; 
        bola.vx = (bola.x - clicX) * 0.45;
        guardarProgreso();
    } else {
        if (pantallaActual === "juego" && !bolaEnEsperaSaque && dificultadActual === "dificil" && skinEquipada === 'ninja') {
            sumarStat('evasiones');
            if (mensaje) { mensaje.textContent = "🥷 ¡Evadiste el fallo! Tu racha sigue."; mensaje.style.color = "#c0392b"; }
        } else if (pantallaActual === "juego" && !bolaEnEsperaSaque && dificultadActual === "dificil") {
            clicksConsecutivos = 0;
            if (comboCount) comboCount.textContent = 0;
            if (mensaje) {
                mensaje.textContent = "❌ ¡Clic fallado! Racha reiniciada.";
                mensaje.style.color = "#ff4757";
            }
        }
    }
}

// ==========================================
// RENDERIZADO GRÁFICO
// ==========================================
function dibujarEsfera3DConElasticidad(x, y, radio, c1, c2, c3, cBrillo) {
    if (!ctx) return;
    ctx.save();
    ctx.translate(x, y);
    if (skinEquipada === 'chicle') ctx.scale(chicleEscalaX, chicleEscalaY);

    ctx.beginPath();
    ctx.arc(0, 0, radio, 0, Math.PI * 2);
    ctx.clip();

    let gradienteFondo = ctx.createRadialGradient(-radio * 0.3, -radio * 0.3, radio * 0.1, 0, 0, radio);
    gradienteFondo.addColorStop(0, c1);
    gradienteFondo.addColorStop(0.5, c2);
    gradienteFondo.addColorStop(1, c3);
    ctx.fillStyle = gradienteFondo;
    ctx.fillRect(-radio, -radio, radio * 2, radio * 2);

    let brillo = ctx.createRadialGradient(-radio * 0.4, -radio * 0.4, 0, -radio * 0.4, -radio * 0.4, radio * 0.6);
    brillo.addColorStop(0, cBrillo || "#ffffff");
    brillo.addColorStop(1, "transparent");
    ctx.fillStyle = brillo;
    ctx.beginPath();
    ctx.arc(-radio * 0.3, -radio * 0.3, radio * 0.4, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
}

// ==========================================
// TEXTURAS DE SKINS (procedurales, animadas)
// ==========================================
const PI2 = Math.PI * 2;
function hash(n) { const s = Math.sin(n * 127.1) * 43758.5453; return s - Math.floor(s); }

function sombreadoEsfera(g, r, c1, c2, c3) {
    const gr = g.createRadialGradient(-r * 0.35, -r * 0.4, r * 0.05, 0, 0, r * 1.05);
    gr.addColorStop(0, c1); gr.addColorStop(0.45, c2); gr.addColorStop(1, c3);
    g.fillStyle = gr; g.fillRect(-r, -r, r * 2, r * 2);
}

function acabadoBrillo(g, r, f) {
    const rim = g.createRadialGradient(0, 0, r * 0.7, 0, 0, r);
    rim.addColorStop(0, 'rgba(0,0,0,0)'); rim.addColorStop(1, `rgba(0,0,0,${0.35 * f})`);
    g.fillStyle = rim; g.fillRect(-r, -r, r * 2, r * 2);
    const reb = g.createRadialGradient(r * 0.3, r * 0.7, 0, r * 0.3, r * 0.7, r * 0.6);
    reb.addColorStop(0, `rgba(255,255,255,${0.22 * f})`); reb.addColorStop(1, 'rgba(255,255,255,0)');
    g.fillStyle = reb; g.fillRect(-r, -r, r * 2, r * 2);
    g.save(); g.rotate(-0.7); g.fillStyle = `rgba(255,255,255,${0.75 * f})`;
    g.beginPath(); g.ellipse(0, -r * 0.62, r * 0.3, r * 0.13, 0, 0, PI2); g.fill(); g.restore();
}

function nucleoBrillo(g, r, col, tam) {
    const n = g.createRadialGradient(0, 0, 0, 0, 0, r * tam);
    n.addColorStop(0, col); n.addColorStop(1, 'rgba(255,255,255,0)');
    g.fillStyle = n; g.fillRect(-r, -r, r * 2, r * 2);
}

const TEXTURAS = {
    clasica(g, r, t, s) {
        sombreadoEsfera(g, r, s.c1, s.c2, s.c3);
        g.strokeStyle = 'rgba(255,255,255,0.18)'; g.lineWidth = r * 0.05;
        [0.5, -0.5].forEach(a => { g.beginPath(); g.ellipse(0, 0, r * 0.5, r * 1.1, a, 0, PI2); g.stroke(); });
    },
    fuego(g, r, t) {
        sombreadoEsfera(g, r, '#fff7a8', '#ff7a00', '#5a0500');
        for (let i = 0; i < 9; i++) {
            const l = r * (0.75 + 0.3 * Math.sin(t * 6 + i * 2));
            g.save(); g.rotate(i / 9 * PI2 + t * 1.2);
            const gr = g.createLinearGradient(0, 0, 0, -l * 1.3);
            gr.addColorStop(0, 'rgba(255,230,80,0.9)'); gr.addColorStop(1, 'rgba(255,60,0,0)');
            g.fillStyle = gr; g.beginPath(); g.moveTo(-r * 0.22, 0);
            g.quadraticCurveTo(-r * 0.1, -l * 0.7, 0, -l * 1.3);
            g.quadraticCurveTo(r * 0.1, -l * 0.7, r * 0.22, 0); g.fill(); g.restore();
        }
        nucleoBrillo(g, r, 'rgba(255,255,220,0.95)', 0.45 + 0.08 * Math.sin(t * 8));
    },
    plasma(g, r, t) {
        sombreadoEsfera(g, r, '#c8fff4', '#00ffcc', '#003a55');
        const f = Math.floor(t * 14);
        g.lineCap = 'round'; g.lineWidth = 2; g.strokeStyle = 'rgba(200,255,250,0.95)';
        g.shadowColor = '#00ffcc'; g.shadowBlur = 8;
        for (let k = 0; k < 5; k++) {
            const a = hash(f * 5 + k) * PI2; g.beginPath(); g.moveTo(0, 0);
            for (let i = 1; i <= 6; i++) {
                const d = r * i / 5.5, j = (hash(f * 31 + k * 7 + i) - 0.5) * r * 0.5;
                g.lineTo(Math.cos(a) * d - Math.sin(a) * j, Math.sin(a) * d + Math.cos(a) * j);
            }
            g.stroke();
        }
        g.shadowBlur = 0; nucleoBrillo(g, r, 'rgba(255,255,255,0.9)', 0.35);
    },
    goku(g, r, t, s, est) {
        const f = est.fase || s;
        sombreadoEsfera(g, r, f.c1, f.c2, f.c3);
        g.lineWidth = r * 0.08; g.strokeStyle = f.c1; g.globalAlpha = 0.5;
        for (let k = 0; k < 3; k++) {
            g.beginPath(); g.arc(0, 0, r * (0.35 + k * 0.28), t * 3 + k * 2, t * 3 + k * 2 + 2); g.stroke();
        }
        g.globalAlpha = 1; nucleoBrillo(g, r, 'rgba(255,255,255,0.55)', 0.6);
    },
    espejo(g, r, t, s, est) {
        const b = est.blindado;
        sombreadoEsfera(g, r, b ? '#b2bec3' : '#ffffff', b ? '#8395a0' : '#b8c2cc', '#4b5560');
        const N = 8, M = 14, rot = t * 0.8, p = Math.PI / N, q = PI2 / M;
        for (let i = 0; i < N; i++) {
            const la0 = -Math.PI / 2 + i * p, la1 = la0 + p * 0.9;
            for (let j = 0; j < M; j++) {
                const lo0 = rot + j * q, lo1 = lo0 + q * 0.9, z = Math.cos((la0 + la1) / 2) * Math.cos((lo0 + lo1) / 2);
                if (z <= 0) continue;
                const br = 0.3 + 0.7 * hash(i * 17 + j) * (0.6 + 0.4 * Math.sin(t * 3 + i * j));
                g.fillStyle = `hsl(${b ? 200 : 215},${b ? 5 : 18}%,${25 + 60 * br * z}%)`;
                g.strokeStyle = 'rgba(20,25,35,0.6)'; g.lineWidth = 0.7; g.beginPath();
                [[la0, lo0], [la0, lo1], [la1, lo1], [la1, lo0]].forEach(([la, lo], n) => {
                    const px = r * Math.cos(la) * Math.sin(lo), py = r * Math.sin(la);
                    n ? g.lineTo(px, py) : g.moveTo(px, py);
                });
                g.closePath(); g.fill(); g.stroke();
            }
        }
    },
    chicle(g, r) {
        sombreadoEsfera(g, r, '#ffd6f6', '#ff8fe6', '#e04fc4');
        const rim = g.createRadialGradient(0, 0, r * 0.55, 0, 0, r);
        rim.addColorStop(0, 'rgba(255,255,255,0)'); rim.addColorStop(0.85, 'rgba(255,200,245,0.25)'); rim.addColorStop(1, 'rgba(255,255,255,0.65)');
        g.fillStyle = rim; g.fillRect(-r, -r, r * 2, r * 2);
        g.fillStyle = 'rgba(255,255,255,0.35)';
        [[0.35, 0.3, 0.12], [0.5, 0.05, 0.06], [-0.1, 0.5, 0.08]].forEach(([x, y, k]) => { g.beginPath(); g.arc(r * x, r * y, r * k, 0, PI2); g.fill(); });
        g.fillStyle = 'rgba(255,255,255,0.85)'; g.beginPath(); g.ellipse(-r * 0.38, -r * 0.42, r * 0.22, r * 0.12, -0.7, 0, PI2); g.fill();
    },
    iman(g, r, t) {
        g.save(); g.rotate(t * 0.6);
        sombreadoEsfera(g, r, '#ff9aa2', '#ff4757', '#6b0f1a');
        g.save(); g.beginPath(); g.rect(0, -r, r, r * 2); g.clip(); sombreadoEsfera(g, r, '#ffffff', '#c8d0d9', '#59626e'); g.restore();
        g.fillStyle = 'rgba(30,35,45,0.85)'; g.fillRect(-r * 0.05, -r, r * 0.1, r * 2);
        g.font = `900 ${r * 0.5}px sans-serif`; g.textAlign = 'center'; g.textBaseline = 'middle';
        g.fillStyle = '#fff'; g.fillText('N', -r * 0.5, 0); g.fillStyle = '#2f3542'; g.fillText('S', r * 0.5, 0);
        g.strokeStyle = 'rgba(255,255,255,0.3)'; g.lineWidth = 1.5;
        [0.3, 0.55, 0.8].forEach(k => { g.beginPath(); g.ellipse(0, 0, r * k, r * k * 0.5, 0, Math.PI, PI2); g.stroke(); });
        g.restore();
    },
    antimateria(g, r, t) {
        sombreadoEsfera(g, r, '#2b0f4a', '#6c2bd9', '#0a0620');
        g.globalCompositeOperation = 'lighter'; g.lineWidth = 3; g.lineCap = 'round';
        for (let k = 0; k < 4; k++) {
            g.strokeStyle = k % 2 ? 'rgba(75,123,236,0.8)' : 'rgba(165,94,234,0.85)'; g.beginPath();
            for (let i = 0; i < 60; i++) {
                const a = i * 0.22 + k * Math.PI / 2 - t * 2.2, d = r * (0.08 + i / 60 * 0.95);
                i ? g.lineTo(Math.cos(a) * d, Math.sin(a) * d) : g.moveTo(Math.cos(a) * d, Math.sin(a) * d);
            }
            g.stroke();
        }
        g.globalCompositeOperation = 'source-over';
        const h = g.createRadialGradient(0, 0, 0, 0, 0, r * 0.4);
        h.addColorStop(0, '#000'); h.addColorStop(0.7, 'rgba(0,0,0,0.9)'); h.addColorStop(1, 'rgba(0,0,0,0)');
        g.fillStyle = h; g.fillRect(-r, -r, r * 2, r * 2);
    },
    cuantica(g, r, t) {
        sombreadoEsfera(g, r, '#c9ffff', '#00d2d3', '#064a7a');
        g.lineWidth = 1.6;
        for (let k = 0; k < 3; k++) {
            g.save(); g.rotate(k * Math.PI / 3 + t * 0.5);
            g.strokeStyle = 'rgba(255,255,255,0.55)'; g.beginPath(); g.ellipse(0, 0, r * 0.9, r * 0.32, 0, 0, PI2); g.stroke();
            const a = t * 3 + k * 2.1; g.fillStyle = '#fff'; g.shadowColor = '#fff'; g.shadowBlur = 6;
            g.beginPath(); g.arc(Math.cos(a) * r * 0.9, Math.sin(a) * r * 0.32, r * 0.07, 0, PI2); g.fill(); g.restore();
        }
        nucleoBrillo(g, r, 'rgba(255,255,255,0.9)', 0.3);
    },
    hielocorrupto(g, r, t) {
        sombreadoEsfera(g, r, '#e8f4ff', '#7a82ff', '#1a1050');
        for (let i = 0; i < 8; i++) {
            const a = i * Math.PI / 4 + 0.3;
            g.fillStyle = `rgba(255,255,255,${i % 2 ? 0.12 : 0.04})`; g.beginPath(); g.moveTo(0, 0); g.arc(0, 0, r, a, a + Math.PI / 4); g.fill();
            g.strokeStyle = 'rgba(255,255,255,0.25)'; g.lineWidth = 1; g.beginPath(); g.moveTo(0, 0); g.lineTo(Math.cos(a) * r, Math.sin(a) * r); g.stroke();
        }
        g.strokeStyle = `rgba(224,86,253,${0.65 + 0.3 * Math.sin(t * 3)})`; g.lineWidth = 2.2; g.shadowColor = '#e056fd'; g.shadowBlur = 8;
        for (let k = 0; k < 4; k++) {
            const a = k * 1.6 + 0.5; g.beginPath(); g.moveTo(Math.cos(a) * r * 0.15, Math.sin(a) * r * 0.15);
            for (let i = 1; i <= 5; i++) { const d = r * (0.15 + i * 0.2), j = (hash(k * 9 + i) - 0.5) * 0.5; g.lineTo(Math.cos(a + j) * d, Math.sin(a + j) * d); }
            g.stroke();
        }
        g.shadowBlur = 0; g.fillStyle = '#fff';
        for (let i = 0; i < 6; i++) { g.globalAlpha = Math.max(0, Math.sin(t * 2 + i * 1.9)); g.beginPath(); g.arc((hash(i) - 0.5) * r * 1.4, (hash(i + 9) - 0.5) * r * 1.4, 1.6, 0, PI2); g.fill(); }
        g.globalAlpha = 1;
    },
    meteoro(g, r, t, s, est) {
        sombreadoEsfera(g, r, '#8a7564', '#3a312c', '#12100f');
        [[-0.35, -0.2, 0.25], [0.3, 0.3, 0.2], [0.35, -0.4, 0.13], [-0.2, 0.5, 0.14]].forEach(([x, y, k]) => {
            const c = g.createRadialGradient(r * x - k * r * 0.2, r * y - k * r * 0.2, 0, r * x, r * y, r * k);
            c.addColorStop(0, 'rgba(0,0,0,0.65)'); c.addColorStop(0.8, 'rgba(0,0,0,0.25)'); c.addColorStop(1, 'rgba(255,255,255,0.15)');
            g.fillStyle = c; g.beginPath(); g.arc(r * x, r * y, r * k, 0, PI2); g.fill();
        });
        const ang = Math.atan2(est.vy || 1, est.vx || 0), c = Math.cos(ang) * r * 0.8, d = Math.sin(ang) * r * 0.8;
        const h = g.createRadialGradient(c, d, 0, c, d, r * 0.9);
        h.addColorStop(0, 'rgba(255,190,90,0.95)'); h.addColorStop(0.5, 'rgba(255,77,77,0.45)'); h.addColorStop(1, 'rgba(255,77,77,0)');
        g.fillStyle = h; g.fillRect(-r, -r, r * 2, r * 2);
    },
    glitch(g, r, t) {
        const f = Math.floor(t * 10);
        g.save(); g.beginPath(); g.arc(0, 0, r, 0, PI2); g.clip();
        sombreadoEsfera(g, r, '#2a2a55', '#15152e', '#07070f');
        for (let k = 0; k < 6; k++) {
            const y0 = (hash(f + k) - 0.5) * r * 2, dx = (hash(f * 3 + k) - 0.5) * r * 0.7;
            g.fillStyle = k % 2 ? 'rgba(255,0,127,0.75)' : 'rgba(0,255,102,0.75)'; g.fillRect(dx - r, y0, r * 2, r * 0.14);
        }
        g.fillStyle = 'rgba(0,255,102,0.55)'; g.font = `bold ${r * 0.22}px monospace`; g.textAlign = 'center';
        for (let i = 0; i < 12; i++) g.fillText(hash(f + i) > 0.5 ? '1' : '0', (hash(i * 3) - 0.5) * r * 1.5, (hash(i * 5 + f % 3) - 0.5) * r * 1.5);
        g.fillStyle = 'rgba(0,0,0,0.25)'; for (let y = -r; y < r; y += 4) g.fillRect(-r, y, r * 2, 1.5);
        g.restore();
        g.globalCompositeOperation = 'lighter'; g.lineWidth = 3; const o = r * 0.06 * (hash(f) > 0.6 ? 3 : 1);
        g.strokeStyle = 'rgba(255,0,127,0.8)'; g.beginPath(); g.arc(-o, 0, r, 0, PI2); g.stroke();
        g.strokeStyle = 'rgba(0,255,102,0.8)'; g.beginPath(); g.arc(o, 0, r, 0, PI2); g.stroke();
        g.globalCompositeOperation = 'source-over';
    },
    tiempo(g, r, t) {
        sombreadoEsfera(g, r, '#fff3c4', '#d4a017', '#5c3d00');
        g.strokeStyle = 'rgba(60,35,0,0.75)'; g.lineCap = 'round';
        for (let i = 0; i < 12; i++) {
            const a = i * Math.PI / 6, l = i % 3 ? 0.08 : 0.16; g.lineWidth = i % 3 ? 2 : 3.5; g.beginPath();
            g.moveTo(Math.sin(a) * r * (0.88 - l), -Math.cos(a) * r * (0.88 - l)); g.lineTo(Math.sin(a) * r * 0.88, -Math.cos(a) * r * 0.88); g.stroke();
        }
        [[t * 0.5, 0.5, 4], [t * 6, 0.75, 2.5]].forEach(([a, l, w]) => { g.lineWidth = w; g.beginPath(); g.moveTo(0, 0); g.lineTo(Math.sin(a) * r * l, -Math.cos(a) * r * l); g.stroke(); });
        g.fillStyle = '#3a2400'; g.beginPath(); g.arc(0, 0, r * 0.07, 0, PI2); g.fill();
        g.fillStyle = 'rgba(255,235,160,0.7)';
        for (let i = 0; i < 6; i++) g.fillRect((hash(i) - 0.5) * r * 0.9, -r * 0.6 + ((t * 0.4 + i * 0.17) % 1) * r * 1.2, 2, 2);
    },
    midas(g, r, t) {
        sombreadoEsfera(g, r, '#fff6b0', '#ffd700', '#8a6200');
        g.font = `900 ${r * 1.1}px Georgia, serif`; g.textAlign = 'center'; g.textBaseline = 'middle';
        g.fillStyle = 'rgba(90,55,0,0.55)'; g.fillText('$', 1.5, r * 0.05 + 1.5);
        g.fillStyle = 'rgba(255,248,200,0.85)'; g.fillText('$', 0, r * 0.05);
        const x = ((t * 0.5) % 2 - 1) * r * 2.2;
        g.save(); g.rotate(0.6);
        const gr = g.createLinearGradient(x - r * 0.3, 0, x + r * 0.3, 0);
        gr.addColorStop(0, 'rgba(255,255,255,0)'); gr.addColorStop(0.5, 'rgba(255,255,255,0.75)'); gr.addColorStop(1, 'rgba(255,255,255,0)');
        g.fillStyle = gr; g.fillRect(-r * 2, -r * 2, r * 4, r * 4); g.restore();
    },
    ninja(g, r, t) {
        sombreadoEsfera(g, r, '#666666', '#1b1b22', '#000000');
        g.fillStyle = '#c0392b'; g.fillRect(-r, -r * 0.32, r * 2, r * 0.26);
        g.fillStyle = 'rgba(0,0,0,0.3)'; g.fillRect(-r, -r * 0.06, r * 2, r * 0.04);
        g.fillStyle = `rgba(245,246,250,${0.75 + 0.25 * Math.sin(t * 4)})`;
        [-1, 1].forEach(k => { g.save(); g.translate(k * r * 0.34, r * 0.14); g.rotate(k * -0.35); g.beginPath(); g.ellipse(0, 0, r * 0.2, r * 0.07, 0, 0, PI2); g.fill(); g.restore(); });
    },
    dragon(g, r, t) {
        sombreadoEsfera(g, r, '#ffd29c', '#e74c3c', '#4a0b0b');
        g.strokeStyle = 'rgba(60,0,0,0.5)'; g.lineWidth = 1.4;
        for (let row = -4; row <= 4; row++) for (let c = -4; c <= 4; c++) {
            g.beginPath(); g.arc(c * r * 0.34 + (row % 2 ? r * 0.17 : 0), row * r * 0.27, r * 0.18, 0.1, Math.PI - 0.1); g.stroke();
        }
        g.fillStyle = '#ffe066'; g.beginPath(); g.ellipse(0, -r * 0.05, r * 0.34, r * 0.21, 0, 0, PI2); g.fill();
        g.fillStyle = '#111'; g.beginPath(); g.ellipse(0, -r * 0.05, r * 0.06 * (1 + 0.25 * Math.sin(t * 2)), r * 0.19, 0, 0, PI2); g.fill();
        nucleoBrillo(g, r, 'rgba(255,120,0,0.25)', 1);
    },
    solar(g, r, t) {
        sombreadoEsfera(g, r, '#ffffff', '#ffd54f', '#e65100');
        for (let i = 0; i < 7; i++) {
            const a = hash(i) * PI2 + t * 0.15 * (i % 2 ? 1 : -1), d = hash(i + 7) * r * 0.65, k = r * (0.12 + hash(i + 3) * 0.14);
            g.fillStyle = 'rgba(190,60,0,0.35)'; g.beginPath(); g.arc(Math.cos(a) * d, Math.sin(a) * d, k, 0, PI2); g.fill();
        }
        g.strokeStyle = 'rgba(255,255,255,0.7)'; g.lineWidth = 2; g.beginPath(); g.arc(0, 0, r * (0.7 + 0.05 * Math.sin(t * 3)), t, t + 1.4); g.stroke();
        nucleoBrillo(g, r, 'rgba(255,255,230,0.8)', 0.6);
    },
    arcoiris(g, r, t) {
        g.save(); g.rotate(t * 0.4);
        for (let i = 0; i < 12; i++) {
            g.fillStyle = `hsl(${(i * 30 + t * 80) % 360},90%,62%)`; g.beginPath(); g.moveTo(0, 0);
            g.arc(0, 0, r * 1.5, i * Math.PI / 6, (i + 1) * Math.PI / 6 + 0.02); g.fill();
        }
        g.restore();
        const c = g.createRadialGradient(-r * 0.3, -r * 0.35, r * 0.05, 0, 0, r * 1.1);
        c.addColorStop(0, 'rgba(255,255,255,0.9)'); c.addColorStop(0.5, 'rgba(255,255,255,0.15)'); c.addColorStop(1, 'rgba(40,0,80,0.45)');
        g.fillStyle = c; g.fillRect(-r, -r, r * 2, r * 2);
        g.fillStyle = '#fff';
        for (let i = 0; i < 6; i++) { g.globalAlpha = Math.max(0, Math.sin(t * 3 + i * 2.1)); g.beginPath(); g.arc((hash(i + 40) - 0.5) * r * 1.5, (hash(i + 50) - 0.5) * r * 1.5, 2, 0, PI2); g.fill(); }
        g.globalAlpha = 1;
    },
    fantasma(g, r, t, s, est) {
        g.globalAlpha = est.fantasmaListo === false ? 0.45 : 0.78 + 0.2 * Math.sin(t * 2.5);
        sombreadoEsfera(g, r, '#ffffff', '#cfd8ff', '#7c83c9');
        g.globalAlpha = 1; g.strokeStyle = 'rgba(124,131,201,0.55)'; g.lineWidth = 2;
        for (let k = 0; k < 3; k++) {
            g.beginPath();
            for (let x = -r; x <= r; x += 6) { const y = r * (0.55 + k * 0.15) + Math.sin(x * 0.08 + t * 3 + k) * r * 0.06; x === -r ? g.moveTo(x, y) : g.lineTo(x, y); }
            g.stroke();
        }
        g.fillStyle = '#1d1f3a';
        [-1, 1].forEach(k => { g.beginPath(); g.ellipse(k * r * 0.3, -r * 0.15, r * 0.11, r * 0.17, 0, 0, PI2); g.fill(); });
        g.beginPath(); g.ellipse(0, r * 0.22, r * 0.12, r * 0.16 * (0.8 + 0.2 * Math.sin(t * 3)), 0, 0, PI2); g.fill();
    },
    cosmos(g, r, t) {
        sombreadoEsfera(g, r, '#3a1a7a', '#12063a', '#02010f');
        [['rgba(155,89,255,0.55)', -0.3, -0.2], ['rgba(0,180,255,0.4)', 0.35, 0.3], ['rgba(255,70,160,0.35)', 0.1, -0.5]].forEach(([c, x, y]) => {
            const n = g.createRadialGradient(x * r, y * r, 0, x * r, y * r, r * 0.7); n.addColorStop(0, c); n.addColorStop(1, 'rgba(0,0,0,0)');
            g.fillStyle = n; g.fillRect(-r, -r, r * 2, r * 2);
        });
        g.save(); g.rotate(-0.4);
        for (let k = 0; k < 2; k++) for (let i = 0; i < 40; i++) {
            const a = i * 0.28 + k * Math.PI - t * 0.6, d = r * (0.05 + i / 40 * 0.9);
            g.fillStyle = `hsla(${260 + i * 2},90%,${70 + (i % 3) * 8}%,${1 - i / 50})`;
            g.beginPath(); g.arc(Math.cos(a) * d, Math.sin(a) * d * 0.55, 1.6, 0, PI2); g.fill();
        }
        g.restore(); g.fillStyle = '#fff';
        for (let i = 0; i < 10; i++) { g.globalAlpha = Math.max(0, Math.sin(t * 2.5 + i * 1.7)); g.beginPath(); g.arc((hash(i + 60) - 0.5) * r * 1.7, (hash(i + 70) - 0.5) * r * 1.7, 1.4, 0, PI2); g.fill(); }
        g.globalAlpha = 1; nucleoBrillo(g, r, 'rgba(255,255,255,0.85)', 0.22);
    },
    estrella(g, r, t) {
        sombreadoEsfera(g, r, '#ffffff', '#9ec5ff', '#2a6fdb');
        g.globalCompositeOperation = 'lighter'; g.save(); g.rotate(t * 0.6);
        g.fillStyle = 'rgba(255,255,255,0.85)'; g.beginPath(); g.moveTo(0, -r);
        g.quadraticCurveTo(0, 0, r, 0); g.quadraticCurveTo(0, 0, 0, r); g.quadraticCurveTo(0, 0, -r, 0); g.quadraticCurveTo(0, 0, 0, -r); g.fill(); g.restore();
        for (let i = 0; i < 8; i++) { g.fillStyle = `rgba(255,255,255,${Math.max(0, Math.sin(t * 3 + i * 2.3))})`; g.beginPath(); g.arc((hash(i + 3) - 0.5) * r * 1.5, (hash(i + 20) - 0.5) * r * 1.5, 1.8, 0, PI2); g.fill(); }
        g.globalCompositeOperation = 'source-over';
    }
};

const BRILLO_FINAL = { tiempo: 0.8, ninja: 0.5, dragon: 0.6, solar: 0.3, arcoiris: 0.5, fantasma: 0.3, cosmos: 0.25, chicle: 1.1, espejo: 0.5, glitch: 0, estrella: 0.4, plasma: 0.5, antimateria: 0.3, fuego: 0.4, goku: 0.8, meteoro: 0.6 };
const RESPLANDOR = { tiempo: '#d4a017', midas: '#ffd700', ninja: '#8e44ad', dragon: '#ff4500', solar: '#ffb300', arcoiris: '#ff77d8', fantasma: '#cfd8ff', cosmos: '#9b59ff', fuego: '#ff5500', plasma: '#00ffcc', goku: '#ffd700', antimateria: '#a55eea', cuantica: '#00d2d3', hielocorrupto: '#e056fd', estrella: '#70a1ff', glitch: '#00ff66', meteoro: '#ff6a00', iman: '#ff4757' };

function rectRedondo(g, x, y, w, h, rad) {
    g.beginPath(); g.moveTo(x + rad, y); g.arcTo(x + w, y, x + w, y + h, rad); g.arcTo(x + w, y + h, x, y + h, rad);
    g.arcTo(x, y + h, x, y, rad); g.arcTo(x, y, x + w, y, rad); g.closePath();
}

function texturaTNT(g, r, est) {
    const cd = est.cooldown, n = 8, c = r * 2 / n;
    g.fillStyle = cd ? '#4a4a4a' : '#b3261e'; g.fillRect(-r, -r, r * 2, r * 2);
    for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) {
        const b = hash(i * 13 + j * 7); g.fillStyle = b > 0.5 ? `rgba(0,0,0,${b * 0.2})` : `rgba(255,255,255,${(1 - b) * 0.1})`;
        g.fillRect(-r + i * c, -r + j * c, c, c);
    }
    g.fillStyle = 'rgba(0,0,0,0.35)'; for (let k = 1; k < 4; k++) g.fillRect(-r + k * r / 2 - 1, -r, 2, r * 2);
    g.fillStyle = cd ? '#9a9a9a' : '#f2f2f2'; g.fillRect(-r, -r * 0.35, r * 2, r * 0.7);
    g.fillStyle = 'rgba(0,0,0,0.5)'; g.fillRect(-r, -r * 0.35, r * 2, 2); g.fillRect(-r, r * 0.35 - 2, r * 2, 2);
    g.fillStyle = '#111'; g.font = `900 ${r * 0.5}px 'Segoe UI', Arial, sans-serif`; g.textAlign = 'center'; g.textBaseline = 'middle';
    g.fillText(cd ? `${est.seg}s` : 'TNT', 0, 1);
    g.fillStyle = 'rgba(255,255,255,0.3)'; g.fillRect(-r, -r, r * 2, 3); g.fillRect(-r, -r, 3, r * 2);
    g.fillStyle = 'rgba(0,0,0,0.4)'; g.fillRect(-r, r - 4, r * 2, 4); g.fillRect(r - 4, -r, 4, r * 2);
}

function texturaMagma(g, r, t) {
    g.save(); rectRedondo(g, -r, -r, r * 2, r * 2, r * 0.22); g.clip();
    const b = g.createLinearGradient(-r, -r, r, r); b.addColorStop(0, '#5a2414'); b.addColorStop(0.5, '#2a0d08'); b.addColorStop(1, '#0f0402');
    g.fillStyle = b; g.fillRect(-r, -r, r * 2, r * 2);
    const venas = [[[-1, -.3], [-.5, -.1], [-.2, .3], [.3, .2], [.7, .6], [1, .5]], [[-.2, -1], [-.1, -.5], [.2, -.2], [.1, .2], [.4, .7], [.3, 1]], [[-1, .6], [-.6, .5], [-.4, .9]], [[1, -.5], [.6, -.4], [.5, -.8], [.8, -1]]];
    g.lineJoin = 'round'; g.shadowColor = '#ff5200'; g.shadowBlur = 10;
    venas.forEach((v, k) => {
        const p = 0.65 + 0.35 * Math.sin(t * 2.5 + k * 1.7);
        [[r * 0.1, `rgba(255,${120 + 80 * p | 0},20,${p})`], [r * 0.035, 'rgba(255,240,150,0.9)']].forEach(([w, col]) => {
            g.lineWidth = w; g.strokeStyle = col; g.beginPath();
            v.forEach(([x, y], i) => i ? g.lineTo(x * r, y * r) : g.moveTo(x * r, y * r)); g.stroke();
        });
    });
    g.shadowBlur = 0; g.fillStyle = 'rgba(255,255,255,0.18)'; g.fillRect(-r, -r, r * 2, 3);
    g.fillStyle = 'rgba(0,0,0,0.4)'; g.fillRect(-r, r - 5, r * 2, 5); g.restore();
}

function dibujarSkin(g, key, x, y, r, t, est) {
    est = est || {};
    const s = SKINS[key] || SKINS.clasica;
    g.save(); g.translate(x, y);
    if (key === 'chicle') g.scale(chicleEscalaX, chicleEscalaY);
    if (s.tipo === 'tnt') texturaTNT(g, r, est);
    else if (s.tipo === 'magma') texturaMagma(g, r, t);
    else {
        if (key === 'meteoro') {
            const ang = Math.atan2(est.vy || 1, est.vx || 0) + Math.PI;
            g.save(); g.rotate(ang);
            const gr = g.createLinearGradient(0, 0, r * 3.2, 0); gr.addColorStop(0, 'rgba(255,170,60,0.9)'); gr.addColorStop(1, 'rgba(255,60,0,0)');
            g.fillStyle = gr; g.beginPath(); g.moveTo(0, -r * 0.9); g.lineTo(r * (2.6 + 0.5 * Math.sin(t * 20)), 0); g.lineTo(0, r * 0.9); g.fill(); g.restore();
        }
        if (key === 'solar') {
            g.fillStyle = 'rgba(255,170,0,0.55)';
            for (let i = 0; i < 16; i++) {
                const l = r * (1.3 + 0.25 * Math.sin(t * 5 + i * 1.3));
                g.save(); g.rotate(i / 16 * PI2 + t * 0.3); g.beginPath(); g.moveTo(-r * 0.2, -r * 0.85); g.lineTo(0, -l); g.lineTo(r * 0.2, -r * 0.85); g.fill(); g.restore();
            }
        }
        if (key === 'goku') {
            const f = est.fase || s; g.fillStyle = f.c2; g.globalAlpha = 0.5;
            for (let i = 0; i < 12; i++) {
                const l = r * (1.35 + 0.25 * Math.sin(t * 9 + i * 1.7));
                g.save(); g.rotate(i / 12 * PI2); g.beginPath(); g.moveTo(-r * 0.28, -r * 0.8); g.lineTo(0, -l); g.lineTo(r * 0.28, -r * 0.8); g.fill(); g.restore();
            }
            g.globalAlpha = 1;
        }
        if (RESPLANDOR[key]) {
            g.save(); g.shadowColor = RESPLANDOR[key]; g.shadowBlur = r * 0.9; g.fillStyle = RESPLANDOR[key];
            g.beginPath(); g.arc(0, 0, r * 0.95, 0, PI2); g.fill(); g.restore();
        }
        if (key === 'glitch') TEXTURAS.glitch(g, r, t);
        else {
            g.save(); g.beginPath(); g.arc(0, 0, r, 0, PI2); g.clip();
            (TEXTURAS[key] || TEXTURAS.clasica)(g, r, t, s, est);
            acabadoBrillo(g, r, BRILLO_FINAL[key] !== undefined ? BRILLO_FINAL[key] : 1);
            g.restore();
        }
    }
    g.restore();
}

function dibujar() {
    if (!ctx || !canvas) return;

    ctx.fillStyle = colorFondoDinamico;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    dibujarEscenaHistoria();

    ondasExplosion.forEach(o => {
        ctx.save();
        ctx.beginPath();
        ctx.arc(o.x, o.y, o.radioActual, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(255, 100, 0, ${o.opacidad})`;
        ctx.lineWidth = 4;
        ctx.stroke();
        ctx.restore();
    });

    portalesVisuales.forEach(pv => {
        ctx.save();
        ctx.beginPath();
        ctx.arc(pv.x, pv.y, pv.radio, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(0, 210, 211, ${pv.opacidad})`;
        ctx.lineWidth = 5;
        ctx.stroke();
        ctx.restore();
    });

    fragmentosCristal.forEach(fc => {
        ctx.save();
        ctx.translate(fc.x, fc.y);
        ctx.rotate(fc.rotacion);
        ctx.fillStyle = `rgba(222, 228, 234, ${fc.vida})`;
        ctx.fillRect(-fc.ancho / 2, -fc.alto / 2, fc.ancho, fc.alto);
        ctx.restore();
    });

    const sActiva = SKINS[skinEquipada] || SKINS.clasica;
    try {
        dibujarSkin(ctx, SKINS[skinEquipada] ? skinEquipada : 'clasica', bola.x, bola.y, bola.radio, performance.now() / 1000, {
            cooldown: tntEnCooldown, seg: tntTiempoRestanteCooldown, blindado: espejoBlindado,
            fase: GOKU_FASES[gokuIndiceFase], vx: bola.vx, vy: bola.vy,
            fantasmaListo: performance.now() - fantasmaUltimo >= 8000
        });
    } catch (e) {
        console.error('Error al dibujar la skin', skinEquipada, e);
        ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = 1; ctx.shadowBlur = 0;
        dibujarEsfera3DConElasticidad(bola.x, bola.y, bola.radio, sActiva.c1, sActiva.c2, sActiva.c3, sActiva.c2);
    }

    const etiqueta = (txt, col, fuente) => {
        ctx.save(); ctx.fillStyle = col; ctx.textAlign = "center"; ctx.shadowColor = 'rgba(0,0,0,0.75)'; ctx.shadowBlur = 4;
        ctx.font = fuente.replace(/(\d+)px/, (m, n) => Math.round(n * escalaPantalla) + 'px');
        ctx.fillText(txt, bola.x, bola.y - bola.radio - 12 * escalaPantalla); ctx.restore();
    };
    if (sActiva.tipo === "chicle") {
        etiqueta(chicleEnCooldown ? `⏳${chicleTiempoRestante}s` : `🫧${chicleUsosRestantes}/5`, "#ffffff", "bold 14px 'Segoe UI', Arial, sans-serif");
    } else if (skinEquipada === 'espejo') {
        etiqueta(espejoBlindado ? `🛡️${espejoTiempoBlindaje}s` : `🪩${espejoQuiebresSeguidos}/5`, "#ffffff", "bold 14px 'Segoe UI', Arial, sans-serif");
    } else if (skinEquipada === 'goku') {
        etiqueta(GOKU_FASES[gokuIndiceFase].nombre, "#ffd700", "bold 13px 'Segoe UI', Arial, sans-serif");
    } else if (skinEquipada === 'antimateria') {
        etiqueta(`🌀${antiCargas}/2`, "#a55eea", "bold 14px 'Segoe UI', Arial, sans-serif");
    } else if (skinEquipada === 'dragon') {
        etiqueta(`🐉${dragonCarga}/5`, "#ff7043", "bold 14px 'Segoe UI', Arial, sans-serif");
    } else if (skinEquipada === 'fantasma') {
        const rest = Math.max(0, Math.ceil((8000 - (performance.now() - fantasmaUltimo)) / 1000));
        etiqueta(rest > 0 ? `👻${rest}s` : '👻 listo', "#cfd8ff", "bold 14px 'Segoe UI', Arial, sans-serif");
    }

    if (pantallaActual === "menu") {
        ctx.save();
        ctx.font = "900 28px 'Segoe UI', Arial, sans-serif";
        ctx.fillStyle = "#ffffff";
        ctx.textAlign = "center";
        ctx.shadowColor = "rgba(0,0,0,0.8)";
        ctx.shadowBlur = 10;
        if (esCompacto()) {
            const F = Math.min(60, Math.round(18 * escalaPantalla));
            ctx.font = `900 ${F}px 'Segoe UI', Arial, sans-serif`;
            ctx.fillText("EN LA PELOTA 👇", canvas.width / 2, bola.y - bola.radio - F * 0.6);
            ctx.fillText("👇 HAZ 5 CLICS", canvas.width / 2, bola.y - bola.radio - F * 1.9);
        } else {
            ctx.fillText("👇 HAZ 5 CLICS EN LA PELOTA PARA COMENZAR 👇", canvas.width / 2, bola.y - 80);
        }
        ctx.restore();
    }

    particulas.forEach(p => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radio, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.vida;
        ctx.fill();
        ctx.globalAlpha = 1.0;
    });
}

// ==========================================
// INTERFAZ Y MODALES
// ==========================================
function actualizarTiendaUI() {
    if (!skinsGrid) return;
    skinsGrid.innerHTML = '';
    for (let key in SKINS) {
        let skin = SKINS[key];
        let desbloqueada = skinsDesbloqueadas.includes(key);
        let equipada = skinEquipada === key;

        let div = document.createElement('div');
        div.className = 'skin-card';
        div.innerHTML = `
            <h3>${skin.nombre}</h3>
            <p>${HABILIDADES[key] || ''}</p>
            <p>Precio: ${skin.precio} Nets</p>
            <button ${equipada ? 'disabled' : ''} class="${desbloqueada ? 'btn-equipar' : ''}">
                ${equipada ? 'Equipado' : (desbloqueada ? 'Equipar' : 'Comprar')}
            </button>
        `;
        div.querySelector('button').onclick = () => {
            if (desbloqueada) {
                skinEquipada = key;
                tntRebotesSeguidos = 0;
                antiCargas = 1;
                dragonCarga = 0;
                hieloCongelado = 0;
                chicleUsosRestantes = 5;
                espejoQuiebresSeguidos = 5;
                espejoBlindado = false;
                gokuIndiceFase = 0;
                guardarProgreso();
                actualizarTiendaUI();
            } else if (nets >= skin.precio) {
                nets -= skin.precio;
                skinsDesbloqueadas.push(key);
                skinEquipada = key;
                tntRebotesSeguidos = 0;
                antiCargas = 1;
                dragonCarga = 0;
                hieloCongelado = 0;
                chicleUsosRestantes = 5;
                espejoQuiebresSeguidos = 5;
                espejoBlindado = false;
                gokuIndiceFase = 0;
                guardarProgreso();
                actualizarTiendaUI();
            } else {
                alert("¡No tienes suficientes Nets!");
            }
        };
        skinsGrid.appendChild(div);
    }
}

function actualizarLogrosUI() {
    if (!logrosGrid) return;
    logrosGrid.innerHTML = '';
    LOGROS.forEach(logro => {
        let completado = logrosCompletados.includes(logro.id);
        let div = document.createElement('div');
        div.className = `skin-card ${completado ? 'completado' : ''}`;
        div.innerHTML = `
            <h3>${logro.titulo}</h3>
            <p>${logro.desc}</p>
            <p style="color: ${completado ? '#2ed573' : '#ffd700'}; font-weight: bold;">
                ${completado ? '✅ Completado' : `Recompensa: +${logro.recompensa} Nets`}
            </p>
        `;
        logrosGrid.appendChild(div);
    });
}

function regresarAlMenu() {
    ejecutarTransicion(() => {
        pantallaActual = "menu";
        clicksParaEmpezar = 5;
        historia.activa = false;
        radioMod = 1;
        ajustarLienzo();
        if (botonesMenuContainer) botonesMenuContainer.style.display = "flex";
        if (btnVolverMenu) btnVolverMenu.style.display = "none";
        if (comboContainer) comboContainer.style.display = "none";
        if (mensaje) {
            mensaje.textContent = "Haz 5 clics en la pelota para comenzar";
            mensaje.style.color = "#ffffff";
        }
    });
}

// ==========================================
// EVENT LISTENERS
// ==========================================
document.querySelectorAll('.btn-dificultad').forEach(btn => {
    btn.addEventListener('click', () => {
        dificultadActual = btn.getAttribute('data-dif');
        if (dificultadBadge) {
            dificultadBadge.textContent = dificultadActual.toUpperCase();
            dificultadBadge.className = `badge-dificultad dif-${dificultadActual}`;
        }
        if (modalDificultad) modalDificultad.style.display = 'none';
        
        ejecutarTransicion(() => {
            pantallaActual = "juego";
            bolaEnEsperaSaque = true;
            clicksConsecutivos = 0;
            if (comboCount) comboCount.textContent = 0;
            bola.x = canvas.width / 2;
            bola.y = alturaEspera();
            
            if (botonesMenuContainer) botonesMenuContainer.style.display = "none";
            if (btnVolverMenu) btnVolverMenu.style.display = "inline-block";
            if (comboContainer) comboContainer.style.display = "block";
            if (mensaje) {
                mensaje.textContent = "¡Haz clic en la bola para realizar el saque inicial!";
                mensaje.style.color = "#ffffff";
            }
        });
    });
});

if (btnTienda && modalTienda) {
    btnTienda.addEventListener('click', () => {
        actualizarTiendaUI();
        modalTienda.style.display = 'flex';
    });
}
if (cerrarTienda && modalTienda) {
    cerrarTienda.addEventListener('click', () => modalTienda.style.display = 'none');
}

if (btnLogros && modalLogros) {
    btnLogros.addEventListener('click', () => {
        actualizarLogrosUI();
        modalLogros.style.display = 'flex';
    });
}
if (cerrarLogros && modalLogros) {
    cerrarLogros.addEventListener('click', () => modalLogros.style.display = 'none');
}

if (btnVolverMenu) {
    btnVolverMenu.addEventListener('click', regresarAlMenu);
}

window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && pantallaActual === 'juego') {
        regresarAlMenu();
    }
    if ((e.key === 'f' || e.key === 'F') && !e.ctrlKey && !e.metaKey && !e.altKey) {
        alternarPantallaCompleta();
    }
});

// ==========================================
// PANTALLA COMPLETA
// ==========================================
const btnPantallaCompleta = document.getElementById('btnPantallaCompleta');

function pantallaCompletaActiva() {
    return !!(document.fullscreenElement || document.webkitFullscreenElement);
}

function alternarPantallaCompleta() {
    const raiz = document.documentElement;
    let promesa;
    if (!pantallaCompletaActiva()) {
        const pedir = raiz.requestFullscreen || raiz.webkitRequestFullscreen;
        if (pedir) promesa = pedir.call(raiz);
    } else {
        const salir = document.exitFullscreen || document.webkitExitFullscreen;
        if (salir) promesa = salir.call(document);
    }
    if (promesa && promesa.catch) promesa.catch(() => {});
}

function actualizarBotonPantallaCompleta() {
    const activa = pantallaCompletaActiva();
    document.body.classList.toggle('pantalla-completa', activa);
    if (btnPantallaCompleta) {
        btnPantallaCompleta.classList.toggle('activo', activa);
        const texto = activa ? 'Salir de pantalla completa (F)' : 'Pantalla completa (F)';
        btnPantallaCompleta.title = texto;
        btnPantallaCompleta.setAttribute('aria-label', texto);
    }
}

if (btnPantallaCompleta) {
    // Si el navegador no la permite (por ejemplo iPhone), se oculta el botón
    if (!(document.fullscreenEnabled || document.webkitFullscreenEnabled)) {
        btnPantallaCompleta.style.display = 'none';
    }
    btnPantallaCompleta.addEventListener('click', alternarPantallaCompleta);
}
document.addEventListener('fullscreenchange', actualizarBotonPantallaCompleta);
document.addEventListener('webkitfullscreenchange', actualizarBotonPantallaCompleta);

if (btnReiniciar) {
    btnReiniciar.addEventListener('click', () => {
        if (confirm("¿Estás seguro de que deseas reiniciar todo tu progreso?")) {
            localStorage.clear();
            nets = 0;
            recordCombo = 0;
            skinEquipada = 'clasica';
            skinsDesbloqueadas = ['clasica'];
            logrosCompletados = [];
            stats = {};
            historiaProgreso = { completados: [] };
            guardarProgreso();
            location.reload();
        }
    });
}

if (canvas) {
    canvas.addEventListener('mousemove', (e) => manejarMovimientoCursor(e.clientX, e.clientY));
    canvas.addEventListener('click', (e) => manejarAccion(e.clientX, e.clientY));
    canvas.addEventListener('touchstart', (e) => {
        e.preventDefault();
        if (e.touches.length > 0) {
            manejarAccion(e.touches[0].clientX, e.touches[0].clientY);
        }
    }, { passive: false });
}

// ==========================================
// BUCLE PRINCIPAL DEL JUEGO (GAME LOOP)
// ==========================================
// ==========================================
// ADAPTACIÓN A MÓVILES
// ==========================================
function esCompacto() {
    return window.innerWidth <= 1000 || window.innerHeight <= 520;
}

function alturaEspera() {
    return Math.round(canvas.height * 0.3);
}

function ajustarLienzo() {
    if (!canvas) return;
    // En celulares en vertical el lienzo es alto; si no, es horizontal (16:9)
    const vertical = window.innerHeight > window.innerWidth && window.innerWidth <= 820;
    const ancho = vertical ? 720 : 1280;
    const alto = vertical ? 1180 : 720;
    if (canvas.width !== ancho || canvas.height !== alto) {
        canvas.width = ancho;
        canvas.height = alto;
        bola.x = ancho / 2;
        bola.y = alturaEspera();
        bola.vx = 0;
        bola.vy = 0;
        if (pantallaActual === "juego") bolaEnEsperaSaque = true;
    }
    document.body.classList.toggle('vertical', vertical);
    const rect = canvas.getBoundingClientRect();
    escalaPantalla = Math.max(1, canvas.width / (rect.width || canvas.width));
    // En pantallas pequeñas la bola mide unos 60 px de radio en la pantalla para que sea fácil tocarla
    const tope = vertical ? 130 : 100;
    bola.radio = Math.round((esCompacto() ? Math.min(tope, Math.max(55, 60 * escalaPantalla)) : 55) * radioMod);
}

window.addEventListener('resize', ajustarLienzo);
window.addEventListener('orientationchange', () => setTimeout(ajustarLienzo, 200));
document.addEventListener('fullscreenchange', () => setTimeout(ajustarLienzo, 150));
document.addEventListener('webkitfullscreenchange', () => setTimeout(ajustarLienzo, 150));

// ==========================================
// MODO HISTORIA
// ==========================================
const CAPITULOS = [
    { id: 1, acto: "Acto I · El Despertar", titulo: "El Último Rebote",
      intro: ["Hace mucho, en el Reino de Rebotia, la Bola Eterna mantenía el mundo en movimiento. Un día cayó al suelo y todo se quedó quieto.", "Solo un Rebotador puede devolverle la energía… y ese eres tú. Empieza con lo básico: mantén la bola en el aire."],
      obj: { tipo: 'combo', meta: 10 }, mod: {}, dif: 'facil', vidas: 5, recompensa: 300,
      victoria: ["¡Lo lograste! La bola brilló un instante y los árboles volvieron a mecerse. Rebotia empieza a despertar."] },
    { id: 2, acto: "Acto I · El Despertar", titulo: "El Valle Tranquilo",
      intro: ["Los aldeanos del Valle no han visto un rebote en años. Si quieres su ayuda, tendrás que demostrar constancia."],
      obj: { tipo: 'clics', meta: 40 }, mod: {}, dif: 'facil', vidas: 5, recompensa: 500,
      victoria: ["Los aldeanos celebran y te regalan provisiones. «Más allá del valle sopla un viento extraño», te advierten."] },
    { id: 3, acto: "Acto I · El Despertar", titulo: "Primeras Brisas",
      intro: ["Al salir del valle te encuentras con un viento que empuja la bola de lado a lado. Aprende a leerlo."],
      obj: { tipo: 'combo', meta: 15 }, mod: { viento: 0.015 }, dif: 'facil', vidas: 4, recompensa: 800,
      victoria: ["Dominaste la brisa. El camino hacia el Bosque del Viento está abierto."] },
    { id: 4, acto: "Acto II · El Bosque del Viento", titulo: "Tormenta de Hojas",
      intro: ["En el bosque, una tormenta de hojas cubre el cielo. Los Nets caen entre las ramas como monedas de luz: gánalos rebotando sin parar, antes de que se acabe el tiempo."],
      obj: { tipo: 'nets', meta: 2500 }, mod: { viento: 0.025 }, dif: 'media', vidas: 4, limite: 100, recompensa: 1200,
      victoria: ["Tus bolsillos tintinean. Pero entre los árboles algo enorme se mueve: el Guardián de las Ramas."] },
    { id: 5, acto: "Acto II · El Bosque del Viento", titulo: "El Guardián de las Ramas", jefe: true,
      intro: ["El Guardián, un viejo roble con mal humor, bloquea el paso. Sus ramas soplan ráfagas para tumbar la bola.", "«Nadie cruza sin vencerme», gruñe."],
      obj: { tipo: 'combo', meta: 20 }, mod: { viento: 0.03, gravedad: 1.1 }, dif: 'media', vidas: 3, recompensa: 2500,
      victoria: ["El Guardián se inclina y se aparta. «Eres digno», dice. «Pero en la cueva te esperan cosas peores.»"] },
    { id: 6, acto: "Acto III · Las Cuevas Oscuras", titulo: "Sombras en la Cueva",
      intro: ["Dentro de la cueva casi no se ve nada. Solo alcanzas a distinguir lo que tienes cerca de la bola. No dejes que toque el suelo."],
      obj: { tipo: 'tiempo', meta: 40 }, mod: { niebla: 300 }, dif: 'media', vidas: 3, recompensa: 3000,
      victoria: ["Una luz azul aparece al fondo. Al fin ves el camino… y las enormes piedras que lo bloquean."] },
    { id: 7, acto: "Acto III · Las Cuevas Oscuras", titulo: "Piedras Pesadas",
      intro: ["Todo pesa más aquí abajo. La gravedad de la cueva jala la bola con fuerza. Necesitarás reflejos rápidos."],
      obj: { tipo: 'combo', meta: 15 }, mod: { gravedad: 1.3 }, dif: 'media', vidas: 4, recompensa: 4000,
      victoria: ["Tus dedos arden, pero la última piedra se rompe. Sales de la cueva al pie de una torre que llega hasta las estrellas."] },
    { id: 8, acto: "Acto III · Las Cuevas Oscuras", titulo: "El Espejo Roto",
      intro: ["En un salón de espejos te espera tu propio reflejo, que juega contra ti con una bola diminuta. Si quieres ganarle, tendrás que ser más preciso."],
      obj: { tipo: 'clics', meta: 100 }, mod: { radio: 0.7 }, dif: 'media', vidas: 4, limite: 90, recompensa: 6000,
      victoria: ["El reflejo se rompe en mil pedazos y cada uno susurra: «Sigue subiendo»."] },
    { id: 9, acto: "Acto IV · La Torre del Cosmos", titulo: "La Torre Infinita",
      intro: ["Cada piso de la torre es más difícil que el anterior. Hay viento, hay oscuridad y no se perdona ningún error."],
      obj: { tipo: 'combo', meta: 18 }, mod: { viento: 0.03, niebla: 360 }, dif: 'media', vidas: 4, recompensa: 10000,
      victoria: ["Llegas al último piso. Una voz antigua resuena: «Por fin, Rebotador… te estaba esperando.»"] },
    { id: 10, acto: "Acto IV · La Torre del Cosmos", titulo: "La Bola Eterna", jefe: true,
      intro: ["Frente a ti flota la Bola Eterna, dormida y cubierta de grietas.", "Para despertarla debes sostener un rebote perfecto mientras la torre entera se sacude. Aquí un clic fallado rompe tu racha."],
      obj: { tipo: 'combo', meta: 25 }, mod: { viento: 0.03, radio: 0.85 }, dif: 'dificil', vidas: 5, recompensa: 25000,
      victoria: ["La Bola Eterna se ilumina y todo Rebotia vuelve a moverse. Las nubes giran, el viento canta y los aldeanos bailan.", "Ya no eres un simple Rebotador: eres la Leyenda de Rebotia. ¡Gracias por jugar!"] }
];

// ---------- Capítulos 11 al 40 ----------
const nuevoCap = (id, acto, titulo, intro, tipo, meta, mod, dif, vidas, recompensa, victoria, extra) =>
    Object.assign({ id, acto, titulo, intro: [intro], obj: { tipo, meta }, mod, dif, vidas, recompensa, victoria: Array.isArray(victoria) ? victoria : [victoria] }, extra || {});
const A5 = "Acto V · Las Montañas Heladas", A6 = "Acto VI · El Desierto de Cristal", A7 = "Acto VII · El Mar de Tormentas",
      A8 = "Acto VIII · El Volcán de Ceniza", A9 = "Acto IX · El Cielo Infinito";
CAPITULOS.push(
    nuevoCap(11, A5, "El Paso Nevado", "La nieve cubre el camino hacia las montañas. Cada rebote levanta una nube de copos: mantén el ritmo.", 'clics', 80, { viento: 0.02 }, 'media', 5, 8000, "Los copos se asientan y ves la cima helada a lo lejos."),
    nuevoCap(12, A5, "Hielo Resbaladizo", "El suelo es puro hielo y la bola parece flotar. Tu puntería tendrá que ser perfecta.", 'combo', 20, { viento: 0.025, radio: 0.9, gravedad: 0.9 }, 'media', 4, 9000, "Tus dedos están fríos, pero tu racha no se rompió. Algo enorme respira más adelante."),
    nuevoCap(13, A5, "El Yeti Gigante", "Un Yeti gigante bloquea el paso y lanza ráfagas heladas. «¡Nadie sube a la cima!», ruge.", 'combo', 22, { viento: 0.03 }, 'media', 3, 12000, "El Yeti se sienta, derrotado, y te deja pasar con un gruñido amistoso."),
    nuevoCap(14, A5, "Aludes", "La montaña tiembla y la nieve cae con monedas de luz atrapadas. Recógelas antes de que la avalancha termine.", 'nets', 3500, { viento: 0.03 }, 'media', 4, 10000, "Sales de la avalancha con los bolsillos llenos."),
    nuevoCap(15, A5, "La Cueva de Cristal", "Cristales de hielo reflejan una luz débil. Solo ves lo que está cerca de la bola. ¡No dejes que caiga!", 'tiempo', 45, { niebla: 340 }, 'media', 3, 11000, "Los cristales brillan al fin y revelan un trono de hielo."),
    nuevoCap(16, A5, "La Reina de la Ventisca", "La Reina de la Ventisca gobierna estas cumbres. Su tormenta apaga la luz y empuja la bola con furia.", 'combo', 25, { viento: 0.04, niebla: 420 }, 'media', 4, 20000, "La Reina se deshace en copos. «Hacia el sur hay un desierto que también te necesita», susurra."),
    nuevoCap(17, A6, "Dunas Ardientes", "El sol quema la arena y el viento levanta cortinas de polvo. Aguanta el calor.", 'clics', 100, { viento: 0.03 }, 'media', 5, 12000, "La arena se calma un momento y ves un oasis brillar en la distancia.", { limite: 100 }),
    nuevoCap(18, A6, "Espejismos", "El desierto te engaña: la bola parece más pequeña de lo que es. Confía en tus reflejos.", 'combo', 20, { radio: 0.8 }, 'media', 4, 13000, "El espejismo se desvanece. Un enorme escorpión de cristal te observa desde una duna."),
    nuevoCap(19, A6, "El Escorpión de Cristal", "El Escorpión de Cristal golpea el suelo y la gravedad parece aumentar. Su cola brilla como una advertencia.", 'combo', 24, { gravedad: 1.15, viento: 0.03 }, 'media', 3, 18000, "Su caparazón se resquebraja en mil destellos. El camino hacia las ruinas queda libre."),
    nuevoCap(20, A6, "Tormenta de Arena", "Una tormenta de arena lo cubre todo. Apenas ves la bola, pero los Nets brillan entre el polvo.", 'nets', 5000, { viento: 0.045, niebla: 380 }, 'media', 4, 15000, "La tormenta pasa y deja las ruinas al descubierto.", { limite: 110 }),
    nuevoCap(21, A6, "Ruinas Antiguas", "Las ruinas guardan un pesado secreto: aquí todo pesa más. Mantén la bola en el aire sin descanso.", 'tiempo', 50, { gravedad: 1.2 }, 'media', 3, 16000, "Una puerta dorada se abre y de ella sale una sombra con corona."),
    nuevoCap(22, A6, "El Faraón de Arena", "El Faraón de Arena despierta de su tumba. Su aliento levanta tormentas y su mirada hace temblar el suelo.", 'combo', 26, { viento: 0.04, radio: 0.85 }, 'media', 4, 28000, "El Faraón se desmorona en arena dorada. «Sigue al mar… allí está el trueno»."),
    nuevoCap(23, A7, "Puerto Gris", "El mar está furioso y la lluvia no deja de caer. Cada rebote cuenta, aunque el viento empuje.", 'clics', 120, { viento: 0.035 }, 'media', 5, 17000, "Zarpas hacia el mar abierto con la lluvia golpeando el casco.", { limite: 110 }),
    nuevoCap(24, A7, "Olas Gigantes", "Las olas suben y bajan, y con ellas la gravedad cambia a tu alrededor. Mantente firme.", 'combo', 22, { gravedad: 1.2, viento: 0.04 }, 'media', 4, 19000, "El barco resiste y las olas se calman un instante. Un resplandor eléctrico aparece en el agua."),
    nuevoCap(25, A7, "La Medusa Eléctrica", "Una Medusa Eléctrica gigante emerge entre relámpagos. En la oscuridad solo ves un halo cerca de la bola.", 'combo', 25, { viento: 0.04, niebla: 400 }, 'media', 3, 26000, "La Medusa se apaga con un destello azul. El mar guarda un último secreto."),
    nuevoCap(26, A7, "Rayos y Truenos", "Los rayos caen alrededor y cada uno deja Nets flotando en el aire. Aprovecha la tormenta.", 'nets', 6000, { viento: 0.05 }, 'media', 4, 21000, "Tu barco brilla con la energía de la tormenta.", { limite: 100 }),
    nuevoCap(27, A7, "El Remolino", "Un remolino gigante tira de la bola hacia los lados. Resiste sin tocar el suelo.", 'tiempo', 55, { viento: 0.05 }, 'media', 3, 23000, "Sales del remolino justo cuando una enorme sombra sube desde el fondo."),
    nuevoCap(28, A7, "El Kraken del Trueno", "El Kraken del Trueno sacude el mar con sus tentáculos. Aquí un solo clic fallado rompe tu racha.", 'combo', 28, { viento: 0.05, gravedad: 1.15 }, 'dificil', 4, 40000, "El Kraken se hunde entre burbujas eléctricas. Al norte, un volcán ruge."),
    nuevoCap(29, A8, "Camino de Ceniza", "La ceniza cubre el cielo y apenas deja ver. Sigue rebotando hasta llegar al volcán.", 'clics', 140, { niebla: 420 }, 'media', 5, 24000, "El camino se abre hacia el cráter, cada vez más caliente.", { limite: 120 }),
    nuevoCap(30, A8, "Ríos de Lava", "El suelo hierve y todo se siente más pesado. No dejes que la bola caiga al calor.", 'combo', 24, { gravedad: 1.25 }, 'media', 4, 26000, "Cruzas el último río de lava. Un gigante de roca despierta frente a ti."),
    nuevoCap(31, A8, "El Golem de Lava", "El Golem de Lava golpea la montaña y la bola se vuelve más difícil de ver. Sus grietas brillan al rojo vivo.", 'combo', 27, { gravedad: 1.2, radio: 0.85 }, 'media', 3, 35000, "El Golem se enfría y se convierte en piedra. Solo queda el calor del cráter."),
    nuevoCap(32, A8, "Lluvia de Fuego", "Del cielo caen brasas con Nets entre ellas. Recógelas antes de que se apaguen.", 'nets', 7000, { viento: 0.04 }, 'media', 4, 30000, "Sales con las manos quemadas, pero llenas.", { limite: 110 }),
    nuevoCap(33, A8, "Cráter Ardiente", "El cráter es una caldera: aire denso, gravedad fuerte y humo por todos lados. Mantén la bola viva.", 'tiempo', 60, { gravedad: 1.3, niebla: 360 }, 'media', 3, 33000, "El calor retrocede un poco. Un rugido profundo sacude el cráter."),
    nuevoCap(34, A8, "El Dragón de Magma", "El Dragón de Magma abre sus alas y la lava sube. Con una bola pequeña y sin margen de error, esta es tu prueba más dura.", 'combo', 30, { viento: 0.045, radio: 0.8 }, 'dificil', 4, 60000, "El Dragón se apaga y sus alas se vuelven ceniza. Más allá del humo se ve un cielo azul clarísimo."),
    nuevoCap(35, A9, "Escalera de Nubes", "Por fin el cielo se despeja. Una escalera de nubes sube hacia las alturas, con una brisa constante.", 'clics', 160, { viento: 0.03 }, 'media', 5, 36000, "Subes entre nubes suaves. Pero arriba se oyen truenos.", { limite: 120 }),
    nuevoCap(36, A9, "Tormenta Eléctrica", "Una tormenta eléctrica rodea la escalera. Las ráfagas son fuertes y la gravedad te empuja hacia abajo.", 'combo', 26, { viento: 0.06, gravedad: 1.15 }, 'media', 4, 42000, "Cruzas la tormenta con el pelo electrizado. Un guardián de alas blancas te espera.", { clima: 'lluvia' }),
    nuevoCap(37, A9, "El Centinela Celestial", "El Centinela Celestial vigila las puertas del cielo. Sus alas levantan vientos que juegan con una bola diminuta.", 'combo', 28, { viento: 0.04, radio: 0.8 }, 'media', 3, 55000, "El Centinela inclina la cabeza. «Puedes pasar, pero el Rey Tormenta no será tan amable.»"),
    nuevoCap(38, A9, "El Ojo de la Tormenta", "Estás en el centro del huracán: todo gira y casi no se ve. Mantén la bola en el aire.", 'tiempo', 60, { viento: 0.06, niebla: 340 }, 'media', 3, 48000, "El viento se calma. Frente a ti, un trono hecho de nubes oscuras.", { clima: 'lluvia' }),
    nuevoCap(39, A9, "La Última Prueba", "El Rey Tormenta te desafía a una carrera: junta Nets antes de que se acabe el tiempo.", 'nets', 8000, { viento: 0.05 }, 'media', 4, 60000, "Pasaste la prueba. Ahora, el combate final.", { limite: 120 }),
    nuevoCap(40, A9, "El Rey Tormenta", "Sobre el trono de nubes se alza el Rey Tormenta, dueño de todos los vientos. «¡Rebotador! ¡Ninguna bola ha cruzado mi cielo!»", 'combo', 32, { viento: 0.06, gravedad: 1.15, radio: 0.8 }, 'dificil', 5, 150000,
        ["El Rey Tormenta se disuelve en una lluvia de estrellas y el cielo se vuelve azul claro, sin una sola nube.", "Rebotia es libre otra vez. Ya no eres solo un Rebotador: eres la Leyenda del Cielo Infinito. ¡Gracias por jugar!"], { clima: 'brisa' })
);
CAPITULOS[9].victoria = ["La Bola Eterna se ilumina y todo Rebotia vuelve a moverse. Las nubes giran, el viento canta y los aldeanos bailan.", "Pero su luz revela un mapa: más allá hay montañas, desiertos y mares que también necesitan tu ayuda. Tu viaje apenas comienza."];

// ---------- Jefes visibles, temas y clima ----------
const JEFES = {
    5: { forma: 'arbol', nombre: 'Guardián de las Ramas', color: '#6bd36b' }, 8: { forma: 'espejo', nombre: 'El Reflejo', color: '#9fd8ff' },
    10: { forma: 'orbe', nombre: 'La Bola Eterna', color: '#ffe58a' }, 13: { forma: 'yeti', nombre: 'Yeti Gigante', color: '#bfe3ff' },
    16: { forma: 'reina', nombre: 'Reina de la Ventisca', color: '#7dd3fc' }, 19: { forma: 'escorpion', nombre: 'Escorpión de Cristal', color: '#a78bfa' },
    22: { forma: 'faraon', nombre: 'Faraón de Arena', color: '#fcd34d' }, 25: { forma: 'medusa', nombre: 'Medusa Eléctrica', color: '#e879f9' },
    28: { forma: 'kraken', nombre: 'Kraken del Trueno', color: '#2dd4bf' }, 31: { forma: 'golem', nombre: 'Golem de Lava', color: '#fb923c' },
    34: { forma: 'dragon', nombre: 'Dragón de Magma', color: '#f87171' }, 37: { forma: 'angel', nombre: 'Centinela Celestial', color: '#fde68a' },
    40: { forma: 'titan', nombre: 'Rey Tormenta', color: '#fef08a' }
};
const TEMAS_ACTO = [
    { hasta: 3, tema: 'valle', clima: 'ninguno' }, { hasta: 5, tema: 'bosque', clima: 'hojas' }, { hasta: 8, tema: 'cueva', clima: 'ninguno' },
    { hasta: 10, tema: 'torre', clima: 'ninguno' }, { hasta: 16, tema: 'nieve', clima: 'nieve' }, { hasta: 22, tema: 'desierto', clima: 'arena' },
    { hasta: 28, tema: 'mar', clima: 'lluvia' }, { hasta: 34, tema: 'volcan', clima: 'ceniza' }, { hasta: 40, tema: 'cielo', clima: 'brisa' }
];
CAPITULOS.forEach(c => {
    const t = TEMAS_ACTO.find(a => c.id <= a.hasta);
    c.tema = t.tema;
    c.clima = c.clima || t.clima;
    if (c.clima === 'ninguno' && c.mod.viento) c.clima = 'brisa';
    if (JEFES[c.id]) c.jefe = JEFES[c.id];
});

const TEMAS = {
    valle: { cielo: ['#6ec6ff', '#d6f0ff'], nubes: '#ffffff', sol: '#fff2a8', suelo: 'colinas', c: ['#58b95c', '#3d9a45'] },
    bosque: { cielo: ['#86b6d8', '#cfe3ee'], nubes: '#e3ecf1', suelo: 'colinas', c: ['#2f8f4e', '#1f6b38'] },
    cueva: { cielo: ['#2b2641', '#0f0c1c'], suelo: 'roca', c: ['#1a1628', '#0a0814'] },
    torre: { cielo: ['#0a0f2e', '#3b2a7c'], estrellas: true, suelo: 'torre', c: ['#1a1446', '#0c0a2a'] },
    nieve: { cielo: ['#b9d7ee', '#f1f8ff'], nubes: '#ffffff', suelo: 'montanas', c: ['#eef6fd', '#a9c7e0'] },
    desierto: { cielo: ['#ffb067', '#ffe7b0'], sol: '#fff7d6', suelo: 'dunas', c: ['#e3a85d', '#c98b3d'] },
    mar: { cielo: ['#3a4a62', '#1b2434'], nubes: '#55657e', suelo: 'olas', c: ['#1f5a88', '#0e3050'] },
    volcan: { cielo: ['#3d0f0c', '#d4500f'], suelo: 'volcan', c: ['#2a0b09', '#140605'] },
    cielo: { cielo: ['#4fb3ff', '#e9f7ff'], nubes: '#ffffff', sol: '#fff6c2', suelo: 'nubes', c: ['#ffffff', '#dff0ff'] }
};

// ---------- Dibujo de los jefes (en unidades; 1 = radio del jefe) ----------
const elip = (g, x, y, rx, ry, f, r) => { g.fillStyle = f; g.beginPath(); g.ellipse(x, y, rx, ry, r || 0, 0, PI2); g.fill(); };
const circ = (g, x, y, r, f) => { g.fillStyle = f; g.beginPath(); g.arc(x, y, r, 0, PI2); g.fill(); };
const ojosJ = (g, x, y, sep, col, t) => {
    g.save(); g.shadowColor = col; g.shadowBlur = 10;
    [-1, 1].forEach(k => elip(g, x + k * sep, y, 0.1, 0.05 + 0.03 * Math.sin(t * 2), col, k * 0.3));
    g.restore();
};
const tentaculo = (g, x0, y0, ang, len, w, col, t, fase) => {
    g.strokeStyle = col; g.lineWidth = w; g.lineCap = 'round'; g.beginPath(); g.moveTo(x0, y0);
    for (let i = 1; i <= 8; i++) { const k = i / 8, a = ang + Math.sin(t * 2 + fase + k * 3) * 0.5 * k; g.lineTo(x0 + Math.cos(a) * len * k, y0 + Math.sin(a) * len * k); }
    g.stroke();
};
const poli = (g, pts, f) => { g.fillStyle = f; g.beginPath(); pts.forEach(([x, y], i) => i ? g.lineTo(x, y) : g.moveTo(x, y)); g.closePath(); g.fill(); };
const linea = (g, pts, col, w) => { g.strokeStyle = col; g.lineWidth = w; g.lineCap = 'round'; g.lineJoin = 'round'; g.beginPath(); pts.forEach(([x, y], i) => i ? g.lineTo(x, y) : g.moveTo(x, y)); g.stroke(); };

const FORMAS_JEFE = {
    arbol(g, t) {
        g.fillStyle = '#6b4423'; g.fillRect(-0.4, -0.1, 0.8, 1.4);
        tentaculo(g, -0.4, 0.3, Math.PI * 0.85, 0.9, 0.12, '#6b4423', t, 0); tentaculo(g, 0.4, 0.3, Math.PI * 0.15, 0.9, 0.12, '#6b4423', t, 1);
        [[-0.6, -0.6, 0.7, '#2e8b57'], [0.6, -0.6, 0.7, '#2e8b57'], [0, -1, 0.8, '#3cb371'], [0, -0.45, 0.7, '#2e8b57']].forEach(([x, y, r, c]) => circ(g, x, y, r, c));
        ojosJ(g, 0, 0.15, 0.18, '#ffe14d', t); elip(g, 0, 0.5, 0.15, 0.07, '#2a1a0a');
    },
    espejo(g, t) {
        elip(g, 0, 0, 0.95, 1.3, '#d4a017');
        const gr = g.createLinearGradient(-0.7, -1, 0.7, 1); gr.addColorStop(0, '#e8f7ff'); gr.addColorStop(1, '#5aa7d6'); elip(g, 0, 0, 0.8, 1.15, gr);
        linea(g, [[0, -1.1], [0.1, -0.5], [-0.15, -0.1], [0.2, 0.4], [0, 1.1]], 'rgba(255,255,255,0.85)', 0.03);
        linea(g, [[-0.7, -0.4], [-0.2, -0.2], [0.3, 0.1]], 'rgba(255,255,255,0.85)', 0.03);
        ojosJ(g, 0, -0.1, 0.25, '#ffffff', t);
    },
    orbe(g, t) {
        const gr = g.createRadialGradient(-0.3, -0.3, 0.1, 0, 0, 1); gr.addColorStop(0, '#ffffff'); gr.addColorStop(0.5, '#ffe58a'); gr.addColorStop(1, '#c9891a'); circ(g, 0, 0, 1, gr);
        linea(g, [[0, -1], [0.15, -0.5], [-0.1, 0], [0.2, 0.5], [0, 1]], 'rgba(255,120,20,0.9)', 0.05);
        linea(g, [[-1, 0.1], [-0.5, 0.2], [-0.2, -0.1]], 'rgba(255,120,20,0.9)', 0.04);
        g.save(); g.rotate(t * 0.5); linea(g, Array.from({ length: 25 }, (_, i) => [Math.cos(i / 24 * PI2) * 1.4, Math.sin(i / 24 * PI2) * 0.35]), 'rgba(255,240,170,0.8)', 0.05); g.restore();
    },
    yeti(g, t) {
        elip(g, 0, 0.5, 0.95, 1.0, '#dfeeff'); elip(g, 0, -0.55, 0.62, 0.58, '#f4faff');
        linea(g, [[-0.8, 0.2], [-1.2 + Math.sin(t * 2) * 0.1, 0.9]], '#cfe3f7', 0.38); linea(g, [[0.8, 0.2], [1.2 - Math.sin(t * 2) * 0.1, 0.9]], '#cfe3f7', 0.38);
        elip(g, 0, -0.5, 0.4, 0.3, '#8fb3d6'); ojosJ(g, 0, -0.6, 0.2, '#ff4b4b', t);
        [-0.15, 0.15].forEach(x => poli(g, [[x - 0.05, -0.38], [x + 0.05, -0.38], [x, -0.2]], '#ffffff'));
    },
    reina(g, t) {
        const gr = g.createLinearGradient(0, -0.2, 0, 1.3); gr.addColorStop(0, '#e6f6ff'); gr.addColorStop(1, '#6fb6e8'); poli(g, [[0, -0.15], [0.85, 1.3], [-0.85, 1.3]], gr);
        elip(g, 0, -0.4, 0.34, 0.38, '#f3e6ea');
        for (let i = 0; i < 5; i++) poli(g, [[-0.3 + i * 0.15 - 0.07, -0.7], [-0.3 + i * 0.15 + 0.07, -0.7], [-0.3 + i * 0.15, -1.0 - (i % 2) * 0.12]], '#bfe9ff');
        ojosJ(g, 0, -0.4, 0.12, '#38bdf8', t); linea(g, [[0.9, 1.0], [1.2, -0.4]], '#bfe9ff', 0.06);
        g.save(); g.translate(1.2, -0.5); g.rotate(t); for (let i = 0; i < 3; i++) { g.rotate(Math.PI / 3); linea(g, [[-0.3, 0], [0.3, 0]], '#e0f7ff', 0.04); } g.restore();
    },
    escorpion(g, t) {
        elip(g, 0, 0.2, 0.8, 0.55, '#7c4dff'); elip(g, 0, 0.05, 0.5, 0.25, 'rgba(255,255,255,0.25)');
        [-1, 1].forEach(k => { g.strokeStyle = '#9b7bff'; g.lineWidth = 0.14; g.lineCap = 'round'; g.beginPath(); g.moveTo(k * 0.6, 0.3); g.quadraticCurveTo(k * 1.3, 0.3, k * 1.2, -0.3); g.stroke(); elip(g, k * 1.2, -0.4, 0.2, 0.15, '#b9a2ff', k * 0.5); });
        g.strokeStyle = '#9b7bff'; g.lineWidth = 0.14; g.beginPath(); g.moveTo(0, 0.6); g.quadraticCurveTo(0.9, 0.9, 0.5, -0.2); g.quadraticCurveTo(0.3, -0.9, -0.1 + Math.sin(t * 3) * 0.05, -1.0); g.stroke();
        poli(g, [[-0.2, -0.95], [0.0, -0.95], [-0.15, -1.25]], '#f0abfc'); ojosJ(g, 0, 0.1, 0.25, '#22d3ee', t);
    },
    faraon(g, t) {
        poli(g, [[-0.6, -1.1], [0.6, -1.1], [0.95, 0.6], [-0.95, 0.6]], '#e0b43a');
        [-0.7, -0.3, 0.1].forEach(y => { g.fillStyle = '#2f6fe0'; g.fillRect(-0.85, y, 1.7, 0.1); });
        elip(g, 0, -0.2, 0.38, 0.5, '#8b5a2b'); ojosJ(g, 0, -0.3, 0.17, '#7CFC00', t);
        g.fillStyle = '#2f6fe0'; g.fillRect(-0.08, 0.2, 0.16, 0.4); elip(g, 0, 0.85, 0.9, 0.35, '#e0b43a'); elip(g, 0, 0.85, 0.7, 0.22, '#2f6fe0');
    },
    medusa(g, t) {
        for (let i = 0; i < 6; i++) tentaculo(g, -0.8 + i * 0.32, 0.05, Math.PI / 2, 1.2, 0.08, 'rgba(160,100,255,0.85)', t, i);
        g.fillStyle = 'rgba(190,120,255,0.85)'; g.beginPath(); g.arc(0, 0, 1, Math.PI, 0); g.closePath(); g.fill();
        elip(g, 0, -0.1, 0.6, 0.35, 'rgba(255,255,255,0.25)');
        const f = Math.floor(t * 10);
        [-1, 1].forEach((k, n) => linea(g, Array.from({ length: 5 }, (_, i) => [k * (1.05 + i * 0.18), -0.1 + (hash(f + n * 9 + i) - 0.5) * 0.4]), '#e0f7ff', 0.04));
        ojosJ(g, 0, -0.35, 0.2, '#22d3ee', t);
    },
    kraken(g, t) {
        for (let i = 0; i < 6; i++) tentaculo(g, -0.8 + i * 0.32, 0.4, Math.PI / 2 + (i - 2.5) * 0.35, 1.3, 0.16, '#1f6f78', t, i);
        elip(g, 0, -0.2, 0.9, 0.8, '#2b8f9a'); elip(g, -0.3, -0.5, 0.3, 0.15, 'rgba(255,255,255,0.25)'); ojosJ(g, 0, -0.25, 0.3, '#ffd400', t);
    },
    golem(g, t) {
        g.fillStyle = '#6b6f7a'; g.fillRect(-0.7, -0.3, 1.4, 1.2); g.fillRect(-0.4, -0.95, 0.8, 0.55); g.fillRect(-1.2, -0.2, 0.45, 1.0); g.fillRect(0.75, -0.2, 0.45, 1.0);
        g.fillStyle = 'rgba(0,0,0,0.25)'; g.fillRect(-0.7, 0.4, 1.4, 0.5); g.fillRect(-1.2, 0.4, 0.45, 0.4); g.fillRect(0.75, 0.4, 0.45, 0.4);
        const p = 0.6 + 0.4 * Math.sin(t * 3); g.save(); g.shadowColor = '#ff7a18'; g.shadowBlur = 10;
        linea(g, [[-0.5, -0.1], [-0.2, 0.2], [-0.3, 0.6]], `rgba(255,${120 + 80 * p | 0},24,1)`, 0.06); linea(g, [[0.4, -0.2], [0.1, 0.3], [0.45, 0.7]], `rgba(255,${120 + 80 * p | 0},24,1)`, 0.06); g.restore();
        ojosJ(g, 0, -0.7, 0.17, '#ff9a2e', t);
    },
    dragon(g, t) {
        [-1, 1].forEach(k => { poli(g, [[k * 0.7, -0.1], [k * 1.8, -0.9], [k * 1.5, 0.1], [k * 1.2, 0.5], [k * 0.7, 0.4]], '#8f1d1d'); linea(g, [[k * 0.8, 0], [k * 1.7, -0.8]], '#c24141', 0.04); });
        const fl = g.createLinearGradient(0, 0.5, 0, 1.5); fl.addColorStop(0, '#fff3a0'); fl.addColorStop(1, 'rgba(255,60,0,0)');
        poli(g, [[-0.25, 0.55], [0.25, 0.55], [Math.sin(t * 10) * 0.15, 1.4 + Math.sin(t * 8) * 0.1]], fl);
        elip(g, 0, 0, 0.8, 0.7, '#e0452b'); [-1, 1].forEach(k => poli(g, [[k * 0.4, -0.5], [k * 0.7, -0.55], [k * 0.8, -1.2]], '#f4e3b0'));
        elip(g, 0, 0.3, 0.45, 0.3, '#f26a4a'); circ(g, -0.15, 0.3, 0.04, '#5a1010'); circ(g, 0.15, 0.3, 0.04, '#5a1010'); ojosJ(g, 0, -0.15, 0.35, '#ffe14d', t);
    },
    angel(g, t) {
        [-1, 1].forEach(k => { for (let j = 0; j < 3; j++) elip(g, k * (0.8 + j * 0.15), -0.1 + j * 0.28 + Math.sin(t * 3) * 0.03, 0.65, 0.18, 'rgba(255,255,255,0.9)', k * (0.5 + j * 0.12)); });
        const gr = g.createLinearGradient(0, -0.1, 0, 1.3); gr.addColorStop(0, '#ffffff'); gr.addColorStop(1, '#ffe8a8'); poli(g, [[0, -0.1], [0.7, 1.3], [-0.7, 1.3]], gr);
        elip(g, 0, -0.4, 0.3, 0.34, '#fbe9d0'); g.strokeStyle = '#ffd84a'; g.lineWidth = 0.07; g.beginPath(); g.ellipse(0, -0.95, 0.4, 0.1, 0, 0, PI2); g.stroke(); ojosJ(g, 0, -0.42, 0.1, '#38bdf8', t);
    },
    titan(g, t) {
        [[0, 0.2, 0.95], [-0.8, 0.35, 0.6], [0.8, 0.35, 0.6], [-0.5, -0.4, 0.6], [0.5, -0.4, 0.6], [0, -0.6, 0.55]].forEach(([x, y, r]) => { circ(g, x, y, r, '#4b5670'); circ(g, x - 0.05, y - 0.05, r * 0.8, '#66728f'); });
        const f = Math.floor(t * 8);
        linea(g, [[-0.5, -1.0], [-0.3, -1.4], [-0.15, -1.1], [0, -1.6], [0.15, -1.1], [0.3, -1.4], [0.5, -1.0]], '#fff7a8', 0.06);
        [-1, 1].forEach((k, n) => linea(g, Array.from({ length: 5 }, (_, i) => [k * (1.2 + i * 0.12), -0.2 + (hash(f + n * 7 + i) - 0.5) * 0.5]), '#fff7a8', 0.04));
        ojosJ(g, 0, -0.2, 0.28, '#fff7a8', t);
    }
};

// ---------- Escena de fondo, jefe y clima ----------
let historiaDt = 0.016;
let capituloActual = null;

function jefesDerrotados() {
    return Object.keys(JEFES).filter(id => historiaProgreso.completados.includes(Number(id))).length;
}

function ondaFondo(y0, amp, freq, fase, color, w, h) {
    ctx.fillStyle = color; ctx.beginPath(); ctx.moveTo(0, h);
    for (let x = 0; x <= w + 16; x += 16) ctx.lineTo(x, y0 + Math.sin(x * freq + fase) * amp);
    ctx.lineTo(w, h); ctx.closePath(); ctx.fill();
}

function nubeFondo(x, y, s, col) {
    ctx.fillStyle = col; ctx.beginPath();
    [[0, 0, 1], [0.9, 0.15, 0.8], [-0.9, 0.2, 0.7], [0.2, -0.4, 0.7]].forEach(([dx, dy, k]) => {
        ctx.moveTo(x + dx * s + k * s, y + dy * s); ctx.arc(x + dx * s, y + dy * s, k * s, 0, PI2);
    });
    ctx.fill();
}

function estadoRayo(t) {
    const ciclo = Math.floor(t / 5), fase = t - ciclo * 5, on = fase < 0.3 && hash(ciclo + 7) > 0.3;
    return { on, a: on ? 1 - fase / 0.3 : 0, x: 0.15 + hash(ciclo + 3) * 0.7, ciclo };
}

function dibujarClima(c, w, h, t) {
    const clima = c.clima;
    if (!clima || clima === 'ninguno') return;
    if (!historia.parts) historia.parts = Array.from({ length: 70 }, () => ({ x: Math.random(), y: Math.random(), v: 0.6 + Math.random() * 0.8, s: Math.random() }));
    const viento = c.mod.viento || 0.02, vx = Math.sin(performance.now() / 1300) * (0.12 + viento * 7), dt = historiaDt, k = w / 720;
    ctx.save(); ctx.lineCap = 'round';
    historia.parts.forEach((p, i) => {
        p.x += vx * p.v * dt * (clima === 'arena' ? 2.5 : (clima === 'lluvia' ? 0.5 : 1));
        if (clima === 'hojas') p.y += 0.07 * p.v * dt;
        else if (clima === 'lluvia') p.y += 1.1 * p.v * dt;
        else if (clima === 'nieve') { p.y += 0.1 * p.v * dt; p.x += Math.sin(t + i) * 0.0008; }
        else if (clima === 'ceniza') p.y -= 0.06 * p.v * dt;
        p.x = ((p.x % 1) + 1) % 1; p.y = ((p.y % 1) + 1) % 1;
        const X = p.x * w, Y = p.y * h, sg = vx < 0 ? -1 : 1;
        if (clima === 'brisa') {
            ctx.strokeStyle = 'rgba(255,255,255,0.5)'; ctx.lineWidth = 2 * k; ctx.beginPath();
            ctx.moveTo(X, Y + Math.sin(t * 2 + i) * 8 * k); ctx.lineTo(X - sg * w * (0.04 + Math.abs(vx) * 0.15), Y + Math.sin(t * 2 + i + 0.6) * 8 * k); ctx.stroke();
        } else if (clima === 'hojas') {
            ctx.save(); ctx.translate(X, Y); ctx.rotate(t * 2 * p.v + i); ctx.fillStyle = p.s > 0.5 ? '#6bbf59' : '#d9a441';
            ctx.beginPath(); ctx.ellipse(0, 0, 7 * k, 3.5 * k, 0, 0, PI2); ctx.fill(); ctx.restore();
        } else if (clima === 'lluvia') {
            ctx.strokeStyle = 'rgba(190,210,255,0.55)'; ctx.lineWidth = 1.6 * k; ctx.beginPath(); ctx.moveTo(X, Y); ctx.lineTo(X + vx * 60 * k, Y + 22 * k); ctx.stroke();
        } else if (clima === 'nieve') {
            circ(ctx, X, Y, (2.5 + 3 * p.s) * k, 'rgba(110,160,210,0.55)'); circ(ctx, X, Y, (1.8 + 2 * p.s) * k, '#ffffff');
        } else if (clima === 'arena') {
            ctx.strokeStyle = 'rgba(255,230,180,0.7)'; ctx.lineWidth = 2 * k; ctx.beginPath(); ctx.moveTo(X, Y); ctx.lineTo(X - sg * 14 * k, Y); ctx.stroke();
        } else if (clima === 'ceniza') {
            circ(ctx, X, Y, (1.5 + 2 * p.s) * k, p.s > 0.6 ? 'rgba(255,140,40,0.85)' : 'rgba(180,170,170,0.6)');
        }
    });
    if (clima === 'arena') { ctx.fillStyle = 'rgba(230,170,90,0.14)'; ctx.fillRect(0, 0, w, h); }
    ctx.restore();
}

function dibujarJefe(c, w, h, t) {
    const j = c.jefe;
    if (!j || !FORMAS_JEFE[j.forma]) return;
    const R = Math.min(w * 0.13, h * 0.2), cx = w * 0.5 + (historia.flash > 0 ? (Math.random() - 0.5) * 8 : 0), cy = h * 0.3 + Math.sin(t * 1.5) * R * 0.08;
    const aura = ctx.createRadialGradient(cx, cy, R * 0.3, cx, cy, R * 1.9);
    aura.addColorStop(0, j.color + '66'); aura.addColorStop(1, j.color + '00');
    ctx.fillStyle = aura; ctx.fillRect(0, 0, w, h);
    ctx.save(); ctx.translate(cx, cy); ctx.scale(R, R); ctx.globalAlpha = 0.95;
    FORMAS_JEFE[j.forma](ctx, t);
    ctx.restore();
    if (historia.flash > 0) { ctx.save(); ctx.globalAlpha = Math.min(0.6, historia.flash * 2); circ(ctx, cx, cy, R * 1.1, '#ffffff'); ctx.restore(); }
}

function dibujarEscenaHistoria() {
    if (!ctx || !historia.activa || historia.terminado || pantallaActual !== "juego") return;
    const c = historia.cap, T = TEMAS[c.tema], w = canvas.width, h = canvas.height, t = performance.now() / 1000, k = w / 720;
    const cielo = ctx.createLinearGradient(0, 0, 0, h); cielo.addColorStop(0, T.cielo[0]); cielo.addColorStop(1, T.cielo[1]);
    ctx.fillStyle = cielo; ctx.fillRect(0, 0, w, h);
    if (T.estrellas) {
        ctx.fillStyle = '#ffffff';
        for (let i = 0; i < 40; i++) { ctx.globalAlpha = 0.4 + 0.6 * Math.abs(Math.sin(t * 1.5 + i)); ctx.fillRect(hash(i) * w, hash(i + 99) * h * 0.8, 2 * k, 2 * k); }
        ctx.globalAlpha = 1;
    }
    if (T.sol) {
        const sx = w * 0.82, sy = h * 0.13, glow = ctx.createRadialGradient(sx, sy, 0, sx, sy, w * 0.16);
        glow.addColorStop(0, T.sol); glow.addColorStop(1, 'rgba(255,255,255,0)');
        ctx.fillStyle = glow; ctx.fillRect(0, 0, w, h * 0.4); circ(ctx, sx, sy, w * 0.045, T.sol);
    }
    if (T.nubes) {
        for (let i = 0; i < 6; i++) {
            const x = ((hash(i + 1) * 1.4 * w + t * (10 + hash(i + 5) * 18) * k) % (w * 1.4)) - w * 0.2;
            nubeFondo(x, h * (0.08 + hash(i + 9) * 0.35), w * (0.05 + hash(i + 3) * 0.05), T.nubes);
        }
    }
    const s = T.suelo, f = Math.PI * 2 / w;
    if (s === 'colinas') { ondaFondo(h * 0.86, h * 0.025, f * 1.2, 0.5, T.c[1], w, h); ondaFondo(h * 0.92, h * 0.02, f * 2, 2, T.c[0], w, h); }
    else if (s === 'dunas') { ondaFondo(h * 0.84, h * 0.035, f * 0.9, 1, T.c[1], w, h); ondaFondo(h * 0.91, h * 0.03, f * 1.4, 3, T.c[0], w, h); }
    else if (s === 'olas') { ondaFondo(h * 0.85, h * 0.012, f * 3, t * 1.4, T.c[0], w, h); ondaFondo(h * 0.89, h * 0.015, f * 2, -t * 1.1, T.c[1], w, h); }
    else if (s === 'montanas') {
        for (let i = 0; i < 4; i++) {
            const x = w * (0.1 + i * 0.28), alto = h * (0.2 + hash(i) * 0.15);
            poli(ctx, [[x - w * 0.2, h * 0.88], [x, h * 0.88 - alto], [x + w * 0.2, h * 0.88]], T.c[1]);
            poli(ctx, [[x - w * 0.05, h * 0.88 - alto * 0.78], [x, h * 0.88 - alto], [x + w * 0.05, h * 0.88 - alto * 0.78]], '#ffffff');
        }
        ctx.fillStyle = T.c[0]; ctx.fillRect(0, h * 0.88, w, h * 0.12);
    } else if (s === 'volcan') {
        poli(ctx, [[w * 0.5, h * 0.88], [w * 0.7, h * 0.45], [w * 0.9, h * 0.88]], T.c[0]);
        const lava = ctx.createRadialGradient(w * 0.7, h * 0.45, 0, w * 0.7, h * 0.45, w * 0.12); lava.addColorStop(0, 'rgba(255,160,40,0.9)'); lava.addColorStop(1, 'rgba(255,80,0,0)');
        ctx.fillStyle = lava; ctx.fillRect(w * 0.5, h * 0.3, w * 0.4, h * 0.3);
        for (let i = 0; i < 5; i++) circ(ctx, w * 0.7 + Math.sin(t + i) * 20 * k, h * 0.45 - ((t * 20 + i * 40) % 200) * k, (20 + i * 6) * k, 'rgba(60,40,40,0.35)');
        ctx.fillStyle = T.c[1]; ctx.fillRect(0, h * 0.9, w, h * 0.1);
    } else if (s === 'roca') {
        for (let i = 0; i < 9; i++) poli(ctx, [[i * w / 8 - w * 0.06, 0], [i * w / 8 + w * 0.06, 0], [i * w / 8, h * (0.05 + hash(i) * 0.1)]], T.c[0]);
        ctx.fillStyle = T.c[0]; ctx.fillRect(0, h * 0.94, w, h * 0.06);
    } else if (s === 'torre') {
        ctx.fillStyle = T.c[0]; ctx.fillRect(0, h * 0.92, w, h * 0.08);
    } else if (s === 'nubes') {
        for (let i = 0; i < 7; i++) nubeFondo(w * i / 6, h * 0.97, w * 0.12, '#ffffff');
    }
    dibujarJefe(c, w, h, t);
    dibujarClima(c, w, h, t);
    if (c.clima === 'lluvia') {
        const r = estadoRayo(t);
        if (r.on) {
            const pts = [[r.x * w, 0]]; let x = r.x * w;
            for (let i = 1; i <= 7; i++) { x += (hash(r.ciclo * 13 + i) - 0.5) * w * 0.12; pts.push([x, i * h * 0.08]); }
            linea(ctx, pts, 'rgba(255,255,200,0.95)', 4 * k);
        }
    }
}

const NOMBRES_DIF = { facil: 'Fácil', media: 'Media', dificil: 'Difícil' };
let historiaProgreso = JSON.parse(localStorage.getItem('historiaProgreso')) || { completados: [] };
let historia = { activa: false, cap: null, clics: 0, netsInicio: 0, vivo: 0, total: 0, vidas: 0, terminado: false };
let radioMod = 1;
let historiaUltimoFrame = performance.now();

const modalHistoria = document.getElementById('modalHistoria');
const capitulosGrid = document.getElementById('capitulosGrid');
const historiaSubtitulo = document.getElementById('historiaSubtitulo');
const modalDialogo = document.getElementById('modalDialogo');
const dialogoActo = document.getElementById('dialogoActo');
const dialogoTitulo = document.getElementById('dialogoTitulo');
const dialogoTexto = document.getElementById('dialogoTexto');
const dialogoObjetivo = document.getElementById('dialogoObjetivo');
const dialogoAcciones = document.getElementById('dialogoAcciones');
const btnHistoria = document.getElementById('btnHistoria');
const cerrarHistoria = document.getElementById('cerrarHistoria');

function modH(nombre, def) {
    const m = historia.activa && !historia.terminado && historia.cap ? historia.cap.mod : null;
    return m && m[nombre] !== undefined ? m[nombre] : def;
}

function textoObjetivo(c) {
    const o = c.obj;
    if (o.tipo === 'combo') return `Llega a una racha de ${o.meta} clics seguidos.`;
    if (o.tipo === 'clics') return `Haz ${o.meta} clics en la bola.`;
    if (o.tipo === 'nets') return `Gana ${o.meta} Nets en este capítulo.`;
    return `Mantén la bola en el aire ${o.meta} segundos sin que toque el suelo.`;
}

function textoReglas(c) {
    const r = [`Dificultad ${NOMBRES_DIF[c.dif]}`, `${c.vidas} vidas`];
    if (c.limite) r.push(`Tiempo límite: ${c.limite} s`);
    if (c.mod.viento) r.push('Viento');
    if (c.mod.gravedad) r.push(c.mod.gravedad > 1 ? 'Más gravedad' : 'Menos gravedad');
    if (c.mod.radio) r.push('Bola más pequeña');
    if (c.mod.niebla) r.push('Niebla');
    return r.join(' · ');
}

function progresoCapitulo() {
    const o = historia.cap.obj;
    if (o.tipo === 'combo') return clicksConsecutivos;
    if (o.tipo === 'clics') return historia.clics;
    if (o.tipo === 'nets') return Math.max(0, nets - historia.netsInicio);
    return Math.floor(historia.vivo);
}

function mostrarDialogo(o) {
    dialogoActo.textContent = o.acto || '';
    dialogoTitulo.textContent = o.titulo || '';
    dialogoTexto.innerHTML = '';
    (o.parrafos || []).forEach(t => {
        const p = document.createElement('p');
        p.textContent = t;
        dialogoTexto.appendChild(p);
    });
    dialogoObjetivo.textContent = o.objetivo || '';
    dialogoObjetivo.style.display = o.objetivo ? 'block' : 'none';
    dialogoAcciones.innerHTML = '';
    o.botones.filter(Boolean).forEach(b => {
        const btn = document.createElement('button');
        btn.className = 'btn-juego' + (b.clase ? ' ' + b.clase : '');
        btn.textContent = b.texto;
        btn.addEventListener('click', b.fn);
        dialogoAcciones.appendChild(btn);
    });
    modalDialogo.style.display = 'flex';
}

function cerrarDialogo() { modalDialogo.style.display = 'none'; }

function actualizarCapitulosUI() {
    capitulosGrid.innerHTML = '';
    capituloActual = null;
    historiaSubtitulo.textContent = `Capítulos completados: ${historiaProgreso.completados.length}/${CAPITULOS.length}`;
    CAPITULOS.forEach((c, i) => {
        const hecho = historiaProgreso.completados.includes(c.id);
        const libre = i === 0 || historiaProgreso.completados.includes(CAPITULOS[i - 1].id);
        if (i === 0 || CAPITULOS[i - 1].acto !== c.acto) {
            const titulo = document.createElement('h3');
            titulo.className = 'acto-titulo';
            titulo.textContent = c.acto;
            capitulosGrid.appendChild(titulo);
        }
        const card = document.createElement('div');
        if (libre && !hecho && !capituloActual) capituloActual = card;
        card.className = 'skin-card' + (hecho ? ' completado' : '') + (libre ? '' : ' bloqueado');
        card.innerHTML = `<h3>${c.jefe ? '👑 ' : ''}Cap. ${c.id}: ${c.titulo}</h3>
            <p>${c.acto}</p>
            ${c.jefe ? `<p>Jefe: ${c.jefe.nombre}</p>` : ''}
            <p>${libre ? textoObjetivo(c) : 'Completa el capítulo anterior para desbloquearlo.'}</p>
            <p>Recompensa: ${c.recompensa} Nets${hecho ? ' (cobrada)' : ''}</p>`;
        const btn = document.createElement('button');
        btn.textContent = !libre ? '🔒 Bloqueado' : (hecho ? 'Jugar de nuevo' : 'Jugar');
        btn.disabled = !libre;
        if (hecho) btn.className = 'btn-equipar';
        btn.addEventListener('click', () => elegirCapitulo(i));
        card.appendChild(btn);
        capitulosGrid.appendChild(card);
    });
}

function abrirHistoria() {
    actualizarCapitulosUI();
    modalHistoria.style.display = 'flex';
    setTimeout(() => { if (capituloActual && capituloActual.scrollIntoView) capituloActual.scrollIntoView({ block: 'center' }); }, 50);
}

function elegirCapitulo(i) {
    const c = CAPITULOS[i];
    modalHistoria.style.display = 'none';
    mostrarDialogo({
        acto: c.acto,
        titulo: `Capítulo ${c.id}: ${c.titulo}`,
        parrafos: c.intro,
        objetivo: `🎯 ${textoObjetivo(c)}\n📋 ${textoReglas(c)}${c.jefe ? '\n👑 Jefe: ' + c.jefe.nombre : ''}`,
        botones: [
            { texto: '¡Comenzar!', fn: () => comenzarCapitulo(c) },
            { texto: 'Volver', clase: 'button-volver', fn: () => { cerrarDialogo(); abrirHistoria(); } }
        ]
    });
}

function comenzarCapitulo(c) {
    cerrarDialogo();
    ejecutarTransicion(() => {
        historia = { activa: true, cap: c, clics: 0, netsInicio: nets, vivo: 0, total: 0, vidas: c.vidas, terminado: false, parts: null, flash: 0, pUlt: 0 };
        radioMod = c.mod.radio || 1;
        ajustarLienzo();
        dificultadActual = c.dif;
        if (dificultadBadge) {
            dificultadBadge.textContent = dificultadActual.toUpperCase();
            dificultadBadge.className = `badge-dificultad dif-${dificultadActual}`;
        }
        pantallaActual = "juego";
        bolaEnEsperaSaque = true;
        clicksConsecutivos = 0;
        if (comboCount) comboCount.textContent = 0;
        bola.vx = 0; bola.vy = 0;
        bola.x = canvas.width / 2;
        bola.y = alturaEspera();
        if (botonesMenuContainer) botonesMenuContainer.style.display = "none";
        if (btnVolverMenu) btnVolverMenu.style.display = "inline-block";
        if (comboContainer) comboContainer.style.display = "block";
        if (mensaje) {
            mensaje.textContent = `Capítulo ${c.id}: haz clic en la bola para empezar`;
            mensaje.style.color = "#ffffff";
        }
    });
}

function terminarCapitulo(ganado, motivo) {
    if (!historia.activa || historia.terminado) return;
    const c = historia.cap;
    const indice = CAPITULOS.indexOf(c);
    historia.terminado = true;
    radioMod = 1;
    ajustarLienzo();
    bolaEnEsperaSaque = true;
    bola.vx = 0; bola.vy = 0; bola.y = alturaEspera();
    clicksConsecutivos = 0;
    if (comboCount) comboCount.textContent = 0;
    const volver = { texto: 'Volver al menú', clase: 'button-volver', fn: () => { cerrarDialogo(); regresarAlMenu(); } };
    if (ganado) {
        const primera = !historiaProgreso.completados.includes(c.id);
        if (primera) {
            historiaProgreso.completados.push(c.id);
            nets += c.recompensa;
            localStorage.setItem('historiaProgreso', JSON.stringify(historiaProgreso));
        }
        guardarProgreso();
        const sig = CAPITULOS[indice + 1];
        mostrarDialogo({
            acto: c.jefe ? '¡Jefe derrotado!' : '¡Capítulo completado!',
            titulo: c.titulo,
            parrafos: c.victoria,
            objetivo: primera ? `🪙 Recompensa: +${c.recompensa} Nets` : 'Ya habías cobrado la recompensa de este capítulo.',
            botones: [sig ? { texto: 'Siguiente capítulo', fn: () => { cerrarDialogo(); elegirCapitulo(indice + 1); } } : null, volver]
        });
    } else {
        mostrarDialogo({
            acto: 'Capítulo fallido',
            titulo: c.titulo,
            parrafos: [motivo === 'tiempo' ? 'Se acabó el tiempo. Rebotia sigue esperando: inténtalo otra vez.' : 'Te quedaste sin vidas. Respira hondo y vuelve a intentarlo.'],
            objetivo: `🎯 ${textoObjetivo(c)}`,
            botones: [{ texto: 'Reintentar', fn: () => comenzarCapitulo(c) }, volver]
        });
    }
}

function historiaAlCaer() {
    if (!historia.activa || historia.terminado) return;
    historia.vivo = 0;
    historia.vidas--;
    if (historia.vidas <= 0) { terminarCapitulo(false, 'vidas'); return; }
    if (mensaje) {
        mensaje.textContent = `💔 Perdiste una vida (te quedan ${historia.vidas}). Clic en la bola para seguir`;
        mensaje.style.color = "#ff6b81";
    }
}

function actualizarHistoria() {
    const ahora = performance.now();
    const dt = Math.min(0.1, (ahora - historiaUltimoFrame) / 1000);
    historiaUltimoFrame = ahora;
    historiaDt = dt;
    if (!historia.activa || historia.terminado || pantallaActual !== "juego") return;
    if (!bolaEnEsperaSaque) {
        historia.vivo += dt;
        historia.total += dt;
    }
    const c = historia.cap;
    const pr = progresoCapitulo();
    if (pr > (historia.pUlt || 0)) historia.flash = 0.25;
    historia.pUlt = pr;
    historia.flash = Math.max(0, (historia.flash || 0) - dt);
    if (pr >= c.obj.meta) terminarCapitulo(true);
    else if (c.limite && historia.total >= c.limite) terminarCapitulo(false, 'tiempo');
}

function dibujarHistoria() {
    if (!ctx || !historia.activa || historia.terminado || pantallaActual !== "juego") return;
    const c = historia.cap, e = Math.min(escalaPantalla, 2), w = canvas.width;
    const niebla = modH('niebla', 0);
    if (niebla) {
        const g = ctx.createRadialGradient(bola.x, bola.y, niebla * 0.5, bola.x, bola.y, niebla * 1.3);
        g.addColorStop(0, 'rgba(5,5,12,0)'); g.addColorStop(1, 'rgba(5,5,12,0.96)');
        ctx.fillStyle = g; ctx.fillRect(0, 0, w, canvas.height);
    }
    if (c.clima === 'lluvia') {
        const r = estadoRayo(performance.now() / 1000);
        if (r.on) { ctx.fillStyle = `rgba(255,255,255,${r.a * 0.35})`; ctx.fillRect(0, 0, w, canvas.height); }
    }
    const pad = 8 * e, ancho = w - pad * 2, alto = 54 * e, prog = progresoCapitulo(), meta = c.obj.meta;
    ctx.save();
    ctx.fillStyle = 'rgba(10,10,22,0.78)'; rectRedondo(ctx, pad, pad, ancho, alto, 10 * e); ctx.fill();
    ctx.textAlign = 'left'; ctx.textBaseline = 'top'; ctx.fillStyle = '#ffffff';
    ctx.font = `bold ${Math.round(13 * e)}px 'Segoe UI', Arial, sans-serif`;
    ctx.fillText(`Cap. ${c.id}: ${c.titulo}`, pad + 10 * e, pad + 6 * e);
    for (let i = 0; i < c.vidas; i++) {
        ctx.beginPath(); ctx.arc(pad + ancho - 14 * e - i * 16 * e, pad + 14 * e, 5.5 * e, 0, PI2);
        ctx.fillStyle = i < historia.vidas ? '#ff4757' : 'rgba(255,255,255,0.18)'; ctx.fill();
    }
    const nombres = { combo: 'Racha', clics: 'Clics', nets: 'Nets', tiempo: 'En el aire' };
    let etiqueta = `${nombres[c.obj.tipo]} ${prog}/${meta}${c.obj.tipo === 'tiempo' ? ' s' : ''}`;
    if (c.limite) etiqueta += `  ·  Tiempo ${Math.max(0, Math.ceil(c.limite - historia.total))} s`;
    ctx.fillStyle = '#ffd700'; ctx.font = `${Math.round(12 * e)}px 'Segoe UI', Arial, sans-serif`;
    ctx.fillText(etiqueta, pad + 10 * e, pad + 24 * e);
    ctx.fillStyle = 'rgba(255,255,255,0.15)'; ctx.fillRect(pad + 10 * e, pad + 41 * e, ancho - 20 * e, 7 * e);
    ctx.fillStyle = '#2ed573'; ctx.fillRect(pad + 10 * e, pad + 41 * e, (ancho - 20 * e) * Math.min(1, prog / meta), 7 * e);
    if (c.jefe) {
        const by = pad + alto + 6 * e, bh = 15 * e, vida = 1 - Math.min(1, prog / meta);
        ctx.fillStyle = 'rgba(10,10,22,0.78)'; rectRedondo(ctx, pad, by, ancho, bh, 6 * e); ctx.fill();
        const barra = ctx.createLinearGradient(pad, 0, pad + ancho, 0); barra.addColorStop(0, '#ff4757'); barra.addColorStop(1, '#ff9f43');
        ctx.fillStyle = barra; ctx.fillRect(pad + 2 * e, by + 2 * e, (ancho - 4 * e) * vida, bh - 4 * e);
        ctx.fillStyle = '#ffffff'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.font = `bold ${Math.round(10 * e)}px 'Segoe UI', Arial, sans-serif`;
        ctx.fillText(c.jefe.nombre, pad + ancho / 2, by + bh / 2);
    }
    ctx.restore();
}

if (btnHistoria) btnHistoria.addEventListener('click', abrirHistoria);
if (cerrarHistoria) cerrarHistoria.addEventListener('click', () => { modalHistoria.style.display = 'none'; });

let errorLoopAvisado = false;
function gameLoop() {
    try {
        actualizarFisicas();
        actualizarParticulas();
        actualizarHistoria();
        dibujar();
        dibujarHistoria();
    } catch (e) {
        if (!errorLoopAvisado) { console.error('Error en el bucle del juego:', e); errorLoopAvisado = true; }
    }
    requestAnimationFrame(gameLoop);
}

// Logros de "completar todo" se vuelven a comprobar: si se agregaron capítulos o skins, ya no cuentan
function revalidarLogrosTotales() {
    logrosCompletados = logrosCompletados.filter(id => {
        const l = LOGROS.find(x => x.id === id);
        const esTotal = id === 'histFin' || id === 'jefesTodos' || id === 'skinsTodas';
        return !(esTotal && l && l.check && !l.check());
    });
}

revalidarLogrosTotales();
ajustarLienzo();
guardarProgreso();
gameLoop();