import {UiOptions} from "../ui/schema";

/**
 * The interface for the component details
 */
export interface IComponentOptions extends UiOptions {
    libName: string;
}

export interface IComponentPath {
    file: string;
    root: string;
}

export interface IComponentDetails {
    fileName: string;
    className: string;
    originalClassName: string;
    selector?: string;
    hostClassName?: string;
    path: IComponentPath;
}
