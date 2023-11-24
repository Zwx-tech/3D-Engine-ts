import { Camera } from "./camera";
import { Line, Mat4x4, Matrix_MakeIdentity, Matrix_MakeProjection, Matrix_MakeRotationX, Matrix_MakeRotationY, Matrix_MakeRotationZ, Matrix_MakeTranslation, Matrix_MultiplyMatrix, Matrix_PointAt, Matrix_QuickInverse, Mesh, Vec3D, Vector_Add, multiplyMatrixVector } from "./math";

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
    private camera = new Camera();

    constructor(canvas: HTMLCanvasElement) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d')!;
        this.canvasWidth = canvas.width;
        this.canvasHeight = canvas.height;
        this.setup();
    }


    private setup(): void {
        // Set up your cube's lines and projection matrix here
        const fNear = 0.1;
        const fFar = 1000.0;
        const fFov = 90.0;
        const fAspectRatio = this.canvasHeight / this.canvasWidth;
        
        this.matProj = Matrix_MakeProjection(fFov, fAspectRatio, fNear, fFar)

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
    private update(step: number) {
        this.render()
    }
    private render(): void {
        this.ctx.clearRect(0, 0, this.canvasWidth, this.canvasHeight);
        // rotation handle
        const rotZMatrix = Matrix_MakeRotationZ(this.fTheta);
        const rotXMatrix = Matrix_MakeRotationX(this.fTheta);
        const rotYMatrix = Matrix_MakeRotationY(this.fTheta);
        
        // handlle camre movement and rotation
        const vUp = new Vec3D(0, 1, 0);
        let vTarget = new Vec3D(0, 0, 1);
        vTarget = Vector_Add(vTarget, this.camera.pos);
        const cameraMatrix = Matrix_PointAt(this.camera.pos, vTarget, vUp);
        const viewMatrix = Matrix_QuickInverse(cameraMatrix);

        this.fTheta += Math.PI / 6 * 1/75;

        for(let i=0;i<this.meshCube.lines.length;i++) {
            const line = this.meshCube.lines[i];
            const projectedLine = new Line([]);
            const translateMatrix = Matrix_MakeTranslation(0, 0, 3);
            let wordMatrix = Matrix_MakeIdentity();
            // applay all transofrmations
            wordMatrix = Matrix_MultiplyMatrix(rotXMatrix, rotZMatrix);
            wordMatrix = Matrix_MultiplyMatrix(wordMatrix, rotYMatrix);
            wordMatrix = Matrix_MultiplyMatrix(wordMatrix, translateMatrix);
            wordMatrix = Matrix_MultiplyMatrix(wordMatrix, viewMatrix);
            wordMatrix = Matrix_MultiplyMatrix(wordMatrix, this.matProj);

            // rotate
            // project
            projectedLine.p.push(multiplyMatrixVector(line.p[0], wordMatrix));
            projectedLine.p.push(multiplyMatrixVector(line.p[1], wordMatrix));
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

export { Engine3D };