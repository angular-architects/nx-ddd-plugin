# @angular-architects/ddd:ui

The library generates a new ui library and places it in the correct domain folder.

## Overview

The `ng g @angular-architects/ddd:ui` command is a customized fork of the
Angular [Domain-Driven Design](https://github.com/angular-architects/nx-ddd-plugin) UI Generator, tailored to our
organization's requirements. This command generates a User Interface (UI) library following Domain-Driven Design (DDD)
principles within an Angular application.

## Additional Customizations

- **Storybook Integration**: This forked version includes Storybook integration for UI component development.
- **Harness Tests**: It automatically generates harness tests for UI components to ensure robust functionality.
- **Default Additional Prefix**: The `--additionalPrefix` option is set by default to `as-` for customizing the prefix
  of classes or selectors within the generated UI components. This prevents clashes with classes or selectors from other
  plugins, ensuring better isolation and avoiding conflicts in your project.

## Usage

#### Generate a new ui library

Running this command generates a new ui library.

```shell
nx g @angular-architects/ddd:ui <library-name> --domain <domain-name> --directory=<ui-directory> --prefix=<boolean>
```

#### Additional Parameters

| Parameter                                      | Description                                                                                                             | Default |
|------------------------------------------------|-------------------------------------------------------------------------------------------------------------------------|---------|
| `<library-name>`                               | Name of the library to generate.                                                                                        | `N/A`   |
| `--domain <domain-name>`                       | Specifies the domain name for the UI library.                                                                           | `N/A`   |
| `--standalone`                                 | Generates a standalone UI module.                                                                                       | `true`  |
| `--directory <ui-directory>`                   | Specifies the directory for the generated UI library.                                                                   | `N/A`   |
| `--prefix`                                     | Apply the "ui-" prefix?                                                                                                 | `true`  |
| `--simpleName`                                 | Don't include the directory in the name of the module or standalone component entry of the library.                     | `true`  |
| `--flat`                                       | Create a flat library structure?                                                                                        | `true`  |
| `--style <css\|scss\|sass\|less\|none>`        | Chooses the stylesheet format for the UI components.                                                                    | `scss`  |                                                                                                 
| `--additionalPrefix <select+className-prefix>` | Optional parameter to add an additional prefix for component class name and selector within the generated UI component. | `as`    |

#### Example

```shell
nx g @angular-architects/ddd:ui test --domain miles --directory=ui --prefix=false
```
