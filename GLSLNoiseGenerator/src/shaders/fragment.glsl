#version 300 es
precision highp float;

in vec2 uv;              // Input UV coordinates
uniform float time;      // Time uniform
uniform sampler2D noiseTexture;  // Texture for noise
uniform bool useHash;    // Use hash toggle

out vec4 fragColor;      // Output color

const uint externalSeed = 429396725u; // Use uint seed for better randomness

// Improved hash function using bitwise operations and XOR with externalSeed
float hash(uint p) {
    p = p ^ (externalSeed ^ (p >> 16));  // Mix the externalSeed into the input
    p = p * 0x45d9f3bfu;
    p = p ^ (p >> 16);
    p = p * 0x45d9f3bfu;
    p = p ^ (p >> 16);
    return float(p & 0x7fffffffu) / float(0x7fffffff); // Normalize to [0.0, 1.0]
}

// Fade function (smooth interpolation)
float fade(float t) {
    return t * t * t * (t * (t * 6.0f - 15.0f) + 10.0f);
}

// Texture-based gradient lookup
float gradTexture(float p) {
    const float texture_width = 256.0f;
    float v = texture(noiseTexture, vec2(mod(p, texture_width) / texture_width, 0.0f)).r;
    return v > 0.5f ? 1.0f : -1.0f;
}

// Gradient function with toggle
float grad(float p) {
    return useHash ? (hash(uint(p)) > 0.5f ? 1.0f : -1.0f) : gradTexture(p);
}

// 1D Perlin-like noise function
float noise(float p) {
    float p0 = floor(p);
    float p1 = p0 + 1.0f;
    float t = p - p0;
    float fade_t = fade(t);
    float g0 = grad(p0);
    float g1 = grad(p1);
    return mix(g0 * (p - p0), g1 * (p - p1), fade_t);
}

void main() {

    float frequency = 1.5f;
    float speed = 0.5f;
    float amplitude = 1.0f;

    float base = 2.0f;
    float exponentFactor = 1.0f;

    const int amountOctaves = 10;

    float n = 0.0f;

    // Sum the noise for each octave
    for(int octaveIndex = 0; octaveIndex < amountOctaves; octaveIndex++) {
        float currentFrequency = frequency * pow(base, exponentFactor * float(octaveIndex));
        float currentAmp = amplitude * pow(base, -exponentFactor * float(octaveIndex));

        float timeSmooth = mod(time * 0.1f, 100.0f);

        float currentN = noise((uv.x + speed * timeSmooth) * currentFrequency) * currentAmp;
        n += currentN;
    }

    // Y-coordinate for the comparison
    float y = 2.0f * (uv.y * (1.0f)) - 1.0f;

    // Decide the color based on noise and comparison
    vec3 color = n > y ? vec3(1.0f) : vec3(0.0f);

    fragColor = vec4(color, 1.0f);  // Set the output color
}
