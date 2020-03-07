# @angular-architects/ddd -- DDD Plugin for Nx

```
npm i 
```

```
ng g @angular-architects/ddd:domain booking
ng g @angular-architects/ddd:domain boarding
ng g @angular-architects/ddd:feature search --domain booking --app flight-app --entity flight
ng g @angular-architects/ddd:feature cancel --domain booking --app flight-app
ng g @angular-architects/ddd:feature manage --domain boarding --app flight-app
```

```
npm run dep-graph
```