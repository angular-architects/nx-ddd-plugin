import { Tree } from '@nx/devkit';
import * as path from 'path';

export function deleteDefaultComponent(tree: Tree, finalDirectory: string, finalName: string, deleteIndex = true): void {
    const dirToDel = path.join(finalDirectory, 'src', 'lib', finalName);
    //console.log('dirToDel', dirToDel);
    let deleted = false;
    if (tree.exists(dirToDel)) {
        tree.delete(dirToDel);
        deleted = true;
    }

    const index = path.join(finalDirectory, 'src', 'index.ts');
    if (deleteIndex && deleted && tree.exists(index)) {
        const contents = tree.read(index, 'utf-8');
        const rest = contents.split('\n').slice(1);
        tree.write(index, (rest || []).join('\n'));
    }
}
