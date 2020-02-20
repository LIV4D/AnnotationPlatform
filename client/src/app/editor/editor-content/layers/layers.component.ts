import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-layers',
  templateUrl: './layers.component.html',
  styleUrls: ['./layers.component.scss']
})
export class LayersComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
    this.layersService.init();
    this.editorService.canvasDisplayRatio.subscribe(
        value => {
            this.updateCursorRadius();
        });
    // this.toolPropertiesService.brushWidthChanged.subscribe(() => { this.updateCursorRadius(); });
    // this.toolboxService.selectedTool.subscribe(value => this.updateMouseCursor(value));
  }

}
