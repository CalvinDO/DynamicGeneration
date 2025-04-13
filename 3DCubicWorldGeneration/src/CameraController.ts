import * as THREE from 'https://cdn.jsdelivr.net/npm/three/build/three.module.js';
//import * as THREE from 'three';

export class CameraController extends THREE.Object3D {

    public static instance: CameraController;

    private mouseTorqueFactor: number = 0.001;
    private maxXRotation: number = 90;
    private isXAxisInverted: boolean = false;
    private isYAxisInverted: boolean = false;
    private elapsedTime: number = 0;


    constructor() {
        super();

        CameraController.instance = this;

        window.addEventListener("mousemove", this.onMouseMove);
    }

    public update(_elapsedTime: number) {
        CameraController.instance.elapsedTime = _elapsedTime;
    }

    public onMouseMove(_event: MouseEvent) {

        let yRotation: number = CameraController.instance.rotation.y + (CameraController.instance.isYAxisInverted ? 1 : -1) * _event.movementX * CameraController.instance.mouseTorqueFactor * CameraController.instance.elapsedTime;


        let xIncrement: number = (CameraController.instance.isXAxisInverted ? 1 : -1) * _event.movementY * CameraController.instance.mouseTorqueFactor * CameraController.instance.elapsedTime;
        let currentX: number = CameraController.instance.rotation.x;
        let nextFrameX: number = xIncrement + currentX;

        if (nextFrameX > CameraController.instance.maxXRotation) {
            xIncrement = CameraController.instance.maxXRotation - currentX;
        }

        if (nextFrameX < -CameraController.instance.maxXRotation) {
            xIncrement = -CameraController.instance.maxXRotation - currentX;
        }

        let xRotation: number = CameraController.instance.rotation.x + xIncrement;
        CameraController.instance.rotation.setFromVector3(new THREE.Vector3(xRotation, yRotation, 0));

        //CameraController.instance.node.mtxLocal.rotation.z = 0;
    }
}