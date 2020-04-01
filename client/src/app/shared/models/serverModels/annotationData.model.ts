export class StringHierarchy { [key: string]: StringHierarchy | string}

export class AnnotationData {
    public biomarker: {[key: string]: string};
    public hierarchy: StringHierarchy;
    nongraphic: {[key: string]: string | boolean | number};
}

