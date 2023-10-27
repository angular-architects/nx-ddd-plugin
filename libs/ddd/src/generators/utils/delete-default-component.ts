import { Tree } from '@nx/devkit';
import { dasherize } from '@nx/devkit/src/utils/string-utils';
import * as path from 'path';

export function deleteDefaultComponent(tree: Tree, directory: string, libName: string, prefix: string): void {
    const dirToDel = path.join('libs', directory, dasherize(libName), 'src', 'lib', dasherize(directory + '-' + libName));
    let deleted = false;
    if (tree.exists(dirToDel)) {
        tree.delete(dirToDel);
        deleted = true;
    }

    const index = path.join('libs', directory, dasherize(libName), 'src', 'index.ts');
    if (deleted && tree.exists(index)) {
        const contents = tree.read(index, 'utf-8');
        const rest = contents.split('\n').slice(1);
        tree.write(index, (rest || []).join('\n'));
    }

}