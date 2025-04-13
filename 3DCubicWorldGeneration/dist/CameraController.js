import * as THREE from 'https://cdn.jsdelivr.net/npm/three/build/three.module.js';
//import * as THREE from 'three';
var Key;
(function (Key) {
})(Key || (Key = {}));
export class CameraController extends THREE.Object3D {
    //private deltatime: number = 0;
    constructor() {
        super();
        this.mouseTorqueFactor = 0.001;
        this.maxXRotation = Math.PI / 2;
        this.isXAxisInverted = false;
        this.isYAxisInverted = false;
        CameraController.instance = this;
        window.addEventListener("mousemove", this.onMouseMove);
        window.addEventListener("keydown", this.onKeyDown);
    }
    onKeyDown(_event) {
        if (_event.key == "w") {
            CameraController.instance.position.add({ x: 0, y: 0, z: 0.2 });
        }
    }
    update(_elapsedTime) {
        //CameraController.instance.elapsedTime = _elapsedTime;
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