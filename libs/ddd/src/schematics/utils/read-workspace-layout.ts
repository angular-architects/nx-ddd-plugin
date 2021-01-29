import { Tree } from '@angular-devkit/schematics';
import { readJsonFile } from '@nrwl/workspace';

export interface WorkspaceLayout {
  appsDir: boolean;
  libsDir: boolean;
}

/**
 * readWorkspaceLayout
 * @param host host provided to a rule
 */
export function readWorkspaceLayout(host: Tree): WorkspaceLayout {
  const content = host.read('nx.json').toString();
  const config = JSON.parse(content);
  return (
    config['workspaceLayout'] ?? {
      appsDir: 'apps',
      libsDir: 'libs',
    }
  );
}

export function readNxWorkspaceLayout(): WorkspaceLayout {
  const config = readJsonFile('nx.json')
  return (
    config['workspaceLayout'] ?? {
      appsDir: 'apps',
      libsDir: 'libs',
    }
  );
}
