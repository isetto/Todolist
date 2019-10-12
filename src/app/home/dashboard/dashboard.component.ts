import { Component, OnInit } from '@angular/core';
import {Column} from '../../_models/column.model';
import {Board} from '../../_models/board.model';
import { CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import {Task} from "../../_models/task.mode";
@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  tasksList: Array<Task> = [];
  tasksList2: Array<Task> = [];
  tasksList3: Array<Task> = [];
  board: Board;
  flag = false;

  constructor() { }

  ngOnInit() {
    this.tasksList.push(
      new Task('zadanie1', false),
      new Task('zadanie2', false),
      new Task('zadanie3', false));
    this.board = new Board( [
      new Column('Todo', this.tasksList),
      new Column('Doing', this.tasksList2),
      new Column('Done', this.tasksList3)
    ]);
  }

  drop(event: CdkDragDrop<Task[]>) {
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      transferArrayItem(event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex);
    }
  }

  addCard(){
    this.tasksList.unshift(new Task('', true))
  }

  editCard(columnName:string,i: number){
    const array = this.chooseColumn(columnName);
    array[i].editable = true
  }

  saveCard(columnName:string,i: number){
    const array = this.chooseColumn(columnName);
    array[i].editable = false
  }

  deleteCard(columnName:string, i: number){
    const array = this.chooseColumn(columnName);
    array.splice(i, 1);
    this.flag = true;
  }

  chooseColumn(columnName:string): Array<Task>{
    if(columnName === 'Todo'){
      return this.tasksList
    }else if(columnName === 'Doing'){
      return this.tasksList2
    }else if(columnName === 'Done'){
      return  this.tasksList3
    }
  }

}
