import { _decorator, Vec3, Vec2 } from "cc";
import SplineNode from "./spline-node";

const { ccclass, property, type } = _decorator;
@ccclass('SplineNodeWrapper')
export default class SplineNodeWrapper {
    static create (node: SplineNode) {
        if (!node) {
            debugger;
        }
        let wrapper = new SplineNodeWrapper();
        wrapper.node = node;
        return wrapper;
    }

    node: SplineNode | null = null;

    @type(SplineNode)
    get splineNode () {
        return this.node;
    }

    @type(Vec3)
    get position () {
        if (!this.node) {
            return Vec3.ZERO;
        }
        return this.node.position;
    }
    set position (value) {
        if (this.node) {
            this.node.position = value;
        }
    }

    @type(Vec3)
    get direction () {
        if (!this.node) {
            return Vec3.ZERO;
        }
        return this.node.direction;
    }
    set direction (value) {
        if (this.node) {
            this.node.direction = value;
        }
    }

    @type(Vec2)
    get scale () {
        if (!this.node) {
            return Vec2.ONE;
        }
        return this.node.scale;
    }
    set scale (value) {
        if (this.node) {
            this.node.scale = value;
        }
    }

    @property
    get roll () {
        if (!this.node) {
            return 0;
        }
        return this.node.roll;
    }
    set roll (value) {
        if (this.node) {
            this.node.roll = value;
        }
    }
}