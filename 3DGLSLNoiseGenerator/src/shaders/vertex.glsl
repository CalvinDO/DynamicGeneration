#version 300 es

in vec2 position;  // Input vertex position
out vec2 uv;       // Output UV coordinates

void main() {
    uv = position * 0.5f + 0.5f;  // Convert from [-1,1] to [0,1]
    gl_Position = vec4(position, 0.0f, 1.0f);  // Set the final vertex position
}
