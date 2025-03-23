#version 300 es
precision highp float;

in vec2 uv;              // Input UV coordinates
uniform float time;      // Time uniform
uniform float pixelRatio;

out vec4 fragColor;      // Output color

const uint externalSeed = 194823u; // Use uint seed for better randomness
const float LARGE_PRIME = 16807.234233123f;

// Rotate function for better bit mixing
uint rotateLeft(uint v, uint shift) {
    return (v << shift) | (v >> (32u - shift));
}

// Hash step with improved seed mixing
uint hashStep(uint value, uint seed) {
    uint rotAmount = 7u + (seed % 5u);
    value ^= seed;
    value = rotateLeft(value, rotAmount);
    value *= 0x85EBCA6Bu;
    value = rotateLeft(value, rotAmount);
    value *= 0xC2B2AE35u;
    return rotateLeft(value, rotAmount);
}

// Hash functions for different vector dimensions
float hash(vec2 p) {
    uint h1 = externalSeed * 0xDEADBEEFu;
    uint h2 = 0xC2B2AE35u + externalSeed;

    h1 = hashStep(uint(p.x), h1);
    h2 = hashStep(uint(p.y), h2);

    uint finalHash = h1 ^ rotateLeft(h2, 13u);

    return float(finalHash & 0x7fffffffu) / float(0x7fffffff);
}

/*
float hash(ivec3 p) {
    uint h1 = externalSeed * 0xDEADBEEFu;
    uint h2 = 0xC2B2AE35u + externalSeed;

    h1 = hashStep(uint(p.x), h1);
    h2 = hashStep(uint(p.y), h2);
    h1 = hashStep(uint(p.z), h1);

    uint finalHash = h1 ^ rotateLeft(h2, 13u);
    return float(finalHash & 0x7fffffffu) / float(0x7fffffff);
}

float hash(ivec4 p) {
    uint h1 = externalSeed * 0xDEADBEEFu;
    uint h2 = 0xC2B2AE35u + externalSeed;

    h1 = hashStep(uint(p.x), h1);
    h2 = hashStep(uint(p.y), h2);
    h1 = hashStep(uint(p.z), h1);
    h2 = hashStep(uint(p.w), h2);

    uint finalHash = h1 ^ rotateLeft(h2, 13u);
    return float(finalHash & 0x7fffffffu) / float(0x7fffffff);
}
*/

// Fade function (smooth interpolation)
float fade(float t) {
    return t * t * t * (t * (t * 6.0f - 15.0f) + 10.0f);
}

/*
// Texture-based gradient lookup
float gradTexture(float p) {
    const float texture_width = 256.0f;
    float v = texture(noiseTexture, vec2(mod(p, texture_width) / texture_width, 0.0f)).r;
    return v > 0.5f ? 1.0f : -1.0f;
}
*/

// Gradient function for generating random gradients in the range (-1, 1) in 2D
vec2 grad(vec2 p) {

    float hash = hash(p);
    hash = hash * LARGE_PRIME;
    return (vec2(cos(hash), sin(hash)));
}

// 1D Perlin-like noise function
float noise(vec2 p) {
    /*
    float p0 = floor(p.x);
    float p1 = p0 + 1.0f;
    float t = p.x - p0;
    float fade_t = fade(t);
    float g0 = grad(p0);
    float g1 = grad(p1);
    return mix(g0 * (p.x - p0), g1 * (p.x - p1), fade_t);
    */

    /* Calculate lattice points. */
    vec2 p0 = floor(p);
    vec2 p1 = p0 + vec2(1.0f, 0.0f);
    vec2 p2 = p0 + vec2(0.0f, 1.0f);
    vec2 p3 = p0 + vec2(1.0f, 1.0f);

    /* Look up gradients at lattice points. */
    vec2 g0 = grad(p0);
    vec2 g1 = grad(p1);
    vec2 g2 = grad(p2);
    vec2 g3 = grad(p3);

    float t0 = p.x - p0.x;
    float fade_t0 = fade(t0); /* Used for interpolation in horizontal direction */

    float t1 = p.y - p0.y;
    float fade_t1 = fade(t1); /* Used for interpolation in vertical direction. */

    /* Calculate dot products and interpolate.*/
    float p0p1 = (1.0f - fade_t0) * dot(g0, (p - p0)) + fade_t0 * dot(g1, (p - p1)); /* between upper two lattice points */
    float p2p3 = (1.0f - fade_t0) * dot(g2, (p - p2)) + fade_t0 * dot(g3, (p - p3)); /* between lower two lattice points */

    /* Calculate final result */
    return (1.0f - fade_t1) * p0p1 + fade_t1 * p2p3;
}

vec3 hsl2rgb(in vec3 c) {
    vec3 rgb = clamp(abs(mod(c.x * 6.0f + vec3(0.0f, 4.0f, 2.0f), 6.0f) - 3.0f) - 1.0f, 0.0f, 1.0f);

    return c.z + c.y * (rgb - 0.5f) * (1.0f - abs(2.0f * c.z - 1.0f));
}

void main() {

    float frequency = 3.0f;
    float speed = 0.1f;
    float amplitude = 1.0f;

    float base = 2.0f;
    float exponentFactor = 0.314f;
    const int amountOctaves = 25;

    //vec2 startOffset = vec2(70.0f, 70.0f);
    float startOffset = 0.0f;

    float n = 0.0f;

    // Sum the noise for each octave
    for(int octaveIndex = 0; octaveIndex < amountOctaves; octaveIndex++) {
        float currentFrequency = frequency * pow(base, exponentFactor * float(octaveIndex));
        float currentAmp = amplitude * pow(base, -exponentFactor * float(octaveIndex));

        //float timeSmooth = mod(time * 0.1f, 100.0f);

        float xIn = (uv.x + startOffset + speed * time) * currentFrequency;
        float yIn = (uv.y + startOffset + speed * time) * currentFrequency;

        float currentN = noise(vec2(xIn, yIn * pixelRatio))  * currentAmp;
        n += currentN;
    }

    // Y-coordinate for the comparison
    //float y = 2.0f * (uv.y * (1.0f)) - 1.0f;

    // Decide the color based on noise and comparison
    //vec3 color = n > y ? vec3(1.0f) : vec3(0.0f);
    vec3 color = hsl2rgb(vec3(n, 1.0f, 0.5f));
    fragColor = vec4(color, 1.0f);  // Set the output color
}
