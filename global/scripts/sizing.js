
function resizeImage(oWidth, oHeight) {
	
	winWidth = $('#resize').width();
	winHeight = $(window).height();
	
	console.log('winWidth: '+winWidth);
	console.log('winHeight: '+winHeight+'\n\n');

	imageNav = $('.image-nav').outerHeight(true);
	if (imageNav == undefined) { imageNav = 0; } // only one image

	photoAreaWidth = $('.p-main').width();
	photoAreaHeight = winHeight - $('#top').outerHeight(true) - imageNav - 20;

	console.log('top: '+$('#top').outerHeight(true));
	
	console.log('photoAreaWidth: '+photoAreaWidth);
	console.log('photoAreaHeight: '+photoAreaHeight+'\n\n');
	
	photoAreaRatio = photoAreaWidth / photoAreaHeight;
	photoRatio = oWidth / oHeight;
	
	if (photoAreaRatio < photoRatio) {
		newWidth = photoAreaWidth;
		newHeight = photoAreaWidth / photoRatio;
	} else {
		newHeight = photoAreaHeight;
		newWidth = photoAreaHeight * photoRatio;
	}
	
	if (newWidth > oWidth || newHeight > oHeight) {
		newWidth = oWidth;
		newHeight = oHeight;
	}
	
	var dimensions = [newWidth, newHeight];
	return dimensions;
}

$(window).resize(function() {

	if ($('.sizing img.photograph').length) {
		var newHeights = [];
		$('.sizing img.photograph').each(function(i) {
			origWidth  = $(this).attr('data-width');
			origHeight = $(this).attr('data-height');
			newDimensions = resizeImage(origWidth, origHeight);

			newWidth = newDimensions[0];
			newHeight = newDimensions[1];
			newHeights.push(newHeight);

			$(this).css({ 'width': newWidth, 'height': newHeight });
		});
		$('.sizing').css('height', Math.max(...newHeights));
	}

});

$(document).ready(function() {

	if ($('.sizing img.photograph').length) {
		var newHeights = [];
		$('.sizing img.photograph').each(function(i) {
			origWidth  = $(this).attr('data-width');
			origHeight = $(this).attr('data-height');
			newDimensions = resizeImage(origWidth, origHeight);

			newWidth = newDimensions[0];
			newHeight = newDimensions[1];
			newHeights.push(newHeight);

			$(this).css({ 'width': newWidth, 'height': newHeight });
			$('.sizing').css('height', newHeight);
		});
		$('.sizing').css('height', Math.max(...newHeights));
	}

});
