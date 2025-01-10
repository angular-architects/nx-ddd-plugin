npx nx build ddd
npm unpublish @angular-architects/ddd@19.0.6 -f --registry http://localhost:4873
npm publish dist/libs/ddd --registry http://localhost:4873
