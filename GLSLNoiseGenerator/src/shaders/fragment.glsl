precision highp float;
varying vec2 uv;
uniform float time;
uniform sampler2D noiseTexture;
uniform bool useHash;

// Fade function (smooth interpolation)
float fade(float t) {
    return t * t * t * (t * (t * 6.0 - 15.0) + 10.0);
}

// Pseudo-random hash function
float hash(float p) {
    return fract(sin(p * 127.1 + 311.7) * 43758.5453);
}

// Texture-based gradient lookup
float gradTexture(float p) {

    const float texture_width = 256.0;
    float v = texture2D(noiseTexture, vec2(mod(p, texture_width) / texture_width, 0.0)).r;
    return v > 0.5 ? 1.0 : -1.0;
}

// Gradient function with toggle
float grad(float p) {
    return useHash ? (hash(p) > 0.5 ? 1.0 : -1.0) : gradTexture(p);
}

// 1D Perlin-like noise function
float noise(float p) {

    float p0 = floor(p);
    float p1 = p0 + 1.0;
    float t = p - p0;
    float fade_t = fade(t);
    float g0 = grad(p0);
    float g1 = grad(p1);
    return mix(g0 * (p - p0), g1 * (p - p1), fade_t);
}

void main() {

    float frequency = 0.5;
    float speed = 0.2;
    float amplitude = 1.0;

    int amountOctaves = 8;

    //float n = noise(uv.x * frequency + time) * amplitude;
    /*
    float n = 0.0;

    for(int octaveIndex = 0; octaveIndex < amountOctaves; octaveIndex++) {
        float currentN = noise((uv.x * frequency + (time * speed)) * (1.5)) * 1.0 * amplitude;
        n += currentN;
    }
    */

    float n = noise(((uv.x + speed * time) * frequency) * (1.5)) * 1.0 * amplitude +
        noise(((uv.x + speed * time) * frequency) * (3.0)) * 0.5 * amplitude +
        noise(((uv.x + speed * time) * frequency) * (6.0)) * 0.25 * amplitude +
        noise(((uv.x + speed * time) * frequency) * (14.0)) * 0.125 * amplitude +
        noise(((uv.x + speed * time) * frequency) * (28.0)) * 0.0625 * amplitude +
        noise(((uv.x + speed * time) * frequency) * (56.0)) * 0.03125 * amplitude +
        noise(((uv.x + speed * time) * frequency) * (56.0 * 2.0)) * 0.015625 * amplitude +
        noise(((uv.x + speed * time) * frequency) * (56.0 * 4.0)) * 0.0078125 * amplitude;

    float y = 2.0 * (uv.y * (1.0)) - 1.0;

    vec3 color = n > y ? vec3(1.0) : vec3(0.0);

    gl_FragColor = vec4(color, 1.0);
}
