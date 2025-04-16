import { loadThreeJs } from './three-loader.js';
import { AmbientLight, DirectionalLight, Euler, Matrix4, Mesh, Vector2, Vector3 } from 'three';
import { Noise } from './Noise.js';
import { CameraController } from './CameraController.js';


let canvas: HTMLCanvasElement;
let aspectRatio: number = 16 / 9;

let autoResizeInterval: number = 0.5;
let timeUntilNextAutoResize: number = autoResizeInterval;

let timeLastFrame: number = Date.now();
let deltaTime: number = 0;

let flyControlsSpeed: number = 100;


async function init(ev: Event): Promise<void> {

    const THREE = await loadThreeJs();

    const clock = new THREE.Clock();

    let camStartPos: Vector3 = new THREE.Vector3(0, 0, 140);
    let camStartRot: Euler = new THREE.Euler(-0.0, 0.0, 0.0);

    const cameraController: CameraController = new CameraController();

    const { scene, renderer, camera } = setupSceneBasics();
    setupLight();


    // Create a shared material (all cubes will use this)
    const { boxGeometry, material } = createFlyweights();


    const worldSizeRadiusVector: Vector3 = new THREE.Vector3(50, 50, 50);

    // GenerateCubes
    generateCubes();



    animate();


    // -----------------------------------------------------------
    // ---------------- FUNCTION DECLERATIONS --------------------
    // -----------------------------------------------------------


    function generateCubes(): void {

        // Create an InstancedMesh to hold all cubes

        let lowestCorner: Vector3 = worldSizeRadiusVector.clone().multiplyScalar(-1);
        let highestCorner: Vector3 = lowestCorner.clone().add(worldSizeRadiusVector.clone().multiplyScalar(2));

        let matrices: Matrix4[] = [];
        let colors: number[] = [];

        let numbers: number[] = [];
        let positions: Vector3[] = [];

        let blockIndex = 0;

        for (let xIndex: number = lowestCorner.x; xIndex < highestCorner.x; xIndex++) {
            for (let yIndex: number = lowestCorner.y; yIndex < highestCorner.y; yIndex++) {
                for (let zIndex: number = lowestCorner.z; zIndex < highestCorner.z; zIndex++) {

                    const currentPos: Vector3 = (new THREE.Vector3(Math.floor(xIndex), Math.floor(yIndex), Math.floor(zIndex))).floor();

                    const pseudoRN = Noise.getNoise(currentPos);

                    numbers.push(pseudoRN);
                    positions.push(currentPos);

                    if (pseudoRN > 0.0 && pseudoRN < 0.10) {
                        const matrix = new THREE.Matrix4();
                        matrix.setPosition(currentPos);
                        matrices.push(matrix);

                        const color = new THREE.Color();
                        color.setHSL(pseudoRN, 0.718, 0.5);
                        colors.push(color.r, color.g, color.b);

                        blockIndex++;
                    }
                }
            }
        }

        //checkDuplicates(numbers, positions);

        const instanceCount = matrices.length;

        console.log("instances: ", instanceCount);

        const instanceMesh = new THREE.InstancedMesh(boxGeometry, material, instanceCount);
        instanceMesh.castShadow = true;
        instanceMesh.receiveShadow = true;

        matrices.forEach((matrix: Matrix4, index: number) => {
            instanceMesh.setMatrixAt(index, matrix);
        })

        const colorAttr = new THREE.InstancedBufferAttribute(new Float32Array(colors), 3);
        instanceMesh.instanceColor = colorAttr;

        scene.add(instanceMesh);
    }


    function checkDuplicates(_numbers: number[], positions: Vector3[]) {

        const uniqueElements = new Set();

        const duplicates: number[] = [];
        const posAtDup: Vector3[] = [];

        _numbers.forEach((item, index) => {
            if (uniqueElements.has(item)) {
                duplicates.push(item);
                posAtDup.push(positions[index]);
            } else {
                uniqueElements.add(item);
            }
        });

        console.log(duplicates.length);

        for (let i: number = 0; i < duplicates.length; i++) {
            console.log(posAtDup[i], duplicates[i]);
        }

    }

    function createFlyweights() {

        const blockTexture = (new THREE.TextureLoader).load('src/textures/wool_colored_white.png');

        blockTexture.magFilter = THREE.NearestFilter;
        blockTexture.minFilter = THREE.NearestFilter;
        blockTexture.generateMipmaps = false;

        const material = new THREE.MeshStandardMaterial({
            map: blockTexture,
            roughness: 0.94,
            metalness: 0.1
        });

        blockTexture.colorSpace = THREE.SRGBColorSpace;

        const boxGeometry = new THREE.BoxGeometry();

        return { boxGeometry, material };
    }


    function setupSceneBasics() {

        const scene = new THREE.Scene();

        const camera = new THREE.PerspectiveCamera(65, window.innerWidth / window.innerHeight, 0.1, 10000);

        cameraController.add(camera);
        cameraController.position.copy(camStartPos);
        cameraController.rotation.copy(camStartRot);

        scene.add(cameraController);

        const renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.shadowMap.enabled = true;
        renderer.shadowMap.type = THREE.PCFSoftShadowMap; // Soft shadows, or use PCFShadowMap for better performance.
        renderer.outputColorSpace = THREE.SRGBColorSpace;


        canvas = renderer.domElement;
        document.body.appendChild(canvas);


        canvas.addEventListener("click", async () => {
            await canvas.requestPointerLock();
        });

        return { scene, renderer, camera };
    }


    function setupLight() {
        const directionalLight: DirectionalLight = new THREE.DirectionalLight(0xffffff, 2.5);
        directionalLight.position.set(-4, 5, 4);
        directionalLight.castShadow = true;
        directionalLight.shadow.mapSize.set(2048, 2048);

        scene.add(directionalLight);


        const ambientLight: AmbientLight = new THREE.AmbientLight(0xffffff, 0.3);
        scene.add(ambientLight);
    }

    /*
    function instantiateCube(_position: Vector3): Mesh {

        const newCube = new THREE.Mesh(boxGeometry, material);

        newCube.castShadow = true;
        newCube.receiveShadow = true;
        newCube.position.copy(_position);// Position the first cube at (-2, 0, 0)

        scene.add(newCube);

        return newCube;
    }
*/

    // 9. Create an animate function to render the scene
    function animate() {

        const deltaTime = clock.getDelta();

        timeUntilNextAutoResize -= deltaTime;


        CameraController.instance.update(deltaTime);

        if (false) {
            boxGeometry.rotateX(1 * deltaTime);
            boxGeometry.rotateY(1 * deltaTime);
            boxGeometry.rotateZ(1 * deltaTime);
        }


        if (timeUntilNextAutoResize <= 0) {
            resizeCanvas();
            timeUntilNextAutoResize = autoResizeInterval;
        }

        renderer.render(scene, camera);

        requestAnimationFrame(animate);
    }

    function resizeCanvas() {

        const gl = canvas.getContext("webgl2", { antialias: true });

        if (!gl) {
            console.error("WebGL not supported");
            return;
        }

        const dpr = window.devicePixelRatio || 1;  // Get the device pixel ratio
        const width = window.innerWidth * dpr;    // Adjust canvas width based on DPR
        const height = window.innerHeight * dpr;  // Adjust canvas height based on DPR

        aspectRatio = canvas.height / canvas.width;

        camera.aspect = 1 / aspectRatio;  // Update the camera aspect ratio
        camera.updateProjectionMatrix();

        renderer.setSize(window.innerWidth, window.innerHeight);
    }

    window.addEventListener("resize", resizeCanvas);
    resizeCanvas();
}

window.addEventListener("load", init);
