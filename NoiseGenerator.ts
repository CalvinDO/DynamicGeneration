namespace NoiseGenerator {

    window.addEventListener("load", init);

    let crc2: CanvasRenderingContext2D;
    let canvas: HTMLCanvasElement;


    class Color {
        r: number;
        g: number;
        b: number;
        a: number;
    }

    function init(_event: Event): void {

        canvas = document.querySelector("canvas");

        crc2 = canvas.getContext("2d");
        crc2.imageSmoothingEnabled = false;

        //const gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
/*
        if (!gl) {
            console.error("WebGL not supported or blocked");
        } else {
            console.log("WebGL initialized successfully!");
        }*/

        
        drawNoise();
    }

    function drawNoise() {

        for (let xIndex: number = 0; xIndex < canvas.width; xIndex++) {
            for (let yIndex: number = 0; yIndex < canvas.height; yIndex++) {

                drawPixel({ r: 0, g: 0, b: 0, a: getAlphaAt(xIndex) }, xIndex, yIndex);
            }
        }
    }

    function fade(t: number): number {
        return t * t * t * (t * (t * 6.0 - 15.0) + 10.0);
    }

    function hash(p: number): number {
        return Math.abs(Math.sin(p * 128347.157 + 33211.732) * 43758.5453) % 1;
    }

    function grad(p: number): number {
        return hash(p) > 0.5 ? 1.0 : -1.0;
    }

    function noise(p: number): number {
        const p0 = Math.floor(p);
        const p1 = p0 + 1.0;

        const t = p - p0;
        const fadeT = fade(t);

        const g0 = grad(p0);
        const g1 = grad(p1);

        return (1.0 - fadeT) * g0 * (p - p0) + fadeT * g1 * (p - p1);
    }

    function getAlphaAt(xIndex: number, yIndex?: number): number {
        const frequency = 1.0 / 20.0;
        const amplitude = 1.0 / 5.0;
        return hash(xIndex)/*noise(xIndex * frequency) * amplitude*/;
    }


    function drawPixel(_color: Color, _x: number, _y: number): void {

        crc2.fillStyle = `rgba(${_color.r},${_color.g},${_color.b}, ${_color.a})`;
        crc2.fillRect(_x, _y, 1, 1);

    }
}
