import { Component, OnInit, Input } from '@angular/core';
import { Tool } from '../../../shared/models/tool.model';

@Component({
  selector: 'app-tool-element',
  templateUrl: './tool-element.component.html',
  styleUrls: ['./tool-element.component.scss']
})
export class ToolElementComponent implements OnInit {

  @Input() tool: Tool;

  constructor() { }

  ngOnInit(): void {
  }

}
