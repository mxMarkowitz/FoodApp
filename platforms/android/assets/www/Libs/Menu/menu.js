//constants 
var rightMenu = $('.rightMenu'),
	leftMenu = $('.leftMenu'),
	overlay = $('.menu-overlay');

function initMenus(){
	rightMenu.hide();
	leftMenu.hide();
}

function openLeftMenu(){
	if (overlay.is(':visible')){
		if (leftMenu.is(':visible')){
			closeMenu();
		} else{
			closeMenu(function(){
				overlay.show();
				leftMenu.show(1, function (){
					leftMenu.animate({
						left: 0
					}, 200);
				});
			});
		}
	}
	else{
		overlay.show();
		leftMenu.show(1, function (){
			leftMenu.animate({
				left: 0
			}, 200);
		});

	}
}

function openRightMenu(){
	if (overlay.is(':visible')){
		if (rightMenu.is(':visible')){
			closeMenu();
		} else{
			closeMenu(function(){
				overlay.show();	
				rightMenu.show(1, function (){
					rightMenu.animate({
						right: 0
					}, 200);
				});
			});
		}
	}
	else{
		overlay.show();	
		rightMenu.show(1, function (){
			rightMenu.animate({
				right: 0
			}, 200);
		});
	}
}
function closeMenu(callback){
	overlay.hide();

	if (rightMenu.is(':visible')){
		rightMenu.animate({
			right: -250
		}, 200, function(){
			rightMenu.hide();
			if (callback){
				callback();
			}
		});
	} else if (leftMenu.is(':visible')){
		leftMenu.animate({
			left: -250
		}, 200, function(){
			leftMenu.hide();
			if (callback){
				callback();
			}
		});
	}

}