#version 300 es
precision highp float;

in vec2 uv;              // Input UV coordinates
uniform float time;      // Time uniform
uniform float aspectRatio;

uniform vec3 startCameraPos;
uniform mat3 cameraRotation;
uniform float fov;
uniform float nearClipPlane;

out vec4 fragColor;      // Output color

const uint externalSeed = 20072001u; // Use uint seed for better randomness
const float LARGE_PRIME = 16807.234233123284755621f;

const float frequency = 10.0f;
const vec3 speed = vec3(0.00f, 0.0f, 0.3f);

const float amplitude = 1.0f;
// const float base = 2.7f;
//const float exponentFactor = 0.02f;
const float base = 2.0f;
const float exponentFactor = 1.0f;
const int amountOctaves = 4;

const float stepSize = 0.03f;
const float maxDist = 0.75f;
const float threshold = 0.01f;

const float absorptionCoefficient = 0.5f; // Absorption coefficient for Beer's law

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
float hash(vec3 p) {
    uint h1 = externalSeed * 0xDEADBEEFu;
    uint h2 = 0xC2B2AE35u + externalSeed;
    uint h3 = externalSeed * 0xB5F4A35Eu + 0x2DA38F7Au;

    h1 = hashStep(uint(p.x), h1);
    h2 = hashStep(uint(p.y), h2);
    h3 = hashStep(uint(p.z), h3);

    uint finalHash = h1 ^ rotateLeft(h2, 13u);
    finalHash ^= rotateLeft(h3, 13u);

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
vec3 grad(vec3 p) {

    float hash = hash(p);
    hash = hash * LARGE_PRIME;

    float theta = hash;
    float phi = acos(2.0f * fract(hash * 0.61803398349875f) - 1.0f);

    return vec3(cos(theta) * sin(phi), sin(theta) * sin(phi), cos(phi));
}

// 1D Perlin-like noise function
float noise(vec3 p) {

    /* Calculate lattice points. */
    vec3 p0 = floor(p);
    vec3 p1 = p0 + vec3(1.0f, 0.0f, 0.0f);
    vec3 p2 = p0 + vec3(0.0f, 1.0f, 0.0f);
    vec3 p3 = p0 + vec3(1.0f, 1.0f, 0.0f);
    vec3 p4 = p0 + vec3(0.0f, 0.0f, 1.0f);
    vec3 p5 = p0 + vec3(1.0f, 0.0f, 1.0f);
    vec3 p6 = p0 + vec3(0.0f, 1.0f, 1.0f);
    vec3 p7 = p0 + vec3(1.0f, 1.0f, 1.0f);

    /* Look up gradients at lattice points. */
    vec3 g0 = grad(p0);
    vec3 g1 = grad(p1);
    vec3 g2 = grad(p2);
    vec3 g3 = grad(p3);
    vec3 g4 = grad(p4);
    vec3 g5 = grad(p5);
    vec3 g6 = grad(p6);
    vec3 g7 = grad(p7);

    //fragColor = vec4(g0, 1.0f);  // Set the output color

    float t0 = p.x - p0.x;
    float fade_t0 = fade(t0); /* Used for interpolation in horizontal direction */

    float t1 = p.y - p0.y;
    float fade_t1 = fade(t1); /* Used for interpolation in vertical direction. */

    float t2 = p.z - p0.z;
    float fade_t2 = fade(t2); /* Used for interpolation in depth direction. */

    /* Calculate dot products and interpolate.*/
    float p0p1 = (1.0f - fade_t0) * dot(g0, (p - p0)) + fade_t0 * dot(g1, (p - p1)); /* between front upper two lattice points */
    float p2p3 = (1.0f - fade_t0) * dot(g2, (p - p2)) + fade_t0 * dot(g3, (p - p3)); /* between front lower two lattice points */

    float front = (1.0f - fade_t1) * p0p1 + fade_t1 * p2p3;

    float p4p5 = (1.0f - fade_t0) * dot(g4, (p - p4)) + fade_t0 * dot(g5, (p - p5)); /* between back upper two lattice points */
    float p6p7 = (1.0f - fade_t0) * dot(g6, (p - p6)) + fade_t0 * dot(g7, (p - p7)); /* between back lower two lattice points */

    float back = (1.0f - fade_t1) * p4p5 + fade_t1 * p6p7;

    /* Calculate final result */
    return (1.0f - fade_t2) * front + fade_t2 * back;
}

vec3 hsl2rgb(in vec3 c) {
    vec3 rgb = clamp(abs(mod(c.x * 6.0f + vec3(0.0f, 4.0f, 2.0f), 6.0f) - 3.0f) - 1.0f, 0.0f, 1.0f);

    return c.z + c.y * (rgb - 0.5f) * (1.0f - abs(2.0f * c.z - 1.0f));
}

float getBrownianNoise(vec3 pos) {

    float n = 0.0f;

    // Sum the noise for each octave
    for(int octaveIndex = 0; octaveIndex < amountOctaves; octaveIndex++) {
        float currentFrequency = frequency * pow(base, exponentFactor * float(octaveIndex));
        float currentAmp = amplitude * pow(base, -exponentFactor * float(octaveIndex));

        //float timeSmooth = mod(time * 0.1f, 100.0f);

        float xIn = pos.x * currentFrequency;
        float yIn = pos.y * currentFrequency;
        float zIn = pos.z * currentFrequency;

        float currentN = noise(vec3(xIn, yIn, zIn)) * currentAmp;
        n += currentN;
    }

    return n;
}

void main() {

    float fovFactor = tan(fov * 0.5f);
    vec3 rayDir = normalize(cameraRotation * normalize(vec3((uv.x * 2.0f - 1.0f) * fovFactor, (uv.y * 2.0f - 1.0f) * fovFactor * aspectRatio, 1.0f)));

    vec3 cameraPos = startCameraPos + speed * time;
    vec3 rayPos = cameraPos;

    float totalDensity = 0.0f;

    float accumulatedDensity = 0.0f;

    for(float i = 0.0f; i < maxDist; i += stepSize) {

        // Compute distance along the ray from the camera
        float rayDepth = length(rayPos - cameraPos);

        // Ensure we're not too close to the camera (near clip plane)
        if(rayDepth > nearClipPlane) {

            float n = getBrownianNoise(rayPos);

            if(n > threshold) {
                accumulatedDensity += n * stepSize;
                // Apply Beer's law attenuation
                float attenuation = exp(-absorptionCoefficient * accumulatedDensity);
                totalDensity += n * attenuation * 0.01f;
            }
        }

        rayPos += rayDir * stepSize;
    }

    vec3 color;

    color = hsl2rgb(vec3(210.0f / 360.0f, totalDensity * 20.0f, mix(1.0f, 0.7f, clamp(totalDensity * 20.0f, 0.0f, 1.0f))));

    fragColor = vec4(color, 1.0f);
}