export class Vec3D {
    constructor(public x: number, public y: number, public z: number) {}
}

export function Vector_Sub(v1: Vec3D, v2: Vec3D): Vec3D {
    return new Vec3D(v1.x - v2.x, v1.y - v2.y, v1.z - v2.z);
}

export function Vector_Add(v1: Vec3D, v2: Vec3D): Vec3D {
    return new Vec3D(v1.x + v2.x, v1.y + v2.y, v1.z + v2.z);
}

export function Vector_DotProduct(v1: Vec3D, v2: Vec3D): number {
    return v1.x * v2.x + v1.y * v2.y + v1.z * v2.z;
}

export function Vector_Length(v: Vec3D): number {
    return Math.sqrt(Vector_DotProduct(v, v));
}

export function Vector_Scalar(v: Vec3D, scalar: number): Vec3D {
    return new Vec3D(v.x * scalar, v.y * scalar, v.z * scalar);
}

export function Vector_Normalise(v: Vec3D): Vec3D {
    const length = Vector_Length(v);
    return new Vec3D(v.x / length, v.y / length, v.z / length);
}

export function Vector_CrossProduct(v1: Vec3D, v2: Vec3D): Vec3D {
    const v = new Vec3D(
        v1.y * v2.z - v1.z * v2.y,
        v1.z * v2.x - v1.x * v2.z,
        v1.x * v2.y - v1.y * v2.x
    );
    return v;
}

export class Line {
    constructor(public p: Vec3D[]) {}
}

export class Mesh {
    constructor(public lines: Line[]) {}
}

export class Mat4x4 {
    m: number[][] = [
        [0, 0, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0]
    ];
}

export function Matrix_MakeIdentity(): Mat4x4 {
    const matrix = new Mat4x4();
    matrix.m[0][0] = 1.0;
    matrix.m[1][1] = 1.0;
    matrix.m[2][2] = 1.0;
    matrix.m[3][3] = 1.0;
    return matrix;
}

export function Matrix_MakeRotationX(fAngleRad: number): Mat4x4 {
    const matrix = new Mat4x4();
    matrix.m[0][0] = 1.0;
    matrix.m[1][1] = Math.cos(fAngleRad);
    matrix.m[1][2] = Math.sin(fAngleRad);
    matrix.m[2][1] = -Math.sin(fAngleRad);
    matrix.m[2][2] = Math.cos(fAngleRad);
    matrix.m[3][3] = 1.0;
    return matrix;
}

export function Matrix_MakeRotationY(fAngleRad: number): Mat4x4 {
    const matrix = new Mat4x4();
    matrix.m[0][0] = Math.cos(fAngleRad);
    matrix.m[0][2] = Math.sin(fAngleRad);
    matrix.m[2][0] = -Math.sin(fAngleRad);
    matrix.m[1][1] = 1.0;
    matrix.m[2][2] = Math.cos(fAngleRad);
    matrix.m[3][3] = 1.0;
    return matrix;
}

export function Matrix_MakeRotationZ(fAngleRad: number): Mat4x4 {
    const matrix = new Mat4x4();
    matrix.m[0][0] = Math.cos(fAngleRad);
    matrix.m[0][1] = Math.sin(fAngleRad);
    matrix.m[1][0] = -Math.sin(fAngleRad);
    matrix.m[1][1] = Math.cos(fAngleRad);
    matrix.m[2][2] = 1.0;
    matrix.m[3][3] = 1.0;
    return matrix;
}

export function Matrix_MakeTranslation(x: number, y: number, z: number): Mat4x4 {
    const matrix = new Mat4x4();
    matrix.m[0][0] = 1.0;
    matrix.m[1][1] = 1.0;
    matrix.m[2][2] = 1.0;
    matrix.m[3][3] = 1.0;
    matrix.m[3][0] = x;
    matrix.m[3][1] = y;
    matrix.m[3][2] = z;
    return matrix;
}

export function Matrix_MakeProjection(fFovDegrees: number, fAspectRatio: number, fNear: number, fFar: number): Mat4x4 {
    const fFovRad = 1.0 / Math.tan(fFovDegrees * 0.5 / 180.0 * Math.PI);
    const matrix = new Mat4x4();
    matrix.m[0][0] = fAspectRatio * fFovRad;
    matrix.m[1][1] = fFovRad;
    matrix.m[2][2] = fFar / (fFar - fNear);
    matrix.m[3][2] = (-fFar * fNear) / (fFar - fNear);
    matrix.m[2][3] = 1.0;
    matrix.m[3][3] = 0.0;
    return matrix;
}

export function Matrix_MultiplyMatrix(m1: Mat4x4, m2: Mat4x4): Mat4x4 {
    const matrix = new Mat4x4();
    for (let c = 0; c < 4; c++)
        for (let r = 0; r < 4; r++)
            matrix.m[r][c] = m1.m[r][0] * m2.m[0][c] + m1.m[r][1] * m2.m[1][c] + m1.m[r][2] * m2.m[2][c] + m1.m[r][3] * m2.m[3][c];
    return matrix;
}


export function multiplyMatrixVector(i: Vec3D, m: Mat4x4): Vec3D {
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

export function Matrix_PointAt(pos: Vec3D, target: Vec3D, up: Vec3D): Mat4x4 {
    // Calculate new forward direction
    let newForward = Vector_Sub(target, pos);
    newForward = Vector_Normalise(newForward);

    // Calculate new Up direction
    const a = Vector_Normalise(Vector_Sub(up, Vector_Scalar(newForward, Vector_DotProduct(up, newForward))));
    const newUp = Vector_CrossProduct(a, newForward);

    // New Right direction is easy, it's just cross product
    const newRight = Vector_CrossProduct(newUp, newForward);

    // Construct Dimensioning and Translation Matrix	
    const matrix = new Mat4x4();
    matrix.m[0][0] = newRight.x; matrix.m[0][1] = newRight.y; matrix.m[0][2] = newRight.z; matrix.m[0][3] = 0.0;
    matrix.m[1][0] = newUp.x; matrix.m[1][1] = newUp.y; matrix.m[1][2] = newUp.z; matrix.m[1][3] = 0.0;
    matrix.m[2][0] = newForward.x; matrix.m[2][1] = newForward.y; matrix.m[2][2] = newForward.z; matrix.m[2][3] = 0.0;
    matrix.m[3][0] = pos.x; matrix.m[3][1] = pos.y; matrix.m[3][2] = pos.z; matrix.m[3][3] = 1.0;
    return matrix;
}

export function Matrix_QuickInverse(m: Mat4x4): Mat4x4 {
    const matrix = new Mat4x4();
    matrix.m[0][0] = m.m[0][0]; matrix.m[0][1] = m.m[1][0]; matrix.m[0][2] = m.m[2][0]; matrix.m[0][3] = 0.0;
    matrix.m[1][0] = m.m[0][1]; matrix.m[1][1] = m.m[1][1]; matrix.m[1][2] = m.m[2][1]; matrix.m[1][3] = 0.0;
    matrix.m[2][0] = m.m[0][2]; matrix.m[2][1] = m.m[1][2]; matrix.m[2][2] = m.m[2][2]; matrix.m[2][3] = 0.0;
    matrix.m[3][0] = -(m.m[3][0] * matrix.m[0][0] + m.m[3][1] * matrix.m[1][0] + m.m[3][2] * matrix.m[2][0]);
    matrix.m[3][1] = -(m.m[3][0] * matrix.m[0][1] + m.m[3][1] * matrix.m[1][1] + m.m[3][2] * matrix.m[2][1]);
    matrix.m[3][2] = -(m.m[3][0] * matrix.m[0][2] + m.m[3][1] * matrix.m[1][2] + m.m[3][2] * matrix.m[2][2]);
    matrix.m[3][3] = 1.0;
    return matrix;
}