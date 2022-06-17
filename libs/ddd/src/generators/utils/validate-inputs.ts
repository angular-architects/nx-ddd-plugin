import { UiOptions } from '../ui/schema';

export function validateInputs(options: UiOptions): void {
  if (options.shared && options.domain) {
    throw new Error(`A UI library should either belong to a specific domain or be shared globally. 
      If you want to share a UI library across multiple specific domains, 
      consider using an API library. Hence, you should not provide the shared option in combination
      with the domain option.`);
  }

  if (!options.shared && !options.domain) {
    throw new Error(`A UI library should either belong to a domain or be shared globally.
      Please provide either of these two options: --domain / --shared`);
  }
}
