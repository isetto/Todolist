import { Injectable } from '@angular/core';
import {HttpClient, HttpParams} from "@angular/common/http";

@Injectable({
  providedIn: 'root'
})
export class TrelloApiService {
   key = '';
   token = '';
   
   boardId = "";
   toDoListId = "";
   doingListId = "";
   doneListId = "";

  useParams = new HttpParams()
    .set('key', this.key)
    .set('token', this.token);



  constructor(private httpClient: HttpClient) { }

  getBoards(){
    return this.httpClient.get<Array<any>>(`https://api.trello.com/1/members/me/boards`, {params: this.useParams}).toPromise()
  }


  getLists(boardId: string){
    return this.httpClient.get(`https://api.trello.com/1/boards/${boardId}/lists`, {params: this.useParams})
  }

  getCards(boardId: string, listId: string){
    return this.httpClient.get<Array<any>>(`https://api.trello.com/1/lists/${listId}/cards`, {params: this.useParams})
  }

  deleteCard(cardId: string){
    return this.httpClient.delete(`https://api.trello.com/1/cards/${cardId}`, {params: this.useParams})
  }
  editCard(cardId: string, name: string, description: string){
    const body = {
      name: name,
      desc: description,
      keepFromSource: 'all',
    };
    return this.httpClient.put(`https://api.trello.com/1/card/${cardId}`,body, {params: this.useParams})
  }
  addCard(idList: string, name: string, description: string, posistion: string){
    const body = {
      idList: idList,
      name: name,
      pos: posistion,
      desc: description,
      keepFromSource: 'all',
    };
    return this.httpClient.post<any>(`https://api.trello.com/1/cards`, body, {params: this.useParams})
  }

  createBoard(){
    const url = 'https://api.trello.com/1/boards/';
    const body = {
      name: 'My_Board',
      defaultLabels: 'true',
      defaultLists: 'true',
      keepFromSource: 'none',
      prefs_permissionLevel: 'private',
      prefs_voting: 'disabled',
      prefs_comments: 'members',
      prefs_invitations: 'members',
      prefs_selfJoin: 'true',
      prefs_cardCovers: 'true',
      prefs_background: 'blue',
      prefs_cardAging: 'regular',
      key: this.key,
      token: this.token
      };
    return this.httpClient.post<any>(url, body).toPromise()
  }
}
