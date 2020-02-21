export class Tool {
    public name: string;
    public imagePath: string;

    // constructor(private _name, private _iconPath: string, private _tooltip: string, toolServices: ToolServices) {
    constructor(name: string, imagePath: string, tooltip: string) {
      this.name = name;
      this.imagePath = imagePath;
    }
}
