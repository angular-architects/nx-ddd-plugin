import {logger, Tree} from "@nx/devkit";
import {ComponentExtension} from "../models/component-extension.enum";
import {IClassNames} from "../models/class-names.interface";
import {IUpdatedFile} from "../models/updated-file.interface";

/**
 * A helper function to check if the file exists and log an error if not
 */
export function checkFileExists(tree: Tree, filePath: string) {
    if (!tree.exists(filePath)) {
        logger.error(`Unable to read project configuration at ${filePath}`);
        return false;
    }
    return true;
}

/**
 * A helper function to replace the class name in the file content
 */
export function replaceClassName(fileContent: string, classNames: IClassNames) {
    return fileContent.replace(new RegExp(classNames.oldName, 'g'), classNames.newName);
}

/**
 * A helper function to write the updated content to the file
 */
export function updateFileContent(tree: Tree, updatedFile: IUpdatedFile) {
    tree.write(updatedFile.path, updatedFile.updatedContent);
}

/**
 * Reset the index file
 */
export function resetIndexFile(tree: Tree, indexFilePath: string) {
    const contents = tree.read(indexFilePath, 'utf-8');
    const rest = contents.split('\n').slice(1);
    tree.write(indexFilePath, (rest || []).join('\n'));
}

/**
 * A helper function to get the file content and check if it exists
 */
export function getFileContent(tree: Tree, filePath: string) {
    const fileContent = tree.read(filePath)?.toString('utf-8');

    if (!fileContent) {
        logger.warn(`File ${filePath} not found or empty.`);
        return null;
    }

    return fileContent;
}

/**
 * A helper function to get the file path with extension
 */
export function getFileWithExtension(filePath: string, extension: ComponentExtension): string {
    const {
        COMPONENT,
        STYLE,
        SPEC,
        TEMPLATE,
        STORY,
        HARNESS
    } = ComponentExtension;

    switch (extension) {
        case COMPONENT:
        case STYLE:
        case SPEC:
        case TEMPLATE:
        case STORY:
        case HARNESS:
            return `${filePath}.${extension}`;
        default:
            return `${filePath}.${COMPONENT}`;
    }
}
