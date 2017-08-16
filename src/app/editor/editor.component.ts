import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { Entry, Category, Address, Contact, ContactRole } from 'app/entry';
import { Comment } from '../comment';
import { Reaction, Rating } from '../rating';
import { AngularFireDatabase, FirebaseListObservable } from 'angularfire2/database';
import * as algoliasearch from 'algoliasearch';
//import * as algolia2 from '@types/algoliasearch'; 
 
@Component({
  templateUrl: 'editor.component.html'
})

export class EditorComponent {
  categorieKeys = Object.keys(Category).splice(Object.keys(Category).length / 2);
  model: Entry;
  entries: FirebaseListObservable<any[]>;
  dbRef: AngularFireDatabase;
  algoliaClient: algoliasearch.AlgoliaClient;
  algoliaIndex: algoliasearch.AlgoliaIndex;
    
  constructor(db: AngularFireDatabase) {
    this.entries = db.list('/entries');
    this.dbRef = db;
    this.resetModel();
    this.algoliaClient = algoliasearch('7JD6GKV9MA', 'a55f4befd56bcec64169b99a90e04acb');
    this.algoliaIndex = this.algoliaClient.initIndex("associations");
  }
  
  onSubmit() {
    this.entries.push(this.model);
    this.pushToAlgolia(this.model);
  }
  
  resetModel(){
    this.model = new Entry('', '', [], [], [], []) ;
    this.model.contacts = [new Contact('', '', '', ContactRole.MAINCONTACT)];
    this.model.address = new Address('');
  }
  
  pushToAlgolia(data){
    this.algoliaIndex.addObject(data,function(err, content) {
      if (err) {
        console.error(err);
      };
    });
  }
}
