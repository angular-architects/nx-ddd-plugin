import {Tree, formatFiles, generateFiles, joinPathFragments, logger} from '@nx/devkit';
import { libraryGenerator } from '@nx/angular/generators';
import { UiOptions } from './schema';
import { strings } from '@angular-devkit/core';
import { validateInputs } from '../utils/validate-inputs';
import { deleteDefaultComponent } from '../utils/delete-default-component';

import {getWorkspaceScope} from "../utils/get-workspace-scope";
import {customizeLibraryConfig, getComponentDetails, getProjectDetails} from "../utils/library-config-utils";
import {updateComponentFiles} from "../utils/componenet-files-utils";
import {dasherize} from "@nx/devkit/src/utils/string-utils";

export default async function (tree: Tree, options: UiOptions) {
  validateInputs(options);

  const {
    name,
    prefix,
    shared,
    directory,
    type,
    importPath,
    standalone,
    flat,
    additionalPrefix,
    simpleName,
    style
  } = options;

  const libName = (prefix ? 'ui-' : '') + strings.dasherize(name);
  const domain = shared ? 'shared' : options.domain;
  const libDirectory = directory ? `${domain}/${directory}` : domain;
  const isPublishableLib = type === 'publishable';

  const project = getProjectDetails(libDirectory, libName);
  const component = getComponentDetails(project.path.root, {
    ...options,
    libName
  });

  await libraryGenerator(tree, {
    name: libName,
    tags: `domain:${domain},type:ui`,
    prefix: additionalPrefix,
    publishable: isPublishableLib,
    buildable: type === 'buildable',
    directory: libDirectory,
    importPath: importPath,
    standalone: standalone,
    selector: strings.dasherize(component.className),
    viewEncapsulation: 'None',
    changeDetection: 'OnPush',
    style,
    flat,
    simpleName
  });

  deleteDefaultComponent(
      tree,
      libDirectory,
      libName,
      name
  );

  await customizeLibraryConfig(tree, project);

  const tmpl = '';
  const params = {
    ...strings,
    ...options,
    'name@dasherize': component.fileName,
    fileName: dasherize(component.fileName),
    className: component.className,
    selector: component.selector,
    workspaceName: getWorkspaceScope(tree),
    tmpl
  };

  generateFiles(
      tree,
      joinPathFragments(__dirname, './files'),
      component.path.root,
      params
  );

  // update component files, which include component, scss, spec, and index.
  updateComponentFiles(tree, component, project.path.index);

  await formatFiles(tree);
}

