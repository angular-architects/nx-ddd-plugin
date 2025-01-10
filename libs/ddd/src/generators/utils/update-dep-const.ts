import { Tree } from '@nx/devkit';
import { checkRuleExists } from './check-rule-exists';

const allowAll = /\s*\{\s*sourceTag:\s*'\*',\s*onlyDependOnLibsWithTags:\s*\['\*'\],?\s*\}\s*,?/;
const depConstraints = /depConstraints:\s*\[\s*/;


export function updateDepConst(
  host: Tree,
  update: (depConst: Array<object>) => void
) {
  let filePath = 'tslint.json';
  const rule = 'nx-enforce-module-boundaries';
  let isJson = true;
  let newText = '';

  if (!host.exists('tslint.json')) {
    if (host.exists('.eslintrc.json')) {
      filePath = '.eslintrc.json';
      console.info('Found .eslintrc.json');
    } else if (host.exists('.eslintrc')) {
      filePath = '.eslintrc';
      console.info('Found .eslintrc');
    } else if (host.exists('eslint.config.cjs')) {
      filePath = 'eslint.config.cjs';
      console.info('Found .eslintrc');
      isJson = false;
    }
    else if (host.exists('eslint.config.js')) {
      console.info(
        'ESLint flat config will be supported in next release!'
      );
      return;
    } else {
      console.info(
        'Cannot add linting rules: ESLint config file not found'
      );
      return;
    }
  }

  const text = host.read(filePath).toString();

  if (isJson) {
    const json = JSON.parse(text);
    let rules = json;
    if (rules['overrides']) {
      const overrides = rules['overrides'];
      rules = overrides.find(
        (e) => e.rules && e.rules['@nx/enforce-module-boundaries']
      );
    }

    if (!checkRuleExists(filePath, rule, rules)) return;

    const depConst = rules['rules'][rule][1]['depConstraints'] as Array<object>;
    update(depConst);
    newText = JSON.stringify(json, undefined, 2);

  }
  else {
    const rules = new Array<object>();
    update(rules);
    const code = trim(JSON.stringify(rules, null, 2)) + ',';
    newText = text.replace(allowAll, '');
    newText = newText.replace(depConstraints, 'depConstraints: [\n' + code);
  }

  host.write(filePath, newText);
}

function trim(str: string) {

  if (str.startsWith('[')) {
    str = str.substring(1);
  }

  if (str.endsWith(']')) {
    str = str.substring(0, str.length-1);
  }

  return str.trim();
}
