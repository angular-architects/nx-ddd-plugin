import { chain, externalSchematic, Rule, Tree, SchematicsException, apply, url, template, move, mergeWith, noop, filter } from '@angular-devkit/schematics';
import { FeatureOptions } from './schema';
import { strings } from '@angular-devkit/core';

import { addImportToModule, addDeclarationToModule, addExportToModule } from '@schematics/angular/utility/ast-utils';
import { InsertChange } from '@schematics/angular/utility/change';
import * as ts from '@schematics/angular/third_party/github.com/Microsoft/TypeScript/lib/typescript';
// import * as ts from 'typescript';



// Taken from @schematics/angular
function readIntoSourceFile(host: Tree, modulePath: string): ts.SourceFile {
  const text = host.read(modulePath);
  if (text === null) {
    throw new SchematicsException(`File ${modulePath} does not exist.`);
  }
  const sourceText = text.toString('utf-8');

  return ts.createSourceFile(modulePath, sourceText, ts.ScriptTarget.Latest, true);
}

function addImport(
  modulePath: string, 
  ngModuleToImportPath: string, 
  ngModuleToImportName: string, 
  optional = false): Rule {
  
    return (host: Tree) => {

      if (optional && !host.exists(modulePath)) {
        return;
      }

      const source = readIntoSourceFile(host, modulePath);

      const changes = addImportToModule(
                        source, 
                        modulePath, 
                        ngModuleToImportName, 
                        ngModuleToImportPath)

      const declarationRecorder = host.beginUpdate(modulePath);
      for (const change of changes) {
        if (change instanceof InsertChange) {
          declarationRecorder.insertLeft(change.pos, change.toAdd);
        }
      }
      host.commitUpdate(declarationRecorder);
  }
}

function addDeclaration(
  modulePath: string, 
  componentToImportPath: string, 
  componentToImportName: string): Rule {
  
    return (host: Tree) => {

      const source = readIntoSourceFile(host, modulePath);

      const changes = addDeclarationToModule(
                        source, 
                        modulePath,
                        componentToImportName,
                        componentToImportPath);

      const declarationRecorder = host.beginUpdate(modulePath);
      for (const change of changes) {
        if (change instanceof InsertChange) {
          declarationRecorder.insertLeft(change.pos, change.toAdd);
        }
      }
      host.commitUpdate(declarationRecorder);
  }
}

function addExport(
  modulePath: string, 
  componentToImportPath: string, 
  componentToImportName: string): Rule {
  
    return (host: Tree) => {

      const source = readIntoSourceFile(host, modulePath);

      const changes = addExportToModule(
                        source, 
                        modulePath,
                        componentToImportName,
                        componentToImportPath);

      const declarationRecorder = host.beginUpdate(modulePath);
      for (const change of changes) {
        if (change instanceof InsertChange) {
          declarationRecorder.insertLeft(change.pos, change.toAdd);
        }
      }
      host.commitUpdate(declarationRecorder);
  }
}

function addTsExport(filePath: string, filesToExport: string[]): Rule {
  return (host: Tree) => {
    let content = host.read(filePath) + '\n';
    
    for(const file of filesToExport) {
      content += `export * from '${file}';\n`;
    }

    host.overwrite(filePath, content);
  }
}

function filterTemplates(options: FeatureOptions): Rule {
  if (!options.entity) {
    return filter(path => !!path.match(/\.facade\.ts$/));
  }
  return filter(_ => true);
}

function readWorkspaceName(host: Tree): string {
  const content = host.read('nx.json').toString();
  const config = JSON.parse(content);
  return '@' + config['npmScope'];
}

export default function(options: FeatureOptions): Rule {

  return (host: Tree) => {

    const workspaceName = readWorkspaceName(host);

    const domainName = strings.dasherize(options.domain);
    const domainFolderName = domainName;
    const domainPath = `libs/${domainFolderName}/domain/src/lib`;
    const domainModulePath = `${domainPath}/${domainFolderName}-domain.module.ts`;
    const domainModuleClassName = strings.classify(options.domain) + "DomainModule";
    const domainImportPath = `${workspaceName}/${domainFolderName}/domain`;
    const domainIndexPath = `libs/${domainFolderName}/domain/src/index.ts`;

    const featureName = strings.dasherize(options.name);
    const featureFolderName = 'feature-' + featureName;
    const featurePath = `libs/${domainFolderName}/${featureFolderName}/src/lib`;
    const featureModulePath = `${featurePath}/${domainFolderName}-${featureFolderName}.module.ts`;
    const featureModuleClassName = strings.classify(`${options.domain}-${featureFolderName}Module`);
    const featureImportPath = `${workspaceName}/${domainFolderName}/${featureFolderName}`;
    const featureIndexPath = `libs/${domainFolderName}/${featureFolderName}/src/index.ts`;

    const entityName = options.entity ? strings.dasherize(options.entity) : '';
    
    const featureComponentImportPath = `./${featureName}.component`;
    const featureComponentClassName = strings.classify(`${featureName}Component`);

    const appName = options.app || options.domain;
    const appFolderName = strings.dasherize(appName);
    const appModulePath = `apps/${appFolderName}/src/app/app.module.ts`;

    const domainTemplates = apply(url('./files/forDomain'), [
      filterTemplates(options),
      template({ ...strings, ...options, workspaceName }),
      move(domainPath)
    ]);

    const featureTemplates = apply(url('./files/forFeature'), [
      template({ ...strings, ...options, workspaceName }),
      move(featurePath)
    ]);

    return chain([
      externalSchematic('@nrwl/angular', 'lib', {
        name: `feature-${options.name}`,
        directory: options.domain,
        tags: `domain:${options.domain},type:feature`,
        style: 'scss',
        prefix: options.domain,
      }),
      addImport(featureModulePath, domainImportPath, domainModuleClassName),
      (!options.lazy && host.exists(appModulePath)) ? 
        chain([
          addImport(appModulePath, featureImportPath, featureModuleClassName, true),
          addImport(appModulePath, '@angular/common/http', 'HttpClientModule', true)
        ]) :
        noop(),
      mergeWith(domainTemplates),
      (options.entity) ? 
        addTsExport(domainIndexPath, [
          `./lib/entities/${entityName}`,
          `./lib/infrastructure/${entityName}.data.service`
        ]) :
        noop(),
      addTsExport(domainIndexPath, [`./lib/application/${featureName}.facade`]),
      mergeWith(featureTemplates),
      addTsExport(featureIndexPath, [`./lib/${featureName}.component`]),
      addDeclaration(featureModulePath, featureComponentImportPath, featureComponentClassName),
      addExport(featureModulePath, featureComponentImportPath, featureComponentClassName),
    ]);
  }
}
