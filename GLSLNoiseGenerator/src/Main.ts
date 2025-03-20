namespace Portfolio {


    let seed: string = "324892738473485734975987435345";

    async function fetchShader(url: string): Promise<string> {
        const response = await fetch(url);
        return response.text();
    }

    async function init() {
        const canvas = document.getElementById("glCanvas") as HTMLCanvasElement;
        const gl = canvas.getContext("webgl");

        if (!gl) {
            console.error("WebGL not supported");
            return;
        }

        // Load GLSL shaders
        const vertexSource = await fetchShader("src/shaders/vertex.glsl");
        const fragmentSource = await fetchShader("src/shaders/fragment.glsl");

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
        const seedPartsUniform = gl.getUniformLocation(program, "seedParts");

        // Generate noise texture
        const noiseTexture = createNoiseTexture(gl);

        // Resize canvas dynamically
        function resizeCanvas() {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            gl.viewport(0, 0, canvas.width, canvas.height);
        }
        window.addEventListener("resize", resizeCanvas);
        resizeCanvas();

        // Render loop
        function render(time: number) {

            gl.uniform1f(timeUniform, time * 0.001);
            gl.uniform1i(useHashUniform, 0); // Toggle this (0 = use texture2D, 1 = use hash)
            gl.uniform1iv(seedPartsUniform, splitSeed(seed));
            gl.activeTexture(gl.TEXTURE0);
            gl.bindTexture(gl.TEXTURE_2D, noiseTexture);
            gl.uniform1i(noiseTextureUniform, 0);
            gl.drawArrays(gl.TRIANGLES, 0, 6);
            requestAnimationFrame(render);
        }
        requestAnimationFrame(render);
    }

    function splitSeed(seed: string): Uint32Array {
        const parts = new Uint32Array(4);
        
        // Convert seed string into a large number and split it safely
        let chunkSize = Math.ceil(seed.length / 4); // Split seed into 4 parts
        for (let i = 0; i < 4; i++) {
            let chunk = seed.slice(i * chunkSize, (i + 1) * chunkSize);
            parts[i] = parseInt(chunk, 10) >>> 0; // Convert safely to uint
        }
    
        return parts;
    }

    // Generate a random grayscale noise texture
    function createNoiseTexture(gl: WebGLRenderingContext): WebGLTexture {
        const size = 256 * 4;
        const data = new Uint8Array(size ** 2);
        for (let i = 0; i < size ** 2; i++) {
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
    function compileShader(gl: WebGLRenderingContext, source: string, type: number): WebGLShader {
        const shader = gl.createShader(type);
        if (!shader) throw new Error("Failed to create shader");
        gl.shaderSource(shader, source);
        gl.compileShader(shader);
        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
            console.error(gl.getShaderInfoLog(shader));
            throw new Error("Shader compilation failed");
        }
        return shader;
    }

    // Helper: Link WebGL program
    function createShaderProgram(gl: WebGLRenderingContext, vertexShader: WebGLShader, fragmentShader: WebGLShader): WebGLProgram {
        const program = gl.createProgram();
        if (!program) throw new Error("Failed to create program");
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
}