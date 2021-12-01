import { Tree } from '@angular-devkit/schematics';
import { SchematicTestRunner } from '@angular-devkit/schematics/testing';
import { readWorkspaceJson, readJsonInTree } from '@nrwl/workspace';
import { createEmptyWorkspace } from '@nrwl/workspace/testing';
import { join } from 'path';
import { Schema } from './schema';

describe('util', () => {
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

  it('should add correct tags if util lib is shared', async () => {
    const tree = await runSchematic<Schema>(
      'util',
      { name: 'form-validation', shared: true },
      appTree
    );

    const nxJson = readWorkspaceJson();
    expect(nxJson.projects).toEqual({
      'shared-util-form-validation': {
        tags: ['domain:shared', 'type:util'],
      },
    });
  });

  it('should add correct tags if util lib belongs to a domain', async () => {
    const tree = await runSchematic<Schema>(
      'util',
      { name: 'form-validation', domain: 'customer' },
      appTree
    );

    const nxJson = readWorkspaceJson();
    expect(nxJson.projects).toEqual({
      'customer-util-form-validation': {
        tags: ['domain:customer', 'type:util'],
      },
    });
  });

  it('should throw error if neither domain nor shared option is provided', async () => {
    const schematicFunc = async () =>
      await runSchematic<Schema>('util', { name: 'form-validation' }, appTree);
    await expect(schematicFunc()).rejects.toThrowError();
  });

  it('should throw error if domain and shared option is provided', async () => {
    const schematicFunc = async () =>
      await runSchematic<Schema>(
        'util',
        { name: 'form-validation', domain: 'customer', shared: true },
        appTree
      );
    await expect(schematicFunc()).rejects.toThrowError();
  });

  it('should be able to customize the directory of the library within the domain / shared folder', async () => {
    const tree = await runSchematic<Schema>(
      'util',
      { name: 'form-validation', domain: 'customer', directory: 'forms' },
      appTree
    );

    const workspaceJson = readJsonInTree(tree, '/workspace.json');
    expect(workspaceJson.projects).toHaveProperty(
      'customer-forms-util-form-validation'
    );
    expect(
      workspaceJson.projects['customer-forms-util-form-validation'].root
    ).toEqual('libs/customer/forms/util-form-validation');
  });

  it('should keep correct tags with a customized directory', async () => {
    const tree = await runSchematic<Schema>(
      'util',
      { name: 'form-validation', domain: 'customer', directory: 'forms' },
      appTree
    );

    const nxJson = readWorkspaceJson();
    expect(nxJson.projects).toEqual({
      'customer-forms-util-form-validation': {
        tags: ['domain:customer', 'type:util'],
      },
    });
  });

  it('should add valid import path to publishable lib', async () => {
    const tree = await runSchematic<Schema>(
      'util',
      { name: 'form-validation', shared: true, type: 'publishable' },
      appTree
    );

    const ngPackage = readJsonInTree(
      tree,
      'libs/shared/util-form-validation/ng-package.json'
    );
    expect(ngPackage).toBeDefined();
    const packageJson = readJsonInTree(
      tree,
      'libs/shared/util-form-validation/package.json'
    );
    expect(packageJson.name).toEqual('@proj/shared-util-form-validation');
  });

  it('should add valid import path to publishable lib with customized directory', async () => {
    const tree = await runSchematic<Schema>(
      'util',
      {
        name: 'form-validation',
        shared: true,
        type: 'publishable',
        directory: 'forms',
      },
      appTree
    );

    const ngPackage = readJsonInTree(
      tree,
      'libs/shared/forms/util-form-validation/ng-package.json'
    );
    expect(ngPackage).toBeDefined();
    const packageJson = readJsonInTree(
      tree,
      'libs/shared/forms/util-form-validation/package.json'
    );
    expect(packageJson.name).toEqual('@proj/shared-forms-util-form-validation');
  });
});
