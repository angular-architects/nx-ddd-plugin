import { chain, Rule } from '@angular-devkit/schematics';
// import { addDepsToPackageJson } from '@nrwl/workspace';

import { initLintingRules } from '../rules';
// import { NGRX_VERSION } from '../../utils';

export default function (): Rule {
  return chain([
    initLintingRules(),
    // This is now a dependency in package.json
    // This prevents issues when installing this lib
    //   and makes installing faster
    // addDepsToPackageJson({}, {
    //   '@ngrx/schematics': NGRX_VERSION
    // })
  ]);
}
