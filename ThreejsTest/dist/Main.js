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
var ThreejsTest;
(function (ThreejsTest) {
    let canvas;
    let aspectRatio = 16 / 9;
    let autoResizeInterval = 0.5;
    let timeUntilNextAutoResize = autoResizeInterval;
    let timeLastFrame = Date.now();
    let deltaTime = 0;
    function init(ev) {
        return __awaiter(this, void 0, void 0, function* () {
            const THREE = yield loadThreeJs();
            const { scene, renderer, camera } = setupSceneBasics();
            setupLight();
            // Create a shared material (all cubes will use this)
            const { boxGeometry, material } = createFlyweights();
            // GenerateCubes
            const cubes = generateCubes();
            animate();
            // -----------------------------------------------------------
            // ---------------- FUNCTION DECLERATIONS --------------------
            // -----------------------------------------------------------
            function generateCubes() {
                let meshes = [];
                const cube1 = instantiateCube(new THREE.Vector3(-1.5, 0, 0));
                const cube2 = instantiateCube(new THREE.Vector3(1.5, 0, 0));
                meshes.push(cube1, cube2);
                return meshes;
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
                camera.position.z = 5;
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
                cubes.forEach(cube => {
                    cube.rotation.x += 0.01;
                    cube.rotation.y += 0.01;
                });
                timeUntilNextAutoResize -= deltaTime;
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
    window.addEventListener("load", init);
})(ThreejsTest || (ThreejsTest = {}));
//# sourceMappingURL=Main.js.map