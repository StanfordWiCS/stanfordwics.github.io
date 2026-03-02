import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { AsciiEffect } from 'three/addons/effects/AsciiEffect.js';

const iconModels = ['icon1.glb']; 
const iconPositions = [
    { x: 0.8, y: -0.4, z: 1.4 }
];

const canvasSizes = [
    { width: 500, height: 500 }
];

let scenes = [];
let cameras = [];
let renderers = [];
let controls = [];
let asciiEffects = [];
let draggableObjects = [];
let bounceStates = [];
let rotationStates = [];

iconModels.forEach((model, index) => {
    const { scene, camera, renderer, control, asciiEffect } = initScene(index, model);
    scenes.push(scene);
    cameras.push(camera);
    renderers.push(renderer);
    controls.push(control);
    asciiEffects.push(asciiEffect);
    rotationStates.push({
        speed: 0.003,  
        amplitude: 0.3  
    });
});

function initScene(index, modelFile) {
    const scene = new THREE.Scene();

    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const context = canvas.getContext('2d');

    const gradient = context.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, '#ec4899');
    gradient.addColorStop(1, '#b8860b');

    context.fillStyle = gradient;
    context.fillRect(0, 0, canvas.width, canvas.height);

    const texture = new THREE.CanvasTexture(canvas);
    scene.background = texture;
    
    const camera = new THREE.PerspectiveCamera(
        75,
        canvasSizes[index].width / canvasSizes[index].height,
        0.1,
        1000
    );
    
    const canvasElement = document.getElementById(`canvas${index + 1}`);
    const renderer = new THREE.WebGLRenderer({ 
        antialias: true, 
        canvas: canvasElement
    });
    renderer.setSize(canvasSizes[index].width, canvasSizes[index].height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    const asciiEffect = new AsciiEffect(renderer, ' .:-=+*#%@█▓▒░', { // .,:;i1tfLCG08○
        invert: false,
        resolution: 0.22,
        scale: 1,
        color: true,
        backgroundColor: 'white',
    });
    asciiEffect.setSize(canvasSizes[index].width, canvasSizes[index].height);
    asciiEffect.domElement.className = 'canvas-embed';
    asciiEffect.domElement.style.backgroundColor = 'transparent';
    asciiEffect.domElement.style.color = 'white';
    asciiEffect.domElement.style.fontFamily = 'IMWritingMono Nerd Font, monospace';
    asciiEffect.domElement.style.fontSize = '6px';
    asciiEffect.domElement.style.lineHeight = '6px';
    asciiEffect.domElement.style.letterSpacing = '0px';
    
    canvasElement.parentNode.replaceChild(asciiEffect.domElement, canvasElement);

    const ambientLight = new THREE.AmbientLight(0xCC9900, 2);  
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xFF8C00, 2.5);  
    directionalLight.position.set(500, 500, 0);
    scene.add(directionalLight);

    const loader = new GLTFLoader();
    loader.load(`models/${modelFile}?t=${Date.now()}`, (gltf) => {
        const model = gltf.scene;
        
        model.traverse((child) => {
            if (child.isMesh) {
                child.material = new THREE.MeshPhongMaterial({
                    color: 0x010000,
                    emissive: 0x333333,
                    specular: 0x333333,
                    shininess: 35
                });
            }
        });
        
        model.scale.set(0.01, 0.01, 0.01);
        model.rotation.z = Math.PI * 1;
        model.rotation.y = Math.PI * 0.1;
        model.rotation.x = Math.PI * 0.65; 
        
        model.position.set(
            iconPositions[index].x,
            iconPositions[index].y,
            iconPositions[index].z
        );
        
        scene.add(model);
        draggableObjects.push(model);
        bounceStates.push({
            y: 0,
            velocity: 0.005,
            amplitude: 0.1
        });
    }, undefined, (error) => {
        console.error("An error happened while loading the model:", error);
    });

    camera.position.set(0, 0, 3);

    const control = new OrbitControls(camera, asciiEffect.domElement);
    control.enableDamping = true;
    control.dampingFactor = 0.05;
    control.enableZoom = false; // Disable mouse wheel zoom

    // Add double-click zoom functionality
    asciiEffect.domElement.addEventListener('dblclick', (event) => {
        event.preventDefault();
        
        const currentDistance = camera.position.distanceTo(control.target);
        if (currentDistance > 2.5) {
            camera.position.lerp(control.target, 0.15);
        } else {
            camera.position.set(0, 0, 3);
        }
        
        camera.lookAt(control.target);
    });

    return { scene, camera, renderer, control, asciiEffect };
}

function animate() {
    if (document.hidden) return;
    requestAnimationFrame(animate);

    scenes.forEach((scene, index) => {
        const camera = cameras[index];
        const control = controls[index];
        const asciiEffect = asciiEffects[index];

        if (control) {
            control.update();
        }

        if (draggableObjects[index] && scene.children.includes(draggableObjects[index])) {
            const bounceState = bounceStates[index];
            bounceState.y = Math.sin(Date.now() * bounceState.velocity) * bounceState.amplitude;
            draggableObjects[index].position.y = iconPositions[index].y + bounceState.y;

            const rotationState = rotationStates[index];
            draggableObjects[index].rotation.y = Math.sin(Date.now() * rotationState.speed) * rotationState.amplitude;
        }

        asciiEffect.render(scene, camera);
    });
}

animate();

document.addEventListener('visibilitychange', () => {
    document.body.classList.toggle('page-hidden', document.hidden);
    if (!document.hidden) animate();
});
if (document.hidden) document.body.classList.add('page-hidden');

function getCanvasSize(index) {
    const base = canvasSizes[index];
    const w = window.innerWidth;
    if (w <= 480) {
        const size = Math.min(300, w - 32);
        return { width: size, height: size };
    }
    if (w <= 768) {
        const size = Math.min(400, w - 32);
        return { width: size, height: size };
    }
    return base;
}

function updateCanvasSizes() {
    scenes.forEach((scene, index) => {
        const camera = cameras[index];
        const renderer = renderers[index];
        const asciiEffect = asciiEffects[index];
        const size = getCanvasSize(index);
        
        renderer.setSize(size.width, size.height);
        camera.aspect = size.width / size.height;
        camera.updateProjectionMatrix();
        asciiEffect.setSize(size.width, size.height);
    });
}

window.addEventListener('resize', updateCanvasSizes);
updateCanvasSizes();