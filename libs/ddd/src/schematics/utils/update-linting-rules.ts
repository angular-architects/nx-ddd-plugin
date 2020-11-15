import { Rule, Tree, SchematicContext  } from '@angular-devkit/schematics';

function checkRuleExists(filePath: string, rule: string, rules: object, context: SchematicContext) {
  if (!rules['rules']) {
    context.logger.info(`${filePath}: rules expected`);
    return false;
  }

  if (!rules['rules'][rule]) {
    context.logger.info(`${filePath}: ${rule} expected`);
    return false;
  }

  if (rules['rules'][rule]['length'] < 2) {
    context.logger.info(`${filePath}: ${rule}.1 unexpected`);
    return false;
  }

  if (!rules['rules'][rule][1]['depConstraints']) {
    context.logger.info(`${filePath}: ${rule}.1.depConstraints expected.`);
    return false;
  }

  if (!Array.isArray(rules['rules'][rule][1]['depConstraints'])) {
    context.logger.info(`${filePath}: ${rule}.1.depConstraints expected to be an array.`);
    return false;
  }

  return true;
}

function updateDepConst(host: Tree, context: SchematicContext, update: (depConst: Array<object>) => void) {
  let filePath = 'tslint.json';
  let rule = 'nx-enforce-module-boundaries';

  if (!host.exists('tslint.json')) {
    if (host.exists(".eslintrc.json")) {
      filePath = ".eslintrc.json";
      rule = '@nrwl/nx/enforce-module-boundaries';
    } else if (host.exists(".eslintrc")) {
      filePath = ".eslintrc";
      rule = '@nrwl/nx/enforce-module-boundaries';
    } else {
      context.logger.info('Cannot add linting rules: linting config file does not exist');
      return;
    }
  } 
  
  const text = host.read(filePath).toString();
  const rules = JSON.parse(text);

  if (!checkRuleExists(filePath, rule, rules, context)) return;

  const depConst = rules['rules'][rule][1]['depConstraints'] as Array<object>;
  update(depConst);
  
  const newText = JSON.stringify(rules, undefined, 2);
  host.overwrite(filePath, newText);
}


export function addDomainToLintingRules(domainName: string): Rule {
  return (host: Tree, context: SchematicContext) => {
    updateDepConst(host, context, (depConst) => {
      depConst.push({
        'sourceTag': `domain:${domainName}`,
        'onlyDependOnLibsWithTags': [`domain:${domainName}`, 'domain:shared']
      });
    });
  }
}

export function initLintingRules(): Rule {
  return (host: Tree, context: SchematicContext) => {
    updateDepConst(host, context, (depConst) => {
      const jokerIndex = depConst.findIndex(entry => 
        entry['sourceTag'] 
          && entry['sourceTag'] === '*' 
          && entry['onlyDependOnLibsWithTags']
          && Array.isArray(entry['onlyDependOnLibsWithTags'])
          && entry['onlyDependOnLibsWithTags'].length > 0
          && entry['onlyDependOnLibsWithTags'][0] === '*');

      if (jokerIndex !== -1) {
        depConst.splice(jokerIndex, 1);
      }

      depConst.push({
        'sourceTag': 'type:app',
        'onlyDependOnLibsWithTags': ['type:api', 'type:feature', 'type:ui', 'type:domain-logic', 'type:util']
      });

      depConst.push({
        'sourceTag': 'type:api',
        'onlyDependOnLibsWithTags': ['type:ui', 'type:domain-logic', 'type:util']
      });

      depConst.push({
        'sourceTag': 'type:feature',
        'onlyDependOnLibsWithTags': ['type:ui', 'type:domain-logic', 'type:util']
      });

      depConst.push({
        'sourceTag': 'type:ui',
        'onlyDependOnLibsWithTags': ['type:domain-logic', 'type:util']
      });

      depConst.push({
        'sourceTag': 'type:domain-logic',
        'onlyDependOnLibsWithTags': ['type:util']
      });

      depConst.push({
        'sourceTag': 'domain:shared',
        'onlyDependOnLibsWithTags': ['domain:shared']
      });
    });
  }
}
