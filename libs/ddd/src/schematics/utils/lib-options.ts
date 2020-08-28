export function validateInputs(options: {
  domain?: string;
  shared?: boolean;
}): void {
  if (options.shared && options.domain) {
    throw new Error(`This library type should either belong to a specific domain or be shared globally. 
        If you want to share this library across multiple specific domains, 
        consider using an API library. Hence, you should not provide the shared option in combination
        with the domain option.`);
  }

  if (!options.shared && !options.domain) {
    throw new Error(`This library type should either belong to a domain or be shared globally.
        Please provide either of these two options: --domain / --shared`);
  }
}
