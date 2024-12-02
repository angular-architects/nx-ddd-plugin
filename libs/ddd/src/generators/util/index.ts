import { Tree, formatFiles } from '@nx/devkit';
import { libraryGenerator } from '@nx/angular/generators';
import { UtilOptions } from './schema';
import { strings } from '@angular-devkit/core';
import { validateInputs } from '../utils/validate-inputs';
import { deleteDefaultComponent } from '../utils/delete-default-component';

export default async function (tree: Tree, options: UtilOptions) {
  validateInputs(options);

  const libName = `util-${strings.dasherize(options.name)}`;
  const libDirectory = options.directory ? strings.dasherize(options.directory) : libName;
  const domainName = options.shared ? 'shared' : options.domain;
  const isPublishableLib = options.type === 'publishable';

  // additions for Nx20 by LXT
  const finalName = domainName + '-' + libName;
  const finalDirectory = `libs/${domainName}/${libDirectory}`;

  await libraryGenerator(tree, {
    name: finalName,
    prefix: finalName,
    directory: finalDirectory,
    tags: `domain:${domainName},type:util`,
    publishable: isPublishableLib,
    buildable: options.type === 'buildable',
    importPath: options.importPath,
    standalone: options.standalone,
  });

  deleteDefaultComponent(
    tree,
    finalDirectory,
    finalName
  );

  await formatFiles(tree);
}
