import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { AsciiEffect } from 'three/addons/effects/AsciiEffect.js';

const icons = [
    {
        model: 'icon1.glb',
        canvasId: 'canvas1',
        size: { width: 500, height: 500 },
        position: { x: 0.8, y: -0.4, z: 1.4 },
        scale: 0.01,
        rotation: { x: Math.PI * 0.65, y: 0, z: Math.PI },
        bounce: { velocity: 0.005, amplitude: 0.1 },
        spin: { speed: 0.003, amplitude: 0.3 },
        cameraZ: 3,
        palette: 'w',
    },
    {
        model: 'icon2.glb',
        canvasId: 'canvas2',
        size: { width: 160, height: 160 },
        position: { x: 0, y: -0.12, z: 0 },
        scale: 0.58,
        rotation: { x: 0.2, y: -0.35, z: 0.08 },
        bounce: { velocity: 0.0068, amplitude: 0.075 },
        spin: { speed: 0.004, amplitude: 0.28, continuous: 0.55 },
        resolution: 0.4,
        center: true,
        cameraZ: 2.5,
        palette: 'sun',
    },
    {
        model: 'icon3.glb',
        canvasId: 'canvas3',
        size: { width: 160, height: 160 },
        position: { x: 0, y: -0.12, z: 0 },
        scale: 1.1,
        rotation: { x: 0.1, y: -0.25, z: 0.15 },
        bounce: { velocity: 0.0072, amplitude: 0.08 },
        spin: { speed: 0.0045, amplitude: 0.25, continuous: 0.7 },
        resolution: 0.4,
        center: true,
        cameraZ: 2.5,
        palette: 'lightning',
    },
    {
        model: 'icon4.glb',
        canvasId: 'canvas4',
        size: { width: 160, height: 160 },
        position: { x: 0, y: -0.12, z: 0 },
        scale: 0.9,
        rotation: { x: 0.1, y: Math.PI - 0.35, z: -0.05 },
        bounce: { velocity: 0.0062, amplitude: 0.07 },
        spin: { speed: 0.0038, amplitude: 0.3, continuous: 0.6 },
        resolution: 0.4,
        center: true,
        cameraZ: 2.5,
        palette: 'heart',
    },
];

const palettes = {
    w: {
        ambient: [0xCC9900, 2],
        lights: [[0xFF8C00, 2.5, [500, 500, 0]]],
        material: { color: 0xFF4400, emissive: 0xFF5500, shininess: 35 },
    },
    sun: {
        // Dimmer so the disk keeps midtones (avoids ASCII black hole) + orange shading
        ambient: [0xFFAA33, 0.55],
        lights: [
            [0xFFE066, 1.6, [3, 2, 4]],
            [0xFF6600, 1.1, [-2, -1, 2]],
        ],
        material: { color: 0xFFB000, emissive: 0x663300, shininess: 22, flatShading: false },
        rayMaterial: { color: 0xFF9900, emissive: 0x884400, shininess: 30, flatShading: true },
    },
    lightning: {
        ambient: [0xFFE066, 0.5],
        lights: [
            [0xFFF2A0, 2.2, [2, 4, 3]],
            [0xFFAA00, 0.9, [-3, -1, 2]],
        ],
        material: { color: 0xFFE566, emissive: 0x886600, shininess: 40, flatShading: true },
    },
    heart: {
        ambient: [0xC44DFF, 0.85],
        lights: [
            [0xE090FF, 2.6, [3, 2, 4]],
            [0xA711F2, 1.2, [-2, -1, 1]],
        ],
        material: { color: 0xD060FF, emissive: 0x8A20E0, shininess: 35, flatShading: true },
    },
};

let scenes = [];
let cameras = [];
let renderers = [];
let controls = [];
let asciiEffects = [];
let draggableObjects = [];
let bounceStates = [];
let rotationStates = [];
let iconConfigs = [];

icons.forEach((config, index) => {
    const canvasElement = document.getElementById(config.canvasId);
    if (!canvasElement) return;

    const { scene, camera, renderer, control, asciiEffect } = initScene(index, config, canvasElement);
    scenes.push(scene);
    cameras.push(camera);
    renderers.push(renderer);
    controls.push(control);
    asciiEffects.push(asciiEffect);
    iconConfigs.push(config);
    rotationStates.push({ ...config.spin });
});

function resolveSize(config) {
    const base = config.size;
    if (window.innerWidth > 768) return { ...base };

    if (config.canvasId === 'canvas1') {
        const side = Math.max(220, Math.min(base.width, window.innerWidth - 40));
        return { width: side, height: side };
    }

    // Match mobile CSS for section icons
    return { width: 140, height: 140 };
}

function makeMaterial({ color, emissive, shininess = 35, flatShading = false, specular = 0xFFD700 }) {
    return new THREE.MeshPhongMaterial({
        color,
        emissive,
        specular,
        shininess,
        flatShading,
    });
}

function initScene(index, config, canvasElement) {
    const size = resolveSize(config);
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
        75,
        size.width / size.height,
        0.1,
        1000
    );

    const renderer = new THREE.WebGLRenderer({
        antialias: true,
        canvas: canvasElement,
        preserveDrawingBuffer: true,
        alpha: false,
    });
    renderer.setSize(size.width, size.height);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setClearColor(0x000000, 1);

    const asciiEffect = new AsciiEffect(renderer, ' .,:;i1tfLCG08●○', {
        invert: false,
        resolution: config.resolution ?? 0.15,
        scale: 1,
        color: true,
    });
    asciiEffect.setSize(size.width, size.height);
    asciiEffect.domElement.classList.add('ascii-canvas');
    asciiEffect.domElement.id = `ascii-${config.canvasId}`;
    asciiEffect.domElement.style.backgroundColor = 'black';

    const asciiTable = asciiEffect.domElement.querySelector('table');
    if (asciiTable) {
        asciiTable.style.fontFamily = 'IMWritingMono Nerd Font, monospace';
        if (config.fontSize) {
            asciiTable.style.fontSize = config.fontSize;
            asciiTable.style.lineHeight = config.lineHeight ?? config.fontSize;
            asciiTable.style.letterSpacing = '0px';
        }
    }

    canvasElement.parentNode.replaceChild(asciiEffect.domElement, canvasElement);

    const palette = palettes[config.palette] || palettes.w;
    scene.add(new THREE.AmbientLight(palette.ambient[0], palette.ambient[1]));
    palette.lights.forEach(([color, intensity, pos]) => {
        const light = new THREE.DirectionalLight(color, intensity);
        light.position.set(...pos);
        scene.add(light);
    });

    const loader = new GLTFLoader();
    loader.load(`models/${config.model}?t=${Date.now()}`, (gltf) => {
        const model = gltf.scene;

        model.traverse((child) => {
            if (!child.isMesh) return;

            if (config.palette === 'sun' && child.name.startsWith('ray_') && palette.rayMaterial) {
                child.material = makeMaterial(palette.rayMaterial);
            } else {
                child.material = makeMaterial(palette.material);
            }
        });

        model.scale.set(config.scale, config.scale, config.scale);

        const pivot = new THREE.Group();
        if (config.center) {
            const box = new THREE.Box3().setFromObject(model);
            const center = box.getCenter(new THREE.Vector3());
            model.position.sub(center);
        }
        pivot.add(model);
        pivot.rotation.set(config.rotation.x, config.rotation.y, config.rotation.z);
        pivot.position.set(config.position.x, config.position.y, config.position.z);

        scene.add(pivot);
        draggableObjects[index] = pivot;
        bounceStates[index] = {
            y: 0,
            velocity: config.bounce.velocity,
            amplitude: config.bounce.amplitude
        };
    }, undefined, (error) => {
        console.error("An error happened while loading the model:", error);
    });

    const homeZ = config.cameraZ ?? 3;
    camera.position.set(0, 0, homeZ);

    const control = new OrbitControls(camera, asciiEffect.domElement);
    control.enableDamping = true;
    control.dampingFactor = 0.05;
    control.enableZoom = false;

    asciiEffect.domElement.addEventListener('dblclick', (event) => {
        event.preventDefault();

        const currentDistance = camera.position.distanceTo(control.target);
        if (currentDistance > homeZ - 0.5) {
            camera.position.lerp(control.target, 0.15);
        } else {
            camera.position.set(0, 0, homeZ);
        }

        camera.lookAt(control.target);
    });

    return { scene, camera, renderer, control, asciiEffect };
}

function animate() {
    requestAnimationFrame(animate);

    scenes.forEach((scene, index) => {
        const camera = cameras[index];
        const control = controls[index];
        const asciiEffect = asciiEffects[index];
        const config = iconConfigs[index];

        if (control) {
            control.update();
        }

        if (draggableObjects[index] && scene.children.includes(draggableObjects[index])) {
            const bounceState = bounceStates[index];
            bounceState.y = Math.sin(Date.now() * bounceState.velocity) * bounceState.amplitude;
            draggableObjects[index].position.y = config.position.y + bounceState.y;

            const rotationState = rotationStates[index];
            const now = Date.now();
            const sway = Math.sin(now * rotationState.speed) * rotationState.amplitude;

            if (rotationState.continuous) {
                // Steady Y spin — don't add sway on Y or it stalls/reverses
                draggableObjects[index].rotation.y =
                    config.rotation.y + now * rotationState.continuous * 0.001;
                draggableObjects[index].rotation.z = config.rotation.z + sway * 0.35;
            } else {
                draggableObjects[index].rotation.y = config.rotation.y + sway;
            }
        }

        asciiEffect.render(scene, camera);
    });
}

animate();

window.addEventListener('resize', () => {
    scenes.forEach((scene, index) => {
        const camera = cameras[index];
        const asciiEffect = asciiEffects[index];
        const config = iconConfigs[index];
        const size = resolveSize(config);

        camera.aspect = size.width / size.height;
        camera.updateProjectionMatrix();
        asciiEffect.setSize(size.width, size.height);
    });
});
