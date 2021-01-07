import {
  chain,
  Rule
} from '@angular-devkit/schematics';
import { addDepsToPackageJson } from '@nrwl/workspace';
import { initLintingRules } from '../rules';
import { NGRX_VERSION } from '../utils';

export default function(): Rule {
  return chain([
    initLintingRules(),
    addDepsToPackageJson({
      '@ngrx/schematics': NGRX_VERSION
    })
  ]);
}
