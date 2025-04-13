import * as THREE from 'https://cdn.jsdelivr.net/npm/three/build/three.module.js';
//import * as THREE from 'three';

enum Key{

}

export class CameraController extends THREE.Object3D {

    public static instance: CameraController;

    private mouseTorqueFactor: number = 0.001;
    private maxXRotation: number = Math.PI / 2;
    private isXAxisInverted: boolean = false;
    private isYAxisInverted: boolean = false;
    //private deltatime: number = 0;

    

    constructor() {
        super();

        CameraController.instance = this;
        
        window.addEventListener("mousemove", this.onMouseMove);
        window.addEventListener("keydown", this.onKeyDown);
    }

    public onKeyDown(_event: KeyboardEvent) {
        if (_event.key == "w") {
            CameraController.instance.position.add({ x: 0, y: 0, z: 0.2 });
        }
    }

    public update(_elapsedTime: number) {
        //CameraController.instance.elapsedTime = _elapsedTime;
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