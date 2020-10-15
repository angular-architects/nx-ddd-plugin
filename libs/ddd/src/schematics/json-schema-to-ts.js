const toTypeScript = require('json-schema-to-typescript');
const fs = require('fs');

toTypeScript
    .compileFromFile('libs/ddd/src/schematics/domain/schema.json')
    .then(ts => fs.writeFileSync('libs/ddd/src/schematics/domain/schema.ts', ts));
    
toTypeScript
    .compileFromFile('libs/ddd/src/schematics/feature/schema.json')
    .then(ts => fs.writeFileSync('libs/ddd/src/schematics/feature/schema.ts', ts));
    

toTypeScript
    .compileFromFile('libs/ddd/src/schematics/ui/schema.json')
    .then(ts => fs.writeFileSync('libs/ddd/src/schematics/ui/schema.ts', ts));

toTypeScript
    .compileFromFile('libs/ddd/src/schematics/util/schema.json')
    .then(ts => fs.writeFileSync('libs/ddd/src/schematics/util/schema.ts', ts));