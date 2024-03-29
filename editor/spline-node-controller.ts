import { Node, Color, Vec3 } from 'cc'
import Controller from './base/controller';
import { createLineShape, getNodeWorldPostion } from './utils';
import { SplineMoveType } from './types';
import { cce } from './define';

const SPLINE_NODE_SIZE = 10;

export default class SplineNodeController extends Controller {
    _node = null;
    _splineNode = null;

    _directionLineShape = null;

    positionNode: Node = null;
    directionNode: Node = null;
    invDirectionNode: Node = null;

    constructor (rootNode) {
        super(rootNode);

        this.initShape();
    }

    initShape () {
        this.createShapeNode('BoxController');

        let cube = cce.gizmos.ControllerUtils.cube(SPLINE_NODE_SIZE, SPLINE_NODE_SIZE, SPLINE_NODE_SIZE, Color.YELLOW);
        cube.parent = this.shape;
        this.positionNode = cube;
        this.initHandle(cube, SplineMoveType.Position);

        cube = cce.gizmos.ControllerUtils.cube(SPLINE_NODE_SIZE, SPLINE_NODE_SIZE, SPLINE_NODE_SIZE, Color.YELLOW);
        cube.parent = this.shape;
        this.directionNode = cube;
        this.initHandle(cube, SplineMoveType.Direction);

        cube = cce.gizmos.ControllerUtils.cube(SPLINE_NODE_SIZE, SPLINE_NODE_SIZE, SPLINE_NODE_SIZE, Color.YELLOW);
        cube.parent = this.shape;
        this.invDirectionNode = cube;
        this.initHandle(cube, SplineMoveType.InvDirection);

        this._directionLineShape = createLineShape('Direction Line', Color.RED);
        this._directionLineShape.parent = this.shape;

        this.hide();
    }

    onShow () {
        this.registerCameraMovedEvent();
        this.hideDirection();
    }

    onHide () {
        this.unregisterCameraMoveEvent();
    }

    showDirection () {
        this.directionNode.active = true;
        this.invDirectionNode.active = true;
        this._directionLineShape.active = true;

        this.updateLineMesh();
    }

    hideDirection () {
        this.directionNode.active = false;
        this.invDirectionNode.active = false;
        this._directionLineShape.active = false;
    }

    setSplineNode (node: Node, splineNode) {
        this._splineNode = splineNode;
        this._node = node;

        this.adjustControllerSize();
        this.shape.setWorldPosition(getNodeWorldPostion(node, this._splineNode.position));

        this.directionNode.setWorldPosition(getNodeWorldPostion(node, this._splineNode.direction));
        this.invDirectionNode.setWorldPosition(getNodeWorldPostion(node, this._splineNode.invDirection));

        this.updateLineMesh();
        this.updateController();
    }

    updateLineMesh () {
        this._directionLineShape.updatePoints([this.directionNode.position, this.invDirectionNode.position]);
    }

    getSplineNodeWorldPosition () {
        return this.positionNode.getWorldPosition(new Vec3);
    }
    getSplineNodeWorldDirection () {
        return this.directionNode.getWorldPosition(new Vec3);
    }
    getSplineNodeWorldInvDirection () {
        return this.invDirectionNode.getWorldPosition(new Vec3);
    }
};
