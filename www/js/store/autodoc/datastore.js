/**
 * Local storage wrapper for creating lists and tags
 * @name Datastore
*/
function dataStore(){
	/**
 	 * Local variable for storing db
 	 */
	this.dataStore  = {lists: {}, tags: {}};

	/**
 	 * Grabs store from storage if it exists, otherwise creates new store in localstorage
 	 * @namespace Datastore
 	 */
	this.initDataStore = function(){
		if (this.getStore == undefined){
			this.createDataStore();
		}
	}
	this.createDataStore = function(){
		store.set('store', {lists: {}, tags: {} }); 
	}
	
	//destructor
	this.destroyDataStore = function(){
		store.clear();
	}
	
	//update store
	this.updateDataStore = function(){
		store.set('store', this.store);
	}
	//get store from storage
	this.getStore = function(){
		this.dataStore = store.get('store');
		return this.dataStore;
	}

	//get list
	this.getList = function(list){
		return this.dataStore.lists[list];
	}
	
	//get all lists
	this.getAllLists = function(){
		return this.dataStore.lists;
	}
	
	/*
		Function: create list
		params: listObject
	*/
	this.createList = function(listObject){
		var id = this.createUUID();
		this.dataStore.lists[id] = listObject;
		return id;
	}
	
	//modify list
	this.editList = function(listObject){
		var id = listObject.id;
		this.dataStore.lists[id] = listObject;
	}
	
	//delete list
	this.deleteList = function(id){
		delete this.dataStore.lists[id];
	}
	
	//get item
	this.getItem = function(id, list){
		return this.dataStore.lists[list][id];
	}
	
	//create item
	this.createItem = function(item, list){
		var id = this.createUUID();
		this.dataStore.lists[list][id] = item;
		return id;
	}
	
	//edit item
	this.editItem = function(item, list){
		var id = item.id;
		this.dataStore.lists[list][id] = item;
	}
	
	//delete item
	this.deleteItem = function(id){
		delete this.dataStore.lists[list][id];
	}

	//utility functions
	this.createUUID = function(){
    	// http://www.ietf.org/rfc/rfc4122.txt
    	var s = [];
    	var hexDigits = "0123456789abcdef";
    	for (var i = 0; i < 36; i++) {
    	    s[i] = hexDigits.substr(Math.floor(Math.random() * 0x10), 1);
    	}
    	s[14] = "4";  // bits 12-15 of the time_hi_and_version field to 0010
    	s[19] = hexDigits.substr((s[19] & 0x3) | 0x8, 1);  // bits 6-7 of the clock_seq_hi_and_reserved to 01
    	s[8] = s[13] = s[18] = s[23] = "-";
		
    	var uuid = s.join("");
    	return uuid;
	}
}

/* 
//list type
//id
//name
//location
//rating
//tags
//foursquare
//maps
*/
var testItem = {
	'name' : 'testItemName',
	'location' : 'testLocation',
	'rating' : 5,
	'tags' : [ 'tag1', 'tag2', 'tag3'],
	'foursquare' : 'testF4link',
	'maps' : 'testMapsLink'
}
var testList = {
	'name' : 'listName',
	'description' : 'listDescription',
	'items' : []
}
var db = {};
function initTestStore(){
	db = new dataStore();
	db.initDataStore();
	var listId = db.createList(testList);
	//console.log(listId);
	var item1 = db.createItem(testItem,listId);
	var item2 = db.createItem(testItem,listId);
	var item3 = db.createItem(testItem,listId);
	var item4 = db.createItem(testItem,listId);
	var item5 = db.createItem(testItem,listId);
}