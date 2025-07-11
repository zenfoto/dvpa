
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

  $('.trigger').click(function(e) {
    e.preventDefault();
    
    const targetClass = '.' + $(this).attr('id');
    const $current = $('.sizing .current');
    const $target = $('.sizing ' + targetClass);

    if ($target.hasClass('current')) return;

    // Update nav buttons
    $('.trigger').removeClass('selected');
    $(this).addClass('selected');

    // Transition effect
    $current.fadeTo(500, 0, function() {
      $(this).removeClass('current');
    });

    $target.fadeTo(500, 1, function() {
      $(this).addClass('current');
    });
  });

});
