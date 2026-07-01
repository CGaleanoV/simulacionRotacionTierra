import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

// 1. Configuración básica de la escena
const container = document.getElementById('canvas-container');
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 15, 30);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
container.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

function createStarLayer(count, radiusMin, radiusMax, color, size, opacity) {
    const positions = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
        const index = i * 3;
        const radius = radiusMin + Math.random() * (radiusMax - radiusMin);
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(THREE.MathUtils.randFloatSpread(2));

        positions[index] = radius * Math.sin(phi) * Math.cos(theta);
        positions[index + 1] = radius * Math.cos(phi);
        positions[index + 2] = radius * Math.sin(phi) * Math.sin(theta);
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const material = new THREE.PointsMaterial({
        color,
        size,
        transparent: true,
        opacity,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        sizeAttenuation: true
    });

    return new THREE.Points(geometry, material);
}

// Fondo espacial con parallax muy suave
const starLayerFar = createStarLayer(1400, 260, 520, 0xffffff, 0.55, 0.55);
const starLayerMid = createStarLayer(700, 180, 360, 0xbcd7ff, 0.8, 0.42);
const starLayerNear = createStarLayer(220, 130, 240, 0xfff2d6, 1.15, 0.28);
scene.add(starLayerFar, starLayerMid, starLayerNear);

// 2. Parámetros Orbitales y Físicos (Escalados para visualización)
const BASE_SEMI_MAJOR_AXIS = 10; // Semieje mayor base visual
const e = 0.0167; // Excentricidad real
const AU_KM = 149597870.7;
const SUN_MU_KM3_S2 = 1.32712440018e11;
const BASE_ORBITAL_PERIOD_SECONDS = 365.25;

let orbitalScale = 1;
let a = BASE_SEMI_MAJOR_AXIS;
let b = a * Math.sqrt(1 - e * e);
let c = a * e;
let orbitalPeriodSeconds = BASE_ORBITAL_PERIOD_SECONDS;
let h = (2 * Math.PI * a * b) / orbitalPeriodSeconds;

// SINCRONIZACIÓN TEMPORAL ESTRICTA
const clock = new THREE.Clock(); 
let theta = 0; // Ángulo orbital
let speedMultiplier = 1;
const TIEMPO_BASE_ESCALA = 0.25;

// Definimos que 1 año completo (una órbita) dura exactamente 365.25 segundos a velocidad 1x.
// Por lo tanto, proporcionalmente 1 día dura exactamente 1 segundo a velocidad 1x.

// 3. Creación de Objetos
const textureLoader = new THREE.TextureLoader();

// Sol (En el origen absoluto)
const sunGeometry = new THREE.SphereGeometry(2, 32, 32);
const sunTexture = textureLoader.load('sol.jpg'); 
const sunMaterial = new THREE.MeshBasicMaterial({ map: sunTexture }); 
const sun = new THREE.Mesh(sunGeometry, sunMaterial);
sun.position.set(0, 0, 0); 
scene.add(sun);

// Iluminación
const pointLight = new THREE.PointLight(0xffffff, 1200, 0); 
sun.add(pointLight);
scene.add(new THREE.AmbientLight(0x888888, 0.8)); 

// Tierra
const earthGroup = new THREE.Group();
const earthGeometry = new THREE.SphereGeometry(0.5, 32, 32);
const earthTexture = textureLoader.load('tierra.jpg'); 
const earthMaterial = new THREE.MeshPhongMaterial({ map: earthTexture }); 
const earth = new THREE.Mesh(earthGeometry, earthMaterial);
earth.rotation.z = 23.5 * Math.PI / 180; // Inclinación axial fija respecto a las estrellas
earthGroup.add(earth);
scene.add(earthGroup);

// Trazado de la Órbita Suave y Centrada con el Sol
const orbitMaterial = new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.3 });
let orbitLine = new THREE.Line(new THREE.BufferGeometry(), orbitMaterial);
scene.add(orbitLine);

function rebuildOrbitLine() {
    const orbitPoints = [];
    for (let i = 0; i <= 256; i++) {
        const angle = (i / 256) * Math.PI * 2;
        const x = a * Math.cos(angle) - c;
        const z = b * Math.sin(angle);
        orbitPoints.push(new THREE.Vector3(x, 0, z));
    }

    const orbitGeometry = new THREE.BufferGeometry().setFromPoints(orbitPoints);
    orbitLine.geometry.dispose();
    orbitLine.geometry = orbitGeometry;
}

function updateOrbitalParameters() {
    a = BASE_SEMI_MAJOR_AXIS * orbitalScale;
    b = a * Math.sqrt(1 - e * e);
    c = a * e;
    orbitalPeriodSeconds = BASE_ORBITAL_PERIOD_SECONDS * Math.pow(orbitalScale, 1.5);
    h = (2 * Math.PI * a * b) / orbitalPeriodSeconds;
    rebuildOrbitLine();
}

updateOrbitalParameters();

// 4. Conexión con la UI
const speedSlider = document.getElementById('speed-slider');
const speedVal = document.getElementById('speed-val');
const distanceSlider = document.getElementById('distance-slider');
const distanceVal = document.getElementById('distance-val');
const distData = document.getElementById('dist-data');
const velData = document.getElementById('vel-data');
const monthSelector = document.getElementById('month-selector');

speedSlider.addEventListener('input', (event) => {
    speedMultiplier = parseFloat(event.target.value);
    speedVal.innerText = `${speedMultiplier}x`;
});

distanceSlider.addEventListener('input', (event) => {
    orbitalScale = parseFloat(event.target.value);
    distanceVal.innerText = `${orbitalScale.toFixed(2)} UA`;
    updateOrbitalParameters();
});

document.getElementById('reset-btn').addEventListener('click', () => {
    controls.reset();
    camera.position.set(0, 15, 30);
});

monthSelector.addEventListener('change', (event) => {
    const mesSeleccionado = parseInt(event.target.value);
    theta = (mesSeleccionado / 12) * Math.PI * 2;
});

// 5. Bucle de Animación
function animate() {
    requestAnimationFrame(animate);

    // Medir el tiempo real transcurrido entre fotogramas (delta)
    const delta = clock.getDelta() * TIEMPO_BASE_ESCALA;

    // Calcular posición elíptica de la Tierra respecto al Sol
    const r = (a * (1 - e * e)) / (1 + e * Math.cos(theta));
    const x = r * Math.cos(theta);
    const z = r * Math.sin(theta);
    
    earthGroup.position.set(x, 0, z);
    
    // FISICA REAL DE ROTACIÓN: 
    // Como 1 día equivale a 1 segundo en nuestro simulador base, la Tierra debe girar exactamente 
    // una vuelta completa (2 * PI radianes) por cada segundo transcurrido.
    const velocidadRotacionDiaria = Math.PI * 2; 
    earth.rotation.y += velocidadRotacionDiaria * speedMultiplier * delta;

    // FÍSICA REAL DE TRASLACIÓN (Segunda Ley de Kepler vinculada al tiempo real delta)
    const dTheta = (h * delta * speedMultiplier) / (r * r);
    theta += dTheta;
    if (theta > Math.PI * 2) theta -= Math.PI * 2;

    // Calcular mes actual basándose en Theta y actualizar el menú desplegable
    const currentMonthIndex = Math.floor((theta / (Math.PI * 2)) * 12) % 12;
    if (document.activeElement !== monthSelector) {
        monthSelector.value = currentMonthIndex;
    }

    // Actualizar datos de la UI
    const semiMajorAxisKm = orbitalScale * AU_KM;
    const distReal = (r / a) * semiMajorAxisKm / 1000000;
    distData.innerText = distReal.toFixed(2);
    
    const distanciaKm = (r / a) * semiMajorAxisKm;
    const velocidadKmS = Math.sqrt(SUN_MU_KM3_S2 * (2 / distanciaKm - 1 / semiMajorAxisKm));
    const velocidadKmH = velocidadKmS * 3600;
    velData.innerText = velocidadKmH.toLocaleString('en-US', { maximumFractionDigits: 0 });

    starLayerFar.rotation.y += delta * 0.0015;
    starLayerMid.rotation.y -= delta * 0.0022;
    starLayerNear.rotation.y += delta * 0.003;
    starLayerFar.rotation.x += delta * 0.0002;
    starLayerMid.rotation.x -= delta * 0.00015;
    starLayerNear.rotation.x += delta * 0.0001;

    controls.update();
    renderer.render(scene, camera);
}

// Manejo de redimensionado de pantalla
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

animate();