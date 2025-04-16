import * as THREE from 'https://cdn.jsdelivr.net/npm/three/build/three.module.js';
import { Camera } from 'three';
//import * as THREE from 'three';


//some data structure/pattern to story keyvalues (maybe with their ascii codes)
//example:
enum Key {
    W = 'w',
    A = 'a',
    S = 's',
    D = 'd',
    SHIFT = 'shift',
    SPACE = ' '  // Space key
}

interface KeyVectorMapping {
    [key: string]: THREE.Vector3;
}

export class CameraController extends THREE.Object3D {

    public static instance: CameraController;

    private static deltaTime: number = 0;
    private static speed: number = 100;

    private mouseTorqueFactor: number = 0.001;
    private maxXRotation: number = Math.PI / 2;
    private isXAxisInverted: boolean = false;
    private isYAxisInverted: boolean = false;
    //private deltatime: number = 0;
    private pressedKeys: Set<Key> = new Set();;

    private keyMappings: Record<Key, THREE.Vector3> = {
        [Key.W]: new THREE.Vector3(0, 0, -1),  // Forward
        [Key.S]: new THREE.Vector3(0, 0, 1), // Backward
        [Key.A]: new THREE.Vector3(-1, 0, 0), // Left
        [Key.D]: new THREE.Vector3(1, 0, 0),  // Right
        [Key.SPACE]: new THREE.Vector3(0, 1, 0), // Up
        [Key.SHIFT]: new THREE.Vector3(0, -1, 0), // Down
    };

    constructor() {
        super();

        CameraController.instance = this;

        window.addEventListener("mousemove", this.onMouseMove);

        // Use arrow functions to pass both parameters
        window.addEventListener("keydown", (event: KeyboardEvent) => this.handleKeyEvent('add', event));
        window.addEventListener("keyup", (event: KeyboardEvent) => this.handleKeyEvent('remove', event));
    }

    private handleKeyEvent(action: 'add' | 'remove', _event: KeyboardEvent) {

        const key = _event.key === ' ' ? Key.SPACE : Key[_event.key.toUpperCase() as keyof typeof Key];

        if (key) {
            // Add or remove the key from pressedKeys based on the action
            action === 'add' ? this.pressedKeys.add(key) : this.pressedKeys.delete(key);
        }
    }

    public update(_deltaTime: number) {

        CameraController.deltaTime = _deltaTime;


        const movementVector = new THREE.Vector3();

        // Check all pressed keys and add corresponding vector to movement vector
        CameraController.instance.pressedKeys.forEach(key => {
            const direction = CameraController.instance.keyMappings[key];
            if (direction) {
                movementVector.add(direction);
            }
        });

        // Normalize movement vector if it's not zero
        if (movementVector.length() > 0) {

            movementVector.normalize();

            this.applyCameraRotationToMovement(movementVector);

            CameraController.instance.accelerateTowardsNormalized(movementVector);
        }
    }

    private applyCameraRotationToMovement(movementVector: THREE.Vector3) {
        // Create a rotation matrix based on the camera's world rotation
        let rotationMatrix = new THREE.Matrix4();
        rotationMatrix.identity().extractRotation(this.matrixWorld); // Extract camera rotation from its world matrix

        // Apply the rotation matrix to the movement vector
        movementVector.applyMatrix4(rotationMatrix);
    }

    private accelerateTowardsNormalized(direction: THREE.Vector3) {
        this.position.add(direction.clone().multiplyScalar(CameraController.deltaTime * CameraController.speed));
    }

    public onMouseMove(_event: MouseEvent) {

        let yRotation: number = CameraController.instance.rotation.y + (CameraController.instance.isYAxisInverted ? 1 : -1) * _event.movementX * CameraController.instance.mouseTorqueFactor /* CameraController.instance.elapsedTime*/;


        let xIncrement: number = (CameraController.instance.isXAxisInverted ? 1 : -1) * _event.movementY * CameraController.instance.mouseTorqueFactor/*CameraController.instance.elapsedTime*/;
        let currentX: number = CameraController.instance.rotation.x;
        let nextFrameX: number = xIncrement + currentX;

        if (nextFrameX > CameraController.instance.maxXRotation) {
            xIncrement = CameraController.instance.maxXRotation - currentX;
        }

        if (nextFrameX < -CameraController.instance.maxXRotation) {
            xIncrement = -CameraController.instance.maxXRotation - currentX;
        }

        let xRotation: number = CameraController.instance.rotation.x + xIncrement;
        CameraController.instance.rotation.setFromVector3(new THREE.Vector3(xRotation, yRotation, 0), 'YXZ');

        //CameraController.instance.node.mtxLocal.rotation.z = 0;
    }
}