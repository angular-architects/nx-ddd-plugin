import {IComponentDetails} from "../models/component-details.interface";
import {logger, Tree} from "@nx/devkit";
import {
    getFileWithExtension,
    getFileContent,
    replaceClassName,
    resetIndexFile,
    updateFileContent,
    isFileExists
} from "./file-utils";
import {addTsExport} from "./add-ts-exports";
import {ComponentExtension} from "../models/component-extension.enum";

/**
 * Update the component class name and host class
 */
function _updateComponentContent(tree: Tree, componentDetails: IComponentDetails) {
    const { path: { file }, className, hostClassName } = componentDetails;

    const path = getFileWithExtension(file, ComponentExtension.COMPONENT);
    const fileContent = getFileContent(tree, path);

    if (!fileContent) {
        throw new Error(`File content not found for ${path}`);
    }

    // replace class name
    const updatedContent = replaceClassName(fileContent, {
        oldName: `export class .*Component`,
        newName: `export class ${className}Component`,
    })

    const updatedFile = {
        path,
        // add host class to the component decorator
        updatedContent: _addHostClass(updatedContent, {
            hostClassName,
            path
        })
    };

    updateFileContent(tree, updatedFile);
}

/**
 * Update the spec file class name
 */
function _updateSpecContent(tree: Tree, componentDetails: IComponentDetails) {
    const { path: { file }, className, originalClassName } = componentDetails;

    const path = getFileWithExtension(file, ComponentExtension.SPEC);
    const specFileContent = getFileContent(tree, path);

    if (!specFileContent) {
        logger.warn(`Spec file not found for ${path}`);
        return;
    }

    const updatedContent = replaceClassName(specFileContent,{
        oldName: `${originalClassName}Component`,
        newName: `${className}Component`
    });
    const updatedFile = { path, updatedContent };

    updateFileContent(tree, updatedFile);
}

/**
 * Update the scss file content
 */
function _updateScssContent(tree: Tree, componentDetails: IComponentDetails) {
    const { path: { file }, className, hostClassName } = componentDetails;

    const styleFilePath = getFileWithExtension(file, ComponentExtension.STYLE);

    if(!isFileExists(tree, styleFilePath)) {
        logger.warn(`SCSS file not found for ${styleFilePath}`);
        return;
    }

    const updatedContent = `.${hostClassName} {\n display: block;\n}\n`;

    // add host class to scss file with display block
    const updatedFile = { path: styleFilePath, updatedContent };

    updateFileContent(tree, updatedFile);
}

/**
 * A helper function to add host class to the component decorator
 */
function _addHostClass(fileContent: string, hostClassDetails: { hostClassName: string, path: string}): string {
    const joinedHostClass = `host: { class: '${hostClassDetails.hostClassName}' }`;
    // matches the entire @Component decorator, capturing content within its curly braces.
    const componentDecoratorRegex = /@Component\([\s\S]*?{([\s\S]*?)\s*}\s*\)/;

    // executing the regular expression to find the @Component decorator and its content
    const match = componentDecoratorRegex.exec(fileContent);

    if (!match) {
        logger.warn(`Unable to find @Component decorator in ${hostClassDetails.path}.`);
        return;
    }

    // extracts and trims the content captured inside the @Component decorator.
    const componentProperties = match[1].trim();

    return fileContent.replace(
        componentDecoratorRegex,
        `@Component({ \n${componentProperties ? `${componentProperties}\n` : ''}${joinedHostClass}\n})`
    );
}

/**
 * Update the component files
 */
export function updateComponentFiles(tree: Tree, component: IComponentDetails, libIndexFilePath: string) {
   try {
       // modify the component generated files
       _updateComponentContent(tree, component);
       _updateSpecContent(tree, component);
       _updateScssContent(tree, component);

       // reset index file
       resetIndexFile(tree, libIndexFilePath);

       // add export public-api to index.ts
       addTsExport(tree, libIndexFilePath, [`./lib/public-api`]);
   } catch (error) {
       throw new Error(`Error occurred while updating the component files: ${error}`);
   }

}
