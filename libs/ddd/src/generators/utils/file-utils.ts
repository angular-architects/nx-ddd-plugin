import {logger, Tree} from "@nx/devkit";
import {ComponentExtension} from "../models/component-extension.enum";
import {IClassNames} from "../models/class-names.interface";
import {IUpdatedFile} from "../models/updated-file.interface";

/**
 * A helper function to check if the file exists and log an error if not
 */
export function isFileExists(tree: Tree, filePath: string): boolean {
    if (!tree.exists(filePath)) {
        throw new Error(`Unable to read project configuration at ${filePath}`);
    }
    return true;
}

/**
 * A helper function to replace the class name in the file content
 */
export function replaceClassName(fileContent: string, classNames: IClassNames): string {
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
    const fileContent = tree.read(indexFilePath, 'utf-8');

    if (fileContent === undefined) {
        return; // exit early if the file doesn't exist or is empty
    }

    const rest = fileContent.split('\n').slice(1);
    const updateFile = {
        path: indexFilePath,
        updatedContent: rest.join('\n')
    }

    updateFileContent(tree, updateFile);
}

/**
 * A helper function to get the file content and check if it exists
 */
export function getFileContent(tree: Tree, filePath: string): string {
    const fileContent = tree.read(filePath)?.toString('utf-8');

    if (!fileContent) {
        throw new Error(`File ${filePath} not found or empty.`);
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
        HARNESS,
        MODULE
    } = ComponentExtension;

    switch (extension) {
        case COMPONENT:
        case STYLE:
        case SPEC:
        case TEMPLATE:
        case STORY:
        case HARNESS:
        case MODULE:
            return `${filePath}.${extension}`;
        default:
            return `${filePath}.${COMPONENT}`;
    }
}
