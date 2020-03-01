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
