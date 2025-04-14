import * as THREE from 'three';

export class Noise {

    public static externalSeed: number = 20072001; // Use uint seed for better randomness
    public static seed = 0x85EBDA6A;

    public static getRandom(): number {
        return Math.random();
    }

    public static rotateLeft(value: number, bits: number): number {
        return ((value << bits) | (value >>> (32 - bits))) >>> 0;
    }

    public static rotateRight(value: number, bits: number): number {
        return ((value >>> bits) | (value << (32 - bits))) >>> 0;
    }

    public static getPRNInt(_position: THREE.Vector3): number {

        let { x, y, z } = _position;

        x = x | 0;
        y = y | 0;
        z = z | 0;

        // Rotate input coordinates
        let hx = Noise.rotateLeft(((x ^ Noise.seed) ^ (0x04A21CC6 ^ Noise.seed)) * 0x05A5A5A5, 5);
        let hy = Noise.rotateRight(((y ^ Noise.seed) ^ (0x0D8DB64C ^ Noise.seed)) * 0x0F4A7C15, 11);
        let hz = Noise.rotateLeft(((z ^ Noise.seed) ^ (0x0BF532B6 ^ Noise.seed)) * 0x01C64E6D, 17);

        // Combine with further rotation-based mixing
        let hash = Noise.rotateLeft(hx ^ hy ^ hz, 13);
        hash = Noise.rotateRight(hash ^ Noise.seed, 7);
        hash = Noise.rotateLeft(hash * 0x27D4EB2F, 15);

        // Normalize to [-1, 1]
        return ((hash >>> 0) / 0xFFFFFFFF) * 2 - 1;
    }
}
