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
    renderer.setPixelRatio(window.devicePixelRatio);

    // Create ASCII effect
    const asciiEffect = new AsciiEffect(renderer, ' .,:;i1tfLCG08●○', { 
        invert: false,
        resolution: 0.15,
        scale: 1,
        color: true,
        backgroundColor: '#000000',
    });
    asciiEffect.setSize(canvasSizes[index].width, canvasSizes[index].height);
    asciiEffect.domElement.style.backgroundColor = 'black';
    asciiEffect.domElement.style.fontFamily = 'IMWritingMono Nerd Font, monospace';
    asciiEffect.domElement.style.fontSize = '6px';
    asciiEffect.domElement.style.lineHeight = '6px';
    asciiEffect.domElement.style.letterSpacing = '0px';
    
    // Replace the canvas with ASCII effect element
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
                    color: 0xFF4400,  
                    emissive: 0xFF5500,   
                    specular: 0xFFD700,  
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
            
            // Apply oscillating rotation
            const rotationState = rotationStates[index];
            draggableObjects[index].rotation.y = Math.sin(Date.now() * rotationState.speed) * rotationState.amplitude;
        }

        asciiEffect.render(scene, camera);
    });
}

animate();

window.addEventListener('resize', () => {
    scenes.forEach((scene, index) => {
        const camera = cameras[index];
        const asciiEffect = asciiEffects[index];
        
        camera.aspect = canvasSizes[index].width / canvasSizes[index].height;
        camera.updateProjectionMatrix();
        asciiEffect.setSize(canvasSizes[index].width, canvasSizes[index].height);
    });
});