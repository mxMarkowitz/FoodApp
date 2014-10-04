function initList(){
}
/*
	id
	name
	location
	rating
	tags
	//step 2
	images
	about
	hours
	cost
	notes
	//step 3
	maps link
	foursquare link
	//step 4
	menu
		items
		style
		images
		review
 */


function addItem(item, list, editEvent, viewEvent, deleteEvent){
	var newItem = template;
		newItem = newItem.replace('{{id}}', 'item_' + item.id);
		newItem = newItem.replace('{{name}}', item.name);
		newItem = newItem.replace('{{location}}', item.location);
		if (item.rating > 0){
			newItem = newItem.replace('{{rating}}', item.rating + ' stars');
		} else {
			newItem = newItem.replace('{{rating}}', 'Not yet visited ');
		}
		newItem = newItem.replace('{{tags}}', item.tags);
		newItem = newItem.replace('{{maps}}', item.maps);
		newItem = newItem.replace('{{foursquare}}', item.foursquare);
		if (item.images !== undefined){
			newItem = newItem.replace('{{imgTextColor}}', 'white');
			newItem = newItem.replace('{{img}}', '<img style="width:100%; height: 100%;" src="' + item.images[0] + '">');
		} else {
			newItem = newItem.replace('{{imgTextColor}}', '#666');
			newItem = newItem.replace('{{img}}', '');
		}
	//id for event
	var tempId = '#item_' +item.id;
	list.append(newItem);
	if (item.images === undefined){
		$(tempId).find('.listCont_imgCont').css('margin-top', '-80px');
	}
	initItemEvents($(tempId), editEvent, viewEvent, deleteEvent);
	//initListCollapse($(tempId));
}
function updateItem(item, editEvent, viewEvent, deleteEvent){
	var newItem = template;
		newItem = newItem.replace('{{id}}', 'item_' + item.id);
		newItem = newItem.replace('{{name}}', item.name);
		newItem = newItem.replace('{{location}}', item.location);
		if (item.rating > 0){
			newItem = newItem.replace('{{rating}}', item.rating + ' stars');
		} else {
			newItem = newItem.replace('{{rating}}', 'havent been');
		}
		newItem = newItem.replace('{{tags}}', item.tags);
		newItem = newItem.replace('{{maps}}', item.maps);
		newItem = newItem.replace('{{foursquare}}', item.foursquare);

	var tempId = '#item_' +item.id;
	$(tempId).replaceWith(newItem);
	initItemEvents($(tempId), editEvent, viewEvent, deleteEvent);
	//initItemEvents($(tempId), editEvent);
}
function getListItemId(listItem){

	return listItem.split('_')[1];
}

function removeItem(item){
	item.remove();
	//todo move to app.js
	//$('#item_' + itemId).remove();
};
function initItemEvents(listItem, editEvent, viewEvent, deleteEvent){
	initListCollapse(listItem);
	initEditButton(listItem, editEvent);
	initViewEvent(listItem, viewEvent);
	initDeleteButton(listItem, deleteEvent);
}

function initListCollapse(listItem){
	console.log(listItem);
	var top = listItem.find('.listCont_topRow');
	var mid = listItem.find('.listCont_midRow');
	var img = listItem.find('.listCont_imgCont');
	var bot = listItem.find('.listCont_botRow');
	top.on('click', function() {
		console.log('click');
		//add function to track when the animation is active
		if (listItem.height() == 59){
			listItem.animate({
				height: '+=41'
			}, 200, function(){
				bot.show();
				img.show();
			});
			if (listItem.find('img').length != 0){
				top.animate({
					width: '-=34%'
				}, 100);
			}
			
		} else if (listItem.height() == 100){
			bot.hide();
			img.hide();
			listItem.animate({
				height: '-=41'
			}, 200);
			if (listItem.find('img').length != 0){
				top.animate({
					width: '+=34%'
				}, 100);
			}
		}
	});
	/*var timeoutId = 0;
	top.mousedown(function() {
    	timeoutId = setTimeout(function(){ alert('tes') }, 1000);

		}).bind('mouseup mouseleave', function() {
    		clearTimeout(timeoutId);
	});*/
}
function initDeleteButton(listItem, event){
	listItem.on('click', '.listCont_botRow_delete', function(){
		removeItem(listItem);
		event(listItem);
	});
}

function initEditButton(listItem, event){
	listItem.on('click', '.listCont_botRow_edit', function(){
		event(listItem);
	});
}
function initViewEvent(listItem, event){
	listItem.on('click', '.listCont_imgCont', function(){
		event(listItem);
	});
}


var template = '<div id="{{id}}" class="listContainer">' +
    	'<div id="item_2_top" class="listCont_topRow">' +
  			'<div class="listCont_topRow_name">' +
    			'{{name}}'+
    		'</div>'+
    		'<div class="listCont_topRow_location">' +
    			'{{location}}' +
    		'</div>' +
    		'<div class="listCont_topRow_review">' +
    			'{{rating}}' +
    		'</div>' +
    		'<div class="listCont_botRow_styles">' +
  				'{{tags}}' +
  			'</div>' +
		'</div>' +
		'<div class="listCont_imgCont">'+
			'{{img}}' +
			'<p style="bottom: 0; text-align: center; color: {{imgTextColor}}; float: left; width: 100%;position: absolute;=">more...</p>'+
		'</div>'+
		'<div class="listCont_botRow">' +
			'<div class="listCont_botRow_edit">' +
                'Edit' +
  			'</div>' +
  			'<div class="listCont_botRow_delete">' +
                'Delete' +
  			'</div>' +
  			//'<div class="listCont_botRow_styles">' +
  			//	'{{tags}}' +
  			//'</div>' +
		'</div>' +
	'</div>';

//testMethods
function testAdd(){
	var newItem ={
		id: 8,
		name: 'testName',
		location: 'testLocation',
		rating: 3,
		tags: [ 'style1', 'style2', 'style3'],
		maps: 'testMapLink',
		description: 'testFSLink',
		photo: '' 
	};

	addItem(newItem, $('body'));
}

function testRemove(){
	//quick test of removal
	removeItem(8, $('body'));
}

function testUpdate(){
	var newItem ={
		id: 8,
		name: 'testName2',
		location: 'testLocation2',
		rating: 4,
		tags: [ 'style12', 'style22', 'style32'],
		maps: 'testMapLink2',
		foursquare: 'testFSLink2'
	};

	updateItem(newItem, $('body'));
}
