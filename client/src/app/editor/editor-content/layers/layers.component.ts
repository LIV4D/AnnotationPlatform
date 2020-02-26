import { Component, OnInit } from '@angular/core';
import { LayersFacadeService } from './../layers/layers.facade.service';
import { EditorFacadeService } from './../../editor.facade.service';
@Component({
  selector: 'app-layers',
  templateUrl: './layers.component.html',
  styleUrls: ['./layers.component.scss']
})
export class LayersComponent implements OnInit {

  constructor(private layersFacadeService: LayersFacadeService, private editorService: EditorFacadeService) { }

  ngOnInit(): void {
    // console.log('LayersComponent::ngOnInit()');
    this.layersFacadeService.init();

    // this.editorService.canvasDisplayRatio.subscribe(
    //     value => {
    //         this.updateCursorRadius();
    //     });
    // this.toolPropertiesService.brushWidthChanged.subscribe(() => { this.updateCursorRadius(); });
    // this.toolboxService.selectedTool.subscribe(value => this.updateMouseCursor(value));
  }

}
