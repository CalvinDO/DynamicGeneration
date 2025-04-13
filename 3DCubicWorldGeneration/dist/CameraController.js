import * as THREE from 'https://cdn.jsdelivr.net/npm/three/build/three.module.js';
//import * as THREE from 'three';
//some data structure/pattern to story keyvalues (maybe with their ascii codes)
//example:
var Key;
(function (Key) {
    Key["W"] = "w";
    Key["A"] = "a";
    Key["S"] = "s";
    Key["D"] = "d";
    Key["SHIFT"] = "shift";
    Key["SPACE"] = " "; // Space key
})(Key || (Key = {}));
export class CameraController extends THREE.Object3D {
    ;
    constructor() {
        super();
        this.mouseTorqueFactor = 0.001;
        this.maxXRotation = Math.PI / 2;
        this.isXAxisInverted = false;
        this.isYAxisInverted = false;
        //private deltatime: number = 0;
        this.pressedKeys = new Set();
        this.keyMappings = {
            [Key.W]: new THREE.Vector3(0, 0, 1), // Forward
            [Key.S]: new THREE.Vector3(0, 0, -1), // Backward
            [Key.A]: new THREE.Vector3(-1, 0, 0), // Left
            [Key.D]: new THREE.Vector3(1, 0, 0), // Right
            [Key.SPACE]: new THREE.Vector3(0, 1, 0), // Up
            [Key.SHIFT]: new THREE.Vector3(0, -1, 0), // Down
        };
        CameraController.instance = this;
        window.addEventListener("mousemove", CameraController.instance.onMouseMove);
        // Use arrow functions to pass both parameters
        window.addEventListener("keydown", (event) => this.handleKeyEvent('add', event));
        window.addEventListener("keyup", (event) => this.handleKeyEvent('remove', event));
    }
    handleKeyEvent(action, _event) {
        const key = _event.key === ' ' ? Key.SPACE : Key[_event.key.toUpperCase()];
        if (key) {
            // Add or remove the key from pressedKeys based on the action
            action === 'add' ? this.pressedKeys.add(key) : this.pressedKeys.delete(key);
        }
    }
    update(_deltaTime) {
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
            CameraController.instance.accelerateTowardsNormalized(movementVector);
        }
    }
    accelerateTowardsNormalized(direction) {
        // Implement your custom acceleration logic here.
        console.log('Accelerating towards:', direction);
    }
    onMouseMove(_event) {
        let yRotation = CameraController.instance.rotation.y + (CameraController.instance.isYAxisInverted ? 1 : -1) * _event.movementX * CameraController.instance.mouseTorqueFactor /* CameraController.instance.elapsedTime*/;
        let xIncrement = (CameraController.instance.isXAxisInverted ? 1 : -1) * _event.movementY * CameraController.instance.mouseTorqueFactor /*CameraController.instance.elapsedTime*/;
        let currentX = CameraController.instance.rotation.x;
        let nextFrameX = xIncrement + currentX;
        if (nextFrameX > CameraController.instance.maxXRotation) {
            xIncrement = CameraController.instance.maxXRotation - currentX;
        }
        if (nextFrameX < -CameraController.instance.maxXRotation) {
            xIncrement = -CameraController.instance.maxXRotation - currentX;
        }
        let xRotation = CameraController.instance.rotation.x + xIncrement;
        CameraController.instance.rotation.setFromVector3(new THREE.Vector3(xRotation, yRotation, 0), 'YXZ');
        //CameraController.instance.node.mtxLocal.rotation.z = 0;
    }
}
//# sourceMappingURL=CameraController.js.map