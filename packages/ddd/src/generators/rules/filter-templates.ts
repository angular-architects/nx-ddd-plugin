import { Rule, filter } from '@angular-devkit/schematics';
import { Schema } from '../feature/schema';

/**
 * filterTemplates
 * @param options the options passed by schematics user when running the feature schematic
 */
export function filterTemplates(options: Schema): Rule {
  if (!options.entity) {
    return filter((path) => !!path.match(/\.facade\.ts$/));
  }
  return filter(() => true);
}
