/**
 * credit: https://github.com/nrwl/nx/tree/master/packages/angular/src/schematics/ngrx/rules
 */
import { Rule } from '@angular-devkit/schematics';
import { addDepsToPackageJson } from '@nrwl/workspace';
import { NGRX_VERSION } from '../utils';

/**
 * addNgRxToPackageJson
 * add the ngrx packages to the package.json and install them
 */
export function addNgRxToPackageJson(): Rule {
  return addDepsToPackageJson(
    {
      '@ngrx/store': NGRX_VERSION,
      '@ngrx/effects': NGRX_VERSION,
      '@ngrx/entity': NGRX_VERSION,
      '@ngrx/store-devtools': NGRX_VERSION,
    },
    {}
  );
}

/**
 * TODO: reconcile the assumption of forRoot
 */
