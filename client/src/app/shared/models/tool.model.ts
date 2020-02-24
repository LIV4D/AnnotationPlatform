import { LayersService } from './../services/Editor/layers.service';
import { EditorService } from './../services/Editor/editor.service';
// import { Tool } from './../services/Editor/editor.service';
// import { EditorService } from './../services/Editor/editor.service';

export interface ToolServices {
  layersService: LayersService;
  editorService: EditorService;
  // toolPropertiesService: ToolPropertiesService;
  // biomarkersService: BiomarkersService;
}

export class Tool {
  disabled: boolean;

  protected layersService: LayersService;
  protected editorService: EditorService;

  public name: string;
  public imagePath: string;
  public tooltip: string;

  constructor(name: string, imagePath: string, tooltip: string, toolServices: ToolServices) {
  // constructor(name: string, imagePath: string, tooltip: string) {
    this.name = name;
    this.imagePath = imagePath;
    this.tooltip = tooltip;
    this.layersService = toolServices.layersService;
    this.editorService = toolServices.editorService;
  }
}
