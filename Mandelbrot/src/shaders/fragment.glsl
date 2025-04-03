#version 300 es
precision highp float;

in vec2 uv;              // Input UV coordinates
uniform float time;      // Time uniform
uniform float pixelRatio;
uniform float zoomDepth;
uniform vec2 zoomPos;

const uint maxIterations = 1000u;
const float maxValue = 4000000000000000000000000000000000000000000000.0f;

const bool isJulia = false;

out vec4 fragColor;      // Output color

vec3 hsl2rgb(in vec3 c) {
    vec3 rgb = clamp(abs(mod(c.x * 6.0f + vec3(0.0f, 4.0f, 2.0f), 6.0f) - 3.0f) - 1.0f, 0.0f, 1.0f);

    return c.z + c.y * (rgb - 0.5f) * (1.0f - abs(2.0f * c.z - 1.0f));
}

void main() {

    float x0 = (uv.x * 2.0f - 1.0f) * zoomDepth - 0.75f + zoomPos.x;
    float y0 = (uv.y * 2.0f - 1.0f) * zoomDepth * pixelRatio + zoomPos.y;

    float x;
    float y;

    if(isJulia) {

        x = x0;
        y = y0;

        x0 = 0.168f;
        y0 = 0.575f;
    } else {
        x = 0.0f;
        y = 0.0f;
    }

    uint currentIteration = 0u;

    while((x * x + y * y) < maxValue && currentIteration < maxIterations) {

        float xTemp = x * x - y * y + x0;
        y = 2.0f * x * y + y0;

        x = xTemp;

        currentIteration = currentIteration + 1u;
    }

    if(currentIteration == maxIterations) {
        fragColor = vec4(0.0f, 0.0f, 0.0f, 1.0f);
    } else {
        fragColor = vec4(hsl2rgb(vec3(float(currentIteration) * 0.018f, 0.5f, 0.5f)), 1.0f);
    }
}
