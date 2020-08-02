import { Tree } from '@angular-devkit/schematics';
import { SchematicTestRunner } from '@angular-devkit/schematics/testing';
import { NxJson, readJsonInTree } from '@nrwl/workspace';
import { createEmptyWorkspace } from '@nrwl/workspace/testing';
import { join } from 'path';
import { UiOptions } from './schema';

describe('ui', () => {
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

  it('should add correct tags if ui lib is shared', async () => {
    const tree = await runSchematic<UiOptions>(
      'ui',
      { name: 'form-components', shared: true },
      appTree
    );

    const nxJson = readJsonInTree<NxJson>(tree, '/nx.json');
    expect(nxJson.projects).toEqual({
      'shared-ui-form-components': {
        tags: ['domain:shared', 'type:ui']
      }
    });
  });

  it('should add correct tags if ui lib belongs to a domain', async () => {
    const tree = await runSchematic<UiOptions>(
      'ui',
      { name: 'form-components', domain: 'customer' },
      appTree
    );

    const nxJson = readJsonInTree<NxJson>(tree, '/nx.json');
    expect(nxJson.projects).toEqual({
      'customer-ui-form-components': {
        tags: ['domain:customer', 'type:ui']
      }
    });
  });

  it('should throw error if neither domain nor shared option is provided', async () => {
    const schematicFunc = async () =>
      await runSchematic<UiOptions>('ui', { name: 'form-components' }, appTree);
    await expect(schematicFunc()).rejects.toThrowError();
  });

  it('should throw error if domain and shared option is provided', async () => {
    const schematicFunc = async () =>
      await runSchematic<UiOptions>(
        'ui',
        { name: 'form-components', domain: 'customer', shared: true },
        appTree
      );
    await expect(schematicFunc()).rejects.toThrowError();
  });
});
