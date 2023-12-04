# miles-ui-test

This library was generated with [Nx](https://nx.dev).

## Targets

### Lint

To lint the project (with both eslint and stylelint), run

```shell
nx lint miles-ui-test [--fix]
```

Adding the `--fix` option will also run the autofixer on any fixable code.

You can also call the dedicated linter explicitly:

```shell
# only lint js, ts and html
nx eslint miles-ui-test [--fix]

# only lint styles
nx stylelint miles-ui-test [--fix]
```

### Test

To test the project (unit tests only), run

```shell
nx test miles-ui-test
```

### Storybook

Stories are hosted inside a combined Storybook for the whole domain located in `miles-storybook`.
You can serve this Storybook via

```shell
nx storybook miles-storybook
```

Storybook will be served at [http://localhost:[Port]/]
