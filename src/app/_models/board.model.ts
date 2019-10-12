import { Column } from './column.model';

export class Board {
  columns: Column[];

  constructor(columns: Column[]) {
    this.columns = columns;
  }
}
