/* 
 * Top of the stack is always the current view
 * 
*/

function createCard(){
	//card = id
	slideCard('left', cards[cards.length-1], function(){ cards.push($('#'+ID)); });
}
function removeCard(ID){
	slideCard('right', cards[cards.length-1]);
	cards.splice(cards[cards.length-1])
}

function slideCard(direction, element, callback){
	//margin-left: 95%;
	console.log('cardclick')
	if (direction == 'left'){
		element.animate({ left: '-95%'}, 200, callback);
	}
	else if (direction == 'right'){
		element.animate({ left: '95%'}, 200, callback);
	}
	else if (direction == 'center'){
		element.animate({ left: '0'}, 200, callback);
	}
}
var leftcard = '';
var currentCardId = '';

