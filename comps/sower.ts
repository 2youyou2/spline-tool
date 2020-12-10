import { _decorator, Node, Prefab, isPropertyModifier, Vec4, Quat, Vec3, instantiate } from 'cc';
import SplineUtilRenderer from './spline-util-renderer';
import Event from '../utils/event';
import pool from '../utils/pool';

const { ccclass, executeInEditMode, float, type, boolean, property } = _decorator;

let tempQuat = new Quat();

let tempBinormal = new Vec3

@ccclass
@executeInEditMode
export default class Sower extends SplineUtilRenderer {
    @float
    _spacing = 10;
    @float
    _spacingRange = 0;
    @float
    _scale = 1;
    @float
    _scaleRange = 0;
    @property
    _rotation = new Vec3();
    @type(Prefab)
    _prefab: Prefab = null;
    @property
    _translation = new Vec3;
    @property
    _translationRange = new Vec3;

    @float
    get spacing () { return this._spacing; };
    set spacing (v) { this._spacing = v; this.dirty = true; };
    @float
    get spacingRange () { return this._spacingRange; };
    set spacingRange (v) { this._spacingRange = v; this.dirty = true; };

    @float
    get scale () { return this._scale; };
    set scale (v) { this._scale = v; this.dirty = true; };
    @property
    get rotation () { return this._rotation; }
    set rotation (value) { this._rotation = value; this.dirty = true; }
    @float
    get scaleRange () { return this._scaleRange; };
    set scaleRange (v) { this._scaleRange = v; this.dirty = true; };

    @property
    get translation () {
        return this._translation;
    }
    set translation (v) {
        this._translation.set(v);
        this.dirty = true;
    }
    @property
    get translationRange () {
        return this._translationRange;
    }
    set translationRange (v) {
        this._translationRange.set(v);
        this.dirty = true;
    }

    @type(Prefab)
    get prefab () { return this._prefab; };
    set prefab (v) {
        this._prefab = v;
        this.generated.removeAllChildren();
        this.dirty = true;
    };

    onComputedEvent: Event = new Event;

    public compute () {
        let children = this.generated.children;

        if ((this.spacing + this.spacingRange) <= 0 ||
            this.prefab == null)
            return;

        let distance = 0;
        let splineCurve = this.splineCurve;
        let used = 0;
        while (distance <= splineCurve.length) {
            let localXOffset = this.translation.x + Math.random() * this.translationRange.x * Math.sign(this.translation.x) + distance;
            localXOffset = Math.min(localXOffset, splineCurve.length)
            let sample = splineCurve.getSampleAtDistance(localXOffset);

            let node = children[used];
            if (!node) {
                node = instantiate(this.prefab);
                node.parent = this.generated;
            }

            // apply scale + random
            let rangedScale = this.scale + Math.random() * this.scaleRange;
            rangedScale *= Math.min(sample.scale.x, sample.scale.y);
            node.setScale(rangedScale, rangedScale, rangedScale);

            Quat.fromEuler(tempQuat, this.rotation.x, this.rotation.y, this.rotation.z);
            Quat.multiply(tempQuat, sample.rotation, tempQuat);
            node.setRotation(tempQuat);

            // move orthogonaly to the spline, according to offset + random
            let zOffset = pool.Vec3.get();
            zOffset = Vec3.transformQuat(zOffset, Vec3.RIGHT, Quat.fromViewUp(tempQuat, sample.tangent, sample.up)).normalize();
            let localZOffset = this.translation.z + Math.random() * this.translationRange.z * Math.sign(this.translation.z);
            localZOffset *= sample.scale.x;
            zOffset.multiplyScalar(localZOffset);

            let yOffset = pool.Vec3.get();
            yOffset.set(sample.transformedUp).normalize();
            let localYOffset = this.translation.y + Math.random() * this.translationRange.y * Math.sign(this.translation.y);
            localYOffset *= sample.scale.y;
            yOffset.multiplyScalar(localYOffset);

            node.position = zOffset.add(yOffset).add(sample.location);

            distance += this.spacing + Math.random() * this.spacingRange;

            used++;
        }

        if (children.length > used) {
            for (let i = children.length - 1; i >= used; i--) {
                children[i].parent = null;
            }
        }

        this.onComputedEvent.invoke();
    }
}
