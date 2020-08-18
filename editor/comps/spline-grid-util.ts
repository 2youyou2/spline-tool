import { _decorator, Component, Node, Vec3 } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('SplineGridUtil')
export class SplineGridUtil extends Component {
    @property
    splineNodeGrid = new Vec3(1, 1, 1);

    @property
    splineDirectionGrid = new Vec3(1, 1, 1)

    start () {
        // Your initialization goes here.
    }

    // update (deltaTime: number) {
    //     // Your update function goes here.
    // }
}
