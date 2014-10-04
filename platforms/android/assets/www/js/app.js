//Global Variables
var app= {};
	app.webdb = {};
	app.webdb.db = null;
	app.lists = [];
	app.selectedList = null,
	db = {},
	listId = '';

//init function
app.init = function (){
	//read db from file
	initAddItemDialog();
	initAddListDialog();
	initEditItemDialog();
	initListSelectDialog();
	initMenus();
	db = new dataStore();
	db.initDataStore();
	//populateSel();
};
function populateSel(){
	var lists = db.getAllLists();
	$('#listSelect option[value!=null]').remove();
	for (var prop in lists){
		$('#listSelect').append($("<option></option>")
						.attr('value', prop)
						.text(lists[prop].name));
	}
	$('#listSelect').on('click', function(e){
		listId = this.value;
		populateList(listId);
	});
}
function populateSelectPopup(){
	var lists = db.getAllLists();
	var container = $('#listSelectContainer');
		container.html('');
	for (var prop in lists){
		container.append($('<div class="listSelect-ListItem">')
							.attr('value', prop)
							.val(prop)
							.html('<div class="listSelect-Name">' + lists[prop].name + '</div><div class="listSelect-Description"> ' + lists[prop].description + '</div>' +
								'<div class="listSelect-Delete">delete</div>' +
								'<div class="listSelect-Edit">edit</div>'));
	}
	$('.listSelect-ListItem').on('click', function(e){
		console.log(this);
		var id = $(this).val();
		if (id != app.selectedList){
			var list = db.getList(id)
			populateList(id);
		}
		app.selectedList = {id: id, val: list};
		$('#selectBtn').html(list.name);
		$('#listSelectDialog').dialog('close');
	})
}
function populateList(list){
	$('#listCard div[class="listContainer"]').remove();
	var vals = db.getList(list).items;
	for (var prop in vals){
		if (typeof vals[prop] === 'object'){
			addItem(vals[prop], $('#listCard'), openEditItemPopop, openItemView, removeItemFromDB);
		}
	}
}

function testInit(){
	var testList = {
	'name' : 'testList',
	'description' : 'testListDescription',
	'items' : {}
	};
	listId = db.createList(testList);

	var i = 5;
	while (i != 0){
		db.createItem({
						'name' : 'testItemName2',
						'location' : 'testLocation2',
						'rating' : 5,
						'tags' : [ 'tag1', 'tag2', 'tag3'],
						'foursquare' : 'testF4link2',
						'maps' : 'testMapsLink2'
					},listId);
	i--;
	}
}

function populateListSelector(){
	var select = document.getElementById('listSelect');
	clearSelect(select);
	for (var i = 0; i < app.lists.length; i++){
		var option = document.createElement('option');
        option.value = app.lists[i];
        option.text = app.lists[i];
        select.add(option);
    }
}

function clearSelect(select){
	var length = select.options.length;
	for (i = 0; i < length; i++) {
	  select.options[i] = null;
	}
}
//Local Storage Structure
// DB of lists
// Last selected list
function initCheckEvent(){
	$('#listCheck').change(function() {
		var id = parseListId($(this).parent().parent().attr('id'));
		console.log(id);
		console.log($(this).prop('checked'));
		var select = $(this).prop('checked')
		app.selectedList.val[id].visited = select;
		updateCurrentList();
	})
}
function parseListId(id){

	return id.trimLeft('item_');
}
function populateListSelect(){
	$('#listSelect').change(function() {

		if ($(this).val() != app.selectedList){
			populateList(store.get($(this).val()));
		}
		app.selectedList = {id:$(this).val(), val: store.get($(this).val())};
	});
}

//popup initialization functions
function initEditItemDialog(){
	$('#editItemDialog').dialog({
		autoOpen: false,
		position: { my: 'top+20', at: 'top', of: window },
		modal: true,
		buttons: {
			'Save' : function() {
				//addNewItem($('#name').val(), $('#style').val(), $('#location').val(), $('#review').val(), false);
				var item = {
					'id': $('#editIdInput').val(),
					'name': $('#editNameInput').val(),
					'location': $('#editLocationInput').val(),
					'rating': parseInt($('#editReviewInput').val()),
					'tags': $('#editStyleInput').val().split(','),
					'foursquare': '',
					'maps': '',
					'images': []
				}
				var id = db.editItem(item, listId);
				updateItem(item, openEditItemPopop);
				//clear form
				$("#editItemDialog :input").each(function(){
					$(this).val('');
				});

				$( this ).dialog( "close" );
			},
			Cancel: function() {
          		$( this ).dialog( "close" );
        	}
		},
		create:function(){
			//so hacky
			$('#editItemDialog').parent().find('span:contains("Save")').parent().addClass('dialog-create-button');
			$('#editItemDialog').parent().find('span:contains("Cancel")').parent().addClass('dialog-cancel-button');
		}
	});
}
function initListSelectDialog(){
	$('#listSelectDialog').dialog({
		autoOpen: false,
		position: { my: 'top+20', at: 'top', of: window },
		modal: true,
		buttons: {
			'Cancel': function (){
				$( this ).dialog( "close" );
			}
		},
		create:function(){
			//so hacky
			$('#listSelectDialog').parent().find('span:contains("Cancel")').parent().addClass('dialog-cancel-button');
		}
	});
}
function initAddItemDialog(){
	$('#addItemDialog').dialog({
		autoOpen: false,
		position: { my: 'top+20', at: 'top', of: window },
		modal: true,
		buttons: {
			'Create' : function() {
				//addNewItem($('#name').val(), $('#style').val(), $('#location').val(), $('#review').val(), false);
				var newItem = {
					'name': $('#name').val(),
					'location': $('#location').val(),
					'rating': Number($('#review').val()),
					'tags': $('#style').val().split(','),
					'foursquare': '',
					'maps': '',
					'images': []
				}
				for (var i= 0; i < $('.dialog-form-input-image').length; i++){
					console.log($('.dialog-form-input-image')[i]);
    				newItem.images.push( $($('.dialog-form-input-image')[i]).children('img').attr('src'));
				}
				$('.dialog-form-input-image').remove();

				var id = db.createItem(newItem, listId);
				newItem.id = id;
				addItem(newItem, $('#listCard'), openEditItemPopop, removeItemFromDB);
				//clear form
				$("#addItemDialog :input").each(function(){
					$(this).val('');
				});

				$( this ).dialog( "close" );
			},
			Cancel: function() {
          		$( this ).dialog( "close" );
        	}
		},
		create:function(){
			//so hacky
			$('#addItemDialog').parent().find('span:contains("Create")').parent().addClass('dialog-create-button');
			$('#addItemDialog').parent().find('span:contains("Cancel")').parent().addClass('dialog-cancel-button');
		}
	});
}
function removeItemFromDB(item){
	db.deleteItem(parseListId( item.attr('id') ), listId);
}
function initAddListDialog(){
	$('#listCreation-form').dialog({
		autoOpen: false,
		position: { my: 'top+20', at: 'top', of: window },
		modal: true,
		buttons: {
			'Create' : function() {
				//addNewItem($('#name').val(), $('#style').val(), $('#location').val(), $('#review').val(), false);

				//create list
				var tempList = {
					'name' : $('#nameListInput').val(),
					'description' : $('#descriptionListInput').val(),
					'items' : {}
				}
				var listId = db.createList(tempList);
				populateSel();
				populateList(listId);
				$('#listSelect').val(listId);
				//switch to list

				//clear form
				$("#listCreation-form :input").each(function(){
					$(this).val('');
				});

				$( this ).dialog( "close" );
			},
			Cancel: function() {
          		$( this ).dialog( "close" );
        	}
		},
		create:function(){
			//so hacky
			$('#listCreation-form').parent().find('span:contains("Create")').parent().addClass('dialog-create-button');
			$('#listCreation-form').parent().find('span:contains("Cancel")').parent().addClass('dialog-cancel-button');
		}
	});
}
//Popup opening functions
function openListSelect(){
	closeMenu(function(){
		var tempheight = $(document).height()-50;
		var tempwidth = $(document).width()-30;
		$('#listSelectDialog').dialog({
			height: tempheight,
			width: tempwidth
		});
		populateSelectPopup();
		$('#listSelectDialog').dialog('open');
	});
}
function openAddItemPopup(){
	if (listId != ''){
		closeMenu(function(){
			var tempheight = $(document).height()-50;
			var tempwidth = $(document).width()-30;
			$('#addItemDialog').dialog({
				height: tempheight,
				width: tempwidth
			});
			$('#addItemDialog').on('shown.bs.modal', function () {
				$('#name').focus();
			});
			$('#addItemDialog').dialog('open');
		});
	} else{
		alert('you need a list open');
	}
}
function openEditItemPopop(listItem){
	var tempheight = $(document).height()-50;
	var tempwidth = $(document).width()-30;
	var item = db.getItem(getListItemId( listItem.attr('id') ), listId);
	//set values
	$('#editIdInput').val(item.id);
	$('#editNameInput').val(item.name);
	$('#editStyleInput').val(item.tags);	
	$('#editLocationInput').val(item.location);
	$('#editReviewInput').val(item.rating);

	$('#editItemDialog').dialog({
		height: tempheight,
		width: tempwidth
	});
	$('#editItemDialog').dialog('open');
}
function openAddListPopup(){
	closeMenu(function(){
		var tempheight = $(document).height()-50;
		var tempwidth = $(document).width()-30;
		$('#listCreation-form').dialog({
			height: tempheight,
			width: tempwidth
		});
		$('#listCreation-form').on('shown.bs.modal', function () {
			$('#nameListInput').focus();
		});
		$('#listCreation-form').dialog('open');
	});
}
function openItemView(listItem){
	currentCard = $('#detailCard');
	leftcard = $('#listCard');
	$('#contentButton').hide();
	$('#backButton').show();
	$('#backButton').on('click', function (){
		$('#detailCard').remove();
		slideCard('center', $('#listCard'), function(){
			$('#backButton').hide();
			$('#contentButton').show();
			$('#backButton').off('click');
		});
	});
	slideCard('left', $('#listCard'), function(){
		$('body').append('<div id="detailCard" style="'+
			'    top: 50; position: absolute; '+
			'    width: 95%; height: 100%; '+
			'    right: 0;'+
			'    float: right;'+
			'    margin-top: 5px;'+
			'    /* border: 1px solid lightgray; */'+
			'            "><div id="titleSection" style="'+
			'    width: 98%;'+
			'    height: 40px;'+
			'    /* border: 1px solid lightgray; */'+
			'"><h2 style="'+
			'    line-height: 40px;'+
			'    /* padding-left: 20px; */'+
			'    text-align: center;'+
			'             ">San Tan Brewing Company</h2>'+
			'</div>'+
			'<div id="descSection" style="'+
			'    width: 98%; '+
			'    /* height: 100px; */ '+
			'    /* border: 1px solid lightgray; */ };'+
			'    margin-top: 5px;'+
			'    /* padding: 10px; */'+
			'">'+
			'  <p style="'+
			'    padding-left: 10px; padding-right: 10px;'+
			'">Open since 2007 under the leadership of founder and brewmaster, Anthony Canecchia, SanTan Brewing Company has established a strong reputation as one of Arizona’s favorite craft breweries.</p>'+
			'<p style="'+
			'    padding-left: 10px; padding-right: 10px;'+
			'">In addition to brewing, SanTan features a friendly neighborhood brewpub in Downtown Chandler, which has quickly become one of the top local food and beer destinations in the Phoenix metro area.</p>'+
			'<p style="'+
			'    padding-left: 10px; padding-right: 10px;'+
			'">In 2009, SanTan Brewing began distributing their Southwestern Style Ales throughout the state of Arizona, operating with a mission to pair craft beer with craft food that would inspire great conversation and good times. 2014 marks the beginning of taking this journey throughout the Southwest and California. Our belief is that Great Craft Beer and Great Craft Food can be the inspiration for the conversations that can change the world!</p>'+
			'</div>'+
			'<div id="hoursSection" style="'+
			'    width: 49%; '+
			'    margin-top: 5px;'+
			'    float: left;'+
			'"><div style="'+
			'    width: 40px;'+
			'    float: left;'+
			'    margin-left: 10px;'+
			'">'+
			'  <p>Mon: </p>'+
			'  <p>Teu: </p>'+
			'  <p>Wed: </p>'+
			'  <p>Thu: </p>'+
			'  <p>Fri: </p>'+
			'  <p>Sat: </p>'+
			'  <p>Sun: </p>'+
			'</div>'+
			'  <div style="'+
			'    float: left;'+
			'    /* margin-left: 10px; */'+
			'">'+
			'  <p>9:00am - 12:00am</p>'+
			'  <p>9:00am - 12:00am</p>'+
			'  <p>9:00am - 12:00am</p>'+
			'  <p>9:00am - 12:00am</p>'+
			'  <p>9:00am - 12:00am</p>'+
			'  <p>9:00am - 12:00am</p>'+
			'  <p>9:00am - 12:00am</p>'+
			'</div>'+
			'</div>'+
			'<div id="infoSection" style="'+
			'    width: 49%;'+
			'    float: left;'+
			'    margin-top: 5px;'+
			'">'+
			'  <p style="'+
			'    padding-left: 10px; padding-right: 10px;'+
			'">Style: Brewery, Pub</p>'+
			'  <p style="'+
			'    padding-left: 10px; padding-right: 10px;'+
			'">Cost: $</p>'+
			'  <p style="'+
			'    padding-left: 10px; padding-right: 10px;'+
			'">Location: Chandler</p>'+
			'</div></div>');
	});
}
function testAddImage(){

	openCameraDialog();
}
function closeApp(){
	navigator.app.exitApp();
}

//prototypes
String.prototype.trimLeft = function(charlist) {
  if (charlist === undefined)
    charlist = "\s";
 
  return this.replace(new RegExp("^[" + charlist + "]+"), "");
};
