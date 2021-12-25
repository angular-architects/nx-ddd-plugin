import { Tree } from '@nrwl/devkit';
import { checkRuleExists } from './check-rule-exists';

export function updateDepConst(
  host: Tree,
  update: (depConst: Array<object>) => void
) {
  let filePath = 'tslint.json';
  let rule = 'nx-enforce-module-boundaries';

  if (!host.exists('tslint.json')) {
    if (host.exists('.eslintrc.json')) {
      filePath = '.eslintrc.json';
      rule = '@nrwl/nx/enforce-module-boundaries';
      console.info(
        'Found .eslintrc.json'
      );
    } else if (host.exists('.eslintrc')) {
      filePath = '.eslintrc';
      rule = '@nrwl/nx/enforce-module-boundaries';
      console.info(
        'Did not find .eslintrc.json but found .eslintrc'
      );
    } else {
      console.info(
        'Cannot add linting rules: linting config file does not exist'
      );
      return;
    }
  }

  const text = host.read(filePath).toString();
  const json = JSON.parse(text);
  let rules = json;
  if (rules['overrides']) {
    const overrides = rules['overrides'];
    rules = overrides.find(
      (e) => e.rules && e.rules['@nrwl/nx/enforce-module-boundaries']
    );
  }

  if (!checkRuleExists(filePath, rule, rules)) return;

  const depConst = rules['rules'][rule][1]['depConstraints'] as Array<object>;
  update(depConst);

  const newText = JSON.stringify(json, undefined, 2);
  host.write(filePath, newText);
}
