
export class Task {
  task: string;
  editable: boolean;


  constructor(task: string, editable: boolean) {
    this.task = task;
    this.editable = editable;
  }
}
