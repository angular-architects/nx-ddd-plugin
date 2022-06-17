import {
  chain,
  Rule
} from '@angular-devkit/schematics';

// In Nx 13.4.1, we had issues with converting generators to schematics
// Hence, we haven't removed this sole ng-add schematic so far
import { initLintingRules } from '../rules/init-linting-rules';

export default function(): Rule {
  return chain([
    initLintingRules(),
  ]);
}
