import { _decorator, Node, Prefab, Vec4, Quat, Vec3, Mat4, ModelComponent, Vec2, Mesh, instantiate, warn, mat4, TERRAIN_HEIGHT_BASE, MeshRenderer } from 'cc';
import SourceMesh from '../../utils/mesh-processing/source-mesh';
import FixedModelMesh from '../../utils/mesh-processing/fixed-model-mesh';
import { ScatterType } from '../type';
import meshUtility from '../../utils/mesh-processing/mesh-utility';

const { ccclass, type, property } = _decorator;

let tempMeshPos = new Vec3();
let tempMeshNormal = new Vec3();
let tempMeshTangent = new Vec4();

let tempArray2 = new Array(2).fill(0);
let tempArray3 = new Array(3).fill(0);
let tempArray4 = new Array(4).fill(0);

let tempMat4 = new Mat4;
let tempMat4_2 = new Mat4;

@ccclass('ScatterItem')
export default class ScatterItem {
    @type(Prefab)
    _prefab: Prefab | null = null;
    @property
    _type = ScatterType.Instance;
    @property
    _volume = 1;

    @type(Prefab)
    get prefab () {
        return this._prefab;
    }
    set prefab (value) {
        this._prefab = value;
    }

    @property
    get volume () {
        return this._volume;
    }
    set volume (value) {
        this._volume = value;
    }

    _maxCount = 0;
    @property
    get maxCount () {
        return this._maxCount;
    }

    protected _fixedMeshes: FixedModelMesh[] = [];
    get fixedMeshes () {
        return this._fixedMeshes;
    }

    @property
    protected _meshStructs: Mesh.IStruct[] = [];

    protected _sourceMesh: SourceMesh | null = null;
    protected _tempNode!: Node;

    init (node: Node, maxCount: number, dataType: ScatterType) {
        this.node = node;
        this._maxCount = maxCount;
        this._type = dataType;

        if (!this.prefab) return;

        // reset
        this.currentCount = 0;
        this._sourceMesh = null;
        this._fixedMeshes.length = 0;
        let model = this.node.getComponent(ModelComponent);
        if (model) {
            model.destroy();
        }
        let instanceObject = this.node.getComponent('InstanceObject');
        if (instanceObject) {
            instanceObject.destroy();
        }
        this.node.removeAllChildren();

        let tempNode: Node = this._tempNode = instantiate(this.prefab);

        if (dataType === ScatterType.Mesh) {
            tempNode = instantiate(this.prefab);
            tempNode.setPosition(0, 0, 0);
            let tempModel = tempNode.getComponent(ModelComponent)! || tempNode.getComponentInChildren(ModelComponent)!;
            if (tempModel && tempModel.mesh) {
                this._sourceMesh = SourceMesh.build(tempModel.mesh);
                tempModel.node.getWorldRotation(this._sourceMesh.rotation)
                tempModel.node.getWorldPosition(this._sourceMesh.translation)
                tempModel.node.getWorldScale(this._sourceMesh.scale)
                this._sourceMesh.reset();
            }

            let tempMaterials = tempModel && tempModel.sharedMaterials;
            let subMeshCount = this._sourceMesh!.subCount();

            this._fixedMeshes.length = 0;
            this._meshStructs.length = 0;
            for (let i = 0; i < subMeshCount; i++) {
                let node = new Node('ScatterItemModel');
                let model = node.addComponent(ModelComponent);
                this._fixedMeshes[i] = FixedModelMesh.create(this._sourceMesh!.getVertices(i).length, this._sourceMesh!.getTriangles(i).length, model, this.maxCount);
                this._meshStructs[i] = this._fixedMeshes[i].mesh!.struct;
                model.mesh = this._fixedMeshes[i].mesh;
                model.shadowCastingMode = tempModel.shadowCastingMode;
                model.lightmapSettings = tempModel.lightmapSettings;

                let renderingSubMeshes = model.mesh!.renderingSubMeshes;
                let material = tempMaterials[i] || tempMaterials[0];
                for (let j = 0; j < renderingSubMeshes.length; j++) {
                    model.setMaterial(material, j);
                }

                node.parent = this.node;
            }
        }
    }

    shiftStructOffset (offset: number) {
        let structs = this._meshStructs;
        for (let i = 0; i < structs.length; i++) {
            structs[i].primitives.forEach(primitive => primitive.indexView!.offset += offset);
            structs[i].vertexBundles.forEach(vertex => vertex.view.offset += offset);
        }
    }

    fill (mat: Mat4) {
        if (this.currentCount >= this.maxCount || !this.prefab) return false;

        if (this._type === ScatterType.Mesh) {
            this.updateMesh(mat);
        }
        else if (this._type === ScatterType.Instance) {
            this.updateInstance(mat);
        }
        else {
            this.updateItem(mat);
        }

        this.currentCount++;

        this._updated = true;
        return true;
    }

    updateFill () {
        if (!this._updated || !this.prefab) return;

        if (this._type === ScatterType.Mesh) {
            let fixedMeshes = this._fixedMeshes;
            for (let i = 0; i < fixedMeshes.length; i++) {
                fixedMeshes[i].update();
            }
        }

        this._updated = false;
    }

    endFill () {
        if (this._type === ScatterType.Instance) {
            let instanceObject: any = this.node!.getComponent('InstanceObject');
            if (instanceObject) {
                instanceObject.rebuild();
            }
        }
    }

    protected updateMesh (mat: Mat4) {
        let sourceMesh = this._sourceMesh;
        if (!sourceMesh) return;

        let subCount = sourceMesh.subCount();
        for (let si = 0; si < subCount; si++) {
            let fixedMesh = this._fixedMeshes[si];
            let vertices = sourceMesh.getVertices(si);
            let vertCount = vertices.length;
            let vertOffset = this.currentCount * vertCount

            for (let i = 0; i < vertCount; i++) {
                let vert = vertices[i];

                let offset = vertOffset + i;

                fixedMesh.writeVertex(offset, 'position', Vec3.toArray(tempArray3, Vec3.transformMat4(tempMeshPos, vert.position, mat)));
                fixedMesh.writeVertex(offset, 'normal', Vec3.toArray(tempArray3, Vec3.transformMat4(tempMeshNormal, vert.position, mat)));
                fixedMesh.writeVertex(offset, 'tangent', Vec4.toArray(tempArray4, Vec4.transformMat4(tempMeshTangent, vert.tangent, mat)));
                fixedMesh.writeVertex(offset, 'uv', Vec2.toArray(tempArray2, vert.uv));
                fixedMesh.writeVertex(offset, 'uv1', Vec2.toArray(tempArray2, vert.uv1));
            }

            let triangles = sourceMesh.triangles;
            let triangleCount = triangles.length;
            let triangleOffset = this.currentCount * triangleCount;
            for (let i = 0; i < triangleCount; i++) {
                fixedMesh.writeIndex(triangleOffset + i, vertOffset + triangles[i]);
            }
        }
    }

    protected updateItem (mat: Mat4) {
        let node: Node = instantiate(this.prefab)! as any;
        Mat4.multiply(tempMat4, node.worldMatrix, mat);
        node.matrix = tempMat4;
        node.parent = this.node;
    }

    protected addInstanceData (mat: Mat4, node: Node, instanceObject: any) {
        let mr = node.getComponent(MeshRenderer) as MeshRenderer;
        if (mr && mr.mesh && mr.sharedMaterials.length) {
            Mat4.multiply(tempMat4, mat, node.worldMatrix);
            instanceObject.addData(mr, tempMat4);
        }

        let children = node.children;
        for (let i = 0; i < children.length; i++) {
            this.addInstanceData(mat, children[i], instanceObject);
        }
    }

    protected updateInstance (mat: Mat4) {
        let instanceObject: any = this.node!.getComponent('InstanceObject');
        if (!instanceObject) {
            instanceObject = this.node!.addComponent('InstanceObject');
        }
        if (!instanceObject || !this._tempNode) {
            return;
        }

        Mat4.multiply(tempMat4_2, this.node!.worldMatrix, mat);
        this.addInstanceData(tempMat4_2, this._tempNode, instanceObject);
    }

    private _updated = false;

    currentCount = 0;

    private node: Node | null = null;
}