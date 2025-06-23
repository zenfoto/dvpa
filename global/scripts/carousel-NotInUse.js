// General utilities.
var utils = {
	imageNameRegex: /\/photographs\/[\w\-]+\/([\w\-]+)\/?/,
	getHtmlTag: function() {
		if (this.htmlTag) {
			return this.htmlTag;
		} else {
			this.htmlTag = document.documentElement;
			return this.htmlTag;
		}
	},
	getViewportSize: function() {
		var size = window.getComputedStyle(this.getHtmlTag(), ':after').content.replace(/"/g, '');
		return size;
	},
	isSmall: function() {
		return this.getViewportSize() === 'small';
	},
};

// URL and history utilities.
var URLManager = function() {
	console.log('hey i am a URL manager.');
	console.log('pathname: ' + document.location.pathname);
	this.formAbsoluteUrl = function(name) {
		// Break up the pathname into an array of parts, removing empty strings.
		var pathParts = document.location.pathname.split('/').filter(function(part) {
			return part.length ? part : false;
		});
		// If we have a path like /gallery/yosemite/something, we'll remove the 'something'.
		if (pathParts.length === 3) {
			pathParts.splice(-1, 1);
		}
		// Now we'll just add the provided name, join it all back up and append the
		// origin to form a complete absolute URL.
		pathParts.push(name);
		pathParts = pathParts.join('/');
		return document.location.origin + '/' + pathParts;
	};
	
	this.pushImageNameToUrl = function(name) {
		history.pushState(null, null, this.formAbsoluteUrl(name));
	};

	this.replaceImageNameToUrl = function(name) {
		history.replaceState(null, null, this.formAbsoluteUrl(name));
	};
	
	// Parses the page URL to return the string after '/gallery/gallery-name/',
	// e.g. '/gallery/gallery-name/image-name' will return 'image-name';
	this.getImageIdFromUrl = function() {
		var match = document.location.pathname.match(utils.imageNameRegex);
		if (match && match[1]) {
			return match[1];
		}
		console.log('match: '+match+'\n');
	};
};

var ImageManager = function() {
	var sizes = {
		small: 'small',
		medium: 'medium',
		large: 'large',
	};
	var sizesOrder = [sizes.small, sizes.medium, sizes.large];
	
	this.setViewportSize = function() {
		this.viewportSize = sizes[utils.getViewportSize()];
	};
	
	this.setViewportSize();
	
	this.setImages = function(imageEls) {
		this.imageEls = imageEls;
	};
	
	this.getSizedURL = function(url, size) {
		var urlParts = url.split('/');
		urlParts.splice(-1, false, '_'+size);
		urlParts.join('/');
		return urlParts.join('/');
	};
	
	this.getSizeFromURL = function(url) {
		var urlParts = url.split('/');
		return urlParts[urlParts.length - 2];
	};
	
	this.preloadImageAtIndex = function(index) {
		var imageEl = this.imageEls[index];
	
		// If we haven't preloaded this before.
		if (!imageEl.src) {
			// Set the src attribute.
			imageEl.src = this.getSizedURL(imageEl.dataset.src, this.viewportSize);
		}
	};
	
	this.preloadPreviousAndNext = function(index, inclusive) {
		if (index < 0 || index > this.imageEls.length -1) {
			throw new RangeError('You have supplied an index for a non-existant image.');
		}
		
		var previous = index - 1;
		var next = index + 1;
		
		if (previous < 0) {
			previous = this.imageEls.length - 1;
		}
		
		if (next > this.imageEls.length - 1) {
			next = 0;
		}
		
		if (inclusive) {
			this.preloadImageAtIndex(index);
		}
		this.preloadImageAtIndex(previous);
		this.preloadImageAtIndex(next);
	};
	
	this.upgradeImages = function() {
		// Reset viewportSize
		this.setViewportSize();
		this.imageEls.each(function(index, image) {
			if (image.src) {
				// Check if there's a src and what size it is.
				var srcSize = this.getSizeFromURL(image.src);
				
				// Determine if the current size we want is larger than what's set already.
				var currentSrcSizeIndex = sizesOrder.indexOf(srcSize);
				var viewportSizeIndex = sizesOrder.indexOf(this.viewportSize);
				
				// If we want larger, delete the src attribute and rerun this method.
				if (viewportSizeIndex > currentSrcSizeIndex) {
					image.removeAttribute('src');
					this.preloadImageAtIndex(index);
				}
			}
		}.bind(this));
	}
};

// Creates Slick carousels and handles events on them.
var GalleryManager = function(URLManager, ImageManager) {
	var size = utils.getViewportSize();
	var mainSlider = $('.slider-main');
	var titleSlider = $('.slider-titles');
	var mainSliderItems = $('.gallery-main-item');
	var mainSliderImages = $('[data-src]');
	var currentSlide;
	var currentSlideName = URLManager.getImageIdFromUrl();
	var userClickedBack = false;
	// Create an array of objects with info about the gallery. Right now we just
	// have the name but we could store more here later if necessary.
	var galleryMap = [];
	mainSliderItems.each(function(index, item) {
		galleryMap.push({
			name: item.getAttribute('data-id'),
		});
	});

	// Set up ImageManager.
	ImageManager.setImages(mainSliderImages);

	this.getSlideNameByIndex = function(index) {
		return galleryMap[index].name;
	};

	this.getSlideIndexByName = function(name) {
		return galleryMap.findIndex(function(item) {
			return item.name === name;
		});
	};

	if (currentSlideName) {
		currentSlide = this.getSlideIndexByName(currentSlideName);
		// Request preloading for the first image.
		ImageManager.preloadPreviousAndNext(currentSlide, true);
	} else {
		// This isn't a 'deep link', e.g. /gallery/yosemite/something, it's the
		// root gallery URL, e.g. /gallery/yosemite. Get the first slide and
		// replace that in history.
		URLManager.replaceImageNameToUrl(this.getSlideNameByIndex(0));
		// Request preloading for the first image.
		ImageManager.preloadPreviousAndNext(0, true);
	}

	mainSlider.slick({
		slidesToShow: 1,
		slidesToScroll: 1,
		arrows: !utils.isSmall(),
		fade: !utils.isSmall(),
		swipeToSlide: utils.isSmall(),
		draggable: utils.isSmall(),
	    asNavFor: (function() {
			if (!utils.isSmall()) { return '.slider-titles'; }
		})(),
		initialSlide: currentSlide || 0,
	});
	
	titleSlider.slick({
		slidesToShow: 1,
		slidesToScroll: 1,
		arrows: false,
		fade: true,
		asNavFor: '.slider-main',
		draggable: utils.isSmall(),
		initialSlide: currentSlide || 0,
	});
/*
	if (!utils.isSmall()) {
		navSlider.slick({
			slidesToShow: 1,
			slidesToScroll: 1,
			arrows: true,
			asNavFor: '.slider-main',
			centerMode: true,
			draggable: false,
			focusOnSelect: true,
			variableWidth: true,
			initialSlide: currentSlide || 0,
		});
	}
*/
	// Listen on slide afterChange
	mainSlider.on('beforeChange', function(e, slick, currentSlide, nextSlide) {
		console.log('i see you changed to slide index', nextSlide);
		// Only push to history if this carousel change was due to the user
		// interacting with the carousel. Not if the change was due to them
		// hitting the browser back button.
		if (!userClickedBack) {
			var currentSlideName = this.getSlideNameByIndex(nextSlide);
			URLManager.pushImageNameToUrl(currentSlideName);
			// Now reset this.
			userClickedBack = false;
		}
		// Request preloading for this index.
		ImageManager.preloadPreviousAndNext(nextSlide, true);
	}.bind(this));

	// Listen on URL changes (e.g. hit the back button) and adjust gallery.
	// Set a flag that the user just clicked the back button so our carousel
	// change event knows and doesn't push this change to the history stack.
	window.addEventListener('popstate', function(e) {
		userClickedBack = true;
		var currentSlideName = URLManager.getImageIdFromUrl();
		var currentSlideIndex = this.getSlideIndexByName(currentSlideName);
		mainSlider.slick('slickGoTo', currentSlideIndex);
	}.bind(this));

	window.addEventListener('keyup', function(e) {
		switch (e.keyCode) {
			case 37:
				mainSlider.slick('slickPrev'); break;
			case 39:
				mainSlider.slick('slickNext'); break;
			case 27:
				break;
		}
	});

	window.addEventListener('resize', function(e) {
		ImageManager.upgradeImages();
	}.bind(this));
};

// Page level. Initializes everything, may do more in the future.
var GalleryPage = function() {
	console.log('hey i am a gallery page.');

	var URLMgr = new URLManager();
	var ImageMgr = new ImageManager();
	new GalleryManager(URLMgr, ImageMgr);

	window.addEventListener('resize', function() {
		// TODO handle resize between breakpoints? We would need to init/destroy
		// the nav carousel and alter settings of the main carousel.
	});
};


function responsivePadding() {
	winWidth = $(window).width();
	if (winWidth < 768) {
		paddingLeft = paddingRight = 0;
		paddingTop = 10;
		paddingBottom = 20;
	} else if (winWidth >= 768 && winWidth < 1024) {
		paddingLeft = paddingRight = 0;
		paddingTop = 10;
		paddingBottom = 20;
	} else {
		paddingLeft = paddingRight = 0;
		paddingTop = 10;
		paddingBottom = 20;
	}
}

function setGalleryContainerHeight() {
	var nav = $('#global-nav');
	var title = $('#title');
	$('#container').height(window.innerHeight - nav.outerHeight() - title.outerHeight() - 0);
}

$(window).resize(function() {
	setGalleryContainerHeight();
});

$(document).ready(function() {
	setGalleryContainerHeight();
});

new GalleryPage();
