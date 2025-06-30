import { Tree, SchematicContext } from '@angular-devkit/schematics';
import { checkRuleExists } from './check-rule-exists';

const allowAll = /\s*\{\s*sourceTag:\s*'\*',\s*onlyDependOnLibsWithTags:\s*\['\*'\],?\s*\}\s*,?/;
const depConstraints = /depConstraints:\s*\[\s*/;

export function updateDepConst(
  host: Tree,
  context: SchematicContext,
  update: (depConst: Array<object>) => void
) {
  let filePath = 'tslint.json';
  let rule = 'nx-enforce-module-boundaries';
  let isJson = true;
  let newText = '';

  if (!host.exists('tslint.json')) {
    if (host.exists('.eslintrc.json')) {
      filePath = '.eslintrc.json';
      rule = '@nx/enforce-module-boundaries';
      context.logger.info('Found .eslintrc.json');
    } else if (host.exists('.eslintrc')) {
      filePath = '.eslintrc';
      rule = '@nx/enforce-module-boundaries';
      context.logger.info(
        'Did not find .eslintrc.json but found .eslintrc'
      );
    } else if (host.exists('eslint.config.cjs')) {
      filePath = 'eslint.config.cjs';
      context.logger.info('Found eslint.config.cjs');
      isJson = false;
    } else if (host.exists('eslint.config.mjs')) {
      filePath = 'eslint.config.mjs';
      context.logger.info('Found eslint.config.mjs');
      isJson = false;
    } else {
      context.logger.info(
        'Cannot add linting rules: linting config file does not exist'
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

    if (!checkRuleExists(filePath, rule, rules, context)) return;

    const depConst = rules['rules'][rule][1]['depConstraints'] as Array<object>;
    update(depConst);

    newText = JSON.stringify(json, undefined, 2);
  } else {
    const rules = new Array<object>();
    update(rules);
    const code = trim(JSON.stringify(rules, null, 2)) + ',';
    newText = text.replace(allowAll, '');
    newText = newText.replace(depConstraints, 'depConstraints: [\n' + code);
  }

  host.overwrite(filePath, newText);
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
