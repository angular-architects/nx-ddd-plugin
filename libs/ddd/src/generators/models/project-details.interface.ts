/**
 * The interface for the project file path
 */
export interface IProjectPath {
    root: string;
    project?: string;
    esLint?: string;
    readme?: string;
    index?: string;
}
/**
 * The interface for the project details
 */
export interface IProjectDetails {
    name: string;
    path: IProjectPath
}
