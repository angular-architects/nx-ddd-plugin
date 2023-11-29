import {IComponentDetails} from "../models/component-details.interface";
import {logger, Tree} from "@nx/devkit";
import {
    getFileWithExtension,
    getFileContent,
    replaceClassName,
    resetIndexFile,
    updateFileContent,
    checkFileExists
} from "./file-utils";
import {addTsExport} from "./add-ts-exports";
import {ComponentExtension} from "../models/component-extension.enum";

/**
 * Update the component class name and host class
 */
function _updateComponentContent(tree: Tree, componentDetails: IComponentDetails) {
    const { path: { file }, className, hostClassName } = componentDetails;

    const path = getFileWithExtension(file, ComponentExtension.COMPONENT);
    let fileContent = getFileContent(tree, path);

    if (!fileContent) {
        return;
    }

    // replace class name
    fileContent = replaceClassName(fileContent, {
        oldName: `export class .*Component`,
        newName: `export class ${className}Component`,
    })

    // add host class
    fileContent = addHostClass(fileContent, {
        className: `host: { class: '${hostClassName}' }`,
        filePath: path,
    });

    updateFileContent(tree, { path, updatedContent: fileContent });
}

/**
 * Update the spec file class name
 */
function _updateSpecContent(tree: Tree, componentDetails: IComponentDetails) {
    const { path: { file }, className, originalClassName } = componentDetails;

    const path = getFileWithExtension(file, ComponentExtension.SPEC);
    const specFileContent = getFileContent(tree, path);
    const classNames = {
        oldName: `${originalClassName}Component`,
        newName: `${className}Component`
    }

    if (!specFileContent) {
        return;
    }

    const updatedFile = {
        path,
        updatedContent: replaceClassName( specFileContent, classNames)
    }

    updateFileContent(tree, updatedFile);
}

/**
 * Update the scss file content
 */
function _updateScssContent(tree: Tree, componentDetails: IComponentDetails) {
    const { path: { file }, className, hostClassName } = componentDetails;

    const styleFilePath = getFileWithExtension(file, ComponentExtension.STYLE);

    if(!checkFileExists(tree, styleFilePath)) {
        return;
    }
    // add host class to scss file with display block
    const updatedFile = {
        path: styleFilePath,
        updatedContent: `.${hostClassName} {\n display: block;\n}\n`
    }

    updateFileContent(tree, updatedFile);
}

/**
 * A helper function to add host class to the component decorator
 */
function addHostClass(fileContent: string, hostClassDetails: { className: string, filePath: string}) {
    // matches the entire @Component decorator, capturing content within its curly braces.
    const componentDecoratorRegex = /@Component\([\s\S]*?{([\s\S]*?)\s*}\s*\)/;

    // executing the regular expression to find the @Component decorator and its content
    const match = componentDecoratorRegex.exec(fileContent);

    if (!match) {
        logger.warn(`Unable to find @Component decorator in ${hostClassDetails.filePath}.`);
        return;
    }

    // extracts and trims the content captured inside the @Component decorator.
    const componentProperties = match[1].trim();

    return fileContent.replace(
        componentDecoratorRegex,
        `@Component({ \n${componentProperties ? `${componentProperties}\n` : ''}${hostClassDetails.className}\n})`
    );
}

/**
 * Update the component files
 */
export function updateComponentFiles(tree: Tree, component: IComponentDetails, projectIndexFilePath: string) {
    // modify the component generated files
    _updateComponentContent(tree, component);
    _updateSpecContent(tree, component);
    _updateScssContent(tree, component);

    // reset index file
    resetIndexFile(tree, projectIndexFilePath);

    // add export public-api to index.ts
    addTsExport(tree, projectIndexFilePath, [`./lib/public-api`]);
}
