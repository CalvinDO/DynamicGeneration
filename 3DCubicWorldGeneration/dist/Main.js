var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { loadThreeJs } from './three-loader.js';
let canvas;
let aspectRatio = 16 / 9;
let autoResizeInterval = 0.5;
let timeUntilNextAutoResize = autoResizeInterval;
let timeLastFrame = Date.now();
let deltaTime = 0;
function init(ev) {
    return __awaiter(this, void 0, void 0, function* () {
        const THREE = yield loadThreeJs();
        let camStartPos = new THREE.Vector3(50, 80, 150);
        let camStartRot = new THREE.Euler(-0.4, 0.0, 0.0);
        const { scene, renderer, camera } = setupSceneBasics();
        setupLight();
        // Create a shared material (all cubes will use this)
        const { boxGeometry, material } = createFlyweights();
        const worldSize = new THREE.Vector3(50, 50, 50);
        // GenerateCubes
        const cubes = generateCubes();
        animate();
        // -----------------------------------------------------------
        // ---------------- FUNCTION DECLERATIONS --------------------
        // -----------------------------------------------------------
        function generateCubes() {
            let cubes = [];
            let lowestCorner = worldSize.multiplyScalar(-0.5);
            let highestCorner = worldSize.multiplyScalar(0.5);
            for (let xIndex = lowestCorner.x; xIndex < highestCorner.x; xIndex++) {
                for (let yIndex = lowestCorner.y; yIndex < highestCorner.y; yIndex++) {
                    for (let zIndex = lowestCorner.z; zIndex < highestCorner.z; zIndex++) {
                        const currentPos = new THREE.Vector3(xIndex, yIndex, zIndex);
                        if (Noise.hash(currentPos) > 0.9) {
                            const newCube = instantiateCube(currentPos);
                            cubes.push(newCube);
                        }
                    }
                }
            }
            return cubes;
        }
        function createFlyweights() {
            const material = new THREE.MeshStandardMaterial({
                color: 0x00aaff,
                roughness: 0.5,
                metalness: 0.1
            });
            // Create the geometry (same geometry for both cubes)
            const boxGeometry = new THREE.BoxGeometry();
            return { boxGeometry, material };
        }
        function setupSceneBasics() {
            const scene = new THREE.Scene();
            const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
            camera.position.copy(camStartPos);
            camera.rotation.copy(camStartRot);
            const renderer = new THREE.WebGLRenderer({ antialias: true });
            renderer.setSize(window.innerWidth, window.innerHeight);
            renderer.shadowMap.enabled = true;
            document.body.appendChild(renderer.domElement);
            return { scene, renderer, camera };
        }
        function setupLight() {
            const directionalLight = new THREE.DirectionalLight(0xffffff, 0.88);
            directionalLight.position.set(-4, 5, 4);
            directionalLight.castShadow = true;
            scene.add(directionalLight);
            const ambientLight = new THREE.AmbientLight(0xffffff, 0.6180339);
            scene.add(ambientLight);
        }
        function instantiateCube(_position) {
            const newCube = new THREE.Mesh(boxGeometry, material);
            newCube.castShadow = true;
            newCube.receiveShadow = true;
            newCube.position.copy(_position); // Position the first cube at (-2, 0, 0)
            scene.add(newCube);
            return newCube;
        }
        // 9. Create an animate function to render the scene
        function animate() {
            let currentTime = Date.now();
            deltaTime = currentTime - timeLastFrame;
            deltaTime *= 0.001;
            timeLastFrame = currentTime;
            timeUntilNextAutoResize -= deltaTime;
            /*
            cubes.forEach(cube => {
                cube.rotation.x += 1 * deltaTime;
                cube.rotation.y += 1 * deltaTime;
            })
            */
            if (timeUntilNextAutoResize <= 0) {
                resizeCanvas();
                timeUntilNextAutoResize = autoResizeInterval;
            }
            renderer.render(scene, camera);
            requestAnimationFrame(animate);
        }
        // Resize canvas dynamically
        function resizeCanvas() {
            canvas = document.querySelector("canvas");
            const gl = canvas.getContext("webgl2", { antialias: true });
            if (!gl) {
                console.error("WebGL not supported");
                return;
            }
            const dpr = window.devicePixelRatio || 1; // Get the device pixel ratio
            const width = window.innerWidth * dpr; // Adjust canvas width based on DPR
            const height = window.innerHeight * dpr; // Adjust canvas height based on DPR
            aspectRatio = canvas.height / canvas.width;
            camera.aspect = 1 / aspectRatio; // Update the camera aspect ratio
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
        }
        window.addEventListener("resize", resizeCanvas);
        resizeCanvas();
    });
}
export class Noise {
    //public static LARGE_PRIME = 16807.234233123284755621;
    static getRandom() {
        return Math.random();
    }
    // Rotate function for better bit mixing
    static rotateLeft(v, shift) {
        return (v << shift) | (v >> (32 - shift));
    }
    // Hash step with improved seed mixing
    static hashStep(value, seed) {
        let rotAmount = 7 + (seed % 5);
        value ^= seed;
        value = Noise.rotateLeft(value, rotAmount);
        value *= 0x85EBCA6B;
        value = Noise.rotateLeft(value, rotAmount);
        value *= 0xC2B2AE35;
        return Noise.rotateLeft(value, rotAmount);
    }
    // Hash functions for different vector dimensions
    static hash(p) {
        let h1 = Noise.externalSeed * 0xDEADBEEF;
        let h2 = 0xC2B2AE35 + Noise.externalSeed;
        let h3 = Noise.externalSeed * 0xB5F4A35E + 0x2DA38F7A;
        h1 = Noise.hashStep((p.x), h1);
        h2 = Noise.hashStep((p.y), h2);
        h3 = Noise.hashStep((p.z), h3);
        let finalHash = h1 ^ Noise.rotateLeft(h2, 13);
        finalHash ^= Noise.rotateLeft(h3, 13);
        return (finalHash & 0x7fffffff) / (0x7fffffff);
    }
}
Noise.externalSeed = 20072001; // Use uint seed for better randomness
window.addEventListener("load", init);
//# sourceMappingURL=Main.js.map