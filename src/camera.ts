import { Vec3D } from "./math";

export class Camera {
    public pos: Vec3D;
    public cameraDir: Vec3D;
    constructor() {
        this.pos = new Vec3D(0, 0, 0);
        this.cameraDir = new Vec3D(0, 0, 0)
    }

}