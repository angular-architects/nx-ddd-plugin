const toTypeScript = require('json-schema-to-typescript');
const fs = require('fs');

toTypeScript
  .compileFromFile('packages/ddd/src/generators/domain/schema.json')
  .then((ts) =>
    fs.writeFileSync('packages/ddd/src/generators/domain/schema.ts', ts)
  );

toTypeScript
  .compileFromFile('packages/ddd/src/generators/feature/schema.json')
  .then((ts) =>
    fs.writeFileSync('packages/ddd/src/generators/feature/schema.ts', ts)
  );

toTypeScript
  .compileFromFile('packages/ddd/src/generators/ui/schema.json')
  .then((ts) =>
    fs.writeFileSync('packages/ddd/src/generators/ui/schema.ts', ts)
  );

toTypeScript
  .compileFromFile('packages/ddd/src/generators/util/schema.json')
  .then((ts) =>
    fs.writeFileSync('packages/ddd/src/generators/util/schema.ts', ts)
  );
