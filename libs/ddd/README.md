# @angular-architects/ddd -- DDD Plugin for Nx

This plugin installs some schematics which automate slicing your Nx workspace into domains and layers according to Nrwl's best practices and our ideas about [client-side DDD with Angular](https://www.softwarearchitekt.at/aktuelles/sustainable-angular-architectures-1/):

![domains and layers](https://github.com/angular-architects/nx-ddd-plugin/blob/master/libs/ddd/assets/ddd.png?raw=true)

The generated access restrictions prevent unwanted access between libraries respecting layers and domains:

![access restrictions](https://github.com/angular-architects/nx-ddd-plugin/blob/master/libs/ddd/assets/linting-2.png?raw=true)

## Features

- 🗺️ Generating domains with domain libraries including a facades, models, and data services
- ⚙️ Generating feature libraries including a feature components using the facades
- 🙅‍♂️ Adding linting rules for access restrictions between domains as proposed by Nrwl
- 🙅‍♀️ Adding linting rules for access restrictions between layers as proposed by Nrwl (supports tslint and eslint)
- 🔥 Optionally generates skeleton for NGRX and integrates it into the DDD design (`--ngrx` switch)
- 💥 Supports Standalone Components

### Features Overview Video

<a href="https://www.youtube.com/watch?v=39JLXMEE7Ds" target="_blank">![Screenshot of Overview Video](https://i.imgur.com/VlTRE80.png)</a>

## Usage

Add this plugin to a Nx workspace:

```
npm i @angular-architects/ddd
ng g @angular-architects/ddd:init
```

Instead, you can also use ng add, however, Nx currently emits a warning when using ng add:

```
nx add @angular-architects/ddd
```

Add domains and features manually:

```
ng g @angular-architects/ddd:domain booking --addApp
ng g @angular-architects/ddd:domain boarding --addApp
ng g @angular-architects/ddd:feature search --domain booking --entity flight
ng g @angular-architects/ddd:feature cancel --domain booking
ng g @angular-architects/ddd:feature manage --domain boarding
```

For NGRX support, just add the `--ngrx` switch:

```
ng g @angular-architects/ddd:domain luggage --addApp --ngrx
ng g @angular-architects/ddd:feature checkin --domain luggage --entity luggage-list --ngrx
[...]
```

This example assumes that you have an app `flight-app` in place.

These schematics also wire up the individual libs. To see the result, create a dependency graph:

```
npm run dep-graph
```

![dependency graph](https://github.com/angular-architects/nx-ddd-plugin/blob/master/libs/ddd/assets/ddd.png?raw=true)

To see that the skeleton works end-to-end, call the generated feature component in your `app.component.html`:

```html
<booking-search></booking-search>
```

You don't need any TypeScript or Angular imports. The plugin already took care about that. After running the example, you should see something like this:

![Result proving that the generated skeleton works end-to-end](https://github.com/angular-architects/nx-ddd-plugin/blob/master/libs/ddd/assets/result.png?raw=true)

## Standalone Components

All generators have a switch ``--standalone`` to support Standalone Components: 

```
ng g @angular-architects/ddd:domain booking --addApp --standalone

ng g @angular-architects/ddd:feature search --domain booking --entity flight --standalone
```

Don't mix Standalone Components and traditional ones within the same domain.

**Since version 19**, standalone **defaults to true**.

## Generated Structure

The included schematics generate a folder for each domain. This folder contains feature libs as well as a library with the domain logic:

![Folder per Domain](https://github.com/angular-architects/nx-ddd-plugin/blob/master/libs/ddd/assets/ddd-libs.png?raw=true)

The domain layer is subdivided into three parts:

![Structured Domain Layer](https://github.com/angular-architects/nx-ddd-plugin/blob/master/libs/ddd/assets/domain-layer.png?raw=true)

### Generated Structure for Domain Library

- **application:** Contains application services. This is a DDD term for what we call facades in Angular nowadays. They orchestrate everything for a use case given so that a feature component only needs to communicate with one such facade. Also, it hides details for state management. While the generates facades just use a `BehaviorSubject`, feel free to add a library like NGRX underneath. As such a modifications changes nothing from the component's perspective, you can use facades to introduce NGRX later on demand.
- **entities:** Client-side data model including logic operating on it (like validations).
- **infrastructure:** Services for communicating with the backend.

## Consider Automatically Checking Access Restrictions

As the access restrictions defined with Nx use linting, you can check against them at the command line too. Hence, you might consider including this into your automated build process.

![Access restrictions via linting](https://github.com/angular-architects/nx-ddd-plugin/blob/master/libs/ddd/assets/linting-3.png?raw=true)

## Example Application

see https://github.com/angular-architects/ddd-demo

## Credits

- [Nx](https://nx.dev/web)
- [Nrwl's eBook about monorepos and best practices](https://go.nrwl.io/angular-enterprise-monorepo-patterns-new-book)
- [Recording of session about this architecture](https://www.youtube.com/watch?v=94HFD391zkE&t=1s)
- [Article series about DDD with Angular](https://www.softwarearchitekt.at/aktuelles/sustainable-angular-architectures-1/)
- [Our eBook on Angular and architectures](https://leanpub.com/enterprise-angular)
- [Thomas Burlison's article about facades in Angular](https://medium.com/@thomasburlesonIA/push-based-architectures-with-rxjs-81b327d7c32d)

## More

- [Angular Architecture Workshop](https://www.angulararchitects.io/en/angular-workshops/advanced-angular-enterprise-architecture-incl-ivy/)
- [Follow us on Twitter](https://twitter.com/ManfredSteyer)
