import { strings } from '@angular-devkit/core';
import { libraryGenerator } from '@nx/angular/generators';
import { Tree, formatFiles } from '@nx/devkit';
import { validateInputs } from '../utils/validate-inputs';
import { UtilOptions } from './schema';

export const angularArchitectsDddUtilGenerator = async (
  tree: Tree,
  options: UtilOptions
) => {
  validateInputs(options);

  const libName = `util-${strings.dasherize(options.name)}`;
  const domain = options.shared ? 'shared' : options.domain;
  const libDirectory = options.directory
    ? `${domain}/${options.directory}`
    : domain;
  const isPublishableLib = options.type === 'publishable';

  await libraryGenerator(tree, {
    name: libName,
    tags: `domain:${domain},type:util`,
    prefix: options.name,
    publishable: isPublishableLib,
    buildable: options.type === 'buildable',
    directory: libDirectory,
    importPath: options.importPath,
    standalone: options.standalone,
  });

  await formatFiles(tree);
};

export default angularArchitectsDddUtilGenerator;
