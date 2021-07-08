import { geometry, CurveRange } from 'cc'

function createKeyframe (time: number, value: number, inTangent = 0, outTangent = 0) {
    let frame = new geometry.Keyframe();
    frame.time = time;
    frame.value = value;
    frame.inTangent = inTangent;
    frame.outTangent = outTangent;
    return frame;
}


// A collection of curves form an [[AnimationClip]].
export default class UAnimationCurve {


    // A straight Line starting at /timeStart/, /valueStart/ and ending at /timeEnd/, /valueEnd/
    public static linear (timeStart: number, valueStart: number, timeEnd: number, valueEnd: number) {
        let tangent = (valueEnd - valueStart) / (timeEnd - timeStart);

        let curve = new CurveRange();
        curve.mode = CurveRange.Mode.Curve;

        curve.curve.keyFrames!.length = 0;
        if (timeStart === timeEnd) {
            curve.curve.addKey(createKeyframe(timeStart, valueStart));
        }
        else {
            curve.curve.addKey(createKeyframe(timeStart, valueStart, 0.0, tangent));
            curve.curve.addKey(createKeyframe(timeEnd, valueEnd, tangent, 0.0));
        }

        return curve;
    }

    // An ease-in and out curve starting at /timeStart/, /valueStart/ and ending at /timeEnd/, /valueEnd/.
    public static easeInOut (timeStart: number, valueStart: number, timeEnd: number, valueEnd: number) {
        let curve = new CurveRange();
        curve.mode = CurveRange.Mode.Curve;

        curve.curve.keyFrames!.length = 0;
        if (timeStart === timeEnd) {
            curve.curve.addKey(createKeyframe(timeStart, valueStart));
        }
        else {
            curve.curve.addKey(createKeyframe(timeStart, valueStart, 0.0, 0.0));
            curve.curve.addKey(createKeyframe(timeEnd, valueEnd, 0.0, 0.0));
        }

        return curve;
    }


    public static constant (value: number) {
        let curve = new CurveRange;
        curve.constant = value;
        return curve;
    }
    public static one () {
        return this.constant(1);
    }
    public static zero () {
        return this.constant(0);
    }
}

