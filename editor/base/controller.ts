import { js, Node } from 'cc'
import { cce } from '../define';
import { callGizmoFunction } from '../utils';
import _Gizmo from './gizmo';


export default class Controller {
    //#region  TODO: change to declare 
    public shape: Node | null = null;
    public _lockSize = true;
    createShapeNode (name: String) { return cce.gizmos.ControllerBase.prototype.createShapeNode.call(this, name); }
    initHandle (node: Node, axisName: String | Number) { return cce.gizmos.ControllerBase.prototype.initHandle.call(this, node, axisName); }
    updateController () { return cce.gizmos.ControllerBase.prototype.updateController.call(this); }
    show () { return cce.gizmos.ControllerBase.prototype.show.call(this); }
    hide () { return cce.gizmos.ControllerBase.prototype.hide.call(this); }
    registerCameraMovedEvent () { return cce.gizmos.ControllerBase.prototype.registerCameraMovedEvent.call(this); }
    unregisterCameraMoveEvent () { return cce.gizmos.ControllerBase.prototype.unregisterCameraMoveEvent.call(this); }
    adjustControllerSize () { return cce.gizmos.ControllerBase.prototype.adjustControllerSize.call(this); }
    //#endregion

    constructor (rootNode) {
        js.addon(this, new cce.gizmos.ControllerBase(rootNode));
    }

    onControllerMouseDown (event) { }
    onControllerMouseMove (event) { }
    onControllerMouseUp (event) { }

    onMouseDown (event) {
        this.onControllerMouseDown(event);
    }
    onMouseMove (event) {
        this.onControllerMouseMove(event);
    }
    onMouseUp (event) {
        this.onControllerMouseUp(event);
    }
    onMouseLeave (event) {
        this.onMouseUp(event);
    }
}

if (CC_EDITOR) {
    callGizmoFunction(() => {
        Object.setPrototypeOf(Controller.prototype, cce.gizmos.ControllerBase.prototype);
    })
}
