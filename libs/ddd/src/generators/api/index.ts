import { Tree, formatFiles } from '@nx/devkit';
import { libraryGenerator } from '@nx/angular/generators';
import { ApiOptions } from './schema';
import { strings } from '@angular-devkit/core';
import { validateInputs } from '../utils/validate-inputs';
import { deleteDefaultComponent } from '../utils/delete-default-component';

export default async function (tree: Tree, options: ApiOptions) {
  validateInputs(options);

  const libName = options.name ? `api-${strings.dasherize(options.name)}` : 'api';
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
    tags: `domain:${domainName},domain:${domainName}/${libName},type:api`,
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

  console.info(
    `\nHINT: Don\'t forget to extend the rules in your "eslint.config.js" to allow selected domains to access this API.\nFor this, add the tag domain:${domainName}/${libName} to the respective domains' rule sets.\n `
  );

  await formatFiles(tree);
}
