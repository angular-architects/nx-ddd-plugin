/**
 * credit: https://github.com/nrwl/nx/blob/master/packages/workspace/src/utils/ast-utils.ts
 * we use this instead of @nrwl/workspace version of import because the nrwl/workspace uses
 * an internal version of Change and we are using the @schematics/angular/utility/ast-utils'
 * version
 */
import { Tree } from '@angular-devkit/schematics';
import { RemoveChange } from '@nrwl/workspace';
import {
  Change,
  InsertChange,
  NoopChange,
} from '@schematics/angular/utility/change';

/**
 * insert
 * @param host Host
 * @param modulePath path to module
 * @param changes array of changes
 */
export function insert(host: Tree, modulePath: string, changes: Change[]) {
  if (changes.length < 1) {
    return;
  }

  // sort changes so that the highest pos goes first
  // and filter out noop changes
  const orderedChanges = changes
    .sort((a, b) => b.order - a.order)
    .filter((change) => !(change instanceof NoopChange));

  const recorder = host.beginUpdate(modulePath);
  for (const change of orderedChanges) {
    if (change instanceof InsertChange) {
      recorder.insertLeft(change.pos, change.toAdd);
    } else if (change instanceof RemoveChange) {
      recorder.remove(change.pos - 1, change.toRemove.length + 1);
    } else {
      throw new Error(`Unexpected Change '${change.constructor.name}'`);
    }
  }
  host.commitUpdate(recorder);
}
