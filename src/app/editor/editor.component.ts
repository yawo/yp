import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AngularFireDatabase, FirebaseListObservable } from 'angularfire2/database';

import { Entry, Category, Address, Contact, ContactRole } from '../entry';
import { Comment } from '../comment';
import { Reaction, Rating } from '../rating';

@Component({
  templateUrl: 'editor.component.html'
})

export class EditorComponent {
  categorieKeys = Object.keys(Category).splice(Object.keys(Category).length / 2);
  model: Entry;
  entries: FirebaseListObservable<any[]>;
  constructor(db: AngularFireDatabase) {
    this.entries = db.list('/entries');
    this.model = new Entry('', 'n', 'd', [], [], [], []) ;
    this.model.contacts = [new Contact('n', 'em@em.com', '06000000', ContactRole.MAINCONTACT)];
    this.model.address = new Address('f');
  }
}
