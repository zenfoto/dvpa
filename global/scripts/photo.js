
$(document).ready(function() {

	// key press for next/prev
	function leftArrowPressed() {
		var prevDest = $('#photoNavD .prev').attr('href');
		if (prevDest !== undefined) {
			window.location = prevDest;
		}
	}

	function rightArrowPressed() {
		var nextDest = $('#photoNavD .next').attr('href');
		if (nextDest !== undefined) {
			window.location = nextDest;
		}
	}

	$('.row').swipe({
	
		//Generic swipe handler for all directions
		swipe:function(event, direction, distance, duration, fingerCount, fingerData) {
		//console.log("You swiped " + direction);
			if (direction == 'right') {
				leftArrowPressed();
			} else if (direction == 'left') {
			rightArrowPressed();
			}
		},
		
		//Default is 75px, set to 0 for demo so any distance triggers swipe
		threshold: 75
	});

	document.onkeydown = function(evt) {
		evt = evt || window.event;
		switch (evt.keyCode) {
			case 37:
				leftArrowPressed(); break;
			case 39:
				rightArrowPressed(); break;
//			case 27:
//				escKeyPressed(); break;
		}
	};
});
