import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AngularFireDatabase, FirebaseListObservable } from 'angularfire2/database';

import { Entry, Category, Contact, ContactRole } from '../entry';

@Component({
  templateUrl: 'editor.component.html'
})

export class EditorComponent {
  entries: FirebaseListObservable<any[]>;
  constructor(db: AngularFireDatabase) {
    this.entries = db.list('/entries');
  }
}
