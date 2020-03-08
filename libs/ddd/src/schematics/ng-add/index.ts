import { 
  chain, 
  Rule, 
} from '@angular-devkit/schematics';

import { initLintingRules } from '../utils/update-linting-rules';

export default function(): Rule {
  return chain([
    initLintingRules(),
  ]);
}
