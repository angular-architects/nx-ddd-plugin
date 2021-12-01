import { Rule, filter } from '@angular-devkit/schematics';
import { FeatureOptions } from '../feature/schema';

/**
 * filterTemplates
 * @param options the options passed by schematics user when running the feature schematic
 */
export function filterTemplates(options: FeatureOptions): Rule {
  if (!options.entity) {
    return filter((path) => !!path.match(/\.facade\.ts$/));
  }
  return filter(() => true);
}
