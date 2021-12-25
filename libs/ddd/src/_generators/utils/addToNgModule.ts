import { Tree } from '@nrwl/devkit';
import * as ts from 'typescript';
import { insertImport } from '@nrwl/workspace/src/utilities/ast-utils';
import { insertNgModuleProperty } from '@nrwl/angular/src/generators/utils';

export function addDeclarationToNgModule(tree: Tree, { filePath, importClassName, importPath }: { filePath: string; importClassName: string; importPath: string; }) {
  addImportToTsModule(tree, { filePath, importClassName, importPath });
  insertNgModuleProperty(tree, filePath, importClassName, 'declarations');
}

export function addDeclarationWithExportToNgModule(tree: Tree, { filePath, importClassName, importPath }: { filePath: string; importClassName: string; importPath: string; }) {
  addDeclarationToNgModule(tree, { filePath, importClassName, importPath });
  insertNgModuleProperty(tree, filePath, importClassName, 'exports');
}

export function addImportToNgModule(tree: Tree, { filePath, importClassName, importPath }: { filePath: string; importClassName: string; importPath: string; }) {
  addImportToTsModule(tree, { filePath, importClassName, importPath });
  insertNgModuleProperty(tree, filePath, importClassName, 'imports');
}

export function addImportToTsModule(tree: Tree, {filePath, importClassName, importPath }: { filePath: string; importClassName: string; importPath: string; }) {
  const moduleSource = tree.read(filePath, 'utf-8');

  let sourceFile = ts.createSourceFile(
    filePath,
    moduleSource,
    ts.ScriptTarget.Latest,
    true
  );

  insertImport(
    tree,
    sourceFile,
    filePath,
    importClassName,
    importPath);
}
