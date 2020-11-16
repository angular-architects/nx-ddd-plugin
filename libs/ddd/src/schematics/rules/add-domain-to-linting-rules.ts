import { Rule, Tree, SchematicContext } from '@angular-devkit/schematics';
import { checkRuleExists, updateDepConst } from '../utils';

/**
 * addDomainToLintingRules
 * @param domainName name of the domain that is being included in the tslint.json
 */
export function addDomainToLintingRules(domainName: string): Rule {
  return (host: Tree, context: SchematicContext) => {
    updateDepConst(host, context, (depConst) => {
      depConst.push({
        sourceTag: `domain:${domainName}`,
        onlyDependOnLibsWithTags: [`domain:${domainName}`, 'domain:shared'],
      });
    });
  };
}
