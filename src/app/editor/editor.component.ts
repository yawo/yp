import { Component } from '@angular/core';
import {NgForm} from '@angular/forms';
import { Router } from '@angular/router';
import { Entry, Category, Address, Contact, ContactRole } from '../entry';
import { Comment } from '../comment';
import { Reaction, Rating } from '../rating';
import { AngularFireDatabase, FirebaseListObservable } from 'angularfire2/database';
import * as algoliasearch from 'algoliasearch';
import * as algoliasearchHelper from 'algoliasearch-helper';
import * as autocomplete from 'autocomplete.js';
import 'rxjs/add/operator/count';
import 'rxjs/add/operator/take';
import * as  places from 'places.js';
import { Observable } from 'rxjs/Observable';

import * as instantsearch from 'instantsearch.js';

@Component({
  templateUrl: 'editor.component.html',
  styleUrls: ['./editor.component.css']
})

export class EditorComponent {
  submitSuccess= false;
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
  algoliaSearchHelper;
  recentEntries: any[];
  totalEntries:  number;
  recentSize: 3;

  constructor(db: AngularFireDatabase) {
    this.entries = db.list('/entries');
    this.entries.subscribe(x => {
      this.totalEntries = x.length;
      this.recentEntries = x.slice(-3).reverse();
    });
    // this.entries.count().subscribe(x => this.totalEntries = x);
    // this.entries.take(this.recentSize).subscribe(x => this.recentEntries = x);
    this.dbRef = db;
    this.resetModel();
    this.algoliaClient = algoliasearch(this.algoliaAppId, this.algoliaApiKey, { protocol: 'https:'});
    this.algoliaIndex = this.algoliaClient.initIndex(this.algoliaIndexName);
    this.algoliaIndex.setSettings({attributesForFaceting: ['tags', 'categories']});
    this.algoliaSearchHelper = algoliasearchHelper( this.algoliaClient, this.algoliaIndexName, { hitsPerPage: 10 });
  }

  // tslint:disable-next-line:use-life-cycle-interface
  ngAfterViewInit() {
    /*autocomplete('#search-input', { hint: false }, [{
      source: autocomplete.sources.hits(this.algoliaIndex , { hitsPerPage: 5 }),
      displayKey: 'name',
      templates: {
        suggestion: function(suggestion) {
          return suggestion._highlightResult.name.value;
        }
      }
    }]).on('autocomplete:selected', function(event, suggestion, dataset) {
      console.log(suggestion, dataset);
    });*/
    const placesAutocomplete = places({
      container: document.querySelector('#address')
    });

    const client = this.algoliaClient;
    const search = instantsearch({
      appId: this.algoliaAppId,
      apiKey: this.algoliaApiKey,
      indexName: this.algoliaIndexName,
      urlSync: true,
      createAlgoliaClient: function(algoliasearch, appId, apiKey) {
        return client;
      }
      // ,searchFunction: function(helper){ console.log('ddddd', helper.search()); }
    });
    search.addWidget(
      instantsearch.widgets.searchBox({
        container: '#search-box',
        placeholder: 'Rechercher une association (par nom, description, catégories ou mots clés)'
      })
    );
    search.addWidget(
      instantsearch.widgets.refinementList({
        collapsible: true,
        container: '#refinement-list',
        attributeName: 'categories'
      })
    );
    search.addWidget(
      instantsearch.widgets.hits({
        collapsible: true,
        container: '#hits',
        templates: {
          empty: 'Aucun resultat',
          item: `
          <li class='hit-entry row'>
            <span class='hitcategories badge badge-warning'>{{{categories.1}}}</span>
            <span class='col-sm-5 hitname'>{{{name}}} </span>
            <span class='col-sm-3 hitaddress'> {{{address.full}}} </span>
            <span class='hitphone'> | {{{contacts.0.phone}}}, {{{contacts.0.email}}} </span>
            <span class='col-sm-12 hitdesc'>{{{description}}}</span>
            <span class='col-sm-12 hittags'>{{{tags}}}</span>
          </li>`
        },
        transformData: {
          item: function(data) {
            data.splittedTags = data.tags.split(',');
            return data;
          }
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
    console.log(this.instantSearchHandler);
  }

  onSubmit(assoForm: any) {
    this.entries.push(this.model);
    this.pushToAlgolia(this.model);
    this.resetModel();
    const is = this.instantSearchHandler;
    setTimeout(function(){
      is.helper.setQuery('  ');
      is.helper.search();
      console.log('re-searching');
    }, 8000);
  }

  resetModel() {
    this.model = new Entry('', '', [], [], [], []) ;
    this.model.contacts = [new Contact('', '', '', ContactRole.MAINCONTACT)];
    this.model.address = new Address('');
  }

  pushToAlgolia(data) {
    this.algoliaIndex.addObject(data, function(err, content) {
      if (err) {
        console.error(err);
      }
    });
  }

  research() {
    /* const searchbox =  <HTMLInputElement>document.querySelector('#search-box input');
    searchbox.value = '*';
    searchbox.dispatchEvent(new KeyboardEvent('input'));
    searchbox.value = ''; */
  }
}
