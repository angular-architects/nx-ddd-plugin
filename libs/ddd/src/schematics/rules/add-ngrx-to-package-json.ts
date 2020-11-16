/**
 * credit: https://github.com/nrwl/nx/tree/master/packages/angular/src/schematics/ngrx/rules
 */
import { Rule } from '@angular-devkit/schematics';
import { addDepsToPackageJson } from '@nrwl/workspace';

/**
 * addNgRxToPackageJson
 * add the ngrx packages to the package.json and install them
 */
export function addNgRxToPackageJson(): Rule {
  const ngrxVersion = '10.0.0';

  return addDepsToPackageJson(
    {
      '@ngrx/store': ngrxVersion,
      '@ngrx/effects': ngrxVersion,
      '@ngrx/entity': ngrxVersion,
      '@ngrx/store-devtools': ngrxVersion,
    },
    {}
  );
}

/**
 * TODO: reconcile the assumption of forRoot
 */
