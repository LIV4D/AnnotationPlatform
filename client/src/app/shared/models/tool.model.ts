export class Tool {
  disabled: boolean;

  public name: string;
  public imagePath: string;
  public tooltip: string;

  // constructor(private _name, private _iconPath: string, private _tooltip: string, toolServices: ToolServices) {
  constructor(name: string, imagePath: string, tooltip: string) {
    this.name = name;
    this.imagePath = imagePath;
    this.tooltip = tooltip;
  }
}
