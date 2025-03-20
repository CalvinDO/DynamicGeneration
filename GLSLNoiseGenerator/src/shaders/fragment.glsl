precision highp float;
varying vec2 uv;
uniform float time;
uniform sampler2D noiseTexture;
uniform bool useHash;

const float externalSeed = 345556766456548.5;
const float internalSeed = 1.0;

/*
use the internal seed to make this a high quality random deterministic hash function. It should be super good quality randomness for externalSeeds that are 1.0, 0.0 up to 23423974298734875.348572616253234234 like all should be good but unique!

the current hash function is just a code structure example and works very very very bad

*/

// Pseudo-random hash function
// Seed Shuffler: Scrambles seeds before use
// Ultra-Chaotic Seed Shuffler
vec2 shuffleSeeds(float s1, float s2) {
    s1 = fract(sin(s1 * 12345.6789) * 98765.4321);
    s2 = fract(cos(s2 * 6789.9876) * 12345.6789);
    s1 = fract(s1 + s2 * 1.61803398875); // Golden Ratio Scramble
    s2 = fract(s2 + s1 * 3.14159265359); // Pi Scramble
    return vec2(s1, s2);
}

// **INSANE AVALANCHE HASH FUNCTION**
float hash(float p) {
    vec2 shuffled = shuffleSeeds(internalSeed, externalSeed);
    float s1 = shuffled.x;
    float s2 = shuffled.y;

    // Absolute non-linearity shifts
    p = fract(p * 0.61803398875 + 0.137) * s1 + s2;
    
    // Exponential divergence
    p = pow(abs(p) + 1e-10, 5.3);  

    // Inject maximum entropy with chaotic trigonometry
    p = sin(p * s1 * 92837.1234) * cos(p * s2 * 87431.1234) * 1e5;

    // More bit diffusion
    p = fract(p) * s2 + 1.61803398875;
    
    // Logarithmic scrambling
    p = fract(p + log(abs(p) + 1.0000001) * 76543.2109);

    // Final diffusion with tan() explosion
    p = tan(p * 45678.9876) * sin(p * 87654.321);
    
    return fract(p);
}

// Fade function (smooth interpolation)
float fade(float t) {
    return t * t * t * (t * (t * 6.0 - 15.0) + 10.0);
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

    float frequency = 1.0;
    float speed = 0.2;
    float amplitude = 1.0;

    float base = 2.0;
    float exponentFactor = 1.0;

    const int amountOctaves = 12;

    float n = 0.0;

    for(int octaveIndex = 0; octaveIndex < amountOctaves; octaveIndex++) {

        float currentFrequency = frequency * pow(base, exponentFactor * float(octaveIndex));
        float currentAmp = amplitude * pow(base, -exponentFactor * float(octaveIndex));

        float currentN = noise((uv.x + speed * time) * currentFrequency) * currentAmp;
        n += currentN;
    }

    float y = 2.0 * (uv.y * (1.0)) - 1.0;

    vec3 color = n > y ? vec3(1.0) : vec3(0.0);

    gl_FragColor = vec4(color, 1.0);
}
