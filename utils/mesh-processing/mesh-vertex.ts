import { _decorator, Vec3, Vec2, Mesh, Vec4, Color } from 'cc';
const { ccclass, property } = _decorator;

import { Pool } from '../pool';

export enum MeshVertexFlags {
    None = 0,
    Position = 1 << 0,
    Normal = 1 << 1,
    Tangent = 1 << 2,
    UV = 1 << 3,
    UV1 = 1 << 4,
    Color = 1 << 5,
}

@ccclass('MeshVertex')
export default class MeshVertex {
    private static _pool: Pool<MeshVertex>;
    static get pool () {
        if (!this._pool) {
            this._pool = new Pool(MeshVertex);
        }
        return this._pool;
    }

    static create (position?: Vec3 | MeshVertex, normal?: Vec3, uv?: Vec2, tangent?: Vec4, color?: Color, uv1?: Vec2): MeshVertex {
        let v = new MeshVertex();
        v.set(position, normal, uv, tangent, color, uv1);
        return v;
    }

    @property
    public position = new Vec3();
    @property
    public normal = new Vec3();
    @property
    public tangent = new Vec4();
    @property
    public uv = new Vec2();
    @property
    public uv1 = new Vec2();
    @property
    public color = new Color();

    public flag = 0;

    set (position?: Vec3 | MeshVertex, normal?: Vec3, uv?: Vec2, tangent?: Vec4, color?: Color, uv1?: Vec2): MeshVertex {
        if (position instanceof MeshVertex) {
            let vert = position;
            this.position.set(vert.position);
            this.normal.set(vert.normal);
            this.uv.set(vert.uv);
            this.uv1.set(vert.uv1);
            this.tangent.set(vert.tangent);
            this.color.set(vert.color);
            
            this.flag = vert.flag;
        }
        else {
            let flag = 0;

            if (position) {
                flag |= MeshVertexFlags.Position;
                this.position.set(Vec3.ZERO);
            }
            if (normal) {
                flag |= MeshVertexFlags.Normal;
                this.normal.set(Vec3.ZERO);
            }
            if (uv) {
                flag |= MeshVertexFlags.UV;
                this.uv.set(Vec2.ZERO);
            }
            if (uv1) {
                flag |= MeshVertexFlags.UV1;
                this.uv1.set(Vec2.ZERO);
            }
            if (tangent) {
                flag |= MeshVertexFlags.Tangent;
                this.tangent.set(Vec4.ZERO);
            }
            if (color) {
                flag |= MeshVertexFlags.Color;
                this.color.set(Color.WHITE);
            }

            this.flag = flag;
        }
        return this;
    }

    reset () {
        this.position.set(Vec3.ZERO);
        this.normal.set(Vec3.ZERO);
        this.uv.set(Vec2.ZERO);
        this.uv1.set(Vec2.ZERO);
        this.tangent.set(Vec4.ZERO);
        this.color.set(Color.WHITE);
        
        this.flag = 0;
    }
}
