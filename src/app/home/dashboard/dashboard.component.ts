import {Component, OnDestroy, OnInit} from '@angular/core';
import {Column} from '../../_models/column.model';
import {Board} from '../../_models/board.model';
import {CdkDragDrop, moveItemInArray, transferArrayItem} from '@angular/cdk/drag-drop';
import {Task} from "../../_models/task.mode";
import {TrelloApiService} from "../../_services/trello-api.service";
import {concatAll, concatMap, map, merge, mergeMap} from "rxjs/operators";
import {concat, forkJoin, fromEvent, Observable, pipe, Subscription} from "rxjs";
import { BlockUI, NgBlockUI } from 'ng-block-ui';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit, OnDestroy {
  todoList: Array<Task> = [];
  doingList: Array<Task> = [];
  doneList: Array<Task> = [];
  board: Board;
  @BlockUI() blockUI: NgBlockUI;

  onlineEvent: Observable<Event>;
  offlineEvent: Observable<Event>;
  subscriptions: Subscription[] = [];

  connectionStatusMessage: string;
  connectionStatus: string;
  constructor(private trelloApi: TrelloApiService) { }

  ngOnInit() {
    this.board = new Board( [
      new Column('Todo', this.todoList),
      new Column('Doing', this.doingList),
      new Column('Done', this.doneList)
    ]);
    this.getCards();
    this.connectionCheck()
  }

  connectionCheck(){
    this.onlineEvent = fromEvent(window, 'online');
    this.offlineEvent = fromEvent(window, 'offline');

    this.subscriptions.push(this.onlineEvent.subscribe(e => {
      this.uploadData();
      this.connectionStatusMessage = 'Uploading data';
      this.connectionStatus = 'online';
    }));

    this.subscriptions.push(this.offlineEvent.subscribe(e => {
      this.connectionStatusMessage = 'Connection lost but you can work offline';
      this.connectionStatus = 'offline';
    }));
  }


  getCards(){
    this.getBoardId().then(()=>{
      this.trelloApi.getLists(this.trelloApi.boardId).pipe(
        mergeMap((response)=>{
          this.trelloApi.toDoListId = response[0].id;
          this.trelloApi.doingListId = response[1].id;
          this.trelloApi.doneListId = response[2].id;

          const listTodo = this.trelloApi.getCards(this.trelloApi.boardId, response[0].id);
          const listDoing = this.trelloApi.getCards(this.trelloApi.boardId, response[1].id);
          const listDone = this.trelloApi.getCards(this.trelloApi.boardId, response[2].id);
          return forkJoin([listTodo, listDoing, listDone])
        })
      ).subscribe(
        response=>{
          response[0].forEach(card=>{this.todoList.push(new Task(card.desc, false, card.id, card.pos))});
          response[1].forEach(card=>{this.doingList.push(new Task(card.desc, false, card.id, card.pos))});
          response[2].forEach(card=>{this.doneList.push(new Task(card.desc, false, card.id, card.pos))});
        },
        error1 => console.log(error1)
      )
    });
  }

  async getBoardId(){
    try{
      const boards = await this.trelloApi.getBoards();
      const board = boards.find(board=>board.name === 'My_Board');
      if(board === null || board === undefined){
        try{
          const boardCreated = await this.trelloApi.createBoard();
          this.trelloApi.boardId = boardCreated.id;
        }catch (e) {console.log(e)}
      }else{
        this.trelloApi.boardId = board.id;
      }
    }
    catch (e) {console.log(e)}
  }

  drop(event: CdkDragDrop<Task[]>) {
    this.blockUI.start('Saving...');
      let previousArray = this.getListFromMovedCard(event.previousContainer.id);
      let currentArray = this.getListFromMovedCard(event.container.id);

      const cardIdTemp = previousArray[event.previousIndex].cardId;
      const taskTemp = previousArray[event.previousIndex].task;

      if(event.previousContainer === event.container){
        previousArray.splice(event.previousIndex, 1);
        currentArray.splice(event.currentIndex, 0, new Task(taskTemp, false, '0', '0'));
      }else{
        currentArray.splice(event.currentIndex, 0, new Task(taskTemp, false, '0', '0'));
        previousArray.splice(event.previousIndex, 1);
      }

      this.trelloApi.addCard(this.getListId(event.container.id), taskTemp, taskTemp, this.getTrelloPosition(currentArray, event.currentIndex)).pipe(
        mergeMap(response=>{
          currentArray.splice(event.currentIndex, 1);
          currentArray.splice(event.currentIndex, 0, new Task(taskTemp, false, response.id, response.pos));
          return this.trelloApi.deleteCard(cardIdTemp)
        })
      ).subscribe(response=> {this.blockUI.stop()}, error1 => this.blockUI.stop());
  }

  getAddCardObservables(): Array<Observable<any>>{
    const cardList$: Array<Observable<any>> = [];
    let todoCounter = 2;
    this.todoList.forEach(item=>{
      todoCounter+=2;
      cardList$.push(this.trelloApi.addCard(this.trelloApi.toDoListId, item.task, item.task, todoCounter.toString()))
    });

    let doingCounter = 2;
    this.doingList.forEach(item=>{
      doingCounter+=2;
      cardList$.push(this.trelloApi.addCard(this.trelloApi.doingListId, item.task, item.task, doingCounter.toString()))
    });

    let doneCounter = 2;
    this.doneList.forEach(item=>{
      doneCounter+=2;
      cardList$.push(this.trelloApi.addCard(this.trelloApi.doneListId, item.task, item.task, doneCounter.toString()))
    });
    return cardList$
  }

  uploadData(){
    const cardsList$ = this.getAddCardObservables();
    const listTodo = this.trelloApi.getCards(this.trelloApi.boardId, this.trelloApi.toDoListId);
    const listDoing = this.trelloApi.getCards(this.trelloApi.boardId, this.trelloApi.doingListId);
    const listDone = this.trelloApi.getCards(this.trelloApi.boardId, this.trelloApi.doneListId);

    forkJoin([listTodo, listDoing, listDone]).pipe(
      mergeMap(response => {
        const recordsToDelete$: Array<Observable<any>> = [];
        response[0].forEach(card=>{recordsToDelete$.push(this.trelloApi.deleteCard(card.id))});
        response[1].forEach(card=>{recordsToDelete$.push(this.trelloApi.deleteCard(card.id))});
        response[2].forEach(card=>{recordsToDelete$.push(this.trelloApi.deleteCard(card.id))});
        return forkJoin([...recordsToDelete$])
      }),
      mergeMap(response=>{
        return forkJoin([...cardsList$])
      })
    ).subscribe(
      response=>{console.log(response)},
      error1 => console.log(error1)
    );
  }

  getTrelloPosition(array: Array<Task>, position: number): string{
    if(position === 0){
      return 'top'
    }else if(position === array.length-1){
      return 'bottom'
    }else{
      const topPosition = Number(array[position-1].trelloPosition);
      const bottomPosition = Number(array[position+1].trelloPosition);
      const resultPosition = (topPosition+bottomPosition)/2;
      return resultPosition.toString()
    }
  }

  getListFromMovedCard(stringId: string): Array<any>{
    let array  = [];
    if(stringId === 'cdk-drop-list-0'){
      array = this.todoList
    }else if(stringId === 'cdk-drop-list-1'){
      array = this.doingList
    }else if(stringId === 'cdk-drop-list-2'){
      array = this.doneList
    }
    return  array
  }

  initialAddCard(){
    this.todoList.unshift(new Task('', true, '0', '0'));
    this.trelloApi.addCard(this.trelloApi.toDoListId, '', '', 'top').subscribe(
      response=>{
        this.todoList.splice(0, 1);
        this.todoList.unshift(new Task('', true, response.id, response.pos));
      },
      error1 => console.log(error1)
    )
  }

  editCard(listName:string,i: number){
    const array = this.chooseList(listName);
    array[i].editable = true
  }

  saveCard(columnName:string, i: number){
    const array = this.chooseList(columnName);
    array[i].editable = false;
    this.trelloApi.editCard(array[i].cardId, array[i].task, array[i].task).subscribe(
      response=> {},
      error1 => console.log(error1)
    )
  }

  deleteCard(columnName:string, i: number){
    const array = this.chooseList(columnName);
    array.splice(i, 1)
    this.trelloApi.deleteCard(array[i].cardId).subscribe(
      response=> {},
      error1 => console.log(error1)
    );
  }

  chooseList(columnName:string): Array<Task>{
    if(columnName === 'Todo'){
      return this.todoList
    }else if(columnName === 'Doing'){
      return this.doingList
    }else if(columnName === 'Done'){
      return  this.doneList
    }
  }

  getListId(columnName: string): string{
    if(columnName === 'cdk-drop-list-0'){
      return this.trelloApi.toDoListId
    }else if(columnName === 'cdk-drop-list-1'){
      return this.trelloApi.doingListId
    }else if(columnName === 'cdk-drop-list-2'){
      return  this.trelloApi.doneListId
    }
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }

}
