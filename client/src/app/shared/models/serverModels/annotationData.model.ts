export class StringHierarchy { [key: string]: StringHierarchy | string}

export class AnnotationData {
    // public biomarker: {[key: string]: string};
    // public hierarchy: StringHierarchy;
    // nongraphic: {[key: string]: string | boolean | number};
    biomarkers?: Array<AnnotationData>;
    type?: string;
    color?: string;
    dataImage?: string; // ou string;
}

