import { gfx, utils } from "cc";

export const builtinAttributes = {
    position: { name: gfx.AttributeName.ATTR_POSITION, format: gfx.Format.RGB32F },
    normal: { name: gfx.AttributeName.ATTR_NORMAL, format: gfx.Format.RGB32F },
    uv: { name: gfx.AttributeName.ATTR_TEX_COORD, format: gfx.Format.RG32F },
    uv1: { name: gfx.AttributeName.ATTR_TEX_COORD1, format: gfx.Format.RG32F },
    color: { name: gfx.AttributeName.ATTR_COLOR, format: gfx.Format.RGBA32F },
    tangent: { name: gfx.AttributeName.ATTR_TANGENT, format: gfx.Format.RGBA32F },
}
export type AttributesKey = 'position' | 'normal' | 'uv' | 'uv1' | 'tangent' | 'color';

export default class FixedBuffer {
    static create (verticesCount: number, indicesCount: number, attributes: AttributesKey[] = ['position', 'normal', 'tangent', 'uv', 'uv1'], { arrayBuffer = null as ArrayBuffer | null, arrayBufferVerticesOffset = 0, arrayBufferIndicesOffset = 0 }) {

        let attrs: any = {};

        let stride = 0;
        for (let i = 0; i < attributes.length; i++) {
            let builtinAttribute = builtinAttributes[attributes[i]];
            let format = builtinAttribute.format;
            let info = gfx.FormatInfos[format];
            attrs[attributes[i]] = {
                gfxIndex: i,
                offset: stride,
                format: format
            };

            stride += info.size;
        }

        let fixedBuffer = new FixedBuffer;

        fixedBuffer.verticesCount = verticesCount;
        fixedBuffer.indicesCount = indicesCount;

        fixedBuffer.verticesBytes = verticesCount * stride;
        fixedBuffer.indicesBytes = indicesCount * 2;

        if (arrayBuffer) {
            fixedBuffer.verticesOffset = arrayBufferVerticesOffset;
            fixedBuffer.indicesOffset = arrayBufferIndicesOffset;

            fixedBuffer._buffer = arrayBuffer;
        }
        else {
            fixedBuffer.verticesOffset = 0;
            fixedBuffer.indicesOffset = fixedBuffer.verticesBytes;

            fixedBuffer._buffer = new ArrayBuffer(verticesCount * stride + indicesCount * 2);
        }

        fixedBuffer._dataView = new DataView(fixedBuffer._buffer, fixedBuffer.verticesOffset, fixedBuffer.verticesBytes);
        fixedBuffer._iView = new Uint16Array(fixedBuffer._buffer, fixedBuffer.indicesOffset, indicesCount);
        fixedBuffer._vbuffer = new Uint8Array(fixedBuffer._buffer, fixedBuffer.verticesOffset, fixedBuffer.verticesBytes);
        fixedBuffer._ibuffer = new Uint8Array(fixedBuffer._buffer, fixedBuffer.indicesOffset, fixedBuffer.indicesBytes);

        fixedBuffer.stride = stride;
        fixedBuffer._attrs = attrs;

        return fixedBuffer;
    }

    _buffer: ArrayBuffer | null = null;
    _ibuffer: Uint8Array | null = null;
    _vbuffer: Uint8Array | null = null;

    _dataView: DataView | null = null;

    _iView: Uint16Array | null = null;

    _attrs: any = {};

    verticesCount = 0;
    indicesCount = 0;

    verticesBytes = 0;
    indicesBytes = 0;

    verticesOffset = 0;
    indicesOffset = 0;

    stride = 0;

    writeVertex (vertOffset: number, attrName: number, value: number[]) {
        let attr = this._attrs[attrName];
        let offset = this.verticesOffset + vertOffset * this.stride + attr.offset;
        utils.writeBuffer(this._dataView!, value, attr.format, offset, this.stride);
    }
    writeIndex (indexOffset: number, value: number) {
        let offset = this.indicesOffset + indexOffset;
        this._iView![offset] = value;
    }
}
