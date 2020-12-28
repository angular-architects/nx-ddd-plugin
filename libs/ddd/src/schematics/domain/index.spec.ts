import { Tree } from '@angular-devkit/schematics';
import { SchematicTestRunner } from '@angular-devkit/schematics/testing';
import { NxJson, readJsonInTree } from '@nrwl/workspace';
import { createEmptyWorkspace } from '@nrwl/workspace/testing';
import { join } from 'path';

describe('domain', () => {
  let appTree: Tree;

  const testRunner = new SchematicTestRunner(
    '@angular-architects/ddd',
    join(__dirname, '../../../collection.json')
  );

  function runSchematic<SchemaOptions = any>(
    schematicName: string,
    options: SchemaOptions,
    tree: Tree
  ) {
    return testRunner
      .runSchematicAsync(schematicName, options, tree)
      .toPromise();
  }

  beforeEach(() => {
    appTree = Tree.empty();
    appTree = createEmptyWorkspace(appTree);
  });

  /**
  it('should ........', async () => {
    const tree = await runSchematic<UiOptions>(
      'ui',
      { name: 'form-components', shared: true },
      appTree
    );

    const nxJson = readJsonInTree<NxJson>(tree, '/nx.json');
    expect(nxJson.projects).toEqual({
      '........': {
        tags: ['domain:abcdefg', 'type:xyz'],
      },
    });
  });
  */
});
