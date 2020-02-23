import { Component, OnInit } from '@angular/core';
import { LayersService } from 'src/app/shared/services/Editor/layers.service';
import { EditorService } from 'src/app/shared/services/Editor/editor.service';

@Component({
  selector: 'app-layers',
  templateUrl: './layers.component.html',
  styleUrls: ['./layers.component.scss']
})
export class LayersComponent implements OnInit {

  constructor(private layersService: LayersService, private editorService: EditorService) { }

  ngOnInit(): void {
    // console.log('LayersComponent::ngOnInit()');
    // this.layersService.init();

    // this.editorService.canvasDisplayRatio.subscribe(
    //     value => {
    //         this.updateCursorRadius();
    //     });
    // this.toolPropertiesService.brushWidthChanged.subscribe(() => { this.updateCursorRadius(); });
    // this.toolboxService.selectedTool.subscribe(value => this.updateMouseCursor(value));
  }

}
