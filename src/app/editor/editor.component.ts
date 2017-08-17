import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { Entry, Category, Address, Contact, ContactRole } from '../entry';
import { Comment } from '../comment';
import { Reaction, Rating } from '../rating';
import { AngularFireDatabase, FirebaseListObservable } from 'angularfire2/database';
import * as algoliasearch from 'algoliasearch';
import * as autocomplete from 'autocomplete.js';
import * as instantsearch from 'instantsearch.js';

@Component({
  templateUrl: 'editor.component.html',
  styleUrls: ['./editor.component.css']
})

export class EditorComponent{
  categorieKeys = Object.keys(Category).splice(Object.keys(Category).length / 2);
  model: Entry;
  entries: FirebaseListObservable<any[]>;
  dbRef: AngularFireDatabase;
  algoliaClient: algoliasearch.AlgoliaClient;
  algoliaIndex: algoliasearch.AlgoliaIndex;
  algoliaAppId = '7JD6GKV9MA';
  algoliaApiKey = 'a55f4befd56bcec64169b99a90e04acb';
  algoliaIndexName = 'associations';
  instantSearchHandler;

  constructor(db: AngularFireDatabase) {
    this.entries = db.list('/entries');
    this.dbRef = db;
    this.resetModel();
    this.algoliaClient = algoliasearch(this.algoliaAppId, this.algoliaApiKey, { protocol: 'https:'});
    this.algoliaIndex = this.algoliaClient.initIndex(this.algoliaIndexName);
    this.algoliaIndex.setSettings({attributesForFaceting: ['tags', 'categories']});
  }

  ngAfterViewInit() {
    autocomplete('#search-input', { hint: false }, [{
      source: autocomplete.sources.hits(this.algoliaIndex , { hitsPerPage: 5 }),
      displayKey: 'name',
      templates: {
        suggestion: function(suggestion) {
          return suggestion._highlightResult.name.value;
        }
      }
    }]).on('autocomplete:selected', function(event, suggestion, dataset) {
      console.log(suggestion, dataset);
    });

    const search = instantsearch({
      appId: this.algoliaAppId,
      apiKey: this.algoliaApiKey,
      indexName: this.algoliaIndexName,
      urlSync: true
    });
    search.addWidget(
      instantsearch.widgets.searchBox({
        container: '#search-box',
        placeholder: 'Rechercher une association'
      })
    );
    search.addWidget(
      instantsearch.widgets.refinementList({
        container: '#refinement-list',
        attributeName: 'categories'
      })
    );
    search.addWidget(
      instantsearch.widgets.hits({
        container: '#hits',
        templates: {
        empty: 'Aucun resultat',
        item: '<li><b>{{{_highlightResult.name.value}}}</b>: {{{_highlightResult.description}}} </li>'
      }
      })
    );
     // initialize currentRefinedValues
    search.addWidget(
      instantsearch.widgets.currentRefinedValues({
        container: '#current-refined-values',
        // This widget can also contain a clear all link to remove all filters,
        // we disable it in this example since we use `clearAll` widget on its own.
        clearAll: false
      })
    );

    // initialize clearAll
    search.addWidget(
      instantsearch.widgets.clearAll({
        container: '#clear-all',
        templates: {
          link: 'Annuler les filtres'
        },
        autoHideContainer: false
      })
    );

    // initialize pagination
    search.addWidget(
      instantsearch.widgets.pagination({
        container: '#pagination',
        maxPages: 20,
        // default is to scroll to 'body', here we disable this behavior
        scrollTo: false
      })
    );
    this.instantSearchHandler = search;
    this.instantSearchHandler.start();

  }

  onSubmit() {
    this.entries.push(this.model);
    this.pushToAlgolia(this.model);
    this.research();
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
      }
    });
  }

  research(){
    const searchbox =  <HTMLInputElement>document.querySelector('#search-box input');
    searchbox.value = '*';
    searchbox.dispatchEvent(new KeyboardEvent('input'));
    searchbox.value = '';
  }
}
