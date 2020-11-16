import { Tree } from '@angular-devkit/schematics';

/**
 * readWorkspaceName
 * @param host host provided to a rule
 */
export function readWorkspaceName(host: Tree): string {
  const content = host.read('nx.json').toString();
  const config = JSON.parse(content);
  return '@' + config['npmScope'];
}
