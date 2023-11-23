import './style.css';

class Vec3D {
    constructor(public x: number, public y: number, public z: number) {}
}

class Line {
    constructor(public p: Vec3D[]) {}
}

class Mesh {
    constructor(public lines: Line[]) {}
}

class Mat4x4 {
    m: number[][] = [
        [0, 0, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0]
    ];
}

class Engine3D {
    private meshCube: Mesh = new Mesh([
        // front
        new Line([new Vec3D(0, 0, 0), new Vec3D(0, 1, 0)]),
        new Line([new Vec3D(0, 1, 0), new Vec3D(1, 1, 0)]),
        new Line([new Vec3D(1, 1, 0), new Vec3D(1, 0, 0)]),
        new Line([new Vec3D(1, 0, 0), new Vec3D(0, 0, 0)]),
        // back
        new Line([new Vec3D(0, 0, 1), new Vec3D(0, 1, 1)]),
        new Line([new Vec3D(0, 1, 1), new Vec3D(1, 1, 1)]),
        new Line([new Vec3D(1, 1, 1), new Vec3D(1, 0, 1)]),
        new Line([new Vec3D(1, 0, 1), new Vec3D(0, 0, 1)]),
        // mid
        new Line([new Vec3D(0, 0, 0), new Vec3D(0, 0, 1)]),
        new Line([new Vec3D(1, 0, 0), new Vec3D(1, 0, 1)]),
        new Line([new Vec3D(1, 1, 0), new Vec3D(1, 1, 1)]),
        new Line([new Vec3D(0, 1, 0), new Vec3D(0, 1, 1)]),
    ]);

    private matProj: Mat4x4 = new Mat4x4();
    private fTheta: number = 0;

    private canvas: HTMLCanvasElement;
    private ctx: CanvasRenderingContext2D;
    private canvasWidth: number
    private canvasHeight: number;

    constructor(canvas: HTMLCanvasElement) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d')!;
        this.canvasWidth = canvas.width;
        this.canvasHeight = canvas.height;
        this.setup();
    }

    private multiplyMatrixVector(i: Vec3D, m: Mat4x4): Vec3D {
        const o = new Vec3D(0, 0, 0);
        const { x, y, z } = i;
        o.x = x * m.m[0][0] + y * m.m[1][0] + z * m.m[2][0] + m.m[3][0];
        o.y = x * m.m[0][1] + y * m.m[1][1] + z * m.m[2][1] + m.m[3][1];
        o.z = x * m.m[0][2] + y * m.m[1][2] + z * m.m[2][2] + m.m[3][2];
        const w = x * m.m[0][3] + y * m.m[1][3] + z * m.m[2][3] + m.m[3][3];

        if (w !== 0) {
            o.x /= w;
            o.y /= w;
            o.z /= w;
        }
        return o;
    }

    private setup(): void {
        // Set up your cube's lines and projection matrix here
        const fNear = 0.1;
        const fFar = 1000.0;
        const fFov = 90.0;
        const fAspectRatio = canvas.height / canvas.width;
        const fFovRad = 1.0 / Math.tan((fFov * 0.5) * (Math.PI / 180.0));

        this.matProj.m[0][0] = fAspectRatio * fFovRad;
        this.matProj.m[1][1] = fFovRad;
        this.matProj.m[2][2] = fFar / (fFar - fNear);
        this.matProj.m[3][2] = (-fFar * fNear) / (fFar - fNear);
        this.matProj.m[2][3] = 1.0;
        this.matProj.m[3][3] = 0.0;

    }

    private drawLine(line: Line): void {
        this.ctx.beginPath();
        this.ctx.strokeStyle = "#eee";
        this.ctx.moveTo(line.p[0].x, line.p[0].y);
        this.ctx.lineTo(line.p[1].x, line.p[1].y);
        console.log(line)
        this.ctx.closePath();
        this.ctx.stroke();
    }

    private update(step: number): void {
        this.ctx.clearRect(0, 0, this.canvasWidth, this.canvasHeight);
        // Rotation Z
        const matRotZ = new Mat4x4();
        const matRotX = new Mat4x4();
        matRotZ.m[0][0] = Math.cos(this.fTheta);
        matRotZ.m[0][1] = Math.sin(this.fTheta);
        matRotZ.m[1][0] = -Math.sin(this.fTheta);
        matRotZ.m[1][1] = Math.cos(this.fTheta);
        matRotZ.m[2][2] = 1;
        matRotZ.m[3][3] = 1;

        // Rotation X
        matRotX.m[0][0] = 1;
        matRotX.m[1][1] = Math.cos(this.fTheta * 0.5);
        matRotX.m[1][2] = Math.sin(this.fTheta * 0.5);
        matRotX.m[2][1] = -Math.sin(this.fTheta * 0.5);
        matRotX.m[2][2] = Math.cos(this.fTheta * 0.5);
        matRotX.m[3][3] = 1;


        this.fTheta += Math.PI / 6 * 1/75;
        for(let i=0;i<this.meshCube.lines.length;i++) {
            const line = this.meshCube.lines[i];
            const translatedLine = new Line([]);
            const rotatedLine = new Line([]);
            const projectedLine = new Line([]);
            // rotate
            rotatedLine.p.push(this.multiplyMatrixVector(this.multiplyMatrixVector(line.p[0], matRotZ), matRotX));
            rotatedLine.p.push(this.multiplyMatrixVector(this.multiplyMatrixVector(line.p[1], matRotZ), matRotX));
            // translate
            translatedLine.p.push(new Vec3D(rotatedLine.p[0].x, rotatedLine.p[0].y, rotatedLine.p[0].z + 3));
            translatedLine.p.push(new Vec3D(rotatedLine.p[1].x, rotatedLine.p[1].y, rotatedLine.p[1].z + 3));
            // project
            projectedLine.p.push(this.multiplyMatrixVector(translatedLine.p[0], this.matProj));
            projectedLine.p.push(this.multiplyMatrixVector(translatedLine.p[1], this.matProj));
            projectedLine.p.forEach(p => {
                p.x += 1;
                p.x *= .5 * this.canvasWidth;
                p.y += 1;
                p.y *= .5 * this.canvasHeight;
            })
            this.drawLine(projectedLine);
        }
        requestAnimationFrame((step) => this.update(step))
    }

    public start(): void {
        requestAnimationFrame((step) => this.update(step));
    }
}

// Usage
const canvas = document.getElementById('app') as HTMLCanvasElement;
const engine = new Engine3D(canvas);
engine.start();