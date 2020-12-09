import { EDITOR } from 'cc/env';
import { formatPath, path } from './npm';

export const Editor = EDITOR && (window as any).Editor;
export const projectPath = EDITOR && formatPath(Editor.Project.path);
export const projectAssetPath = EDITOR && formatPath(path.join(projectPath, 'assets'));
