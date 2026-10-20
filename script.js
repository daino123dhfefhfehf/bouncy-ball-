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
    iman: { nombre: "Bola Imán 🧲", precio: 120000, c1: "#ffffff", c2: "#ff4757", c3: "#2f3542", part: 350, tipo: "iman" },
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
    { id: 'hist40', titulo: 'Veterano de Rebotia', desc: 'Completa 40 capítulos del Modo Historia', recompensa: 40000, check: () => historiaProgreso.completados.length >= 40 },
    { id: 'hist60', titulo: 'Maestro de Rebotia', desc: 'Completa 60 capítulos del Modo Historia', recompensa: 60000, check: () => historiaProgreso.completados.length >= 60 },
    { id: 'jefes5', titulo: 'Cazajefes', desc: 'Derrota a 5 jefes del Modo Historia', recompensa: 15000, check: () => jefesDerrotados() >= 5 },
    { id: 'jefesTodos', titulo: 'Rey de los Jefes', desc: 'Derrota a todos los jefes del Modo Historia', recompensa: 60000, check: () => jefesDerrotados() >= Object.keys(JEFES).length },
    { id: 'esquiva30', titulo: 'Reflejos de Gato', desc: 'Esquiva por los pelos 30 proyectiles en el Modo Historia', recompensa: 8000, check: () => stat('esquivados') >= 30 }
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
    actualizarStatsMenu();
    verificarLogros();
}

function actualizarStatsMenu() {
    try {
        const set = (id, v) => { const e = document.getElementById(id); if (e) e.textContent = v; };
        set('statCombo', recordCombo);
        set('statSkins', `${skinsDesbloqueadas.length}/${Object.keys(SKINS).length}`);
        set('statLogros', `${logrosCompletados.length}/${LOGROS.length}`);
        set('statHistoria', `${historiaProgreso.completados.length}/${CAPITULOS.length}`);
    } catch (e) { /* aún no se cargó todo */ }
}

function htmlBarra(actual, total, texto) {
    const pct = total ? Math.round(actual / total * 100) : 0;
    return `${texto}<div class="barra-prog"><i style="width:${pct}%"></i></div>`;
}

let toastTimer = null;
function mostrarToast(texto, tipo) {
    const t = document.getElementById('toast');
    if (!t) return;
    t.textContent = texto;
    t.className = 'toast visible' + (tipo ? ' ' + tipo : '');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => t.classList.remove('visible'), 2200);
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
                sfx('logro');
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
function dispararEfectoExplosionHd(x, y, o) {
    sfx('explosion');
    FX.explosion(x, y, o);
}

function dispararQuiebreEspejo(x, y) {
    sfx('cristal');
    FX.cristal(x, y);
}

function dispararPortalAzulVisual(x, y, col) {
    sfx('portal');
    FX.portal(x, y, col || '#00d2d3');
}

// Impacto de un clic: usa los colores de la skin equipada y crece con la racha
function crearParticulas(x, y) {
    const skin = SKINS[skinEquipada] || SKINS.clasica;
    if (skin.part === 0) return;
    FX.golpe(x, y, skin.c2, skin.c1, skin.c3, 1 + Math.min(1, clicksConsecutivos / 60) * 0.6);
}

let fxUltimo = performance.now();
function actualizarParticulas() {
    const ahora = performance.now(), dt = Math.min(0.05, (ahora - fxUltimo) / 1000);
    fxUltimo = ahora;
    FX.ajustar(canvas.width, canvas.height);
    FX.actualizar(dt);
    if (!document.hidden) {
        FX.aura(skinEquipada, { fase: GOKU_FASES[gokuIndiceFase], cooldown: tntEnCooldown, blindado: espejoBlindado }, bola.x, bola.y, bola.radio, bola.vx * 60, bola.vy * 60, dt);
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
            sumarStat('pegadas'); sfx('pegajoso');
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
            sumarStat('reapariciones'); sfx('vacio'); FX.portal(bola.x, bola.y, '#cfd8ff');
            bola.y = canvas.height - 10 - bola.radio;
            bola.vy = -17;
            nets += 150;
            guardarProgreso();
            if (mensaje) { mensaje.textContent = "👻 ¡Atravesaste el suelo y reapareciste! +150 Nets"; mensaje.style.color = "#cfd8ff"; }
        } else if (skinEquipada === 'antimateria' && antiCargas > 0) {
            antiCargas--;
            sumarStat('absorbidas'); sfx('vacio');
            bola.y = canvas.height - 10 - bola.radio;
            bola.vy = -16;
            nets += 100;
            guardarProgreso();
            dispararPortalAzulVisual(bola.x, bola.y, '#a55eea');
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
                sfx('caida');
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
            sumarStat('pegadas'); sfx('pegajoso');
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
            sumarStat('pegadas'); sfx('pegajoso');
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
    sfx('quemadura');
    nets += 60;
    guardarProgreso();
    crearParticulas(x, y);
    if (mensaje) { mensaje.textContent = "🌋 ¡Quemadura! +60 Nets"; mensaje.style.color = "#ff5252"; }
}

function alRebotarPared(x, y) {
    sfx('rebote');
    const angR = x <= bola.radio + 2 ? 0 : (x >= canvas.width - bola.radio - 2 ? Math.PI : Math.PI / 2);
    FX.rebote(angR === 0 ? 0 : (angR === Math.PI ? canvas.width : x), angR === Math.PI / 2 ? 0 : y, (SKINS[skinEquipada] || SKINS.clasica).c2, angR, bola.radio / 55);
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
            if (n % 4 === 0) { g += 120; sumarStat('descargas'); sfx('zap'); FX.descarga(bola.x, bola.y, bola.radio, '#00ffcc'); msg = "⚡ ¡Descarga eléctrica! +120 Nets"; col = "#00ffcc"; }
            break;
        case 'goku':
            g += 25 * gokuIndiceFase;
            break;
        case 'antimateria':
            if (n % 10 === 0 && antiCargas < 2) { antiCargas++; msg = `🌀 ¡Vacío recargado! (cargas: ${antiCargas}/2)`; col = "#a55eea"; }
            break;
        case 'hielocorrupto':
            if (hieloCongelado > 0) { hieloCongelado = 0; g += 150; sumarStat('congelados'); msg = "🧊 ¡Golpe congelado! +150 Nets"; col = "#e056fd"; }
            if (n % 10 === 0) { hieloCongelado = 100; sfx('hielo'); msg = "🧊 ¡Tiempo congelado! Haz clic para +150 Nets"; col = "#686de0"; }
            break;
        case 'meteoro':
            if (bola.vy > 10) { g += 200; sumarStat('impactos'); dispararEfectoExplosionHd(bola.x, bola.y, { col: '#ff6a00', esc: 1.1 }); msg = "☄️ ¡IMPACTO! +200 Nets"; col = "#ff6a00"; }
            break;
        case 'glitch':
            if (Math.random() < 0.25) { g *= 4; sumarStat('criticos'); sfx('zap'); FX.descarga(bola.x, bola.y, bola.radio, '#00ff66'); msg = "👾 ¡ERROR CRÍTICO! x4 Nets"; col = "#00ff66"; }
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
            if (dragonCarga >= 5) { dragonCarga = 0; g += 1000; sumarStat('alientos'); dispararEfectoExplosionHd(bola.x, bola.y, { col: '#ff4500', esc: 1.4 }); msg = "🐉 ¡ALIENTO DE DRAGÓN! +1000 Nets"; col = "#ff4500"; }
            break;
        case 'solar':
            if (n % 15 === 0) { g += 1500; sumarStat('supernovas'); dispararEfectoExplosionHd(bola.x, bola.y, { col: '#ffb300', esc: 1.9 }); msg = "☀️ ¡SUPERNOVA! +1500 Nets"; col = "#ffb300"; }
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
            if (n % 20 === 0) { g += 5000; sumarStat('bigbangs'); dispararEfectoExplosionHd(bola.x, bola.y, { col: '#9b59ff', esc: 2.3 }); msg = "🌌 ¡BIG BANG! +5000 Nets"; col = "#9b59ff"; }
            break;
        case 'estrella':
            g *= 2;
            if (n % 5 === 0) { g += 250; sumarStat('deseos'); dispararEfectoExplosionHd(bola.x, bola.y, { col: '#70a1ff', esc: 1.2 }); msg = "🌠 ¡Deseo cumplido! +250 Nets"; col = "#70a1ff"; }
            break;
    }
    if (msg && mensaje) { mensaje.textContent = msg; mensaje.style.color = col; }
    if (msg) sfx('moneda');
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
            sfx('golpe', 5 - clicksParaEmpezar);
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
        sfx('golpe', clicksConsecutivos);
        if (clicksConsecutivos % 10 === 0) sfx('combo');
        if (historia.activa && !historia.terminado) historia.clics++;
        if (comboCount) comboCount.textContent = clicksConsecutivos;
        
        if (skinEquipada === 'goku') {
            if (clicksConsecutivos % 5 === 0) {
                gokuIndiceFase = (gokuIndiceFase + 1) % GOKU_FASES.length;
                nets += 100;
                dispararEfectoExplosionHd(bola.x, bola.y, { col: GOKU_FASES[gokuIndiceFase].c2, esc: 1.5 });
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

function dibujarFondoMenu() {
    const w = canvas.width, h = canvas.height, t = performance.now() / 1000;
    const g = ctx.createRadialGradient(w / 2, h * 0.5, h * 0.05, w / 2, h * 0.5, Math.max(w, h) * 0.75);
    g.addColorStop(0, '#2b2f7a'); g.addColorStop(0.55, '#171a45'); g.addColorStop(1, '#0b0b1c');
    ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
    ctx.save();
    for (let i = 0; i < 60; i++) {
        ctx.globalAlpha = 0.25 + 0.6 * Math.abs(Math.sin(t * (0.6 + hash(i + 200)) + i));
        ctx.fillStyle = '#ffffff';
        const r = 1 + hash(i + 300) * 2 * Math.max(1, escalaPantalla * 0.6);
        ctx.fillRect(hash(i + 100) * w, hash(i + 150) * h, r, r);
    }
    for (let i = 0; i < 9; i++) {
        const x = (hash(i + 400) * w + Math.sin(t * 0.3 + i) * 40) % w;
        const y = h - ((t * (14 + hash(i + 450) * 20) + hash(i + 500) * h) % (h + 60));
        const rad = (10 + hash(i + 600) * 26) * Math.max(1, escalaPantalla * 0.6);
        const og = ctx.createRadialGradient(x, y, 0, x, y, rad);
        og.addColorStop(0, 'rgba(143,148,251,0.35)'); og.addColorStop(1, 'rgba(143,148,251,0)');
        ctx.globalAlpha = 1; ctx.fillStyle = og; ctx.beginPath(); ctx.arc(x, y, rad, 0, PI2); ctx.fill();
    }
    ctx.globalAlpha = 1; ctx.lineWidth = 2;
    for (let i = 0; i < 3; i++) {
        const rr = bola.radio * (1.9 + i * 0.85) + Math.sin(t * 1.3 + i) * 6;
        ctx.strokeStyle = `rgba(143,148,251,${0.28 - i * 0.08})`;
        ctx.beginPath(); ctx.arc(bola.x, bola.y, rr, 0, PI2); ctx.stroke();
    }
    ctx.restore();
}

function dibujar() {
    if (!ctx || !canvas) return;

    ctx.fillStyle = colorFondoDinamico;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    if (pantallaActual === "menu") dibujarFondoMenu();
    dibujarEscenaHistoria();

    FX.dibujar(ctx, 0);

    const sActiva = SKINS[skinEquipada] || SKINS.clasica;
    if (historia.activa && historia.invul > 0) ctx.globalAlpha = Math.floor(performance.now() / 80) % 2 ? 0.35 : 1;
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
    ctx.globalAlpha = 1;

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

    FX.dibujar(ctx, 1);
}

// ==========================================
// INTERFAZ Y MODALES
// ==========================================
function actualizarTiendaUI() {
    if (!skinsGrid) return;
    skinsGrid.innerHTML = '';
    const saldo = document.getElementById('saldoTienda');
    if (saldo) saldo.textContent = nets;
    for (let key in SKINS) {
        let skin = SKINS[key];
        let desbloqueada = skinsDesbloqueadas.includes(key);
        let equipada = skinEquipada === key;

        let div = document.createElement('div');
        div.className = 'skin-card' + (equipada ? ' equipada' : '') + (!desbloqueada && nets < skin.precio ? ' no-alcanza' : '');
        const chip = desbloqueada
            ? '<span class="chip-precio tuya">✔ Tuya</span>'
            : (skin.precio === 0 ? '<span class="chip-precio tuya">Gratis</span>' : `<span class="chip-precio">🪙 ${skin.precio.toLocaleString('es')}</span>`);
        div.innerHTML = `
            <canvas class="skin-orbe" width="160" height="160" data-skin="${key}"></canvas>
            <h3>${skin.nombre}</h3>
            <p class="hab">${HABILIDADES[key] || ''}</p>
            ${chip}
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
                mostrarToast(`Te faltan ${(skin.precio - nets).toLocaleString('es')} Nets para esta skin`);
            }
        };
        skinsGrid.appendChild(div);
    }
}

// Vista previa de cada skin con la misma textura que se usa en el juego
function dibujarVistasTienda() {
    if (modalTienda && modalTienda.style.display === 'flex') {
        const t = performance.now() / 1000;
        skinsGrid.querySelectorAll('canvas.skin-orbe').forEach(cv => {
            const g = cv.getContext('2d');
            g.clearRect(0, 0, cv.width, cv.height);
            try {
                dibujarSkin(g, cv.dataset.skin, cv.width / 2, cv.height / 2, 46, t, {
                    cooldown: false, seg: 0, blindado: false, vx: 0, vy: 4,
                    fase: GOKU_FASES[Math.floor(t * 0.8) % GOKU_FASES.length], fantasmaListo: true
                });
            } catch (e) { /* si una textura falla, se deja vacía */ }
        });
    }
    requestAnimationFrame(dibujarVistasTienda);
}
requestAnimationFrame(dibujarVistasTienda);

function actualizarLogrosUI() {
    if (!logrosGrid) return;
    logrosGrid.innerHTML = '';
    const resumen = document.getElementById('logrosResumen');
    if (resumen) resumen.innerHTML = htmlBarra(logrosCompletados.length, LOGROS.length, `Completados: ${logrosCompletados.length}/${LOGROS.length}`);
    LOGROS.forEach(logro => {
        let completado = logrosCompletados.includes(logro.id);
        let div = document.createElement('div');
        div.className = `skin-card ${completado ? 'completado' : ''}`;
        div.innerHTML = `
            <div class="logro-ico">${completado ? '🏆' : '🎯'}</div>
            <h3>${logro.titulo}</h3>
            <p>${logro.desc}</p>
            <p class="chip-recompensa">
                ${completado ? '✅ Completado' : `Recompensa: +${logro.recompensa.toLocaleString('es')} Nets`}
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
// SISTEMA DE AUDIO DINÁMICO (efectos y música)
// Todo se genera con Web Audio: no hay archivos de sonido.
// ==========================================
const audio = { ctx: null, master: null, musica: null, sfx: null, filtro: null, ruidoBuf: null, silencio: false, volMusica: 0.6, volSfx: 0.7, paso: 0, proxTiempo: 0, temporizador: null, ultimo: {} };
try {
    const guardado = JSON.parse(localStorage.getItem('audioAjustes'));
    if (guardado) {
        audio.silencio = !!guardado.silencio;
        if (typeof guardado.volMusica === 'number') audio.volMusica = Math.min(1, Math.max(0, guardado.volMusica));
        if (typeof guardado.volSfx === 'number') audio.volSfx = Math.min(1, Math.max(0, guardado.volSfx));
    }
} catch (e) {}

const MODOS = {
    mayor: [0, 2, 4, 5, 7, 9, 11], menor: [0, 2, 3, 5, 7, 8, 10], frigio: [0, 1, 3, 5, 7, 8, 10],
    dorico: [0, 2, 3, 5, 7, 9, 10], lidio: [0, 2, 4, 6, 7, 9, 11], menorArm: [0, 2, 3, 5, 7, 8, 11]
};
const MUSICAS = {
    menu:     { raiz: 57, modo: 'dorico',   prog: [0, 5, 3, 4], bpm: 78,  bajo: 'sine',     arp: 'triangle' },
    libre:    { raiz: 55, modo: 'mayor',    prog: [0, 4, 5, 3], bpm: 100, bajo: 'triangle', arp: 'square' },
    valle:    { raiz: 60, modo: 'mayor',    prog: [0, 4, 5, 3], bpm: 96,  bajo: 'triangle', arp: 'triangle' },
    bosque:   { raiz: 57, modo: 'dorico',   prog: [0, 3, 5, 4], bpm: 92,  bajo: 'triangle', arp: 'triangle' },
    cueva:    { raiz: 50, modo: 'frigio',   prog: [0, 1, 0, 6], bpm: 70,  bajo: 'sine',     arp: 'sine' },
    torre:    { raiz: 52, modo: 'menorArm', prog: [0, 5, 3, 4], bpm: 88,  bajo: 'sawtooth', arp: 'triangle' },
    nieve:    { raiz: 62, modo: 'lidio',    prog: [0, 4, 1, 5], bpm: 84,  bajo: 'sine',     arp: 'sine' },
    desierto: { raiz: 52, modo: 'frigio',   prog: [0, 1, 0, 3], bpm: 96,  bajo: 'triangle', arp: 'square' },
    mar:      { raiz: 50, modo: 'menor',    prog: [0, 5, 3, 6], bpm: 104, bajo: 'sawtooth', arp: 'triangle' },
    volcan:   { raiz: 45, modo: 'frigio',   prog: [0, 1, 5, 0], bpm: 108, bajo: 'sawtooth', arp: 'square' },
    cielo:    { raiz: 62, modo: 'mayor',    prog: [0, 4, 5, 3], bpm: 104, bajo: 'triangle', arp: 'triangle' }
};
const TIMBRE_GOLPE = { fuego: 'sawtooth', plasma: 'sawtooth', glitch: 'square', minecraft: 'square', chicle: 'sine', cuantica: 'sine', cosmos: 'triangle', estrella: 'triangle' };

function guardarAudio() {
    try { localStorage.setItem('audioAjustes', JSON.stringify({ silencio: audio.silencio, volMusica: audio.volMusica, volSfx: audio.volSfx })); } catch (e) {}
}

function aplicarVolumenes() {
    if (!audio.ctx) return;
    const t = audio.ctx.currentTime;
    audio.master.gain.setTargetAtTime(audio.silencio ? 0 : 1, t, 0.03);
    audio.musica.gain.setTargetAtTime(audio.volMusica * 0.5, t, 0.03);
    audio.sfx.gain.setTargetAtTime(audio.volSfx, t, 0.03);
}

function iniciarAudio() {
    if (audio.ctx) {
        if (audio.ctx.state === 'suspended' && !document.hidden) audio.ctx.resume();
        return;
    }
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    try {
        const ctx = new AC();
        audio.ctx = ctx;
        audio.master = ctx.createGain(); audio.master.connect(ctx.destination);
        audio.filtro = ctx.createBiquadFilter(); audio.filtro.type = 'lowpass'; audio.filtro.frequency.value = 18000; audio.filtro.connect(audio.master);
        audio.musica = ctx.createGain(); audio.musica.connect(audio.filtro);
        audio.sfx = ctx.createGain(); audio.sfx.connect(audio.master);
        const largo = ctx.sampleRate, buf = ctx.createBuffer(1, largo, ctx.sampleRate), datos = buf.getChannelData(0);
        for (let i = 0; i < largo; i++) datos[i] = Math.random() * 2 - 1;
        audio.ruidoBuf = buf;
        aplicarVolumenes();
        if (ctx.state === 'suspended') ctx.resume();
        audio.proxTiempo = ctx.currentTime + 0.1;
        audio.paso = 0;
        audio.temporizador = setInterval(programarMusica, 50);
    } catch (e) {
        audio.ctx = null;
    }
}

function midiHz(m) { return 440 * Math.pow(2, (m - 69) / 12); }

function tono(freq, dur, tipo, vol, o) {
    if (!audio.ctx || audio.silencio) return;
    o = o || {};
    const ctx = audio.ctx, t0 = o.t || ctx.currentTime, osc = ctx.createOscillator(), g = ctx.createGain();
    osc.type = tipo || 'sine';
    osc.frequency.setValueAtTime(freq, t0);
    if (o.hasta) osc.frequency.exponentialRampToValueAtTime(Math.max(20, o.hasta), t0 + dur);
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.linearRampToValueAtTime(vol, t0 + Math.min(o.ataque || 0.01, dur / 2));
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    osc.connect(g); g.connect(o.destino || audio.sfx);
    osc.start(t0); osc.stop(t0 + dur + 0.05);
}

function ruido(dur, corte, vol, o) {
    if (!audio.ctx || audio.silencio || !audio.ruidoBuf) return;
    o = o || {};
    const ctx = audio.ctx, t0 = o.t || ctx.currentTime, fuente = ctx.createBufferSource(), f = ctx.createBiquadFilter(), g = ctx.createGain();
    fuente.buffer = audio.ruidoBuf;
    f.type = o.tipo || 'lowpass';
    f.frequency.setValueAtTime(corte, t0);
    if (o.hasta) f.frequency.exponentialRampToValueAtTime(Math.max(40, o.hasta), t0 + dur);
    g.gain.setValueAtTime(vol, t0);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    fuente.connect(f); f.connect(g); g.connect(o.destino || audio.sfx);
    fuente.start(t0); fuente.stop(t0 + dur + 0.05);
}

const PENTA = [0, 2, 4, 7, 9];
const SFX = {
    ui() { tono(900, 0.05, 'square', 0.06, { hasta: 600 }); },
    golpe(combo) {
        const c = Math.max(0, combo || 0), semi = Math.min(24, PENTA[c % 5] + 12 * Math.floor(c / 5)), f = 330 * Math.pow(2, semi / 12);
        tono(f, 0.14, TIMBRE_GOLPE[skinEquipada] || 'triangle', 0.26, { hasta: f * 0.85 });
        tono(f * 2, 0.08, 'sine', 0.09);
    },
    rebote() { tono(190, 0.12, 'sine', 0.22, { hasta: 70 }); ruido(0.05, 900, 0.08); },
    caida() { tono(420, 0.55, 'sawtooth', 0.16, { hasta: 70 }); },
    vida() { const t = audio.ctx.currentTime; tono(320, 0.22, 'square', 0.12, { hasta: 160 }); tono(240, 0.32, 'square', 0.12, { hasta: 90, t: t + 0.16 }); },
    combo() { const t = audio.ctx.currentTime; [0, 4, 7, 12].forEach((s, i) => tono(523 * Math.pow(2, s / 12), 0.18, 'triangle', 0.14, { t: t + i * 0.06 })); },
    explosion() { ruido(0.6, 1800, 0.45, { hasta: 120 }); tono(120, 0.5, 'sine', 0.45, { hasta: 35 }); },
    zap() { ruido(0.18, 4000, 0.22, { tipo: 'bandpass', hasta: 1200 }); tono(1200, 0.15, 'sawtooth', 0.1, { hasta: 200 }); },
    cristal() { const t = audio.ctx.currentTime; [2100, 2800, 3500, 4200].forEach((f, i) => tono(f, 0.25, 'triangle', 0.08, { t: t + i * 0.02 })); ruido(0.15, 6000, 0.12, { tipo: 'highpass' }); },
    portal() { tono(300, 0.4, 'sine', 0.22, { hasta: 1200 }); tono(600, 0.4, 'triangle', 0.09, { hasta: 2400 }); },
    hielo() { tono(1500, 0.3, 'sine', 0.16, { hasta: 600 }); ruido(0.25, 7000, 0.1, { tipo: 'highpass' }); },
    pegajoso() { const t = audio.ctx.currentTime; tono(500, 0.25, 'sine', 0.22, { hasta: 120 }); tono(250, 0.2, 'triangle', 0.18, { hasta: 600, t: t + 0.1 }); },
    vacio() { tono(80, 0.7, 'sine', 0.35, { hasta: 400 }); ruido(0.5, 400, 0.15, { hasta: 2000 }); },
    quemadura() { ruido(0.18, 2500, 0.18, { hasta: 500 }); tono(220, 0.15, 'sawtooth', 0.1, { hasta: 90 }); },
    moneda() { const t = audio.ctx.currentTime; tono(988, 0.08, 'square', 0.1); tono(1319, 0.18, 'square', 0.1, { t: t + 0.07 }); },
    golpeJefe() { tono(140, 0.15, 'square', 0.2, { hasta: 60 }); ruido(0.1, 1500, 0.15); },
    trueno() { ruido(1.2, 700, 0.5, { hasta: 80 }); tono(60, 1.0, 'sine', 0.35, { hasta: 30 }); },
    logro() { const t = audio.ctx.currentTime; [0, 4, 7, 12, 16].forEach((s, i) => { tono(523 * Math.pow(2, s / 12), 0.35, 'triangle', 0.16, { t: t + i * 0.09 }); tono(1046 * Math.pow(2, s / 12), 0.2, 'sine', 0.05, { t: t + i * 0.09 }); }); },
    victoria() { const t = audio.ctx.currentTime; [0, 4, 7, 12, 7, 12, 16, 19].forEach((s, i) => tono(392 * Math.pow(2, s / 12), 0.4, 'triangle', 0.17, { t: t + i * 0.12 })); },
    derrota() { const t = audio.ctx.currentTime; [0, -2, -5, -9].forEach((s, i) => tono(392 * Math.pow(2, s / 12), 0.45, 'sawtooth', 0.1, { t: t + i * 0.18, hasta: 392 * Math.pow(2, (s - 3) / 12) })); }
};

function sfx(nombre, arg) {
    if (!audio.ctx || audio.silencio || !SFX[nombre]) return;
    const ahora = performance.now();
    if (audio.ultimo[nombre] && ahora - audio.ultimo[nombre] < 45) return;
    audio.ultimo[nombre] = ahora;
    try { SFX[nombre](arg); } catch (e) {}
}

// ----- Música dinámica: cambia de tema, tempo y capas según lo que pasa en el juego -----
function estadoMusica() {
    if (pantallaActual === 'menu') return { tema: 'menu', intens: 0, jefe: false };
    const combo = clicksConsecutivos;
    let intens = combo >= 40 ? 4 : combo >= 25 ? 3 : combo >= 12 ? 2 : combo >= 4 ? 1 : 0;
    let tema = 'libre', jefe = false;
    if (historia.activa && !historia.terminado) {
        tema = MUSICAS[historia.cap.tema] ? historia.cap.tema : 'libre';
        jefe = !!historia.cap.jefe;
        if (jefe) intens = Math.max(2, Math.min(4, intens + 1));
        if (historia.vidas === 1 && !bolaEnEsperaSaque) intens = Math.min(4, intens + 1);
    }
    if (bolaEnEsperaSaque) intens = Math.min(intens, jefe ? 2 : 1);
    return { tema, intens, jefe };
}

function notaGrado(T, g) {
    const modo = MODOS[T.modo], o = Math.floor(g / 7);
    return T.raiz + modo[((g % 7) + 7) % 7] + 12 * o;
}

function tocarPaso(T, est, p, t, paso) {
    const barra = Math.floor(p / 16) % 4, s = p % 16, g = T.prog[barra], d = { t, destino: audio.musica };
    if (s === 0) [0, 2, 4].forEach(k => tono(midiHz(notaGrado(T, g + k)), paso * 15.5, 'triangle', 0.05, { t, destino: audio.musica, ataque: 0.25 }));
    if (est.intens >= 1) {
        if (s % 4 === 0) tono(midiHz(notaGrado(T, g) - 12), paso * 3.4, T.bajo, 0.12, d);
        if (est.intens >= 2 && (s === 6 || s === 14)) tono(midiHz(notaGrado(T, g + 4) - 12), paso * 1.6, T.bajo, 0.09, d);
    }
    if (est.intens >= 2 && s % 2 === 0) {
        const grado = g + [0, 2, 4, 7][(s / 2 + barra) % 4];
        tono(midiHz(notaGrado(T, grado) + 12), paso * 1.5, T.arp, 0.03, d);
    }
    if (est.intens >= 3) {
        if (s % 8 === 0 || (est.intens >= 4 && s % 4 === 0)) tono(150, 0.16, 'sine', 0.32, { t, destino: audio.musica, hasta: 45 });
        if (s % 2 === 0) ruido(0.04, 7000, s % 4 === 0 ? 0.06 : 0.035, { t, destino: audio.musica, tipo: 'highpass' });
        if (est.intens >= 4 && (s === 4 || s === 12)) ruido(0.12, 3000, 0.1, { t, destino: audio.musica, tipo: 'bandpass' });
    }
}

function programarMusica() {
    const ctx = audio.ctx;
    if (!ctx || ctx.state !== 'running') return;
    const est = estadoMusica(), T = MUSICAS[est.tema] || MUSICAS.libre;
    const espera = pantallaActual === 'juego' && bolaEnEsperaSaque;
    const corte = pantallaActual === 'menu' ? 2600 : (espera ? 1500 : (modH('niebla', 0) ? 3000 : 18000));
    audio.filtro.frequency.setTargetAtTime(corte, ctx.currentTime, 0.2);
    if (audio.proxTiempo < ctx.currentTime - 0.1) audio.proxTiempo = ctx.currentTime + 0.05;
    let guardia = 0;
    while (audio.proxTiempo < ctx.currentTime + 0.25 && guardia++ < 8) {
        const bpm = T.bpm + est.intens * 6 + (est.jefe ? 10 : 0), paso = 60 / bpm / 4;
        if (!audio.silencio) tocarPaso(T, est, audio.paso, audio.proxTiempo, paso);
        audio.proxTiempo += paso;
        audio.paso = (audio.paso + 1) % 64;
    }
}

// ----- Controles -----
const btnAudio = document.getElementById('btnAudio');
const modalAudio = document.getElementById('modalAudio');
const rangoMusica = document.getElementById('rangoMusica');
const rangoSfx = document.getElementById('rangoSfx');
const btnSilenciar = document.getElementById('btnSilenciar');
const cerrarAudio = document.getElementById('cerrarAudio');

function actualizarControlesAudio() {
    if (rangoMusica) rangoMusica.value = Math.round(audio.volMusica * 100);
    if (rangoSfx) rangoSfx.value = Math.round(audio.volSfx * 100);
    if (btnSilenciar) btnSilenciar.textContent = audio.silencio ? '🔇 Activar sonido' : '🔊 Silenciar todo';
    if (btnAudio) {
        btnAudio.classList.toggle('mudo', audio.silencio);
        btnAudio.title = audio.silencio ? 'Sonido desactivado (M)' : 'Sonido (M)';
    }
}

function alternarSilencio() {
    audio.silencio = !audio.silencio;
    aplicarVolumenes();
    guardarAudio();
    actualizarControlesAudio();
}

if (btnAudio) btnAudio.addEventListener('click', () => { actualizarControlesAudio(); modalAudio.style.display = 'flex'; });
if (cerrarAudio) cerrarAudio.addEventListener('click', () => { modalAudio.style.display = 'none'; });
if (btnSilenciar) btnSilenciar.addEventListener('click', alternarSilencio);
if (rangoMusica) rangoMusica.addEventListener('input', () => { audio.volMusica = rangoMusica.value / 100; aplicarVolumenes(); guardarAudio(); });
if (rangoSfx) rangoSfx.addEventListener('input', () => { audio.volSfx = rangoSfx.value / 100; aplicarVolumenes(); guardarAudio(); sfx('moneda'); });
actualizarControlesAudio();

// El navegador solo permite sonido después de un gesto del usuario
['pointerdown', 'touchstart', 'keydown', 'click'].forEach(ev => document.addEventListener(ev, iniciarAudio, { passive: true }));
document.addEventListener('click', (e) => {
    const b = e.target && e.target.closest ? e.target.closest('button') : null;
    if (b) sfx('ui');
});
document.addEventListener('visibilitychange', () => {
    if (!audio.ctx) return;
    if (document.hidden) audio.ctx.suspend(); else audio.ctx.resume();
});
window.addEventListener('keydown', (e) => {
    if ((e.key === 'm' || e.key === 'M') && !e.ctrlKey && !e.metaKey && !e.altKey) alternarSilencio();
});

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
        ["El Rey Tormenta se disuelve en una lluvia de estrellas y el cielo se vuelve azul claro, sin una sola nube.", "Rebotia es libre otra vez. Ya no eres solo un Rebotador: eres la Leyenda del Cielo Infinito.", "Pero allá abajo, en lo profundo del bosque, algo se agita: una sombra nueva crece bajo las raíces. Tu viaje continúa."], { clima: 'brisa' })
);
CAPITULOS[9].victoria = ["La Bola Eterna se ilumina y todo Rebotia vuelve a moverse. Las nubes giran, el viento canta y los aldeanos bailan.", "Pero su luz revela un mapa: más allá hay montañas, desiertos y mares que también necesitan tu ayuda. Tu viaje apenas comienza."];

// ---------- Capítulos 41 al 80 ----------
const A10 = "Acto X · El Bosque Maldito", A11 = "Acto XI · Las Minas de Cristal", A12 = "Acto XII · El Mar Abisal", A13 = "Acto XIII · El Corazón del Volcán";
CAPITULOS.push(
    nuevoCap(41, A10, "Raíces Retorcidas", "El bosque que liberaste ahora está maldito: raíces negras se mueven bajo tus pies y el viento huele a podrido.", 'clics', 150, { viento: 0.03 }, 'media', 5, 40000, "Las raíces se encogen y el camino se abre entre la niebla.", { limite: 150 }),
    nuevoCap(42, A10, "Niebla de Esporas", "Una nube de esporas lo cubre todo. Solo ves lo que rodea a la bola: no pierdas el ritmo.", 'combo', 24, { niebla: 400 }, 'media', 4, 45000, "Las esporas se dispersan y se oyen risas entre los árboles."),
    nuevoCap(43, A10, "Hongos Saltarines", "Los hongos gigantes hacen que todo flote raro. Mantén la bola en el aire sin tocar el suelo.", 'tiempo', 60, { gravedad: 0.9, viento: 0.035 }, 'media', 4, 48000, "Los hongos se calman y brillan con una luz verde suave."),
    nuevoCap(44, A10, "Lluvia de Savia", "De las ramas gotea savia dorada que se convierte en Nets. Recógela antes de que se seque.", 'nets', 8000, { viento: 0.04 }, 'media', 4, 50000, "Sales cubierto de savia dorada. Un crujido enorme sacude el bosque.", { limite: 140 }),
    nuevoCap(45, A10, "La Raíz Corrupta", "La Raíz Corrupta, un árbol antiguo envenenado, lanza ramas y hojas afiladas contra ti.", 'combo', 28, { viento: 0.04, gravedad: 1.15 }, 'media', 3, 80000, "La Raíz se parte en dos y deja salir una luz limpia. El bosque respira de nuevo."),
    nuevoCap(46, A10, "Sendero de Espinas", "Las espinas cierran el sendero y la bola parece más pequeña entre tantas ramas.", 'clics', 180, { radio: 0.85 }, 'media', 4, 55000, "Las espinas se abren y dejan ver un pantano oscuro.", { limite: 150 }),
    nuevoCap(47, A10, "El Pantano Hueco", "El pantano tira de todo hacia abajo y la niebla esconde la orilla. Aguanta.", 'combo', 26, { gravedad: 1.2, niebla: 380 }, 'media', 4, 58000, "Cruzas el último charco. Decenas de ojos brillan en las sombras."),
    nuevoCap(48, A10, "Ojos en la Oscuridad", "Algo te observa desde los árboles. La oscuridad es total, solo ves un halo cerca de la bola.", 'tiempo', 65, { niebla: 330 }, 'media', 3, 60000, "Los ojos se cierran uno a uno. Delante, una red enorme bloquea el cielo."),
    nuevoCap(49, A10, "Telaraña Gigante", "Una telaraña inmensa vibra con el viento. Un fallo y la bola queda atrapada.", 'combo', 28, { viento: 0.05, radio: 0.8 }, 'media', 3, 65000, "Rompes el último hilo. Algo con ocho patas baja lentamente del techo."),
    nuevoCap(50, A10, "La Reina Araña", "La Reina Araña descuelga su tela y te dispara aguijones venenosos. Un clic fallado rompe tu racha.", 'combo', 32, { viento: 0.05, radio: 0.8 }, 'dificil', 4, 120000, ["La Reina cae enredada en su propia tela y el bosque vuelve a ser verde.", "Entre sus restos aparece un mapa que señala una mina bajo las montañas: allí brilla algo que no debería existir."])
);
CAPITULOS.push(
    nuevoCap(51, A11, "Vagonetas Locas", "Las vagonetas de la mina corren sin conductor y todo tiembla. Mantén la bola viva entre tanto traqueteo.", 'clics', 200, { gravedad: 1.2 }, 'media', 5, 70000, "La última vagoneta se detiene y la mina se queda en silencio.", { limite: 150 }),
    nuevoCap(52, A11, "Túneles Estrechos", "Los túneles son tan estrechos que la bola parece más pequeña. Apunta con cuidado.", 'combo', 28, { radio: 0.8 }, 'media', 4, 72000, "Sales del túnel a una cámara llena de gemas brillantes."),
    nuevoCap(53, A11, "Derrumbe", "El techo se viene abajo y todo pesa el doble. No dejes que la bola caiga.", 'tiempo', 65, { gravedad: 1.3 }, 'media', 3, 75000, "El polvo se asienta. Entre las rocas aparece una veta dorada."),
    nuevoCap(54, A11, "Veta de Oro", "La veta es una lluvia de Nets, pero la cueva está casi a oscuras. Recoge todo lo que puedas.", 'nets', 9000, { niebla: 360 }, 'media', 4, 80000, "Tienes los bolsillos pesados. Una sombra enorme de cristal se mueve al fondo.", { limite: 150 }),
    nuevoCap(55, A11, "El Coloso de Cristal", "El Coloso de Cristal despierta y lanza esquirlas y carámbanos que brillan en la oscuridad.", 'combo', 30, { gravedad: 1.2, niebla: 420 }, 'media', 3, 130000, "El Coloso se hace mil pedazos y deja un camino de luz azul."),
    nuevoCap(56, A11, "Cámara de Ecos", "Cada rebote suena mil veces. La niebla se mete en la cámara y confunde todo.", 'clics', 220, { niebla: 340 }, 'media', 4, 85000, "El eco se apaga y puedes oír tu propia respiración.", { limite: 150 }),
    nuevoCap(57, A11, "Lago Subterráneo", "Un lago oscuro refleja los cristales. El aire es ligero y el viento se cuela por las grietas.", 'combo', 30, { viento: 0.04, gravedad: 0.9 }, 'media', 4, 88000, "Cruzas el lago y sientes que algo te copia en el agua."),
    nuevoCap(58, A11, "Corazón de Gema", "En el centro de la mina late una gema gigante que apaga la luz. La bola se ve más pequeña.", 'tiempo', 70, { radio: 0.8, niebla: 360 }, 'media', 3, 92000, "La gema se apaga y deja ver un salón lleno de espejos negros."),
    nuevoCap(59, A11, "Salón de Espejos Negros", "Los espejos negros devuelven tu reflejo, pero más oscuro y más rápido. No te distraigas.", 'combo', 32, { radio: 0.75 }, 'media', 3, 96000, "Los espejos tiemblan. Tu propio reflejo da un paso fuera del cristal."),
    nuevoCap(60, A11, "El Reflejo Oscuro", "Tu Reflejo Oscuro te lanza esquirlas desde todos los lados. Aquí un clic fallado rompe tu racha.", 'combo', 34, { radio: 0.75, viento: 0.04 }, 'dificil', 4, 160000, ["El Reflejo se rompe en polvo negro y la luz vuelve a la mina.", "Desde la superficie llega el sonido del mar. Algo enorme se mueve bajo las olas."])
);
CAPITULOS.push(
    nuevoCap(61, A12, "Muelle Hundido", "El mar se tragó el puerto. Solo quedan tablones flotando y un viento que no para.", 'clics', 230, { viento: 0.04 }, 'media', 5, 100000, "Subes a una balsa y las olas te llevan mar adentro.", { limite: 150 }),
    nuevoCap(62, A12, "Corrientes Heladas", "Las corrientes frías empujan la bola de lado a lado. Mantén la calma.", 'combo', 30, { viento: 0.055 }, 'media', 4, 105000, "La corriente se calma y ves algo oscuro bajo el agua."),
    nuevoCap(63, A12, "Cementerio de Barcos", "Cientos de barcos hundidos se esconden en la niebla. La bola apenas se distingue.", 'tiempo', 70, { niebla: 380 }, 'media', 3, 110000, "Pasas entre los cascos oxidados y una luz azul aparece en el fondo."),
    nuevoCap(64, A12, "Perlas Eléctricas", "Las perlas del abismo sueltan chispas y Nets. Atrápalas antes de que se apaguen.", 'nets', 10000, { viento: 0.05 }, 'media', 4, 115000, "Tus bolsillos chisporrotean. Una sombra con tentáculos sube del fondo.", { limite: 150 }),
    nuevoCap(65, A12, "La Medusa Abisal", "La Medusa Abisal ilumina el fondo con rayos y lanza tinta eléctrica. Solo ves cerca de la bola.", 'combo', 32, { viento: 0.05, niebla: 400 }, 'media', 3, 180000, "La Medusa se apaga y el agua se queda en calma."),
    nuevoCap(66, A12, "Fosa Profunda", "Cuanto más desciendes, más pesa todo. La gravedad de la fosa casi te aplasta.", 'clics', 250, { gravedad: 1.25 }, 'media', 4, 120000, "Tocas el fondo de la fosa y encuentras un bosque de algas brillantes.", { limite: 150 }),
    nuevoCap(67, A12, "Bosque de Algas", "Las algas se mecen y empujan la bola. Entre ellas, todo se ve más pequeño.", 'combo', 32, { viento: 0.045, radio: 0.85 }, 'media', 4, 125000, "Las algas se abren y dejan ver una ciudad hundida."),
    nuevoCap(68, A12, "Ciudad Sumergida", "En la ciudad perdida casi no hay luz y el agua es densa. Mantén la bola arriba.", 'tiempo', 75, { niebla: 340, gravedad: 1.15 }, 'media', 3, 130000, "Las torres tiemblan. El suelo entero comienza a moverse."),
    nuevoCap(69, A12, "Tormenta Submarina", "Una tormenta bajo el agua mezcla corrientes y relámpagos. No hay un solo respiro.", 'combo', 34, { viento: 0.06, gravedad: 1.2 }, 'media', 3, 135000, "La tormenta se aparta. Algo gigantesco levanta la cabeza."),
    nuevoCap(70, A12, "El Leviatán", "El Leviatán, el rey del abismo, lanza rayos, tinta y olas. Un clic fallado rompe tu racha.", 'combo', 36, { viento: 0.06, gravedad: 1.25 }, 'dificil', 4, 220000, ["El Leviatán se hunde en un remolino de burbujas azules y el mar se queda en calma.", "En el horizonte, un volcán que creías apagado escupe fuego. Su rugido llama a la última batalla."])
);
CAPITULOS.push(
    nuevoCap(71, A13, "Puertas de Obsidiana", "Las puertas del volcán están selladas con obsidiana. El humo apenas deja ver la bola.", 'clics', 260, { niebla: 420 }, 'media', 5, 150000, "Las puertas se abren y el calor te golpea la cara.", { limite: 150 }),
    nuevoCap(72, A13, "Ríos de Fuego", "Ríos de lava recorren los túneles. Todo pesa más y no hay lugar para errores.", 'combo', 34, { gravedad: 1.3 }, 'media', 4, 155000, "Cruzas el último río de fuego. El suelo tiembla."),
    nuevoCap(73, A13, "Géiseres de Ceniza", "Los géiseres lanzan columnas de ceniza que empujan la bola. Apenas se ve el cielo.", 'tiempo', 75, { viento: 0.05, niebla: 360 }, 'media', 3, 160000, "Los géiseres se apagan uno a uno y aparece una sala dorada."),
    nuevoCap(74, A13, "El Tesoro del Dragón", "El dragón guardaba un tesoro que arde como brasas. Recógelo antes de que se enfríe.", 'nets', 11000, { viento: 0.05 }, 'media', 4, 170000, "Con el tesoro en las manos, oyes unas alas enormes sobre ti.", { limite: 150 }),
    nuevoCap(75, A13, "El Dragón de Ceniza", "El Dragón de Ceniza ruge y escupe abanicos de lava y brasas del cielo. Tu bola es pequeña y no hay margen.", 'combo', 36, { viento: 0.055, gravedad: 1.25, radio: 0.8 }, 'media', 3, 260000, "El Dragón se apaga convertido en ceniza. El camino al corazón del volcán queda libre."),
    nuevoCap(76, A13, "Escalera de Magma", "La escalera sube por el interior del volcán entre chorros de magma. Sigue rebotando sin parar.", 'clics', 300, { gravedad: 1.3 }, 'media', 4, 180000, "Llegas a una cámara circular donde flotan cuatro orbes de luz.", { limite: 150 }),
    nuevoCap(77, A13, "Lluvia de Meteoros", "El techo del volcán se rompe y caen meteoros. La bola parece diminuta bajo ese cielo rojo.", 'combo', 36, { viento: 0.06, radio: 0.8 }, 'media', 3, 190000, "El último meteoro se apaga. Los cuatro orbes empiezan a brillar."),
    nuevoCap(78, A13, "La Cámara del Eco Final", "Todo lo que has vivido regresa en forma de sombras. La niebla es densa y el aire pesa.", 'tiempo', 80, { niebla: 340, gravedad: 1.3 }, 'media', 3, 200000, "Las sombras se desvanecen y los orbes se unen en el centro."),
    nuevoCap(79, A13, "Los Cuatro Guardianes", "Los guardianes de los orbes te ponen a prueba con viento, peso y una bola cada vez más pequeña.", 'combo', 38, { viento: 0.06, gravedad: 1.25, radio: 0.8 }, 'media', 3, 220000, "Los orbes se funden en uno solo. El suelo se abre y algo despierta."),
    nuevoCap(80, A13, "El Devorador de Rebotia", "El Devorador de Rebotia surge del corazón del volcán: rayos, ráfagas y rocas llueven sin parar. Un clic fallado rompe tu racha.", 'combo', 40, { viento: 0.06, gravedad: 1.3, radio: 0.75 }, 'dificil', 5, 400000, ["El Devorador estalla en una lluvia de chispas y todo Rebotia se llena de luz.", "Has recorrido bosques, minas, mares y volcanes. Ya no eres solo la Leyenda de Rebotia: eres su guardián para siempre. ¡Gracias por jugar!"])
);

// ---------- Jefes visibles, temas y clima ----------
const JEFES = {
    5: { forma: 'arbol', nombre: 'Guardián de las Ramas', color: '#6bd36b' }, 8: { forma: 'espejo', nombre: 'El Reflejo', color: '#9fd8ff' },
    10: { forma: 'orbe', nombre: 'La Bola Eterna', color: '#ffe58a' }, 13: { forma: 'yeti', nombre: 'Yeti Gigante', color: '#bfe3ff' },
    16: { forma: 'reina', nombre: 'Reina de la Ventisca', color: '#7dd3fc' }, 19: { forma: 'escorpion', nombre: 'Escorpión de Cristal', color: '#a78bfa' },
    22: { forma: 'faraon', nombre: 'Faraón de Arena', color: '#fcd34d' }, 25: { forma: 'medusa', nombre: 'Medusa Eléctrica', color: '#e879f9' },
    28: { forma: 'kraken', nombre: 'Kraken del Trueno', color: '#2dd4bf' }, 31: { forma: 'golem', nombre: 'Golem de Lava', color: '#fb923c' },
    34: { forma: 'dragon', nombre: 'Dragón de Magma', color: '#f87171' }, 37: { forma: 'angel', nombre: 'Centinela Celestial', color: '#fde68a' },
    40: { forma: 'titan', nombre: 'Rey Tormenta', color: '#fef08a' },
    45: { forma: 'arbol', nombre: 'Raíz Corrupta', color: '#a3e635', cada: 2.8, ataques: [{ k: 'caida', n: 3, spr: 'rama', col: '#8a5a2b', r: 18 }, { k: 'abanico', n: 5, spr: 'hoja', col: '#a3e635', v: 340, ab: 0.22 }] },
    50: { forma: 'escorpion', nombre: 'Reina Araña', color: '#f472b6', cada: 2.6, ataques: [{ k: 'bala', spr: 'aguijon', col: '#f472b6', v: 470 }, { k: 'abanico', n: 5, spr: 'aguijon', col: '#f472b6', v: 400, ab: 0.25 }, { k: 'caida', n: 2, spr: 'aguijon', col: '#f472b6', r: 16 }] },
    55: { forma: 'golem', nombre: 'Coloso de Cristal', color: '#67e8f9', cada: 2.8, ataques: [{ k: 'caida', n: 3, spr: 'hielo', col: '#67e8f9', r: 16 }, { k: 'abanico', n: 5, spr: 'esquirla', col: '#67e8f9', v: 360, ab: 0.24 }] },
    60: { forma: 'espejo', nombre: 'Reflejo Oscuro', color: '#c084fc', cada: 2.6, ataques: [{ k: 'abanico', n: 5, spr: 'esquirla', col: '#c084fc', v: 380, ab: 0.25 }, { k: 'radial', n: 8, spr: 'esquirla', col: '#c084fc', v: 280 }, { k: 'bala', spr: 'esquirla', col: '#c084fc', v: 470 }] },
    65: { forma: 'medusa', nombre: 'Medusa Abisal', color: '#38bdf8', cada: 2.8, ataques: [{ k: 'rayo', n: 3, col: '#38bdf8' }, { k: 'abanico', n: 5, spr: 'tinta', col: '#38bdf8', v: 360, ab: 0.25 }] },
    70: { forma: 'kraken', nombre: 'Leviatán', color: '#0ea5e9', cada: 2.5, ataques: [{ k: 'rayo', n: 3, col: '#0ea5e9' }, { k: 'radial', n: 10, spr: 'tinta', col: '#0ea5e9', v: 270 }, { k: 'bala', spr: 'tinta', col: '#0ea5e9', v: 480 }] },
    75: { forma: 'dragon', nombre: 'Dragón de Ceniza', color: '#fb923c', cada: 2.4, ataques: [{ k: 'abanico', n: 5, spr: 'lava', col: '#ff5a10', v: 390, ab: 0.24, r: 16 }, { k: 'bala', spr: 'lava', col: '#ff5a10', v: 480, r: 16 }, { k: 'caida', n: 3, spr: 'lava', col: '#ff5a10', r: 17 }] },
    80: { forma: 'titan', nombre: 'Devorador de Rebotia', color: '#e879f9', cada: 2.2, ataques: [{ k: 'rayo', n: 4, col: '#e879f9' }, { k: 'radial', n: 12, spr: 'electro', col: '#e879f9', v: 270 }, { k: 'abanico', n: 5, spr: 'electro', col: '#e879f9', v: 420, ab: 0.2 }, { k: 'caida', n: 3, spr: 'roca', col: '#c084fc', r: 22 }] }
};
const TEMAS_ACTO = [
    { hasta: 3, tema: 'valle', clima: 'ninguno' }, { hasta: 5, tema: 'bosque', clima: 'hojas' }, { hasta: 8, tema: 'cueva', clima: 'ninguno' },
    { hasta: 10, tema: 'torre', clima: 'ninguno' }, { hasta: 16, tema: 'nieve', clima: 'nieve' }, { hasta: 22, tema: 'desierto', clima: 'arena' },
    { hasta: 28, tema: 'mar', clima: 'lluvia' }, { hasta: 34, tema: 'volcan', clima: 'ceniza' }, { hasta: 40, tema: 'cielo', clima: 'brisa' },
    { hasta: 50, tema: 'bosque', clima: 'hojas' }, { hasta: 60, tema: 'cueva', clima: 'ninguno' }, { hasta: 70, tema: 'mar', clima: 'lluvia' }, { hasta: 80, tema: 'volcan', clima: 'ceniza' }
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
    const viento = c.mod.viento || 0.02, vx = Math.sin(performance.now() / 1300) * (0.12 + viento * 7);
    FX.clima(ctx, clima, w, h, t, historiaDt, vx, w / 720);
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

// ==========================================
// FONDOS DETALLADOS DEL MODO HISTORIA
// Cada fondo se pinta una sola vez en un lienzo oculto (caché) y cada
// fotograma solo se copia y se le añaden los elementos animados.
// ==========================================
const cacheFondos = {};
const nuevoLienzo = (w, h) => { const c = document.createElement('canvas'); c.width = Math.max(1, Math.round(w)); c.height = Math.max(1, Math.round(h)); return c; };
const gV = (g, y0, y1, st) => { const r = g.createLinearGradient(0, y0, 0, y1); st.forEach(([p, c]) => r.addColorStop(p, c)); return r; };
const yCr = (x, b, a, f, ph) => b + Math.sin(x * f + ph) * a + Math.sin(x * f * 2.7 + ph * 2.3) * a * 0.45 + Math.sin(x * f * 6.1 + ph * 4.1) * a * 0.12;

function crestaPath(g, w, h, b, a, f, ph) {
    g.beginPath(); g.moveTo(0, h);
    for (let x = 0; x <= w + 6; x += 6) g.lineTo(x, yCr(x, b, a, f, ph));
    g.lineTo(w, h); g.closePath();
}

function grano(g, x, y, w, h, n, cols, tam, sem) {
    for (let i = 0; i < n; i++) {
        g.fillStyle = cols[Math.floor(hash(sem + i * 3.1) * cols.length)];
        g.fillRect(x + hash(sem + i * 7.7 + 1) * w, y + hash(sem + i * 11.3 + 2) * h, tam, tam);
    }
}

// Colina con degradado, granulado y matas en la cresta
function colina(g, w, h, b, a, f, ph, c0, c1, c2, sem, s, matas) {
    const cv = nuevoLienzo(w, h), q = cv.getContext('2d');
    crestaPath(q, w, h, b, a, f, ph);
    q.fillStyle = gV(q, b - a, h, [[0, c0], [1, c1]]); q.fill();
    q.globalCompositeOperation = 'source-atop';
    grano(q, 0, b - a, w, h - b + a, Math.floor(w * (h - b + a) / 70), [c0, c1, c2, 'rgba(255,255,255,0.1)', 'rgba(0,0,0,0.12)'], Math.max(2, Math.round(2.5 * s)), sem);
    q.globalCompositeOperation = 'source-over';
    if (matas !== false) {
        q.lineCap = 'round';
        for (let x = 0; x < w; x += Math.max(7, 9 * s)) {
            const y = yCr(x, b, a, f, ph), l = (5 + hash(sem + x) * 9) * s;
            q.strokeStyle = hash(sem + x * 1.7) > 0.5 ? c0 : c2; q.lineWidth = 2 * s;
            q.beginPath(); q.moveTo(x, y + 2); q.lineTo(x + (hash(sem + x * 2.3) - 0.5) * 5 * s, y - l); q.stroke();
        }
    }
    g.drawImage(cv, 0, 0);
}

function montanas(g, w, base, alt, luz, sombra, nieve, n, sem, bruma) {
    for (let i = 0; i < n; i++) {
        const hw = w / n * (0.7 + hash(sem + i) * 0.5), cx = (i + 0.5) / n * w + (hash(sem + i * 3) - 0.5) * w / n * 0.6,
              ph = alt * (0.6 + 0.4 * hash(sem + i * 5)), tx = cx + (hash(sem + i * 7) - 0.5) * hw * 0.3;
        poli(g, [[cx - hw, base], [tx - hw * 0.35, base - ph * 0.55], [tx, base - ph], [tx + hw * 0.1, base]], luz);
        poli(g, [[tx, base - ph], [tx + hw * 0.45, base - ph * 0.5], [cx + hw, base], [tx + hw * 0.1, base]], sombra);
        linea(g, [[tx, base - ph], [tx + hw * 0.05, base - ph * 0.5], [tx + hw * 0.1, base]], 'rgba(0,0,0,0.12)', 2);
        linea(g, [[tx - hw * 0.12, base - ph * 0.8], [tx - hw * 0.25, base - ph * 0.45], [tx - hw * 0.3, base - ph * 0.2]], 'rgba(0,0,0,0.08)', 3);
        if (nieve) {
            const y1 = base - ph * 0.7;
            poli(g, [[tx, base - ph], [tx + hw * 0.27, y1 + ph * 0.05], [tx + hw * 0.12, y1 + ph * 0.13], [tx, y1 + ph * 0.04], [tx - hw * 0.13, y1 + ph * 0.15], [tx - hw * 0.3, y1 + ph * 0.04]], nieve);
        }
    }
    if (bruma) { g.fillStyle = gV(g, base - alt, base, [[0, 'rgba(255,255,255,0)'], [1, bruma]]); g.fillRect(0, base - alt, w, alt + 2); }
}

function arbolR(g, x, y, s, c, sem) {
    g.fillStyle = 'rgba(0,0,0,0.22)'; g.beginPath(); g.ellipse(x, y, 38 * s, 9 * s, 0, 0, PI2); g.fill();
    const tr = g.createLinearGradient(x - 8 * s, 0, x + 8 * s, 0); tr.addColorStop(0, '#8a5a2b'); tr.addColorStop(1, '#4b2f15');
    g.fillStyle = tr; g.beginPath(); g.moveTo(x - 7 * s, y); g.lineTo(x - 4 * s, y - 46 * s); g.lineTo(x + 4 * s, y - 46 * s); g.lineTo(x + 7 * s, y); g.fill();
    const bl = [[0, -78, 34], [-26, -60, 26], [26, -60, 26], [-14, -92, 24], [16, -90, 24]];
    [[c[2], 4, 6, 1], [c[1], 0, 0, 0.88], [c[0], -5, -6, 0.6]].forEach(([col, dx, dy, k]) => {
        g.fillStyle = col;
        bl.forEach(([bx, by, br]) => { g.beginPath(); g.arc(x + (bx + dx) * s, y + (by + dy) * s, br * s * k, 0, PI2); g.fill(); });
    });
    for (let i = 0; i < 26; i++) {
        g.fillStyle = hash(sem + i * 5) > 0.5 ? c[0] : c[2];
        const a = hash(sem + i * 3) * PI2, d = hash(sem + i * 9) * 40 * s;
        g.fillRect(x + Math.cos(a) * d - 1, y - 78 * s + Math.sin(a) * d * 0.8, 3 * s, 3 * s);
    }
}

function pino(g, x, y, s, c, nieve) {
    g.fillStyle = 'rgba(0,0,0,0.2)'; g.beginPath(); g.ellipse(x, y, 30 * s, 7 * s, 0, 0, PI2); g.fill();
    g.fillStyle = '#4b2f15'; g.fillRect(x - 5 * s, y - 18 * s, 10 * s, 18 * s);
    for (let i = 0; i < 4; i++) {
        const w = (44 - i * 8) * s, yb = y - (12 + i * 30) * s, yt = yb - 44 * s, alto = yb - yt;
        poli(g, [[x - w, yb], [x, yt], [x + w, yb]], c[1]);
        poli(g, [[x, yt], [x + w, yb], [x + w * 0.15, yb]], c[2]);
        poli(g, [[x - w, yb], [x, yt], [x - w * 0.3, yb]], c[0]);
        if (nieve) poli(g, [[x - w * 0.55, yb - alto * 0.45], [x, yt], [x + w * 0.55, yb - alto * 0.45], [x + w * 0.3, yb - alto * 0.38], [x + w * 0.05, yb - alto * 0.52], [x - w * 0.25, yb - alto * 0.36]], '#f4fbff');
    }
}

function roca(g, x, y, s, c, sem) {
    const k = 0.7 + hash(sem) * 0.6, W = 30 * s * k, H = 22 * s * k;
    const P = pts => pts.map(([a, b]) => [x + a * W, y + b * H]);
    g.fillStyle = 'rgba(0,0,0,0.25)'; g.beginPath(); g.ellipse(x, y, W * 1.1, H * 0.25, 0, 0, PI2); g.fill();
    poli(g, P([[-1, 0], [-0.9, -0.5], [-0.4, -0.95], [0.3, -1], [0.85, -0.55], [1, 0]]), c[1]);
    poli(g, P([[-0.9, -0.5], [-0.4, -0.95], [0.3, -1], [0.85, -0.55], [0.1, -0.35]]), c[0]);
    poli(g, P([[0.1, -0.35], [0.85, -0.55], [1, 0], [0.2, 0]]), c[2]);
}

function tronco(g, x, y, ancho, alto, s) {
    const gr = g.createLinearGradient(x, 0, x + ancho, 0); gr.addColorStop(0, '#6b4423'); gr.addColorStop(0.45, '#8a5a2b'); gr.addColorStop(1, '#3b2410');
    g.fillStyle = gr; g.beginPath(); g.moveTo(x - ancho * 0.25, y); g.quadraticCurveTo(x + ancho * 0.1, y - alto * 0.3, x, y - alto); g.lineTo(x + ancho, y - alto); g.quadraticCurveTo(x + ancho * 0.9, y - alto * 0.3, x + ancho * 1.25, y); g.closePath(); g.fill();
    g.strokeStyle = 'rgba(0,0,0,0.3)'; g.lineWidth = 2 * s;
    for (let i = 0; i < 9; i++) { const xx = x + ancho * (i / 9 + 0.04); g.beginPath(); g.moveTo(xx, y); g.lineTo(xx + (hash(i + x) - 0.5) * 14 * s, y - alto * (0.5 + hash(i + 3) * 0.5)); g.stroke(); }
    g.fillStyle = 'rgba(88,160,70,0.75)';
    for (let i = 0; i < 16; i++) { g.beginPath(); g.ellipse(x + hash(i + 7) * ancho, y - hash(i + 11) * alto * 0.5, (6 + hash(i) * 12) * s, (3 + hash(i + 2) * 5) * s, 0, 0, PI2); g.fill(); }
}

function casita(g, x, y, s, techo) {
    g.fillStyle = 'rgba(0,0,0,0.2)'; g.beginPath(); g.ellipse(x, y + 2 * s, 34 * s, 6 * s, 0, 0, PI2); g.fill();
    g.fillStyle = '#f5ead0'; g.fillRect(x - 24 * s, y - 28 * s, 48 * s, 28 * s);
    g.fillStyle = 'rgba(120,90,50,0.22)'; g.fillRect(x + 6 * s, y - 28 * s, 18 * s, 28 * s);
    poli(g, [[x - 32 * s, y - 27 * s], [x, y - 54 * s], [x + 32 * s, y - 27 * s]], techo);
    poli(g, [[x, y - 54 * s], [x + 32 * s, y - 27 * s], [x + 8 * s, y - 27 * s]], 'rgba(0,0,0,0.2)');
    g.fillStyle = '#7a4a22'; g.fillRect(x - 6 * s, y - 16 * s, 11 * s, 16 * s);
    g.fillStyle = '#a8dcff'; g.fillRect(x + 9 * s, y - 21 * s, 9 * s, 9 * s); g.strokeStyle = '#7a4a22'; g.lineWidth = 1.5 * s; g.strokeRect(x + 9 * s, y - 21 * s, 9 * s, 9 * s);
    g.fillStyle = '#8c8c94'; g.fillRect(x + 14 * s, y - 52 * s, 7 * s, 14 * s);
}

function cristal(g, x, y, s, col, luz) {
    [[0, 1, -0.15], [-14, 0.7, -0.5], [14, 0.75, 0.4], [6, 0.5, 0.15]].forEach(([dx, k, rot]) => {
        g.save(); g.translate(x + dx * s, y); g.rotate(rot);
        const w = 11 * s * k, h = 46 * s * k;
        poli(g, [[-w, 0], [-w, -h], [0, -h - 16 * s * k], [0, 0]], luz);
        poli(g, [[0, 0], [0, -h - 16 * s * k], [w, -h], [w, 0]], col);
        linea(g, [[-w * 0.5, -h * 0.15], [-w * 0.5, -h * 0.85]], 'rgba(255,255,255,0.7)', 2 * s);
        g.restore();
    });
}

function cactus(g, x, y, s) {
    g.fillStyle = 'rgba(0,0,0,0.22)'; g.beginPath(); g.ellipse(x, y, 24 * s, 6 * s, 0, 0, PI2); g.fill();
    g.lineCap = 'round'; g.lineJoin = 'round';
    const tramos = [[[x, y], [x, y - 70 * s], 16 * s], [[x, y - 30 * s], [x - 26 * s, y - 30 * s], 11 * s], [[x - 26 * s, y - 30 * s], [x - 26 * s, y - 52 * s], 11 * s], [[x, y - 40 * s], [x + 24 * s, y - 40 * s], 11 * s], [[x + 24 * s, y - 40 * s], [x + 24 * s, y - 62 * s], 11 * s]];
    tramos.forEach(([a, b, w]) => { g.strokeStyle = '#2e7d45'; g.lineWidth = w; g.beginPath(); g.moveTo(a[0], a[1]); g.lineTo(b[0], b[1]); g.stroke(); });
    tramos.forEach(([a, b, w]) => { g.strokeStyle = '#5fc27a'; g.lineWidth = w * 0.3; g.beginPath(); g.moveTo(a[0] - w * 0.22, a[1]); g.lineTo(b[0] - w * 0.22, b[1]); g.stroke(); });
    g.strokeStyle = 'rgba(255,255,220,0.8)'; g.lineWidth = 1;
    for (let i = 0; i < 14; i++) { const yy = y - 6 * s - hash(i + x) * 60 * s; g.beginPath(); g.moveTo(x - 4 * s, yy); g.lineTo(x - 7 * s, yy - 2 * s); g.moveTo(x + 4 * s, yy); g.lineTo(x + 7 * s, yy - 2 * s); g.stroke(); }
}

function spriteNube(ancho, col, sombra, sem, luz) {
    const h = Math.round(ancho * 0.5), cv = nuevoLienzo(ancho, h), g = cv.getContext('2d');
    const bl = [[0.2, 0.66, 0.17], [0.38, 0.5, 0.22], [0.6, 0.52, 0.2], [0.8, 0.66, 0.15], [0.5, 0.7, 0.2]];
    g.fillStyle = sombra; bl.forEach(([x, y, r]) => { g.beginPath(); g.arc(x * ancho, y * h + r * ancho * 0.12, r * ancho, 0, PI2); g.fill(); });
    g.fillStyle = col; bl.forEach(([x, y, r]) => { g.beginPath(); g.arc(x * ancho - r * ancho * 0.05, y * h - r * ancho * 0.06, r * ancho * 0.88, 0, PI2); g.fill(); });
    g.globalAlpha = luz === undefined ? 0.5 : luz; g.fillStyle = '#ffffff'; bl.slice(0, 3).forEach(([x, y, r]) => { g.beginPath(); g.arc(x * ancho - r * ancho * 0.18, y * h - r * ancho * 0.25, r * ancho * 0.45, 0, PI2); g.fill(); });
    g.globalAlpha = 1; g.globalCompositeOperation = 'destination-out'; g.fillStyle = gV(g, h * 0.72, h, [[0, 'rgba(0,0,0,0)'], [1, 'rgba(0,0,0,1)']]); g.fillRect(0, h * 0.72, ancho, h * 0.28);
    return cv;
}

function spriteIsla(ancho, sem) {
    const h = Math.round(ancho * 0.95), cv = nuevoLienzo(ancho, h), g = cv.getContext('2d'), s = ancho / 300;
    poli(g, [[ancho * 0.04, h * 0.3], [ancho * 0.96, h * 0.3], [ancho * 0.8, h * 0.55], [ancho * 0.62, h * 0.8], [ancho * 0.5, h * 0.98], [ancho * 0.38, h * 0.78], [ancho * 0.2, h * 0.52]], '#8a6a4a');
    poli(g, [[ancho * 0.5, h * 0.98], [ancho * 0.62, h * 0.8], [ancho * 0.8, h * 0.55], [ancho * 0.96, h * 0.3], [ancho * 0.6, h * 0.3]], '#5f4630');
    linea(g, [[ancho * 0.3, h * 0.34], [ancho * 0.34, h * 0.55], [ancho * 0.42, h * 0.72]], 'rgba(0,0,0,0.2)', 2 * s);
    g.fillStyle = gV(g, h * 0.18, h * 0.38, [[0, '#7fe06a'], [1, '#3f9a45']]);
    g.beginPath(); g.ellipse(ancho * 0.5, h * 0.3, ancho * 0.47, h * 0.11, 0, 0, PI2); g.fill();
    g.fillStyle = 'rgba(255,255,255,0.12)'; g.beginPath(); g.ellipse(ancho * 0.45, h * 0.27, ancho * 0.3, h * 0.05, 0, 0, PI2); g.fill();
    arbolR(g, ancho * 0.32, h * 0.31, s * 0.55, ['#8fe07a', '#4fae5a', '#2e7a40'], sem);
    arbolR(g, ancho * 0.66, h * 0.32, s * 0.4, ['#ffc4dd', '#f08bb4', '#c05a88'], sem + 9);
    for (let i = 0; i < 10; i++) circ(g, ancho * (0.15 + hash(sem + i) * 0.7), h * (0.3 + hash(sem + i + 5) * 0.05), 2.5 * s, ['#ff6b81', '#ffd32a', '#ffffff'][i % 3]);
    return cv;
}

function antorcha(g, x, y, s) {
    g.fillStyle = '#4a3a2a'; g.fillRect(x - 3 * s, y, 6 * s, 28 * s);
    g.fillStyle = '#7d7d86'; g.fillRect(x - 8 * s, y - 4 * s, 16 * s, 7 * s);
    g.fillStyle = '#2a2a30'; g.fillRect(x - 9 * s, y + 24 * s, 18 * s, 5 * s);
}

// ---------- Cada tema: est = parte fija (se pinta una vez), din = parte animada ----------
function nubesDin(g, w, h, t, C, y0, y1, vel, n, alpha) {
    if (!C.nubes) return;
    g.save(); g.globalAlpha = alpha;
    for (let i = 0; i < n; i++) {
        const sp = C.nubes[i % C.nubes.length], sc = 0.7 + hash(i + 4) * 0.8, ancho = sp.width * sc, tot = w + ancho * 2;
        const x = ((hash(i + 1) * tot + t * vel * (0.5 + hash(i + 5))) % tot) - ancho;
        g.drawImage(sp, x, y0 + hash(i + 9) * (y1 - y0), ancho, sp.height * sc);
    }
    g.restore();
}

function solDin(g, w, h, t, x, y, r, col) {
    const gl = g.createRadialGradient(x, y, 0, x, y, r * 3.2); gl.addColorStop(0, col); gl.addColorStop(0.25, col.replace(/[\d.]+\)$/, '0.35)')); gl.addColorStop(1, 'rgba(255,255,255,0)');
    g.fillStyle = gl; g.fillRect(0, 0, w, h * 0.7);
    g.fillStyle = col.replace(/[\d.]+\)$/, '1)'); g.beginPath(); g.arc(x, y, r * (1 + 0.02 * Math.sin(t * 2)), 0, PI2); g.fill();
}

function aves(g, w, h, t, n, y0) {
    g.save(); g.strokeStyle = 'rgba(40,50,70,0.75)'; g.lineWidth = 2; g.lineCap = 'round';
    for (let i = 0; i < n; i++) {
        const x = ((hash(i + 80) * w * 1.4 + t * (28 + hash(i + 90) * 20)) % (w * 1.3)) - w * 0.15, y = y0 + hash(i + 70) * h * 0.12 + Math.sin(t * 0.9 + i) * 8, f = Math.sin(t * 7 + i * 2) * 4;
        g.beginPath(); g.moveTo(x - 9, y - f); g.quadraticCurveTo(x - 4, y - 5, x, y); g.quadraticCurveTo(x + 4, y - 5, x + 9, y - f); g.stroke();
    }
    g.restore();
}

const FONDOS = {
    valle: {
        est(g, w, h, s, C) {
            g.fillStyle = gV(g, 0, h * 0.85, [[0, '#46a9ff'], [0.55, '#9fd8ff'], [1, '#eaf7ff']]); g.fillRect(0, 0, w, h);
            montanas(g, w, h * 0.78, h * 0.34, '#a7c3e4', '#7f9fcb', '#ffffff', 4, 5, 'rgba(220,239,255,0.75)');
            montanas(g, w, h * 0.8, h * 0.2, '#86b6c0', '#63909e', null, 6, 9, 'rgba(207,233,240,0.7)');
            const P1 = [h * 0.72, h * 0.03, 0.005, 1.2];
            colina(g, w, h, ...P1, '#a4e27f', '#6cc268', '#8fd46f', 21, s);
            for (let x = 10; x < w; x += 30 * s) arbolR(g, x, yCr(x, ...P1) + 4, s * 0.3, ['#8fe07a', '#4fae5a', '#2e7a40'], x);
            const P2 = [h * 0.8, h * 0.035, 0.0045, 3.4];
            colina(g, w, h, ...P2, '#7fd36a', '#4aa84f', '#66c25c', 47, s);
            [[0.16, '#d9534f'], [0.3, '#3f7fd4'], [0.74, '#e0a33a'], [0.88, '#d9534f']].forEach(([fx, col]) => casita(g, w * fx, yCr(w * fx, ...P2) + 4 * s, s * 0.95, col));
            for (let x = 24; x < w; x += 70 * s) if (hash(x) > 0.35) arbolR(g, x, yCr(x, ...P2) + 6, s * (0.5 + hash(x + 3) * 0.2), ['#8fe07a', '#4fae5a', '#2e7a40'], x + 1);
            const P3 = [h * 0.9, h * 0.02, 0.006, 5.1];
            colina(g, w, h, ...P3, '#5fc05a', '#2f8a3e', '#49a84a', 83, s);
            g.strokeStyle = '#c99a5b'; g.lineWidth = 4 * s; g.lineCap = 'round';
            for (let x = w * 0.04; x < w * 0.3; x += 26 * s) { const y = yCr(x, ...P3) + 14 * s; g.beginPath(); g.moveTo(x, y); g.lineTo(x, y - 24 * s); g.stroke(); }
            g.lineWidth = 3 * s; [10, 20].forEach(o => { g.beginPath(); g.moveTo(w * 0.04, yCr(w * 0.04, ...P3) + (14 - o) * s); g.lineTo(w * 0.3, yCr(w * 0.3, ...P3) + (14 - o) * s); g.stroke(); });
            for (let i = 0; i < Math.floor(w / 9); i++) { const x = hash(i + 200) * w; circ(g, x, yCr(x, ...P3) + 6 * s + hash(i + 300) * (h * 0.1), (2 + hash(i + 400) * 2) * s, ['#ff6b81', '#ffd32a', '#ffffff', '#a29bfe'][i % 4]); }
            arbolR(g, w * 0.06, h * 0.97, s * 1.1, ['#9aea84', '#52b85e', '#2a7a3c'], 5); arbolR(g, w * 0.95, h * 0.97, s * 1.0, ['#9aea84', '#52b85e', '#2a7a3c'], 6);
            C.nubes = [spriteNube(260 * s, '#ffffff', '#cfe3f5', 1), spriteNube(200 * s, '#ffffff', '#d6e8f7', 2), spriteNube(320 * s, '#ffffff', '#c8def2', 3)];
        },
        din(g, w, h, t, s, C) { solDin(g, w, h, t, w * 0.82, h * 0.13, w * 0.04, 'rgba(255,244,170,1)'); nubesDin(g, w, h, t, C, h * 0.04, h * 0.36, 9 * s, 6, 0.95); aves(g, w, h, t, 4, h * 0.22); }
    },

    bosque: {
        est(g, w, h, s, C) {
            g.fillStyle = gV(g, 0, h, [[0, '#7fb3a8'], [0.5, '#bcd9c8'], [1, '#e8f1da']]); g.fillRect(0, 0, w, h);
            const hilera = (yb, tam, col, n, sem, bruma) => { for (let i = 0; i < n; i++) { const x = (i + hash(sem + i) * 0.6) / n * w; pino(g, x, yb + hash(sem + i * 2) * 14 * s, s * tam, col, false); } if (bruma) { g.fillStyle = bruma; g.fillRect(0, yb - 160 * s * tam, w, 190 * s * tam); } };
            hilera(h * 0.62, 0.7, ['#6fa593', '#4f8774', '#3b6e5e'], 22, 3, 'rgba(210,235,225,0.35)');
            hilera(h * 0.7, 0.95, ['#4f9a72', '#2f7a55', '#1f5c42'], 15, 17, 'rgba(190,225,205,0.25)');
            colina(g, w, h, h * 0.78, h * 0.03, 0.005, 2, '#4a9a4a', '#2c6a35', '#3a8040', 61, s);
            hilera(h * 0.85, 1.35, ['#3f8f5f', '#1f6a45', '#124a30'], 9, 31, null);
            colina(g, w, h, h * 0.9, h * 0.02, 0.006, 4, '#3f8a3a', '#1f4f2a', '#2f6a30', 77, s);
            for (let i = 0; i < 18; i++) { const x = hash(i + 500) * w, y = h * 0.92 + hash(i + 510) * h * 0.06; g.strokeStyle = '#2a8a3a'; g.lineWidth = 2 * s; for (let k = -3; k <= 3; k++) { g.beginPath(); g.moveTo(x, y); g.quadraticCurveTo(x + k * 7 * s, y - 20 * s, x + k * 14 * s, y - 14 * s + Math.abs(k) * 4 * s); g.stroke(); } }
            [[0.18, '#e5484d'], [0.55, '#ffb142'], [0.81, '#e5484d']].forEach(([fx, col], i) => { const x = w * fx, y = h * 0.95; g.fillStyle = '#efe6cf'; g.fillRect(x - 4 * s, y - 14 * s, 8 * s, 14 * s); g.fillStyle = col; g.beginPath(); g.ellipse(x, y - 14 * s, 15 * s, 10 * s, 0, Math.PI, 0); g.fill(); g.fillStyle = 'rgba(255,255,255,0.9)'; [[-6, -17], [4, -19], [8, -14]].forEach(([dx, dy]) => circ(g, x + dx * s, y + dy * s, 2.2 * s, '#ffffff')); });
            tronco(g, -w * 0.02, h, w * 0.11, h * 1.05, s); tronco(g, w * 0.9, h, w * 0.12, h * 1.05, s);
            [[0.02, 0.0, 150], [0.12, -0.02, 110], [0.9, 0.0, 150], [0.98, -0.01, 120], [0.5, -0.04, 90]].forEach(([fx, fy, r], i) => { [['#1b4f2c', 0, 10], ['#2f7a3f', 0, 0], ['#4aa84f', -8, -8]].forEach(([c, dx, dy], j) => circ(g, w * fx + dx * s, h * fy + dy * s, r * s * (1 - j * 0.18), c)); });
            C.nubes = null; C.luciernagas = Array.from({ length: 26 }, (_, i) => [hash(i + 1), hash(i + 2)]);
        },
        din(g, w, h, t, s, C) {
            g.save(); g.globalCompositeOperation = 'lighter';
            for (let i = 0; i < 5; i++) { const x = w * (0.2 + i * 0.17), a = 0.05 + 0.04 * Math.sin(t * 0.8 + i * 1.7); g.fillStyle = `rgba(255,248,190,${a})`; g.beginPath(); g.moveTo(x, 0); g.lineTo(x + w * 0.05, 0); g.lineTo(x - w * 0.12, h); g.lineTo(x - w * 0.22, h); g.closePath(); g.fill(); }
            C.luciernagas.forEach(([a, b], i) => { const x = a * w + Math.sin(t * 0.6 + i) * 30 * s, y = h * (0.45 + b * 0.5) + Math.cos(t * 0.5 + i * 2) * 20 * s, al = 0.35 + 0.65 * Math.abs(Math.sin(t * 1.5 + i * 3)); const gr = g.createRadialGradient(x, y, 0, x, y, 9 * s); gr.addColorStop(0, `rgba(255,255,160,${al})`); gr.addColorStop(1, 'rgba(255,255,160,0)'); g.fillStyle = gr; g.fillRect(x - 10 * s, y - 10 * s, 20 * s, 20 * s); });
            g.restore();
        }
    },

    cueva: {
        est(g, w, h, s, C) {
            g.fillStyle = gV(g, 0, h, [[0, '#241f3f'], [0.5, '#15112a'], [1, '#0a0812']]); g.fillRect(0, 0, w, h);
            for (let i = 0; i < 70; i++) { const x = hash(i + 1) * w, y = hash(i + 2) * h, r = (30 + hash(i + 3) * 90) * s; g.fillStyle = hash(i + 4) > 0.5 ? 'rgba(80,70,130,0.12)' : 'rgba(0,0,0,0.2)'; g.beginPath(); g.ellipse(x, y, r, r * 0.6, hash(i + 5) * 3, 0, PI2); g.fill(); }
            grano(g, 0, 0, w, h, Math.floor(w * h / 220), ['rgba(255,255,255,0.05)', 'rgba(0,0,0,0.18)', 'rgba(120,110,190,0.08)'], Math.max(2, 2 * s), 7);
            for (let i = 0; i < 14; i++) { const x = (i + hash(i) * 0.7) / 14 * w, len = h * (0.1 + hash(i + 9) * 0.22), bw = (22 + hash(i + 4) * 26) * s;
                poli(g, [[x - bw, -2], [x, len], [x + bw * 0.1, len * 0.4], [x + bw, -2]], '#322a52'); poli(g, [[x, len], [x + bw, -2], [x + bw * 0.1, len * 0.4]], '#1c1733'); linea(g, [[x - bw * 0.4, 0], [x - bw * 0.05, len * 0.8]], 'rgba(170,160,255,0.35)', 2 * s); circ(g, x, len, 2.5 * s, 'rgba(160,220,255,0.7)'); }
            C.cristales = [[0.12, 0.88, '#46e0ff', '#9af3ff'], [0.34, 0.9, '#b266ff', '#dca6ff'], [0.78, 0.89, '#46e0ff', '#9af3ff'], [0.92, 0.9, '#ff6bd6', '#ffb0ec'], [0.05, 0.3, '#b266ff', '#dca6ff'], [0.95, 0.28, '#46e0ff', '#9af3ff']];
            g.fillStyle = gV(g, h * 0.86, h, [[0, '#2a2347'], [1, '#0d0a18']]); g.fillRect(0, h * 0.9, w, h * 0.1);
            const gr = g.createRadialGradient(w * 0.55, h * 0.95, 0, w * 0.55, h * 0.95, w * 0.25); gr.addColorStop(0, 'rgba(120,200,255,0.5)'); gr.addColorStop(1, 'rgba(120,200,255,0)'); g.fillStyle = gr; g.beginPath(); g.ellipse(w * 0.55, h * 0.95, w * 0.22, h * 0.04, 0, 0, PI2); g.fill();
            for (let i = 0; i < 12; i++) { const x = (i + 0.5) / 12 * w + (hash(i + 30) - 0.5) * 40 * s, hh = (20 + hash(i + 31) * 60) * s, bw = (10 + hash(i + 32) * 12) * s; poli(g, [[x - bw, h], [x, h - hh], [x + bw, h]], '#2b2446'); poli(g, [[x, h - hh], [x + bw, h], [x + bw * 0.1, h]], '#16112a'); }
            [[0.12, 0.88], [0.34, 0.9], [0.78, 0.89], [0.92, 0.9], [0.05, 0.3], [0.95, 0.28]].forEach(([fx, fy], i) => { const [, , c, l] = C.cristales[i]; cristal(g, w * fx, h * fy, s * (i > 3 ? 1.1 : 1.5), c, l); });
            for (let i = 0; i < 5; i++) roca(g, w * (0.2 + i * 0.17), h * 0.97, s * 1.1, ['#4a4272', '#2f2950', '#1b1632'], i + 70);
        },
        din(g, w, h, t, s, C) {
            g.save(); g.globalCompositeOperation = 'lighter';
            C.cristales.forEach(([fx, fy, c], i) => { const x = w * fx, y = h * fy - 30 * s, r = (110 + 25 * Math.sin(t * 1.6 + i * 2)) * s; const gr = g.createRadialGradient(x, y, 0, x, y, r); gr.addColorStop(0, c + '66'); gr.addColorStop(1, c + '00'); g.fillStyle = gr; g.fillRect(x - r, y - r, r * 2, r * 2); });
            g.restore(); g.fillStyle = 'rgba(190,230,255,0.9)';
            for (let i = 0; i < 4; i++) { const x = w * (0.1 + hash(i + 5) * 0.8), y = ((t * 160 + hash(i) * 900) % (h * 0.85)) + h * 0.1; if (y < h * 0.9) g.fillRect(x, y, 2 * s, 8 * s); }
        }
    },

    torre: {
        est(g, w, h, s, C) {
            g.fillStyle = gV(g, 0, h, [[0, '#070b26'], [0.55, '#241a63'], [1, '#5a3a98']]); g.fillRect(0, 0, w, h);
            const mx = w * 0.18, my = h * 0.16, mg = g.createRadialGradient(mx, my, 0, mx, my, w * 0.14); mg.addColorStop(0, 'rgba(255,250,220,0.5)'); mg.addColorStop(1, 'rgba(255,250,220,0)'); g.fillStyle = mg; g.fillRect(0, 0, w * 0.5, h * 0.5);
            circ(g, mx, my, w * 0.035, '#fff8e0'); circ(g, mx - w * 0.01, my - w * 0.006, w * 0.007, 'rgba(200,190,160,0.5)'); circ(g, mx + w * 0.01, my + w * 0.01, w * 0.01, 'rgba(200,190,160,0.4)');
            montanas(g, w, h * 0.8, h * 0.28, '#2b2470', '#1a1550', null, 5, 13, 'rgba(110,80,180,0.5)');
            for (let i = 0; i < 6; i++) { const x = w * (0.06 + i * 0.18), tw = w * 0.05, th = h * (0.18 + hash(i + 20) * 0.2), y = h * 0.82 - th; g.fillStyle = '#1a1648'; g.fillRect(x, y, tw, th + 2); poli(g, [[x - 4 * s, y], [x + tw / 2, y - 26 * s], [x + tw + 4 * s, y]], '#2c2268'); for (let k = 0; k < 4; k++) if (hash(i * 7 + k) > 0.35) { g.fillStyle = 'rgba(255,214,120,0.9)'; g.fillRect(x + tw * 0.35, y + 10 * s + k * 24 * s, 7 * s, 11 * s); } }
            const tx = w * 0.5, tw = w * 0.2, ty = h * 0.12;
            g.fillStyle = gV(g, ty, h, [[0, '#4b4a7a'], [1, '#2a2850']]); g.fillRect(tx - tw / 2, ty, tw, h);
            g.fillStyle = 'rgba(0,0,0,0.28)'; g.fillRect(tx + tw * 0.15, ty, tw * 0.35, h);
            g.strokeStyle = 'rgba(0,0,0,0.25)'; g.lineWidth = 1.5;
            for (let y = ty; y < h; y += 18 * s) { g.beginPath(); g.moveTo(tx - tw / 2, y); g.lineTo(tx + tw / 2, y); g.stroke(); for (let x = tx - tw / 2 + ((Math.round((y - ty) / (18 * s)) % 2) ? 14 * s : 0); x < tx + tw / 2; x += 28 * s) { g.beginPath(); g.moveTo(x, y); g.lineTo(x, y + 18 * s); g.stroke(); } }
            for (let x = tx - tw / 2; x < tx + tw / 2; x += tw / 5) g.fillStyle = '#3d3c6c', g.fillRect(x, ty - 14 * s, tw / 10, 16 * s);
            for (let k = 0; k < 5; k++) { const yy = ty + 50 * s + k * 120 * s; g.fillStyle = '#0a0a22'; g.beginPath(); g.moveTo(tx - 12 * s, yy + 40 * s); g.lineTo(tx - 12 * s, yy + 10 * s); g.arc(tx, yy + 10 * s, 12 * s, Math.PI, 0); g.lineTo(tx + 12 * s, yy + 40 * s); g.fill(); g.fillStyle = 'rgba(255,200,100,0.55)'; g.fillRect(tx - 8 * s, yy + 14 * s, 16 * s, 24 * s); }
            g.fillStyle = gV(g, h * 0.9, h, [[0, '#3a3568'], [1, '#1c1840']]); g.fillRect(0, h * 0.9, w, h * 0.1);
            g.strokeStyle = 'rgba(0,0,0,0.35)'; g.lineWidth = 2; for (let x = -w; x < w * 2; x += 90 * s) { g.beginPath(); g.moveTo(w * 0.5 + (x - w * 0.5) * 0.5, h * 0.9); g.lineTo(x, h); g.stroke(); } g.beginPath(); g.moveTo(0, h * 0.945); g.lineTo(w, h * 0.945); g.stroke();
            [0.1, 0.9].forEach(fx => { const x = w * fx; g.fillStyle = gV(g, 0, h, [[0, '#55547f'], [1, '#2b2a52']]); g.fillRect(x - 24 * s, h * 0.28, 48 * s, h * 0.65); g.fillStyle = '#6b6a96'; g.fillRect(x - 32 * s, h * 0.26, 64 * s, 16 * s); g.fillRect(x - 32 * s, h * 0.91, 64 * s, 14 * s); antorcha(g, x + (fx < 0.5 ? 38 : -38) * s, h * 0.42, s); });
            C.antorchas = [[w * 0.1 + 38 * s, h * 0.42], [w * 0.9 - 38 * s, h * 0.42]];
            C.nubes = [spriteNube(300 * s, 'rgba(90,70,150,0.6)', 'rgba(40,30,90,0.6)', 1, 0.05), spriteNube(240 * s, 'rgba(90,70,150,0.5)', 'rgba(40,30,90,0.5)', 2, 0.05)];
        },
        din(g, w, h, t, s, C) {
            g.fillStyle = '#ffffff'; for (let i = 0; i < 70; i++) { g.globalAlpha = 0.25 + 0.75 * Math.abs(Math.sin(t * (0.8 + hash(i + 3)) + i)); g.fillRect(hash(i + 100) * w, hash(i + 150) * h * 0.65, (1 + hash(i + 7) * 1.6) * s, (1 + hash(i + 7) * 1.6) * s); }
            g.globalAlpha = 1; nubesDin(g, w, h, t, C, h * 0.55, h * 0.8, 6 * s, 3, 0.8);
            g.save(); g.globalCompositeOperation = 'lighter';
            C.antorchas.forEach(([x, y], i) => { const fl = 1 + 0.18 * Math.sin(t * 12 + i * 3) + 0.1 * Math.sin(t * 23 + i); const gr = g.createRadialGradient(x, y - 10 * s, 0, x, y - 10 * s, 120 * s * fl); gr.addColorStop(0, 'rgba(255,170,60,0.45)'); gr.addColorStop(1, 'rgba(255,120,20,0)'); g.fillStyle = gr; g.fillRect(x - 130 * s, y - 140 * s, 260 * s, 260 * s); g.fillStyle = 'rgba(255,200,90,0.95)'; g.beginPath(); g.moveTo(x - 7 * s, y - 2 * s); g.quadraticCurveTo(x - 9 * s, y - 20 * s * fl, x, y - 34 * s * fl); g.quadraticCurveTo(x + 9 * s, y - 20 * s * fl, x + 7 * s, y - 2 * s); g.fill(); });
            for (let i = 0; i < 6; i++) { const x = w * (0.25 + i * 0.1), y = h * (0.35 + 0.2 * Math.sin(t * 0.5 + i)); g.fillStyle = `rgba(150,200,255,${0.25 + 0.25 * Math.sin(t * 2 + i)})`; g.font = `${Math.round(22 * s)}px serif`; g.fillText('ᚠᚢᚦᚨᚱᚲ'[i], x, y); }
            g.restore();
        }
    },

    nieve: {
        est(g, w, h, s, C) {
            g.fillStyle = gV(g, 0, h * 0.85, [[0, '#8fc0e8'], [0.6, '#cfe6f8'], [1, '#f4fbff']]); g.fillRect(0, 0, w, h);
            montanas(g, w, h * 0.78, h * 0.42, '#d6e6f5', '#8fb0d6', '#ffffff', 4, 3, 'rgba(235,246,255,0.7)');
            montanas(g, w, h * 0.82, h * 0.26, '#b6cfe8', '#7897c0', '#ffffff', 6, 8, 'rgba(235,246,255,0.5)');
            const P1 = [h * 0.78, h * 0.03, 0.005, 1.4];
            colina(g, w, h, ...P1, '#ffffff', '#d4e6f6', '#e8f2fb', 11, s, false);
            for (let x = 14; x < w; x += 40 * s) pino(g, x, yCr(x, ...P1) + 4, s * 0.38, ['#5f9a86', '#3c7a68', '#245a4c'], true);
            const P2 = [h * 0.86, h * 0.025, 0.0055, 3];
            colina(g, w, h, ...P2, '#f6fbff', '#c4dcf0', '#dcebf8', 23, s, false);
            for (let x = 40; x < w; x += 110 * s) if (hash(x) > 0.3) pino(g, x, yCr(x, ...P2) + 6, s * (0.7 + hash(x + 3) * 0.3), ['#5f9a86', '#3c7a68', '#245a4c'], true);
            const P3 = [h * 0.93, h * 0.015, 0.007, 5];
            colina(g, w, h, ...P3, '#ffffff', '#bcd6ee', '#d8e8f6', 37, s, false);
            C.chispas = Array.from({ length: 50 }, (_, i) => [hash(i + 1), 0.78 + hash(i + 2) * 0.2]);
            [[0.2, 0.96], [0.7, 0.97], [0.45, 0.95]].forEach(([fx, fy], i) => cristal(g, w * fx, h * fy, s * 0.9, '#8fd6ff', '#d4f2ff'));
            pino(g, w * 0.05, h * 0.99, s * 1.5, ['#5f9a86', '#3c7a68', '#245a4c'], true); pino(g, w * 0.96, h * 0.99, s * 1.4, ['#5f9a86', '#3c7a68', '#245a4c'], true);
            C.nubes = [spriteNube(280 * s, '#ffffff', '#d8e8f6', 1), spriteNube(220 * s, '#ffffff', '#dcecf8', 2)];
        },
        din(g, w, h, t, s, C) {
            g.save(); g.globalCompositeOperation = 'lighter';
            for (let i = 0; i < 3; i++) { const y = h * (0.1 + i * 0.05); g.strokeStyle = `rgba(${i ? '170,255,210' : '190,170,255'},${0.1 + 0.05 * Math.sin(t + i)})`; g.lineWidth = 26 * s; g.beginPath(); for (let x = 0; x <= w; x += 12) { const yy = y + Math.sin(x * 0.006 + t * 0.4 + i) * 28 * s; x ? g.lineTo(x, yy) : g.moveTo(x, yy); } g.stroke(); }
            g.restore(); nubesDin(g, w, h, t, C, h * 0.05, h * 0.3, 7 * s, 4, 0.9);
            g.fillStyle = '#ffffff'; C.chispas.forEach(([a, b], i) => { g.globalAlpha = Math.max(0, Math.sin(t * 2 + i * 1.9)); g.fillRect(a * w, b * h, 3 * s, 3 * s); }); g.globalAlpha = 1;
        }
    },

    desierto: {
        est(g, w, h, s, C) {
            g.fillStyle = gV(g, 0, h * 0.85, [[0, '#ff8f4f'], [0.45, '#ffc47a'], [1, '#ffeab8']]); g.fillRect(0, 0, w, h);
            [[0.2, 0.7, 1], [0.34, 0.74, 0.6], [0.7, 0.72, 0.8]].forEach(([fx, fy, k]) => { const x = w * fx, y = h * fy, a = 130 * s * k; poli(g, [[x - a, y], [x, y - a * 0.9], [x + a * 0.15, y]], '#e8b26a'); poli(g, [[x, y - a * 0.9], [x + a, y], [x + a * 0.15, y]], '#b9783a'); linea(g, [[x - a * 0.5, y - a * 0.45], [x + a * 0.55, y - a * 0.45]], 'rgba(120,70,30,0.3)', 2); });
            const dunas = (b, a, f, ph, c0, c1, sem) => { const cv = nuevoLienzo(w, h), q = cv.getContext('2d'); crestaPath(q, w, h, b, a, f, ph); q.fillStyle = gV(q, b - a, h, [[0, c0], [1, c1]]); q.fill(); q.globalCompositeOperation = 'source-atop'; q.strokeStyle = 'rgba(120,70,20,0.14)'; q.lineWidth = 2 * s; for (let i = 0; i < 90; i++) { const y0 = b - a + hash(sem + i) * (h - b + a), x0 = hash(sem + i * 3) * w; q.beginPath(); for (let k = 0; k <= 8; k++) { const xx = x0 + k * 10 * s, yy = y0 + Math.sin(k * 0.9 + i) * 2 * s; k ? q.lineTo(xx, yy) : q.moveTo(xx, yy); } q.stroke(); } q.globalCompositeOperation = 'source-over'; q.strokeStyle = 'rgba(255,240,200,0.45)'; q.lineWidth = 3 * s; q.beginPath(); for (let x = 0; x <= w; x += 6) { const y = yCr(x, b, a, f, ph); x ? q.lineTo(x, y) : q.moveTo(x, y); } q.stroke(); g.drawImage(cv, 0, 0); };
            dunas(h * 0.76, h * 0.04, 0.004, 1, '#f7cf86', '#e6aa58', 2);
            dunas(h * 0.84, h * 0.04, 0.005, 3, '#f2bd6c', '#d99a4e', 9);
            [[0.12, 0.84], [0.62, 0.83], [0.9, 0.86]].forEach(([fx, fy], i) => cactus(g, w * fx, h * fy, s * (0.7 + i * 0.1)));
            dunas(h * 0.92, h * 0.025, 0.006, 5, '#eeb25f', '#cf8c42', 14);
            roca(g, w * 0.3, h * 0.96, s * 1.4, ['#c9915a', '#9c6a3c', '#6f4624'], 3); roca(g, w * 0.8, h * 0.97, s * 1.2, ['#c9915a', '#9c6a3c', '#6f4624'], 4);
            cactus(g, w * 0.05, h * 0.98, s * 1.2);
        },
        din(g, w, h, t, s, C) {
            solDin(g, w, h, t, w * 0.78, h * 0.2, w * 0.06, 'rgba(255,248,214,1)');
            g.save(); g.globalAlpha = 0.07; g.fillStyle = '#ffffff'; for (let i = 0; i < 6; i++) { const y = h * 0.66 + i * 8 * s; g.beginPath(); for (let x = 0; x <= w; x += 14) { const yy = y + Math.sin(x * 0.03 + t * 3 + i) * 2.5 * s; x ? g.lineTo(x, yy) : g.moveTo(x, yy); } g.lineTo(w, y + 6 * s); g.lineTo(0, y + 6 * s); g.closePath(); g.fill(); } g.restore();
        }
    },

    mar: {
        est(g, w, h, s, C) {
            g.fillStyle = gV(g, 0, h * 0.72, [[0, '#262f44'], [0.55, '#4b5b74'], [1, '#8b9bb0']]); g.fillRect(0, 0, w, h);
            const sx = w * 0.26, sy = h * 0.7; poli(g, [[sx - 40 * s, sy], [sx + 40 * s, sy], [sx + 28 * s, sy + 14 * s], [sx - 30 * s, sy + 14 * s]], '#1d2331'); linea(g, [[sx, sy], [sx, sy - 52 * s]], '#1d2331', 3 * s); poli(g, [[sx + 2 * s, sy - 50 * s], [sx + 30 * s, sy - 6 * s], [sx + 2 * s, sy - 6 * s]], '#c9d2e0'); poli(g, [[sx - 2 * s, sy - 44 * s], [sx - 24 * s, sy - 6 * s], [sx - 2 * s, sy - 6 * s]], '#aab5c6');
            const lx = w * 0.84, ly = h * 0.74;
            poli(g, [[lx - 80 * s, ly + 40 * s], [lx - 50 * s, ly - 10 * s], [lx + 50 * s, ly - 14 * s], [lx + 90 * s, ly + 40 * s]], '#2a2f3a'); poli(g, [[lx - 50 * s, ly - 10 * s], [lx + 50 * s, ly - 14 * s], [lx + 20 * s, ly + 6 * s]], '#4a5262');
            for (let i = 0; i < 5; i++) poli(g, [[lx - 22 * s + i * 1.5 * s, ly - 12 * s - i * 40 * s], [lx + 22 * s - i * 1.5 * s, ly - 12 * s - i * 40 * s], [lx + 20.5 * s - i * 1.5 * s, ly - 52 * s - i * 40 * s], [lx - 20.5 * s + i * 1.5 * s, ly - 52 * s - i * 40 * s]], i % 2 ? '#d93a3a' : '#f2f2f2');
            g.fillStyle = '#e8c85a'; g.fillRect(lx - 14 * s, ly - 232 * s, 28 * s, 22 * s); poli(g, [[lx - 20 * s, ly - 232 * s], [lx, ly - 256 * s], [lx + 20 * s, ly - 232 * s]], '#2a2f3a');
            C.faro = [lx, ly - 221 * s]; C.nubes = [spriteNube(340 * s, '#5b6a82', '#3a465c', 1, 0.07), spriteNube(280 * s, '#66758d', '#404c62', 2, 0.07), spriteNube(400 * s, '#4e5c74', '#323d52', 3, 0.07)];
        },
        din(g, w, h, t, s, C) {
            nubesDin(g, w, h, t, C, h * 0.0, h * 0.42, 14 * s, 8, 0.9);
            const [fx, fy] = C.faro, ang = Math.sin(t * 0.7) * 0.6 - 2.5; g.save(); g.globalCompositeOperation = 'lighter';
            const bm = g.createRadialGradient(fx, fy, 0, fx, fy, w * 0.6); bm.addColorStop(0, 'rgba(255,240,160,0.5)'); bm.addColorStop(1, 'rgba(255,240,160,0)'); g.fillStyle = bm; g.beginPath(); g.moveTo(fx, fy); g.arc(fx, fy, w * 0.6, ang - 0.09, ang + 0.09); g.closePath(); g.fill(); g.restore();
            const caps = [[0.72, '#2f6f86', '#1d4d63'], [0.76, '#285f78', '#173f55'], [0.82, '#1f4f69', '#102f45'], [0.89, '#183f58', '#0b2438'], [0.95, '#10334a', '#07192a']];
            caps.forEach(([fy2, c0, c1], i) => { const y0 = h * fy2, a = (6 + i * 3) * s; g.fillStyle = gV(g, y0 - a, h, [[0, c0], [1, c1]]); g.beginPath(); g.moveTo(0, h); for (let x = 0; x <= w + 10; x += 10) g.lineTo(x, y0 + Math.sin(x * 0.012 + t * (1.2 + i * 0.25) + i * 2) * a + Math.sin(x * 0.03 - t * 1.6 + i) * a * 0.35); g.lineTo(w, h); g.closePath(); g.fill();
                g.strokeStyle = 'rgba(235,248,255,0.55)'; g.lineWidth = (2 + i * 0.5) * s; g.beginPath(); for (let x = 0; x <= w + 10; x += 10) { const yy = y0 + Math.sin(x * 0.012 + t * (1.2 + i * 0.25) + i * 2) * a + Math.sin(x * 0.03 - t * 1.6 + i) * a * 0.35; x ? g.lineTo(x, yy) : g.moveTo(x, yy); } g.stroke(); });
        }
    },

    volcan: {
        est(g, w, h, s, C) {
            g.fillStyle = gV(g, 0, h, [[0, '#1d0606'], [0.5, '#6a1a0a'], [0.85, '#e0560f'], [1, '#ffb347']]); g.fillRect(0, 0, w, h);
            montanas(g, w, h * 0.82, h * 0.3, '#3a1512', '#1f0a09', null, 5, 4, 'rgba(255,110,40,0.35)');
            const vx = w * 0.62, vb = h * 0.88, vt = h * 0.32, vw = w * 0.34;
            poli(g, [[vx - vw, vb], [vx - vw * 0.12, vt], [vx + vw * 0.12, vt], [vx + vw, vb]], '#2b1411'); poli(g, [[vx, vt], [vx + vw * 0.12, vt], [vx + vw, vb], [vx + vw * 0.2, vb]], '#150908'); poli(g, [[vx - vw, vb], [vx - vw * 0.12, vt], [vx - vw * 0.4, vb]], '#4a2418');
            g.fillStyle = '#ff8a2a'; g.beginPath(); g.ellipse(vx, vt, vw * 0.13, 10 * s, 0, 0, PI2); g.fill();
            C.lava = [[[vx - 6 * s, vt], [vx - 30 * s, vt + h * 0.12], [vx - 18 * s, vt + h * 0.24], [vx - 60 * s, vb]], [[vx + 8 * s, vt], [vx + 40 * s, vt + h * 0.1], [vx + 24 * s, vt + h * 0.26], [vx + 80 * s, vb]], [[vx, vt], [vx - 4 * s, vt + h * 0.2], [vx + 10 * s, vb]]];
            C.lava.forEach(l => { linea(g, l, '#ff5a10', 8 * s); linea(g, l, '#ffc04a', 3 * s); });
            const P = [h * 0.9, h * 0.02, 0.006, 2.5]; colina(g, w, h, ...P, '#3a1a14', '#120706', '#2a120e', 55, s, false);
            C.grietas = []; for (let i = 0; i < 9; i++) { const x0 = hash(i + 300) * w, y0 = h * (0.92 + hash(i + 310) * 0.07), pts = [[x0, y0]]; for (let k = 1; k < 5; k++) pts.push([x0 + k * 26 * s + (hash(i * 9 + k) - 0.5) * 24 * s, y0 + (hash(i * 7 + k) - 0.5) * 12 * s]); C.grietas.push(pts); linea(g, pts, '#ff5a10', 3 * s); }
            [[0.1, 0.97, 2], [0.3, 0.96, 1.4], [0.9, 0.98, 2.2]].forEach(([fx, fy, k], i) => roca(g, w * fx, h * fy, s * k, ['#4a3a38', '#241817', '#100a09'], 40 + i));
            C.nubes = [spriteNube(300 * s, 'rgba(70,52,52,0.85)', 'rgba(35,24,24,0.85)', 1, 0.05), spriteNube(240 * s, 'rgba(80,60,60,0.8)', 'rgba(40,28,28,0.8)', 2, 0.05)];
            C.vx = vx; C.vt = vt;
        },
        din(g, w, h, t, s, C) {
            for (let i = 0; i < 6; i++) { const sp = C.nubes[i % 2], p = ((t * 0.12 + i / 6) % 1), x = C.vx + Math.sin(t * 0.4 + i) * 30 * s + p * 60 * s, y = C.vt - p * h * 0.35, sc = 0.5 + p * 1.1; g.save(); g.globalAlpha = (1 - p) * 0.85; g.drawImage(sp, x - sp.width * sc / 2, y - sp.height * sc / 2, sp.width * sc, sp.height * sc); g.restore(); }
            g.save(); g.globalCompositeOperation = 'lighter';
            const gl = g.createRadialGradient(C.vx, C.vt, 0, C.vx, C.vt, w * 0.3); gl.addColorStop(0, `rgba(255,140,40,${0.45 + 0.15 * Math.sin(t * 2.5)})`); gl.addColorStop(1, 'rgba(255,100,20,0)'); g.fillStyle = gl; g.fillRect(0, 0, w, h);
            const p = 0.5 + 0.5 * Math.sin(t * 3); C.lava.forEach((l, i) => linea(g, l, `rgba(255,190,70,${0.25 + 0.4 * Math.abs(Math.sin(t * 2 + i))})`, 6 * s)); C.grietas.forEach((l, i) => linea(g, l, `rgba(255,150,40,${0.3 + 0.5 * Math.abs(Math.sin(t * 2.5 + i))})`, 6 * s));
            g.restore();
        }
    },

    cielo: {
        est(g, w, h, s, C) {
            g.fillStyle = gV(g, 0, h, [[0, '#2f8ff0'], [0.5, '#7cc7ff'], [1, '#eaf7ff']]); g.fillRect(0, 0, w, h);
            C.nubes = [spriteNube(300 * s, '#ffffff', '#cfe3f5', 1), spriteNube(240 * s, '#ffffff', '#d6e8f7', 2), spriteNube(380 * s, '#ffffff', '#c4dcf2', 3)];
            C.islas = [[spriteIsla(260 * s, 3), 0.1, 0.5, 0], [spriteIsla(200 * s, 8), 0.72, 0.38, 2], [spriteIsla(150 * s, 5), 0.45, 0.62, 4]];
            g.fillStyle = gV(g, h * 0.88, h, [[0, 'rgba(255,255,255,0)'], [1, 'rgba(255,255,255,0.9)']]); g.fillRect(0, h * 0.88, w, h * 0.12);
        },
        din(g, w, h, t, s, C) {
            solDin(g, w, h, t, w * 0.82, h * 0.1, w * 0.04, 'rgba(255,246,194,1)');
            g.save(); g.globalCompositeOperation = 'lighter'; for (let i = 0; i < 6; i++) { g.fillStyle = `rgba(255,250,210,${0.05 + 0.03 * Math.sin(t + i)})`; g.beginPath(); g.moveTo(w * 0.82, h * 0.1); g.lineTo(w * 0.82 - w * (0.2 + i * 0.12) - 40 * s, h); g.lineTo(w * 0.82 - w * (0.1 + i * 0.12), h); g.closePath(); g.fill(); } g.restore();
            nubesDin(g, w, h, t, C, h * 0.5, h * 0.9, 6 * s, 4, 0.9);
            C.islas.forEach(([sp, fx, fy, ph]) => g.drawImage(sp, w * fx, h * fy + Math.sin(t * 0.8 + ph) * 10 * s));
            nubesDin(g, w, h, t, C, h * 0.05, h * 0.45, 11 * s, 5, 0.95); aves(g, w, h, t, 5, h * 0.3);
        }
    }
};

function fondoCache(tema, w, h) {
    const key = tema + '|' + w + 'x' + h;
    if (!cacheFondos[key]) {
        Object.keys(cacheFondos).forEach(k => { delete cacheFondos[k]; });
        const cv = nuevoLienzo(w, h), g = cv.getContext('2d'), s = Math.max(0.6, w / 1280), C = {};
        FONDOS[tema].est(g, w, h, s, C);
        const vg = g.createRadialGradient(w / 2, h / 2, Math.min(w, h) * 0.35, w / 2, h / 2, Math.max(w, h) * 0.75);
        vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(0,0,0,0.3)'); g.fillStyle = vg; g.fillRect(0, 0, w, h);
        cacheFondos[key] = { cv, C, s };
    }
    return cacheFondos[key];
}

function dibujarFondoTema(tema, w, h, t) {
    const F = fondoCache(tema, w, h);
    ctx.drawImage(F.cv, 0, 0);
    FONDOS[tema].din(ctx, w, h, t, F.s, F.C);
}

function dibujarEscenaHistoria() {
    if (!ctx || !historia.activa || historia.terminado || pantallaActual !== "juego") return;
    const c = historia.cap, w = canvas.width, h = canvas.height, t = performance.now() / 1000, k = w / 720;
    try {
        dibujarFondoTema(c.tema, w, h, t);
    } catch (e) {
        if (!dibujarEscenaHistoria.avisado) { console.error('Error al dibujar el fondo:', e); dibujarEscenaHistoria.avisado = true; }
        const T = TEMAS[c.tema], cielo = ctx.createLinearGradient(0, 0, 0, h);
        cielo.addColorStop(0, T.cielo[0]); cielo.addColorStop(1, T.cielo[1]); ctx.fillStyle = cielo; ctx.fillRect(0, 0, w, h);
    }
    dibujarJefe(c, w, h, t);
    dibujarClima(c, w, h, t);
    if (c.clima === 'lluvia') {
        const r = estadoRayo(t);
        if (r.on && historia.rayoCiclo !== r.ciclo) { historia.rayoCiclo = r.ciclo; sfx('trueno'); }
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
    if (listaAtaques(c).length) r.push(c.jefe ? 'Ataques del jefe: esquiva los proyectiles' : 'Peligros: esquiva las estalagmitas');
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
    historiaSubtitulo.innerHTML = htmlBarra(historiaProgreso.completados.length, CAPITULOS.length, `Capítulos completados: ${historiaProgreso.completados.length}/${CAPITULOS.length}`);
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
        historia = { activa: true, cap: c, clics: 0, netsInicio: nets, vivo: 0, total: 0, vidas: c.vidas, terminado: false, parts: null, flash: 0, pUlt: 0, proy: [], proxAtq: 2.2, sigAtq: null, invul: 0, golpeFlash: 0, avisado: false };
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
    sfx(ganado ? 'victoria' : 'derrota');
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
    sfx('vida');
    if (mensaje) {
        mensaje.textContent = `💔 Perdiste una vida (te quedan ${historia.vidas}). Clic en la bola para seguir`;
        mensaje.style.color = "#ff6b81";
    }
}

// ==========================================
// ATAQUES ACTIVOS DE LOS JEFES
// Proyectiles que hay que esquivar: haz clic en la bola para desviarla.
// k: bala (apunta a la bola) · abanico · radial · caida (con aviso) · rayo (con aviso) · estal (estalagmita del suelo)
// ==========================================
const ATAQUES_JEFE = {
    arbol:     { cada: 3.4, ataques: [{ k: 'bala', spr: 'hoja', col: '#7bd957', v: 320 }, { k: 'caida', n: 2, spr: 'rama', col: '#8a5a2b', r: 18 }] },
    espejo:    { cada: 3.6, ataques: [{ k: 'abanico', n: 3, spr: 'esquirla', col: '#bfe6ff', v: 340, ab: 0.3 }] },
    orbe:      { cada: 3.8, ataques: [{ k: 'radial', n: 8, spr: 'orbe', col: '#ffe58a', v: 230 }, { k: 'bala', spr: 'orbe', col: '#ffe58a', v: 400 }] },
    yeti:      { cada: 3.2, ataques: [{ k: 'caida', n: 2, spr: 'nieve', col: '#bcd9f2', r: 20 }, { k: 'bala', spr: 'nieve', col: '#bcd9f2', v: 310, r: 18 }] },
    reina:     { cada: 3.4, ataques: [{ k: 'abanico', n: 5, spr: 'hielo', col: '#7dd3fc', v: 330, ab: 0.22, r: 14 }, { k: 'caida', n: 2, spr: 'hielo', col: '#7dd3fc', r: 16 }] },
    escorpion: { cada: 3.0, ataques: [{ k: 'bala', spr: 'aguijon', col: '#c084fc', v: 430 }, { k: 'abanico', n: 3, spr: 'aguijon', col: '#c084fc', v: 380, ab: 0.3 }] },
    faraon:    { cada: 3.2, ataques: [{ k: 'bala', spr: 'arena', col: '#fcd34d', v: 370 }, { k: 'caida', n: 2, spr: 'roca', col: '#c9a24a', r: 22 }] },
    medusa:    { cada: 3.2, ataques: [{ k: 'rayo', n: 2, col: '#e879f9' }, { k: 'bala', spr: 'electro', col: '#67e8f9', v: 400 }] },
    kraken:    { cada: 3.0, ataques: [{ k: 'rayo', n: 2, col: '#2dd4bf' }, { k: 'abanico', n: 3, spr: 'tinta', col: '#2dd4bf', v: 350, ab: 0.35 }] },
    golem:     { cada: 3.0, ataques: [{ k: 'caida', n: 3, spr: 'roca', col: '#fb923c', r: 22 }, { k: 'bala', spr: 'lava', col: '#ff5a10', v: 340 }] },
    dragon:    { cada: 2.6, ataques: [{ k: 'abanico', n: 3, spr: 'lava', col: '#ff5a10', v: 370, ab: 0.3, r: 16 }, { k: 'bala', spr: 'lava', col: '#ff5a10', v: 450, r: 16 }, { k: 'caida', n: 2, spr: 'lava', col: '#ff5a10', r: 17 }] },
    angel:     { cada: 3.2, ataques: [{ k: 'rayo', n: 2, col: '#fde68a' }, { k: 'abanico', n: 5, spr: 'pluma', col: '#ffffff', v: 320, ab: 0.2 }] },
    titan:     { cada: 2.6, ataques: [{ k: 'rayo', n: 3, col: '#fff7a8' }, { k: 'radial', n: 10, spr: 'electro', col: '#fff7a8', v: 250 }, { k: 'bala', spr: 'electro', col: '#fff7a8', v: 480 }] }
};
// Peligros del propio escenario (solo en capítulos sin jefe)
const ATAQUES_TEMA = {
    cueva: { cada: 2.8, ataques: [{ k: 'estal', n: 2, col: '#a99bd6' }, { k: 'caida', n: 1, spr: 'estalactita', col: '#a99bd6', r: 18 }] }
};

function listaAtaques(c) {
    if (c.jefe && c.jefe.ataques) return c.jefe.ataques;
    if (c.jefe && ATAQUES_JEFE[c.jefe.forma]) return ATAQUES_JEFE[c.jefe.forma].ataques;
    if (!c.jefe && ATAQUES_TEMA[c.tema]) return ATAQUES_TEMA[c.tema].ataques;
    return [];
}
function cadenciaBase(c) {
    if (c.jefe && c.jefe.cada) return c.jefe.cada;
    if (c.jefe && ATAQUES_JEFE[c.jefe.forma]) return ATAQUES_JEFE[c.jefe.forma].cada;
    return (ATAQUES_TEMA[c.tema] || { cada: 3 }).cada;
}
function posJefe(w, h, t) {
    const R = Math.min(w * 0.13, h * 0.2);
    return { x: w * 0.5, y: h * 0.3 + Math.sin(t * 1.5) * R * 0.08, R };
}
function factoresAtaque() {
    // vel incluye un -20% global en la velocidad de todos los proyectiles
    return dificultadActual === 'dificil' ? { cad: 0.8, vel: 1.15 * 0.8, aviso: 0.85 }
        : (dificultadActual === 'media' ? { cad: 1, vel: 0.8, aviso: 1 } : { cad: 1.35, vel: 0.85 * 0.8, aviso: 1.2 });
}
function unidadProy() { return Math.max(0.8, bola.radio / (radioMod || 1) / 55); }

function lanzarAtaque(a, w, h, t) {
    const P = historia.proy, F = factoresAtaque(), u = unidadProy(), c = historia.cap;
    const origen = c.jefe ? posJefe(w, h, t) : { x: w / 2, y: -20 };
    const vel = (a.v || 350) * F.vel * u;
    const apuntar = Math.atan2(bola.y - origen.y, bola.x - origen.x);
    const bala = (ang) => P.push({ k: 'bala', x: origen.x, y: origen.y, vx: Math.cos(ang) * vel, vy: Math.sin(ang) * vel, r: (a.r || 15) * u, spr: a.spr, col: a.col, rot: ang, edad: 0 });
    if (a.k === 'bala') bala(apuntar);
    else if (a.k === 'abanico') { for (let i = 0; i < a.n; i++) bala(apuntar + (i - (a.n - 1) / 2) * (a.ab || 0.28)); }
    else if (a.k === 'radial') { const o = Math.random() * PI2; for (let i = 0; i < a.n; i++) bala(o + i / a.n * PI2); }
    else {
        for (let i = 0; i < (a.n || 1); i++) {
            const x = Math.max(50, Math.min(w - 50, i === 0 ? bola.x + (Math.random() - 0.5) * bola.radio * 2 : 60 + Math.random() * (w - 120)));
            P.push({ k: a.k, x, y: -(a.r || 16) * u * 3, vy: 260 * F.vel * u, r: (a.r || 16) * u, spr: a.spr, col: a.col, rot: Math.PI / 2, edad: 0, aviso: (a.k === 'rayo' ? 1.1 : 1.0) * F.aviso + i * 0.22 });
        }
    }
    if (a.k === 'bala' || a.k === 'abanico' || a.k === 'radial') {
        sfx('quemadura');
        FX.golpe(origen.x, origen.y, a.col || '#ffffff', '#ffffff', '#000000', 1.2);
    }
    if (!historia.avisado && mensaje) {
        historia.avisado = true;
        mensaje.textContent = "⚠️ ¡Esquiva! Haz clic en la bola para desviarla de los proyectiles";
        mensaje.style.color = "#ffa502";
    }
}

function golpeProyectil(p) {
    p.golpeado = true;
    historia.invul = 1.6;
    historia.golpeFlash = 0.4;
    historia.vidas--;
    clicksConsecutivos = 0;
    if (comboCount) comboCount.textContent = 0;
    dispararEfectoExplosionHd(bola.x, bola.y, { col: '#ff4757', esc: 0.9 });
    sfx('golpeJefe');
    bola.vy = -9;
    bola.vx = Math.max(-9, Math.min(9, (bola.x - p.x) * 0.06)) || 6;
    hieloCongelado = 0;
    if (chiclePegada) {
        chiclePegada = false;
        if (chicleTimerSuperficie) clearTimeout(chicleTimerSuperficie);
        if (chicleUsosRestantes === 0 && !chicleEnCooldown) activarCooldownChicle();
    }
    if (historia.vidas <= 0) { terminarCapitulo(false, 'vidas'); return; }
    sfx('vida');
    if (mensaje) {
        mensaje.textContent = `💥 ¡Te alcanzó un proyectil! Te quedan ${historia.vidas} vidas`;
        mensaje.style.color = "#ff6b81";
    }
}

function actualizarProyectiles(dt, w, h, t) {
    const c = historia.cap, P = historia.proy || (historia.proy = []);
    historia.invul = Math.max(0, (historia.invul || 0) - dt);
    historia.golpeFlash = Math.max(0, (historia.golpeFlash || 0) - dt);
    const lista = listaAtaques(c);
    if (!lista.length) return;
    if (bolaEnEsperaSaque) { P.length = 0; historia.proxAtq = 1.8; historia.sigAtq = null; return; }

    if (!historia.sigAtq) historia.sigAtq = lista[Math.floor(Math.random() * lista.length)];
    historia.proxAtq -= dt;
    if (c.jefe && historia.sigAtq && ['bala', 'abanico', 'radial'].includes(historia.sigAtq.k) && historia.proxAtq < 0.6) {
        const jf = posJefe(w, h, t);
        FX.carga(jf.x, jf.y, jf.R, historia.sigAtq.col || '#ffffff', 1 - Math.max(0, historia.proxAtq) / 0.6);
    }
    if (historia.proxAtq <= 0) {
        lanzarAtaque(historia.sigAtq, w, h, t);
        historia.sigAtq = null;
        historia.proxAtq = cadenciaBase(c) * factoresAtaque().cad * (1 - 0.35 * Math.min(1, progresoCapitulo() / c.obj.meta)) * (0.85 + Math.random() * 0.3);
    }

    const u = unidadProy(), piso = h - 10, rb = bola.radio;
    for (let i = P.length - 1; i >= 0; i--) {
        const p = P[i];
        p.edad = (p.edad || 0) + dt;
        let golpe = false, fuera = false;
        if (p.k === 'bala') {
            p.x += p.vx * dt; p.y += p.vy * dt;
            FX.proyectil(p, dt);
            const d = Math.hypot(bola.x - p.x, bola.y - p.y);
            if (d < rb * 3) p.cerca = true;
            golpe = d < rb * 0.85 + p.r * 0.85;
            fuera = p.x < -80 || p.x > w + 80 || p.y < -80 || p.y > h + 80;
        } else if (p.k === 'caida') {
            if (p.edad < p.aviso) continue;
            p.vy += 900 * 0.8 * u * dt; p.y += p.vy * dt;
            const d = Math.min(Math.hypot(bola.x - p.x, bola.y - p.y), Math.hypot(bola.x - p.x, bola.y - (p.y + p.r * 1.4)));
            if (d < rb * 3) p.cerca = true;
            golpe = d < rb * 0.85 + p.r * 0.75;
            if (p.y + p.r * 1.4 >= piso) {
                fuera = true;
                sfx('rebote');
                FX.impactoSuelo(p.x, piso, p.col || '#aaaaaa', p.r / 16);
            }
        } else if (p.k === 'rayo') {
            if (p.edad < p.aviso) continue;
            const ph = p.edad - p.aviso;
            if (!p.sono) { p.sono = true; sfx('zap'); FX.rayoSuelo(p.x, piso, p.col, u); }
            if (ph < 0.28) {
                const dx = Math.abs(bola.x - p.x);
                if (dx < rb * 2.5) p.cerca = true;
                golpe = dx < 28 * u + rb * 0.6;
            } else fuera = true;
        } else if (p.k === 'estal') {
            if (p.edad < p.aviso) continue;
            const ph = p.edad - p.aviso;
            if (!p.sono) { p.sono = true; sfx('rebote'); FX.impactoSuelo(p.x, piso, p.col, 1.3); }
            const fr = ph < 0.12 ? ph / 0.12 : (ph < 0.67 ? 1 : Math.max(0, 1 - (ph - 0.67) / 0.25));
            p.alt = fr * 190 * u;
            const dx = Math.abs(bola.x - p.x);
            if (fr > 0.35 && dx < rb * 2.5) p.cerca = true;
            golpe = fr > 0.35 && dx < 28 * u * 0.75 + rb * 0.6 && (bola.y + rb * 0.75) > piso - p.alt;
            fuera = ph > 0.92;
        }
        if (golpe && !(historia.invul > 0)) {
            golpeProyectil(p);
            if (historia.terminado) return;
            if (p.k === 'bala' || p.k === 'caida') P.splice(i, 1);
        } else if (fuera) {
            if (p.cerca && !p.golpeado) sumarStat('esquivados');
            P.splice(i, 1);
        }
    }
}

// ---------- Sprites de proyectiles (apuntan hacia +x) ----------
const SPR_PROY = {
    lava(g, r) {
        const cola = g.createLinearGradient(-r * 3.4, 0, 0, 0); cola.addColorStop(0, 'rgba(255,60,0,0)'); cola.addColorStop(1, 'rgba(255,140,30,0.75)');
        poli(g, [[-r * 3.4, 0], [0, -r * 0.95], [0, r * 0.95]], cola);
        g.save(); g.shadowColor = '#ff5a10'; g.shadowBlur = r * 1.2; circ(g, 0, 0, r, '#ff5a10'); g.restore();
        circ(g, 0, 0, r * 0.65, '#ffb347'); circ(g, -r * 0.2, -r * 0.2, r * 0.28, '#fff3b0');
    },
    hoja(g, r) {
        elip(g, 0, 0, r * 1.25, r * 0.55, '#7bd957'); poli(g, [[r * 1.25, 0], [r * 0.2, -r * 0.5], [r * 0.2, 0]], '#a5ec7d');
        linea(g, [[-r * 1.1, 0], [r * 1.1, 0]], '#3c8a30', r * 0.1);
    },
    esquirla(g, r) {
        poli(g, [[r * 1.5, 0], [0, -r * 0.6], [-r * 0.9, 0], [0, r * 0.6]], '#cfeaff');
        poli(g, [[r * 1.5, 0], [0, r * 0.6], [-r * 0.9, 0]], '#8cc8f0');
        linea(g, [[-r * 0.4, -r * 0.1], [r * 0.9, -r * 0.05]], 'rgba(255,255,255,0.9)', r * 0.1);
    },
    orbe(g, r) {
        const gr = g.createRadialGradient(-r * 0.3, -r * 0.3, r * 0.1, 0, 0, r); gr.addColorStop(0, '#ffffff'); gr.addColorStop(0.5, '#ffe58a'); gr.addColorStop(1, '#c9891a');
        g.save(); g.shadowColor = '#ffe58a'; g.shadowBlur = r; circ(g, 0, 0, r, gr); g.restore();
    },
    nieve(g, r) { circ(g, 0, 0, r, '#bcd9f2'); circ(g, -r * 0.1, -r * 0.1, r * 0.85, '#ffffff'); circ(g, r * 0.3, r * 0.3, r * 0.2, '#d7e8f8'); },
    hielo(g, r) {
        poli(g, [[r * 1.7, 0], [-r * 0.9, -r * 0.55], [-r * 0.9, r * 0.55]], '#9fe3ff');
        poli(g, [[r * 1.7, 0], [-r * 0.9, r * 0.55], [-r * 0.2, 0]], '#5cb8e8');
        linea(g, [[-r * 0.6, 0], [r * 1.2, 0]], 'rgba(255,255,255,0.8)', r * 0.1);
    },
    aguijon(g, r) {
        poli(g, [[r * 1.5, 0], [-r * 0.3, -r * 0.45], [-r * 1.0, 0], [-r * 0.3, r * 0.45]], '#a855f7');
        poli(g, [[r * 1.1, 0], [-r * 0.2, -r * 0.2], [-r * 0.6, 0], [-r * 0.2, r * 0.2]], '#f0abfc');
    },
    arena(g, r) { poli(g, [[r * 1.3, 0], [0, -r * 0.8], [-r * 1.1, 0], [0, r * 0.8]], '#fcd34d'); poli(g, [[r * 1.3, 0], [0, r * 0.8], [-r * 1.1, 0]], '#b8860b'); },
    roca(g, r) {
        const P = (pts) => pts.map(([a, b]) => [a * r, b * r]);
        poli(g, P([[-1, 0.1], [-0.7, -0.8], [0, -1], [0.8, -0.6], [1, 0.2], [0.5, 0.9], [-0.4, 0.85]]), '#7a6a58');
        poli(g, P([[-1, 0.1], [-0.7, -0.8], [0, -1], [0.1, -0.1]]), '#a99884');
        poli(g, P([[0.1, -0.1], [0.8, -0.6], [1, 0.2], [0.5, 0.9], [0, 0.5]]), 'rgba(0,0,0,0.25)');
    },
    tinta(g, r) {
        circ(g, 0, 0, r, '#0f172a'); g.strokeStyle = '#2dd4bf'; g.lineWidth = r * 0.18; g.beginPath(); g.arc(0, 0, r * 0.9, 0, PI2); g.stroke();
        circ(g, -r * 0.3, -r * 0.3, r * 0.22, 'rgba(255,255,255,0.5)');
    },
    pluma(g, r) {
        elip(g, 0, 0, r * 1.7, r * 0.5, '#ffffff'); linea(g, [[-r * 1.5, 0], [r * 1.6, 0]], '#d0def5', r * 0.1);
        elip(g, -r * 0.3, -r * 0.2, r * 1.0, r * 0.2, 'rgba(255,240,180,0.6)', -0.2);
    },
    estalactita(g, r) {
        poli(g, [[r * 2.3, 0], [-r * 0.9, -r * 0.85], [-r * 0.9, r * 0.85]], '#6b5d9a');
        poli(g, [[r * 2.3, 0], [-r * 0.9, r * 0.85], [-r * 0.2, 0]], '#463c70');
        linea(g, [[-r * 0.5, -r * 0.3], [r * 1.4, -r * 0.1]], 'rgba(220,210,255,0.55)', r * 0.1);
    },
    rama(g, r) {
        g.fillStyle = '#8a5a2b'; rectRedondo(g, -r * 1.7, -r * 0.45, r * 3.4, r * 0.9, r * 0.3); g.fill();
        linea(g, [[-r * 1.4, -r * 0.15], [r * 1.3, -r * 0.15]], '#5a3a18', r * 0.12);
        circ(g, r * 1.5, -r * 0.3, r * 0.4, '#4aa84f'); circ(g, -r * 1.5, r * 0.2, r * 0.35, '#6bd36b');
    }
};
SPR_PROY.electro = function (g, r, t) {
    const f = Math.floor((t || 0) * 14);
    g.save(); g.shadowColor = '#67e8f9'; g.shadowBlur = r * 1.4; circ(g, 0, 0, r, '#67e8f9'); g.restore();
    circ(g, 0, 0, r * 0.5, '#ffffff');
    for (let k = 0; k < 4; k++) {
        const a = hash(f + k) * PI2;
        linea(g, [[0, 0], [Math.cos(a) * r * 0.8 + (hash(f + k + 9) - 0.5) * r * 0.6, Math.sin(a) * r * 0.8], [Math.cos(a) * r * 1.7, Math.sin(a) * r * 1.7]], '#e0ffff', r * 0.12);
    }
};

function avisoColumna(g, p, ancho, h, piso, u) {
    const k = Math.min(1, p.edad / p.aviso), pulso = 0.5 + 0.5 * Math.sin(p.edad * 16);
    g.save();
    g.globalAlpha = 0.07 + 0.22 * k * (0.6 + 0.4 * pulso);
    g.fillStyle = p.col || '#ff4757'; g.fillRect(p.x - ancho / 2, 0, ancho, piso);
    g.globalAlpha = 0.5 + 0.5 * pulso;
    poli(g, [[p.x, 22 * u], [p.x - 16 * u, 52 * u], [p.x + 16 * u, 52 * u]], '#ffd32a');
    g.fillStyle = '#2a1a00'; g.font = `900 ${Math.round(22 * u)}px 'Segoe UI', Arial, sans-serif`; g.textAlign = 'center'; g.textBaseline = 'middle';
    g.fillText('!', p.x, 42 * u);
    g.globalAlpha = 0.35 + 0.4 * pulso; g.strokeStyle = p.col || '#ff4757'; g.lineWidth = 3 * u;
    g.beginPath(); g.ellipse(p.x, piso, ancho * 0.6, 7 * u, 0, 0, PI2); g.stroke();
    g.restore();
}

function dibujarProyectiles(w, h, t) {
    const P = historia.proy, c = historia.cap;
    if (!P || !ctx) return;
    const u = unidadProy(), piso = h - 10, g = ctx;
    g.save();
    // El jefe carga el disparo
    const sig = historia.sigAtq;
    if (c.jefe && !bolaEnEsperaSaque && sig && (sig.k === 'bala' || sig.k === 'abanico' || sig.k === 'radial') && historia.proxAtq < 0.6) {
        const jf = posJefe(w, h, t), k = 1 - Math.max(0, historia.proxAtq) / 0.6, col = sig.col || '#ffffff';
        const gr = g.createRadialGradient(jf.x, jf.y, 0, jf.x, jf.y, jf.R * (0.5 + k * 0.9));
        gr.addColorStop(0, col + 'cc'); gr.addColorStop(1, col + '00');
        g.fillStyle = gr; g.fillRect(jf.x - jf.R * 1.6, jf.y - jf.R * 1.6, jf.R * 3.2, jf.R * 3.2);
    }
    P.forEach(p => {
        if (p.k === 'bala' || p.k === 'caida') {
            if (p.k === 'caida' && p.edad < p.aviso) { avisoColumna(g, p, p.r * 2.4, h, piso, u); return; }
            g.save(); g.translate(p.x, p.y);
            g.rotate(p.spr === 'roca' || p.spr === 'nieve' ? p.edad * 4 : p.rot);
            (SPR_PROY[p.spr] || SPR_PROY.orbe)(g, p.r, t);
            g.restore();
        } else if (p.k === 'rayo') {
            if (p.edad < p.aviso) { avisoColumna(g, p, 70 * u, h, piso, u); return; }
            const ph = p.edad - p.aviso, a = Math.max(0, 1 - ph / 0.28), f = Math.floor(t * 30), pts = [[p.x, 0]];
            for (let i = 1; i <= 9; i++) pts.push([p.x + (hash(f + i + p.x) - 0.5) * 46 * u, i * piso / 9]);
            g.save(); g.globalAlpha = a * 0.28; g.fillStyle = p.col; g.fillRect(p.x - 40 * u, 0, 80 * u, piso);
            g.globalAlpha = a; g.shadowColor = p.col; g.shadowBlur = 24 * u;
            linea(g, pts, p.col, 13 * u); linea(g, pts, '#ffffff', 4.5 * u); g.restore();
        } else if (p.k === 'estal') {
            const wb = 30 * u;
            if (p.edad < p.aviso) {
                const k = Math.min(1, p.edad / p.aviso), pulso = 0.5 + 0.5 * Math.sin(p.edad * 16);
                g.save(); g.globalAlpha = 0.3 + 0.5 * pulso; g.strokeStyle = p.col; g.lineWidth = 3 * u;
                g.beginPath(); g.ellipse(p.x, piso, wb * (0.8 + 0.5 * k), 8 * u, 0, 0, PI2); g.stroke();
                linea(g, [[p.x - 14 * u, piso - 2], [p.x - 4 * u, piso - 16 * u], [p.x + 6 * u, piso - 6 * u], [p.x + 16 * u, piso - 20 * u]], '#ffd32a', 3 * u);
                g.restore();
                return;
            }
            const alt = p.alt || 0;
            if (alt > 1) {
                poli(g, [[p.x - wb, piso + 8], [p.x, piso - alt], [p.x + wb, piso + 8]], '#8d7fc0');
                poli(g, [[p.x, piso - alt], [p.x + wb, piso + 8], [p.x + wb * 0.1, piso + 8]], '#4f4480');
                linea(g, [[p.x - wb * 0.3, piso - alt * 0.2], [p.x - wb * 0.05, piso - alt * 0.8]], 'rgba(235,228,255,0.6)', 2.5 * u);
            }
        }
    });
    g.restore();
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
    if (pr > (historia.pUlt || 0)) { historia.flash = 0.25; if (c.jefe) sfx('golpeJefe'); }
    historia.pUlt = pr;
    historia.flash = Math.max(0, (historia.flash || 0) - dt);
    if (pr >= c.obj.meta) terminarCapitulo(true);
    else if (c.limite && historia.total >= c.limite) terminarCapitulo(false, 'tiempo');
    else actualizarProyectiles(dt, canvas.width, canvas.height, ahora / 1000);
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
    dibujarProyectiles(w, canvas.height, performance.now() / 1000);
    if (historia.golpeFlash > 0) {
        const hh = canvas.height, vg = ctx.createRadialGradient(w / 2, hh / 2, Math.min(w, hh) * 0.3, w / 2, hh / 2, Math.max(w, hh) * 0.75);
        vg.addColorStop(0, 'rgba(255,40,60,0)'); vg.addColorStop(1, `rgba(255,40,60,${Math.min(0.6, historia.golpeFlash * 1.5)})`);
        ctx.fillStyle = vg; ctx.fillRect(0, 0, w, hh);
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

// ----- Ventanas: cerrar con Esc o tocando fuera -----
const VENTANAS_CERRABLES = ['modalTienda', 'modalLogros', 'modalHistoria', 'modalAudio', 'modalDificultad'];
function ventanaAbierta() {
    return [...document.querySelectorAll('.modal-tienda')].find(m => m.style.display === 'flex') || null;
}
window.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return;
    const m = ventanaAbierta();
    if (!m) return;
    e.stopImmediatePropagation();
    if (VENTANAS_CERRABLES.includes(m.id)) m.style.display = 'none';
}, true);
VENTANAS_CERRABLES.forEach(id => {
    const m = document.getElementById(id);
    if (m) m.addEventListener('click', (e) => { if (e.target === m) m.style.display = 'none'; });
});
const btnCancelarDif = document.getElementById('btnCancelarDif');
if (btnCancelarDif) btnCancelarDif.addEventListener('click', () => { modalDificultad.style.display = 'none'; });

let enJuegoPrevio = null;
function sincronizarInterfaz() {
    const j = pantallaActual === 'juego';
    if (j === enJuegoPrevio) return;
    enJuegoPrevio = j;
    document.body.classList.toggle('en-juego', j);
}

let errorLoopAvisado = false;
function gameLoop() {
    try {
        sincronizarInterfaz();
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
if (canvas) FX.iniciar(canvas);
ajustarLienzo();
guardarProgreso();
gameLoop();