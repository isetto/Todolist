
export class Task {
  task: string;
  editable: boolean;
  cardId: string;
  trelloPosition: string;


  constructor(task: string, editable: boolean, cardId: string, trelloPosition: string) {
    this.task = task;
    this.editable = editable;
    this.cardId = cardId;
    this.trelloPosition = trelloPosition
  }
}
