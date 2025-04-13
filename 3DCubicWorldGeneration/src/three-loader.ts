// This will load THREE.js dynamically (you could also bundle it if needed).
export function loadThreeJs(): Promise<typeof import('three')> {
    return import('https://cdn.jsdelivr.net/npm/three/build/three.module.js');
}