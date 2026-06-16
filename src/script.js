import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

const scene = new THREE.Scene();

const textureLoader = new THREE.TextureLoader();
const cubeTextureLoader = new THREE.CubeTextureLoader();
cubeTextureLoader.setPath("/textures/cubeMap/");

const sunTexture = textureLoader.load("/textures/2k_sun.jpg");
sunTexture.colorSpace = THREE.SRGBColorSpace;
const mercuryTexture = textureLoader.load("/textures/2k_mercury.jpg");
mercuryTexture.colorSpace = THREE.SRGBColorSpace;
const venusTexture = textureLoader.load("/textures/2k_venus_surface.jpg");
venusTexture.colorSpace = THREE.SRGBColorSpace;
const earthTexture = textureLoader.load("/textures/2k_earth_daymap.jpg");
earthTexture.colorSpace = THREE.SRGBColorSpace;
const marsTexture = textureLoader.load("/textures/2k_mars.jpg");
marsTexture.colorSpace = THREE.SRGBColorSpace;
const moonTexture = textureLoader.load("/textures/2k_moon.jpg");
moonTexture.colorSpace = THREE.SRGBColorSpace;

const backgroundCubemap = cubeTextureLoader.load([
  "px.png",
  "nx.png",
  "py.png",
  "ny.png",
  "pz.png",
  "nz.png",
]);
scene.background = backgroundCubemap;

const mercuryMaterial = new THREE.MeshStandardMaterial({ map: mercuryTexture });
const venusMaterial = new THREE.MeshStandardMaterial({ map: venusTexture });
const earthMaterial = new THREE.MeshStandardMaterial({ map: earthTexture });
const marsMaterial = new THREE.MeshStandardMaterial({ map: marsTexture });
const moonMaterial = new THREE.MeshStandardMaterial({ map: moonTexture });

const sphereGeometry = new THREE.SphereGeometry(1, 32, 32);
const sunMaterial = new THREE.MeshBasicMaterial({ map: sunTexture });

const sun = new THREE.Mesh(sphereGeometry, sunMaterial);
sun.scale.setScalar(5);
scene.add(sun);

const planets = [
  {
    name: "Mercury",
    radius: 0.5,
    distance: 10,
    speed: 0.01,
    material: mercuryMaterial,
    moons: [],
    info: {
      type: "Terrestrial",
      dayLength: "59 Earth days",
      temp: "430°C / −180°C",
      fact: "No atmosphere — extreme temperature swings between day and night.",
    },
  },
  {
    name: "Venus",
    radius: 0.8,
    distance: 15,
    speed: 0.007,
    material: venusMaterial,
    moons: [],
    info: {
      type: "Terrestrial",
      dayLength: "243 Earth days",
      temp: "465°C (avg)",
      fact: "Hottest planet in the solar system due to greenhouse effect.",
    },
  },
  {
    name: "Earth",
    radius: 1,
    distance: 20,
    speed: 0.005,
    material: earthMaterial,
    moons: [{ name: "Moon", radius: 0.3, distance: 3, speed: 0.015 }],
    info: {
      type: "Terrestrial",
      dayLength: "24 hours",
      temp: "15°C (avg)",
      fact: "Only known planet to harbor life, with liquid water oceans.",
    },
  },
  {
    name: "Mars",
    radius: 0.7,
    distance: 25,
    speed: 0.003,
    material: marsMaterial,
    moons: [
      { name: "Phobos", radius: 0.1, distance: 2, speed: 0.02 },
      { name: "Deimos", radius: 0.2, distance: 3, speed: 0.015 },
    ],
    info: {
      type: "Terrestrial",
      dayLength: "24.6 hours",
      temp: "−60°C (avg)",
      fact: "Home to Olympus Mons, the tallest volcano in the solar system.",
    },
  },
];

const createPlanet = (planet) => {
  const planetMesh = new THREE.Mesh(sphereGeometry, planet.material);
  planetMesh.scale.setScalar(planet.radius);
  planetMesh.position.x = planet.distance;
  return planetMesh;
};

const createMoon = (moon) => {
  const moonMesh = new THREE.Mesh(sphereGeometry, moonMaterial);
  moonMesh.scale.setScalar(moon.radius);
  moonMesh.position.x = moon.distance;
  return moonMesh;
};

const planetMeshes = planets.map((planet) => {
  const planetMesh = createPlanet(planet);
  scene.add(planetMesh);
  planet.moons.forEach((moon) => {
    const moonMesh = createMoon(moon);
    planetMesh.add(moonMesh);
  });
  return planetMesh;
});

// orbit rings
planets.forEach((planet) => {
  const ringGeo = new THREE.RingGeometry(
    planet.distance - 0.05,
    planet.distance + 0.05,
    128,
  );
  const ringMat = new THREE.MeshBasicMaterial({
    color: 0xffffff,
    opacity: 0.08,
    transparent: true,
    side: THREE.DoubleSide,
  });
  const ring = new THREE.Mesh(ringGeo, ringMat);
  ring.rotation.x = -Math.PI / 2;
  scene.add(ring);
});

// lights
const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
scene.add(ambientLight);
const pointLight = new THREE.PointLight(0xffffff, 1000);
scene.add(pointLight);

// camera
const camera = new THREE.PerspectiveCamera(
  35,
  window.innerWidth / window.innerHeight,
  0.1,
  400,
);
camera.position.z = 100;
camera.position.y = 5;

// renderer
const canvas = document.querySelector("canvas.threejs");
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

// controls
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;
controls.maxDistance = 200;
controls.minDistance = 20;

// resize
window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

const hud = document.createElement("div");
hud.id = "planet-hud";
hud.style.cssText = `
  position: fixed;
  top: 20px;
  right: 20px;
  width: 240px;
  background: #0B0C12 ;
  color: #fff;
  font-family: var(--font-sans, "Outfit", sans-serif);
  font-size: 13px;
  border-radius: 10px;
  padding: 16px;
  backdrop-filter: blur(6px);
  border: 1px solid rgba(255,255,255,0.1);
  display: none;
  line-height: 1.6;
  z-index: 999;
`;
document.body.appendChild(hud);

// speed controls panel
const speedPanel = document.createElement("div");
speedPanel.style.cssText = `
  position: fixed;
  bottom: 20px;
  left: 20px;
  background: #0B0C12 ;
  color: #fff;
  font-family: var(--font-sans, "Outfit", sans-serif);
  font-size: 12px;
  border-radius: 10px;
  backdrop-filter: blur(6px);
  border: 1px solid rgba(255,255,255,0.1);
  min-width: 220px;
  z-index: 999;
  overflow: hidden;
`;

const speedHeader = document.createElement("div");
speedHeader.style.cssText = `
  font-size: 13px;
  font-weight: 600;
  opacity: 0.8;
  padding: 14px 18px;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;
  user-select: none;
`;
speedHeader.innerHTML = `<span>⏱ Orbit speed</span><span id="speed-arrow">⤴</span>`;
speedPanel.appendChild(speedHeader);

const speedBody = document.createElement("div");
speedBody.id = "speed-body";
speedBody.style.cssText = `padding: 0 18px 14px; display: block;`;
speedPanel.appendChild(speedBody);

let speedOpen = true;
speedHeader.addEventListener("click", () => {
  speedOpen = !speedOpen;
  speedBody.style.display = speedOpen ? "block" : "none";
  document.getElementById("speed-arrow").textContent = speedOpen ? "⤴" : "⤵";
});

const speedMultipliers = planets.map(() => 1);

planets.forEach((planet, i) => {
  const row = document.createElement("div");
  row.style.cssText =
    "display:flex;align-items:center;gap:8px;margin-bottom:8px;";
  row.innerHTML = `
    <span style="width:60px;opacity:0.7;">${planet.name}</span>
    <input type="range" min="0" max="5" step="0.1" value="1"
      style="flex:1;accent-color:#f56c11;"
      id="speed-${i}" />
    <span style="width:28px;text-align:right;" id="speed-label-${i}">1×</span>
  `;
  speedBody.appendChild(row);
});

document.body.appendChild(speedPanel);

planets.forEach((_, i) => {
  const slider = document.getElementById(`speed-${i}`);
  const label = document.getElementById(`speed-label-${i}`);
  slider.addEventListener("input", () => {
    speedMultipliers[i] = parseFloat(slider.value);
    label.textContent = `${parseFloat(slider.value).toFixed(1)}×`;
  });
});

// Raycaster — pointerup so OrbitControls
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
let pointerMoved = false;

canvas.addEventListener("pointerdown", () => {
  pointerMoved = false;
});

canvas.addEventListener("pointermove", () => {
  pointerMoved = true;
});

canvas.addEventListener("pointerup", (e) => {
  if (pointerMoved) return;

  mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;

  raycaster.setFromCamera(mouse, camera);
  const hits = raycaster.intersectObjects(planetMeshes, false);

  if (hits.length > 0) {
    const idx = planetMeshes.indexOf(hits[0].object);
    if (idx !== -1) {
      const p = planets[idx];
      hud.style.display = "block";
      hud.innerHTML = `
        <div style="font-size:15px;font-weight:700;margin-bottom:10px;">${p.name}</div>
        <div style="opacity:0.6;font-size:11px;margin-bottom:8px;text-transform:uppercase;letter-spacing:0.05em">${p.info.type}</div>
        <div style="margin-bottom:5px;"><span style="opacity:0.5">Day length: </span>${p.info.dayLength}</div>
        <div style="margin-bottom:5px;"><span style="opacity:0.5">Temperature: </span>${p.info.temp}</div>
        <div style="margin-bottom:10px;"><span style="opacity:0.5">Moons: </span>${p.moons.length || "None"}</div>
        <div style="font-style:italic;opacity:0.7;font-size:12px;border-top:1px solid rgba(255,255,255,0.1);padding-top:9px;">${p.info.fact}</div>
        <div style="margin-top:10px;font-size:11px;opacity:0.4;">Click elsewhere to dismiss</div>
      `;
    }
  } else {
    hud.style.display = "none";
  }
});

// render loop
const renderloop = () => {
  planetMeshes.forEach((planet, planetIndex) => {
    const speed = planets[planetIndex].speed * speedMultipliers[planetIndex];
    planet.rotation.y += speed;
    planet.position.x =
      Math.sin(planet.rotation.y) * planets[planetIndex].distance;
    planet.position.z =
      Math.cos(planet.rotation.y) * planets[planetIndex].distance;

    planet.children.forEach((moon, moonIndex) => {
      moon.rotation.y += planets[planetIndex].moons[moonIndex].speed;
      moon.position.x =
        Math.sin(moon.rotation.y) *
        planets[planetIndex].moons[moonIndex].distance;
      moon.position.z =
        Math.cos(moon.rotation.y) *
        planets[planetIndex].moons[moonIndex].distance;
    });
  });

  controls.update();
  renderer.render(scene, camera);
  window.requestAnimationFrame(renderloop);
};

renderloop();
