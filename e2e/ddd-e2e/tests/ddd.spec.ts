import {
  checkFilesExist,
  ensureNxProject,
  readJson,
  runNxCommandAsync,
  uniq,
} from '@nrwl/nx-plugin/testing';
describe('ddd e2e', () => {
  it('should create ddd', async () => {
    const plugin = uniq('ddd');
    ensureNxProject('@angular-architects/ddd', 'dist/packages/ddd');
    await runNxCommandAsync(`generate @angular-architects/ddd:ddd ${plugin}`);

    const result = await runNxCommandAsync(`build ${plugin}`);
    expect(result.stdout).toContain('Executor ran');
  }, 120000);

  describe('--directory', () => {
    it('should create src in the specified directory', async () => {
      const plugin = uniq('ddd');
      ensureNxProject('@angular-architects/ddd', 'dist/packages/ddd');
      await runNxCommandAsync(
        `generate @angular-architects/ddd:ddd ${plugin} --directory subdir`
      );
      expect(() =>
        checkFilesExist(`libs/subdir/${plugin}/src/index.ts`)
      ).not.toThrow();
    }, 120000);
  });

  describe('--tags', () => {
    it('should add tags to the project', async () => {
      const plugin = uniq('ddd');
      ensureNxProject('@angular-architects/ddd', 'dist/packages/ddd');
      await runNxCommandAsync(
        `generate @angular-architects/ddd:ddd ${plugin} --tags e2etag,e2ePackage`
      );
      const project = readJson(`libs/${plugin}/project.json`);
      expect(project.tags).toEqual(['e2etag', 'e2ePackage']);
    }, 120000);
  });
});
/*
      const nxJson = readJson('nx.json');
      expect(nxJson.projects[plugin].tags).toEqual(['e2etag', 'e2ePackage']);
      done();
    });
  });
});
*/
