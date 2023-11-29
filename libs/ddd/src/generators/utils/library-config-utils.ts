import {readJson, Tree} from "@nx/devkit";
import {checkFileExists} from "./file-utils";
import {IProjectDetails, IProjectPath} from "../models/project-details.interface";
import {IComponentDetails, IComponentOptions} from "../models/component-details.interface";
import {strings} from "@angular-devkit/core";

/**
 * Adds the lint target to the project.json
 */
function _addlintToTargets(tree: Tree, projectDetails: IProjectDetails) {
    const { name, path: { project }} = projectDetails;

    const projectConfig = readJson(tree, project);
    if (!projectConfig.targets) {
        projectConfig.targets = {};
    }

    projectConfig.targets.lint = {
        executor: 'nx:run-commands',
        options: {
            commands: [
                `nx eslint ${name}`,
                `nx stylelint ${name}`
            ],
        },
    };

    tree.write(project, JSON.stringify(projectConfig, null, 2));
}

/**
 * Adds the eslint target to the project.json
 */
function _addEslintToTargets(tree: Tree, projectPath: IProjectPath) {
    const { project } = projectPath;

    const projectConfig = readJson(tree, project);
    if (!projectConfig.targets) {
        projectConfig.targets = {};
    }

    projectConfig.targets.eslint = {
        executor: '@nx/linter:eslint',
        options: {
            lintFilePatterns: [
                `${projectConfig.project}/**/*.ts`,
                `${projectConfig.project}/**/*.html`
            ],
        },
    };

    tree.write(project, JSON.stringify(projectConfig, null, 2));
}

/**
 * Adds the stylelint target to the project.json
 */
function _addStylelintToTargets(tree: Tree, projectPath: IProjectPath) {
    const { project } = projectPath;

    const projectConfig = readJson(tree, project);
    if (!projectConfig.targets) {
        projectConfig.targets = {};
    }

    projectConfig.targets.stylelint = {
        executor: '@nx/linter:stylelint',
        outputs: [
            "{options.outputFile}"
        ],
        options: {
            formatter: "stylelint-codeframe-formatter",
            lintFilePatterns: [
                `${projectConfig.root}/**/*.css`,
                `${projectConfig.root}/**/*.scss`
            ],
        },
    };

    tree.write(project, JSON.stringify(projectConfig, null, 2));
}

/**
 * Removes the overrides section from the .eslintrc.json
 */
function _removeEsLintOverrides(tree: Tree, projectPath: IProjectPath) {
    const { esLint } = projectPath;

    const eslintConfig = readJson(tree, esLint);

    if (eslintConfig.overrides) {
        delete eslintConfig.overrides;
        tree.write(esLint, JSON.stringify(eslintConfig, null, 2));
    }
}

/**
 * Modifies the README.md file
 */
function _modifyReadme(tree: Tree, projectDetails: IProjectDetails) {
    const { name, path: { readme } } = projectDetails;
    const domainName = name.split('-')[0];
    // Read the existing content of the README.md file
    let existingContent = tree.read(readme).toString();

    const sectionToRemove = `## Running unit tests

Run \`nx test ${name}\` to execute the unit tests.`;

    // Remove the section if it exists in the content
    if (existingContent.includes(sectionToRemove)) {
        existingContent = existingContent.replace(sectionToRemove, '');
        tree.write(readme, existingContent);
    }

    const contentToAdd = `

## Targets

### Lint

To lint the project (with both eslint and stylelint), run

\`\`\`shell
nx lint ${name} [--fix]
\`\`\`

Adding the \`--fix\` option will also run the autofixer on any fixable code.

You can also call the dedicated linter explicitly:

\`\`\`shell
# only lint js, ts and html
nx eslint ${name} [--fix]

# only lint styles
nx stylelint ${name} [--fix]
\`\`\`

### Test

To test the project (unit tests only), run

\`\`\`shell
nx test ${name}
\`\`\`

### Storybook

Stories are hosted inside a combined Storybook for the whole domain located in \`${domainName}-storybook\`.
You can serve this Storybook via

\`\`\`shell
nx storybook ${domainName}-storybook
\`\`\`

Storybook will be served at [http://localhost:[Port]/]
`;

    // Append the new content to the existing content and write it back to the README.md
    tree.write(readme, existingContent + contentToAdd);
}

/**
 * Customize the library configuration
 */
export async function customizeLibraryConfig(tree: Tree, projectDetails: IProjectDetails) {
    // add Eslint, Stylelint, and Addlint to targets
    if (checkFileExists(tree, projectDetails.path.project)) {
        _addEslintToTargets(tree, projectDetails.path);
        _addStylelintToTargets(tree, projectDetails.path);
        _addlintToTargets(tree, projectDetails);
    }

    // remove Eslint overrides
    if (checkFileExists(tree, projectDetails.path.esLint)) {
        _removeEsLintOverrides(tree, projectDetails.path);
    }

    // modify the README
    if (checkFileExists(tree, projectDetails.path.readme)) {
        _modifyReadme(tree, projectDetails);
    }
}

/**
 * Get the project details including the paths
 */
export function getProjectDetails(libDirectory: string, libName: string): IProjectDetails {
    const root = `libs/${libDirectory}/${libName}`;
    const name = `${libDirectory.split('/').join('-')}-${libName}`;

    return {
        name,
        path: {
            root,
            project: `${root}/project.json`,
            esLint: `${root}/.eslintrc.json`,
            readme: `${root}/README.md`,
            index: `${root}/src/index.ts`,
        }
    }
}

/**
 * Get the component details
 */
export function getComponentDetails(projectRoot: string, options: IComponentOptions): IComponentDetails {
    const {
        name,
        domain,
        additionalPrefix,
        simpleName,
        libName
    } = options;

    const root = `${projectRoot}/src/lib`;
    const fileName = simpleName?
        `${strings.dasherize(libName)}` :
        `${strings.dasherize(domain)}-${strings.dasherize(libName)}`;
    const filePath = `${root}/${fileName}.component`
    const className = `${strings.classify(additionalPrefix)}${strings.classify(domain)}${strings.classify(name)}`;
    const selector = strings.dasherize(className);
    const hostClassName = `c-${selector}`;

    return {
        fileName,
        className,
        selector,
        hostClassName,
        originalClassName: strings.classify(name),
        path: {
            file: filePath,
            root
        }
    }
}
