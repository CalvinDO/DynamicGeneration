var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var Portfolio;
(function (Portfolio) {
    let pixelRatio = 16 / 9;
    function fetchShader(url) {
        return __awaiter(this, void 0, void 0, function* () {
            const response = yield fetch(url);
            return response.text();
        });
    }
    function init() {
        return __awaiter(this, void 0, void 0, function* () {
            const canvas = document.getElementById("glCanvas");
            const gl = canvas.getContext("webgl2", { antialias: true });
            if (!gl) {
                console.error("WebGL not supported");
                return;
            }
            // Load GLSL shaders
            const vertexSource = yield fetchShader("src/shaders/vertex.glsl");
            const fragmentSource = yield fetchShader("src/shaders/fragment.glsl");
            // Compile shaders
            const vertexShader = compileShader(gl, vertexSource, gl.VERTEX_SHADER);
            const fragmentShader = compileShader(gl, fragmentSource, gl.FRAGMENT_SHADER);
            const program = createShaderProgram(gl, vertexShader, fragmentShader);
            gl.useProgram(program);
            // Fullscreen Quad
            const vertices = new Float32Array([
                -1, -1, 1, -1, -1, 1,
                -1, 1, 1, -1, 1, 1
            ]);
            const buffer = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
            gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
            const position = gl.getAttribLocation(program, "position");
            gl.enableVertexAttribArray(position);
            gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);
            // Get uniform locations
            const timeUniform = gl.getUniformLocation(program, "time");
            const useHashUniform = gl.getUniformLocation(program, "useHash");
            const noiseTextureUniform = gl.getUniformLocation(program, "noiseTexture");
            const pixelRatioUniform = gl.getUniformLocation(program, "pixelRatio");
            // Generate noise texture
            const noiseTexture = createNoiseTexture(gl);
            // Resize canvas dynamically
            function resizeCanvas() {
                const dpr = window.devicePixelRatio || 1; // Get the device pixel ratio
                const width = window.innerWidth * dpr; // Adjust canvas width based on DPR
                const height = window.innerHeight * dpr; // Adjust canvas height based on DPR
                canvas.width = width; // Set internal width
                canvas.height = height; // Set internal height
                canvas.style.width = `${window.innerWidth}px`; // Set the display width
                canvas.style.height = `${window.innerHeight}px`; // Set the display height
                pixelRatio = canvas.height / canvas.width;
                gl.viewport(0, 0, canvas.width, canvas.height); // Update WebGL viewport
            }
            window.addEventListener("resize", resizeCanvas);
            resizeCanvas();
            // Create a framebuffer and a renderbuffer with MSAA
            const framebuffer = gl.createFramebuffer();
            gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
            // Create a renderbuffer for color attachment with multi-sampling
            const renderbuffer = gl.createRenderbuffer();
            gl.bindRenderbuffer(gl.RENDERBUFFER, renderbuffer);
            gl.renderbufferStorageMultisample(gl.RENDERBUFFER, 4, gl.RGBA8, canvas.width, canvas.height); // 4x MSAA
            gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.RENDERBUFFER, renderbuffer);
            // Check if framebuffer is complete
            if (gl.checkFramebufferStatus(gl.FRAMEBUFFER) !== gl.FRAMEBUFFER_COMPLETE) {
                console.error("Framebuffer is not complete!");
                return;
            }
            // Unbind framebuffer
            gl.bindFramebuffer(gl.FRAMEBUFFER, null);
            // Render loop
            function render(time) {
                gl.uniform1f(timeUniform, time * 0.001);
                gl.uniform1f(pixelRatioUniform, pixelRatio);
                gl.uniform1i(useHashUniform, 1); // Toggle this (0 = use texture2D, 1 = use hash)
                gl.activeTexture(gl.TEXTURE0);
                gl.bindTexture(gl.TEXTURE_2D, noiseTexture);
                gl.uniform1i(noiseTextureUniform, 0);
                gl.drawArrays(gl.TRIANGLES, 0, 6);
                requestAnimationFrame(render);
            }
            requestAnimationFrame(render);
        });
    }
    // Function to split the string into an array of uints
    function splitSeed(seed) {
        const seedArray = [];
        // Convert string to uints (using ASCII codes of characters)
        for (let i = 0; i < seed.length; i++) {
            // Get the ASCII value of each character
            const charCode = seed.charCodeAt(i);
            // Break the character code into smaller parts (since uint is 32-bits)
            seedArray.push(charCode);
        }
        // Ensure we have a 32-bit unsigned integer array for GLSL, pad with 0 if necessary
        while (seedArray.length < 4) {
            seedArray.push(0); // Pad with zeros if we need more values
        }
        return seedArray;
    }
    // Generate a random grayscale noise texture
    function createNoiseTexture(gl) {
        const size = 256 * 4;
        const data = new Uint8Array(Math.pow(size, 2));
        for (let i = 0; i < Math.pow(size, 2); i++) {
            data[i] = Math.random() * 255;
        }
        const texture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.LUMINANCE, size, size, 0, gl.LUMINANCE, gl.UNSIGNED_BYTE, data);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
        return texture;
    }
    // Helper: Compile WebGL shader
    function compileShader(gl, source, type) {
        const shader = gl.createShader(type);
        if (!shader)
            throw new Error("Failed to create shader");
        gl.shaderSource(shader, source);
        gl.compileShader(shader);
        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
            console.error(gl.getShaderInfoLog(shader));
            throw new Error("Shader compilation failed");
        }
        return shader;
    }
    // Helper: Link WebGL program
    function createShaderProgram(gl, vertexShader, fragmentShader) {
        const program = gl.createProgram();
        if (!program)
            throw new Error("Failed to create program");
        gl.attachShader(program, vertexShader);
        gl.attachShader(program, fragmentShader);
        gl.linkProgram(program);
        if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
            console.error(gl.getProgramInfoLog(program));
            throw new Error("Shader linking failed");
        }
        return program;
    }
    // Run the shader
    window.addEventListener("load", init);
})(Portfolio || (Portfolio = {}));
//# sourceMappingURL=Main.js.map