#version 300 es
precision highp float;

in vec2 uv;
uniform vec2 zoomPosHi;
uniform vec2 zoomPosLo;
uniform vec2 zoomDepthHiLo; // .x = hi, .y = lo
uniform float pixelRatio;
uniform uint maxIterations;
out vec4 fragColor;

struct Float64 {
    float hi;
    float lo;
};

Float64 twoSum(float a, float b) {
    float s = a + b;
    float bb = s - a;
    float err = (a - (s - bb)) + (b - bb);
    return Float64(s, err);
}

#ifndef HAS_FMA
float fma(float a, float b, float c) {
    return a * b + c;
}
#endif

Float64 twoProd(float a, float b) {
    float p = a * b;
    float err = fma(a, b, -p);
    return Float64(p, err);
}

Float64 add64(Float64 a, Float64 b) {
    Float64 s = twoSum(a.hi, b.hi);
    float lo = a.lo + b.lo + s.lo;
    return twoSum(s.hi, lo);
}

Float64 sub64(Float64 a, Float64 b) {
    return add64(a, Float64(-b.hi, -b.lo));
}

Float64 mul64(Float64 a, Float64 b) {
    Float64 p1 = twoProd(a.hi, b.hi);
    float p2 = a.hi * b.lo + a.lo * b.hi;
    return twoSum(p1.hi, p1.lo + p2);
}

Float64 square64(Float64 a) {
    return mul64(a, a);
}

Float64 mag2(Float64 x, Float64 y) {
    return add64(square64(x), square64(y));
}

vec3 hsl2rgb(in vec3 c) {
    vec3 rgb = clamp(abs(mod(c.x * 6.0f + vec3(0.0f, 4.0f, 2.0f), 6.0f) - 3.0f) - 1.0f, 0.0f, 1.0f);
    return c.z + c.y * (rgb - 0.5f) * (1.0f - abs(2.0f * c.z - 1.0f));
}

void main() {
    Float64 zx = Float64(0.0f, 0.0f);
    Float64 zy = Float64(0.0f, 0.0f);

    // uv-based coordinate in high precision
    float u = uv.x * 2.0f - 1.0f;
    float v = uv.y * 2.0f - 1.0f;

    Float64 uScaled = mul64(Float64(u, 0.0f), Float64(zoomDepthHiLo.x, zoomDepthHiLo.y));
    Float64 vScaled = mul64(Float64(v * pixelRatio, 0.0f), Float64(zoomDepthHiLo.x, zoomDepthHiLo.y));

    Float64 cx = add64(uScaled, Float64(zoomPosHi.x, zoomPosLo.x));
    Float64 cy = add64(vScaled, Float64(zoomPosHi.y, zoomPosLo.y));

    const Float64 escape = Float64(4.0f, 0.0f);
    uint iter = 0u;

    while(iter < maxIterations) {
        Float64 zx2 = square64(zx);
        Float64 zy2 = square64(zy);
        Float64 zxzy = mul64(zx, zy);

        if(add64(zx2, zy2).hi > escape.hi)
            break;

        zx = add64(sub64(zx2, zy2), cx);
        zy = add64(mul64(zxzy, Float64(2.0f, 0.0f)), cy);
        iter++;
    }

    if(iter == maxIterations) {
        fragColor = vec4(0.0f, 0.0f, 0.0f, 1.0f);
    } else {
        fragColor = vec4(hsl2rgb(vec3(float(iter) * 0.02f, 0.6f, 0.5f)), 1.0f);
    }
}