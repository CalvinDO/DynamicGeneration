import * as THREE from 'https://cdn.jsdelivr.net/npm/three/build/three.module.js';
//import * as THREE from 'three';

export class Noise {

    private static seed = 0x01324641;
    private static LARGE_PRIME: number = 16807.234233123284755621;

    private static frequency = 0.02;
    private static amplitude = 1.00;
    private static base = 2.0;
    private static exponentFactor = 1;
    private static amountOctaves = 6;


    private static rotateLeft(value: number, bits: number): number {

        return ((value << bits) | (value >>> (32 - bits))) >>> 0;
    }

    private static rotateRight(value: number, bits: number): number {

        return ((value >>> bits) | (value << (32 - bits))) >>> 0;
    }

    private static getPRNInt(_position: THREE.Vector3) {

        let { x, y, z } = _position;

        x = x | 0;
        y = y | 0;
        z = z | 0;

        let hx = Noise.rotateLeft(((x ^ Noise.seed) ^ (0x71A21CC6 ^ Noise.seed)) * 0x4CA5A5A5, 5);
        let hy = Noise.rotateRight(((y ^ Noise.seed) ^ (0x4B8DB64C ^ Noise.seed)) * 0x334A7C15, 11);
        let hz = Noise.rotateLeft(((z ^ Noise.seed) ^ (0x5AF532B6 ^ Noise.seed)) * 0xA4C64E6D, 17);

        let hash = Noise.rotateLeft(hx ^ hy ^ hz, 13);
        hash = Noise.rotateRight(hash ^ Noise.seed, 7);
        hash = Noise.rotateLeft(hash * 0x0005EB2F, 15);

        return [((hash >>> 0) / 0xFFFFFFFF) * 2 - 1, hash];
    }

    private static fade(t: number): number {

        return t * t * t * (t * (t * 6.0 - 15.0) + 10.0);
    }

    private static grad(p: THREE.Vector3): THREE.Vector3 {

        const [, rawHash] = Noise.getPRNInt(p);
        const hash = rawHash * Noise.LARGE_PRIME;

        const theta = hash;
        const phi = Math.acos(2.0 * Noise.fract(hash * 0.61803398349875) - 1.0);

        return new THREE.Vector3(
            Math.cos(theta) * Math.sin(phi),
            Math.sin(theta) * Math.sin(phi),
            Math.cos(phi)
        );
    }

    private static fract(_input: number): number {
        return _input - Math.floor(_input);
    }

    private static noise(p: THREE.Vector3): number {

        const floorVec = (v: THREE.Vector3) => new THREE.Vector3(Math.floor(v.x), Math.floor(v.y), Math.floor(v.z));

        const p0 = floorVec(p);
        const p1 = p0.clone().add(new THREE.Vector3(1, 0, 0));
        const p2 = p0.clone().add(new THREE.Vector3(0, 1, 0));
        const p3 = p0.clone().add(new THREE.Vector3(1, 1, 0));
        const p4 = p0.clone().add(new THREE.Vector3(0, 0, 1));
        const p5 = p0.clone().add(new THREE.Vector3(1, 0, 1));
        const p6 = p0.clone().add(new THREE.Vector3(0, 1, 1));
        const p7 = p0.clone().add(new THREE.Vector3(1, 1, 1));

        const g0 = Noise.grad(p0);
        const g1 = Noise.grad(p1);
        const g2 = Noise.grad(p2);
        const g3 = Noise.grad(p3);
        const g4 = Noise.grad(p4);
        const g5 = Noise.grad(p5);
        const g6 = Noise.grad(p6);
        const g7 = Noise.grad(p7);

        const t0 = p.x - p0.x;
        const t1 = p.y - p0.y;
        const t2 = p.z - p0.z;

        const fade_t0 = Noise.fade(t0);
        const fade_t1 = Noise.fade(t1);
        const fade_t2 = Noise.fade(t2);

        const dot = (a: THREE.Vector3, b: THREE.Vector3) => a.dot(b);

        const p0p1 = (1.0 - fade_t0) * dot(g0, p.clone().sub(p0)) + fade_t0 * dot(g1, p.clone().sub(p1));
        const p2p3 = (1.0 - fade_t0) * dot(g2, p.clone().sub(p2)) + fade_t0 * dot(g3, p.clone().sub(p3));
        const front = (1.0 - fade_t1) * p0p1 + fade_t1 * p2p3;

        const p4p5 = (1.0 - fade_t0) * dot(g4, p.clone().sub(p4)) + fade_t0 * dot(g5, p.clone().sub(p5));
        const p6p7 = (1.0 - fade_t0) * dot(g6, p.clone().sub(p6)) + fade_t0 * dot(g7, p.clone().sub(p7));
        const back = (1.0 - fade_t1) * p4p5 + fade_t1 * p6p7;

        return (1.0 - fade_t2) * front + fade_t2 * back;
    }

    public static getNoise(_input: THREE.Vector3): number {


        let n = 0.0;

        for (let octaveIndex = 0; octaveIndex < Noise.amountOctaves; octaveIndex++) {

            const exponent = Noise.exponentFactor * octaveIndex;
            const currentFrequency = Noise.frequency * Math.pow(Noise.base, exponent);
            const currentAmp = Noise.amplitude * Math.pow(Noise.base, -exponent);

            const xIn = _input.x * currentFrequency;
            const yIn = _input.y * currentFrequency;
            const zIn = _input.z * currentFrequency;

            const noiseInput = new THREE.Vector3(xIn, yIn, zIn);
            const currentN = Noise.noise(noiseInput) * currentAmp;

            n += currentN;
        }

        return n;
    }
}
