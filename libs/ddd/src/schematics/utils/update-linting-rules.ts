import { Rule, Tree, SchematicContext  } from '@angular-devkit/schematics';

export function updateLintingRules(domainName: string): Rule {
    return (host: Tree, context: SchematicContext) => {
      const text = host.read('tslint.json').toString();
      const rules = JSON.parse(text);
  
      if (!rules['rules']) {
        context.logger.info('tslint.json: rules expected');
        return;
      }
  
      if (!rules['rules']['nx-enforce-module-boundaries']) {
        context.logger.info('tslint.json: nx-enforce-module-boundaries expected');
        return;
      }
  
      if (rules['rules']['nx-enforce-module-boundaries']['length'] < 2) {
        context.logger.info('nx-enforce-module-boundaries.1 unexpected');
        return;
      }
  
      if (!rules['rules']['nx-enforce-module-boundaries'][1]['depConstraints']) {
        context.logger.info('tslint.json: nx-enforce-module-boundaries.1.depConstraints expected.');
        return;
      }
  
      if (!Array.isArray(rules['rules']['nx-enforce-module-boundaries'][1]['depConstraints'])) {
        context.logger.info('tslint.json: nx-enforce-module-boundaries.1.depConstraints expected to be an array.');
        return;
      }
  
      const depConst = rules['rules']['nx-enforce-module-boundaries'][1]['depConstraints'];
      depConst.push({
        'sourceTag': `domain:${domainName}`,
        'onlyDependOnLibsWithTags': [`domain:${domainName}`, 'shared']
      });
  
      const newText = JSON.stringify(rules, undefined, 2);
      host.overwrite('tslint.json', newText);
    }
  }