import { EDITOR } from 'cc/env';

export function formatPath (p: string) {
    return p.replace(/\\/g, '/');
}

export const cce = EDITOR && (window as any).cce;
export const io = EDITOR && (window as any).require('socket.io');
export const path = EDITOR && (window as any).require('path');
export const fse = EDITOR && (window as any).require('fs-extra');
export const base642arraybuffer = EDITOR && (window as any).require('base64-arraybuffer');
