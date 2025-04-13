export class Noise {
    static getRandom() {
        return Math.random();
    }
    static rotateLeft(value, bits) {
        return ((value << bits) | (value >>> (32 - bits))) >>> 0;
    }
    static rotateRight(value, bits) {
        return ((value >>> bits) | (value << (32 - bits))) >>> 0;
    }
    static getPRNInt(_position) {
        let { x, y, z } = _position;
        x = x | 0;
        y = y | 0;
        z = z | 0;
        // Rotate input coordinates
        let hx = Noise.rotateLeft(((x ^ Noise.seed) ^ (0x74A21CC6 ^ Noise.seed)) * 0xA5A5A5A5, 5);
        let hy = Noise.rotateRight(((y ^ Noise.seed) ^ (0x3A8DB64C ^ Noise.seed)) * 0x7F4A7C15, 11);
        let hz = Noise.rotateLeft(((z ^ Noise.seed) ^ (0x5AF532B6 ^ Noise.seed)) * 0xC1C64E6D, 17);
        // Combine with further rotation-based mixing
        let hash = Noise.rotateLeft(hx ^ hy ^ hz, 13);
        hash = Noise.rotateRight(hash ^ Noise.seed, 7);
        hash = Noise.rotateLeft(hash * 0x27D4EB2F, 15);
        // Normalize to [-1, 1]
        return ((hash >>> 0) / 0xFFFFFFFF) * 2 - 1;
    }
}
Noise.externalSeed = 20072001; // Use uint seed for better randomness
Noise.seed = 0x85EBDA6A;
//# sourceMappingURL=Noise.js.map