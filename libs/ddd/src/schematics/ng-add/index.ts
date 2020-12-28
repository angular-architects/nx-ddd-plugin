import { chain, Rule } from '@angular-devkit/schematics';
import { initLintingRules } from '../rules';

export default function (): Rule {
  return chain([initLintingRules()]);
}
