import { Component, OnInit, Input } from '@angular/core';
import { Tool } from '../../../shared/services/Editor/Tools/tool.service';
import { ToolboxFacadeService } from './../toolbox.facade.service';

@Component({
  selector: 'app-tool-element',
  templateUrl: './tool-element.component.html',
  styleUrls: ['./tool-element.component.scss']
})
export class ToolElementComponent implements OnInit {

  @Input() tool: Tool;
  isSelected = false;
  showDelay: number;
  disabled = false;

  constructor(private toolboxFacadeService: ToolboxFacadeService) {
    this.showDelay = 1000;
  }

  ngOnInit(): void {
    this.toolboxFacadeService.selectedTool.subscribe(
      value => {
        this.isSelected = value === this.tool;
        if (value === this.tool ) {
          console.log('TRUE_____');
        }
      });
  }

  selectTool(): void {
    console.log('Clicked Stik tik tik l7elwa l7elwa');

    this.toolboxFacadeService.setSelectedTool(this.tool.name);
  }

  public onMouseUp(event: MouseEvent): void {
    // setTimeout necessary or else it will happen on next mouse up
    setTimeout(() => {
      this.toolboxFacadeService.setUndoRedoState();
    }, 0);
  }

}
