import { AssetLibrary, Mesh } from "cc";
import { EDITOR } from 'cc/env';

let _createMesh: (filePath: string) => Promise<Mesh>;
let _saveMesh: (filePath: string, mesh: Mesh) => Promise<Mesh>;

// @ts-ignore
if (EDITOR && typeof (BUILDER) === 'undefined') {

    const globalThisAny = globalThis as any;
    const { createReadStream, createWriteStream, ensureDirSync, existsSync, readdirSync, removeSync, writeFileSync } = globalThisAny.require('fs-extra');
    const { dirname, join, parse } = globalThisAny.require('path');
    const archiver = globalThisAny.require('archiver');
    const os = globalThisAny.require('os')
    const Editor = globalThisAny.require('editor')

    const projectPath = EDITOR && Editor.Project.path;

    const tmpdir = os.tmpdir();

    async function zip (target: string, files: string[]) {
        return new Promise((resolve, reject) => {
            const output = createWriteStream(target);
            const archive = archiver('zip');

            let data: number[] = [];
            output.on('error', (error: Error) => {
                reject(error);
            });

            output.on('close', () => {
                console.log('zip close');
                resolve(new Uint8Array(data))
            });

            archive.on('data', function (subdata: number[]) {
                for (let i = 0; i < subdata.length; i++) {
                    data.push(subdata[i]);
                }
            });

            archive.pipe(output);

            files.forEach((file: string) => {
                const nameItem = parse(file);
                archive.append(createReadStream(file), { name: nameItem.ext.substr(1) });
            });

            archive.finalize();
        })
    }

    _createMesh = async function createMesh (filePath: string) {
        let mesh = new Mesh();
        mesh._setRawAsset('.bin');

        return mesh;
    }

    _saveMesh = async function saveMesh (filePath: string, mesh: Mesh) {
        filePath = join(projectPath, 'assets', filePath);

        mesh._setRawAsset('.bin');
        // @ts-ignore
        mesh._dataLength = mesh.data.byteLength;
        // @ts-ignore
        let meshJson = EditorExtends.serialize(mesh);
        let meshBin = mesh.data;

        let meshJsonPath = join(tmpdir, 'creator/SaveMesh/__meshJson__.json');
        let meshBinPath = join(tmpdir, 'creator/SaveMesh/__meshBin__.bin');
        let meshZipPath = join(tmpdir, 'creator/SaveMesh/__meshZip__.zip');
        ensureDirSync(dirname(meshJsonPath));

        writeFileSync(meshJsonPath, meshJson);
        writeFileSync(meshBinPath, meshBin);

        ensureDirSync(dirname(filePath));
        let data = await zip(meshZipPath, [meshJsonPath, meshBinPath]);

        const url = await Editor.Ipc.requestToPackage('asset-db', 'query-url-by-path', filePath);

        let assetUid = '';
        if (existsSync(filePath)) {
            assetUid = await Editor.Ipc.requestToPackage('asset-db', 'query-asset-uuid', url);
            await Editor.Ipc.requestToPackage('asset-db', 'save-asset', assetUid, data);
        } else {
            assetUid = await Editor.Ipc.requestToPackage('asset-db', 'create-asset', url, data);
        }

        return new Promise((resolve, reject) => {
            setTimeout(() => {
                AssetLibrary.loadAsset(assetUid, (err: any, asset: any) => {
                    if (err) {
                        return reject(err);
                    }
                    resolve(asset);
                });
            }, 500);
        })
    }

}

// @ts-ignore
export let createMesh = _createMesh;
// @ts-ignore
export let saveMesh = _saveMesh;
