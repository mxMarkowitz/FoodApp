function openMenu(menuID, overlay){
	$(overlay).show();
	$(menuID).animate({
		left: 0
	}, 200);
}
function closeMenu(menuID, overlay){
	$(overlay).hide();
	$(menuID).animate({
		left: -250
	}, 200);
}