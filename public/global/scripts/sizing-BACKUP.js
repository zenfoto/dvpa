
function resizeImage(oWidth, oHeight) {
	
	winWidth = $('#resize').width();
	winHeight = $(window).height();
	
	console.log('winWidth: '+winWidth);
	console.log('winHeight: '+winHeight+'\n\n');

	title = $('#title').outerHeight(true);
	if (title == undefined) { title = 30; } // this is for home

	photoAreaWidth = winWidth;
	photoAreaHeight = winHeight - $('#header').outerHeight(true) - title;

	console.log('header: '+$('#header').outerHeight(true));
	
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
	
	$('img.photograph').css({
		'width': newWidth, 'height': newHeight
	});
	$('.sizing').css('height', newHeight);

}

$(window).resize(function() {

	if ($('.sizing img.photograph').length) {
		resizeImage(origWidth, origHeight);
	}

});

$(document).ready(function() {

	if ($('.sizing img.photograph').length) {
		origWidth  = $('img.photograph').attr('data-width');
		origHeight = $('img.photograph').attr('data-height');
		resizeImage(origWidth, origHeight);
	}

});
