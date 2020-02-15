import { Component, OnInit } from '@angular/core';
import { Tool } from 'src/app/shared/models/tool.model';

@Component({
  selector: 'app-toolbox',
  templateUrl: './toolbox.component.html',
  styleUrls: ['./toolbox.component.scss']
})
export class ToolboxComponent implements OnInit {

  listOfTools: Tool[] = [
    new Tool('name', '../../../assets/icons/hand.svg'),
    new Tool('name', '../../../assets/icons/brush.svg'),
    new Tool('name', '../../../assets/icons/brush-fill.svg'),
    new Tool('name', '../../../assets/icons/eraser.svg'),
    new Tool('name', '../../../assets/icons/lasso-eraser.svg'),
    new Tool('name', '../../../assets/icons/picker.svg'),
    new Tool('name', '../../../assets/icons/undo.svg'),
    new Tool('name', '../../../assets/icons/redo.svg')
  ];

  constructor() { }

  ngOnInit(): void {
  }

}
