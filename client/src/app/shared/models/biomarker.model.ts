export class Biomarker {
    public isVisible: boolean = true;
    constructor(public type: string, public color: string, isVisible=true){
        this.isVisible = isVisible;
    }
}