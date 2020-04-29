import { Rule, Tree, SchematicContext  } from '@angular-devkit/schematics';

export function checkRuleExists(rules: object, context: SchematicContext) {
  if (!rules['rules']) {
    context.logger.info('tslint.json: rules expected');
    return false;
  }

  if (!rules['rules']['nx-enforce-module-boundaries']) {
    context.logger.info('tslint.json: nx-enforce-module-boundaries expected');
    return false;
  }

  if (rules['rules']['nx-enforce-module-boundaries']['length'] < 2) {
    context.logger.info('nx-enforce-module-boundaries.1 unexpected');
    return false;
  }

  if (!rules['rules']['nx-enforce-module-boundaries'][1]['depConstraints']) {
    context.logger.info('tslint.json: nx-enforce-module-boundaries.1.depConstraints expected.');
    return false;
  }

  if (!Array.isArray(rules['rules']['nx-enforce-module-boundaries'][1]['depConstraints'])) {
    context.logger.info('tslint.json: nx-enforce-module-boundaries.1.depConstraints expected to be an array.');
    return false;
  }

  return true;
}


export function addDomainToLintingRules(domainName: string): Rule {
  return (host: Tree, context: SchematicContext) => {
    const text = host.read('tslint.json').toString();
    const rules = JSON.parse(text);

    if (!checkRuleExists(rules, context)) return;

    const depConst = rules['rules']['nx-enforce-module-boundaries'][1]['depConstraints'];
    depConst.push({
      'sourceTag': `domain:${domainName}`,
      'onlyDependOnLibsWithTags': [`domain:${domainName}`, 'domain:shared']
    });

    const newText = JSON.stringify(rules, undefined, 2);
    host.overwrite('tslint.json', newText);
  }
}

export function initLintingRules(): Rule {
  return (host: Tree, context: SchematicContext) => {
    const text = host.read('tslint.json').toString();
    const rules = JSON.parse(text);

    if (!checkRuleExists(rules, context)) return;

    const depConst = rules['rules']['nx-enforce-module-boundaries'][1]['depConstraints'] as Array<object>;

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

    const newText = JSON.stringify(rules, undefined, 2);
    host.overwrite('tslint.json', newText);
  }
}
