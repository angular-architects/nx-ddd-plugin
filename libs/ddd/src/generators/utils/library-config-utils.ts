import {logger, readJson, Tree} from "@nx/devkit";
import {getFileContent, isFileExists} from "./file-utils";
import {IProjectDetails, IProjectPath} from "../models/project-details.interface";
import {IComponentDetails, IComponentOptions} from "../models/component-details.interface";
import {strings} from "@angular-devkit/core";

/**
 * Adds the lint target to the project.json
 */
async function _addlintToProjectTargets(tree: Tree, projectDetails: IProjectDetails) {
    try {
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
    } catch (error) {
        throw new Error(`Error occurred while adding lint targets: ${error}`);
    }
}

/**
 * Adds the eslint target to the project.json
 */
async function _addEslintToProjectTargets(tree: Tree, projectPath: IProjectPath) {
    try {
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
    } catch (error) {
        throw new Error(`Error occurred while adding eslint targets: ${error}`);
    }
}

/**
 * Adds the stylelint target to the project.json
 */
async function _addStylelintToProjectTargets(tree: Tree, projectPath: IProjectPath) {
    try {
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
    } catch (error) {
        throw new Error(`Error occurred while adding stylelint targets: ${error}`);
    }
}

/**
 * Removes the overrides section from the .eslintrc.json
 */
async function _removeEsLintOverrides(tree: Tree, projectPath: IProjectPath) {
    try {
        const { esLint } = projectPath;

        const eslintConfig = readJson(tree, esLint);

        if (eslintConfig.overrides) {
            delete eslintConfig.overrides;
            tree.write(esLint, JSON.stringify(eslintConfig, null, 2));
        }
    } catch (error) {
        throw new Error(`Error occurred while removing eslint overrides: ${error}`);
    }
}

/**
 * Modifies the README.md file
 */
async function _modifyReadmeContent(tree: Tree, projectDetails: IProjectDetails) {
    try {
        const { name, path: { readme } } = projectDetails;

        // read the existing content of the README.md file
        let existingContent = getFileContent(tree, readme);

        existingContent = await _removeTestSection(existingContent, name);
        existingContent = await _addTargetContent(existingContent, name);

        // append the new content to the existing content and write it back to the README.md
        tree.write(readme, existingContent);
    } catch (error) {
        throw new Error(`Error occurred while modifying the README.md: ${error}`);
    }
}

/**
 * Removes the default test section from the README.md
 */
async function _removeTestSection(existingContent: string, name: string): Promise<string> {
    const sectionToRemove = `## Running unit tests\nRun \`nx test ${name}\` to execute the unit tests.`;
    return existingContent.includes(sectionToRemove)
        ? existingContent.replace(sectionToRemove, '')
        : existingContent;
}

/**
 * Adds the targets section to the README.md
 */
async function _addTargetContent(existingContent: string, name: string): Promise<string> {
    const domainName = name.split('-')[0];
    const contentToAdd =  `

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
    return existingContent + contentToAdd;
}

/**
 * Customize the library configuration
 */
export async function customizeLibraryConfig(
    tree: Tree,
    projectDetails: IProjectDetails,
    options: {
        addLintToTarget?: boolean;
        removeEsLint?: boolean;
        modifyReadme?: boolean;
    } = {
        addLintToTarget: true,
        removeEsLint: true,
        modifyReadme: true,
    }
) {
    // add Eslint, Stylelint, and Addlint to targets
    try {
        if (options.addLintToTarget && isFileExists(tree, projectDetails.path.project)) {
           await Promise.all([
                  _addEslintToProjectTargets(tree, projectDetails.path),
                  _addStylelintToProjectTargets(tree, projectDetails.path),
                  _addlintToProjectTargets(tree, projectDetails)
             ]);
        }

        // remove Eslint overrides
        if (options.removeEsLint && isFileExists(tree, projectDetails.path.esLint)) {
            await _removeEsLintOverrides(tree, projectDetails.path);
        }

        // modify the README
        if (options.modifyReadme && isFileExists(tree, projectDetails.path.readme)) {
            await _modifyReadmeContent(tree, projectDetails);
        }
    } catch (error) {
        throw new Error(`Error occurred while customizing the library configuration: ${error}`);
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
