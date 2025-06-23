
$(document).ready(function() {
	
	$('ul.tips a').mouseenter(function() {
		$(this).find('span').css('display', 'block');
	});
	$('ul.tips a').mouseleave(function() {
		$(this).find('span').css('display', 'none');
	});
	
	// tapping or clicking tooltips on the photo detail pages
	$('ul.tips a').click(function(e) {
		e.preventDefault();
		if ($(this).find('span').css('display') == 'block') {
			$(this).find('span').css('display', 'none');
		} else {
			$(this).find('span').css('display', 'block');
		}
	});

	// if page has a subnav, envoke sticky code
	if ($('#subnav').length) {
		makeSticky('subnav', '#');
	}

	// if on photo detail page, envoke sticky code
	if ($('.portfolios .photo').length) {
		makeSticky('photo', '.');
	}

	// if a scrollToTop is in the page
	if ($('.scrollToTop').length) {		
/*
		var scrollTrigger = 100;
		var backToTop = function() {
			var scrollTop = $(window).scrollTop();
			if (scrollTop > scrollTrigger) {
				$('.scrollToTop').addClass('show');
			} else {
				$('.scrollToTop').removeClass('show');
			}
		};
		backToTop();

		$(window).scroll(function() {
			backToTop();
		});
*/
		$('.scrollToTop').on('click', function (e) {
			e.preventDefault();
			$('html,body').animate({
				scrollTop: 0
			}, 700);
		});
	}

});

/*! modernizr 3.3.1 (Custom Build) | MIT *
 * http://modernizr.com/download/?-csspositionsticky-setclasses !*/
!function(e,n,s){function t(e,n){return typeof e===n}function o(){var e,n,s,o,a,i,r;for(var c in l)if(l.hasOwnProperty(c)){if(e=[],n=l[c],n.name&&(e.push(n.name.toLowerCase()),n.options&&n.options.aliases&&n.options.aliases.length))for(s=0;s<n.options.aliases.length;s++)e.push(n.options.aliases[s].toLowerCase());for(o=t(n.fn,"function")?n.fn():n.fn,a=0;a<e.length;a++)i=e[a],r=i.split("."),1===r.length?Modernizr[r[0]]=o:(!Modernizr[r[0]]||Modernizr[r[0]]instanceof Boolean||(Modernizr[r[0]]=new Boolean(Modernizr[r[0]])),Modernizr[r[0]][r[1]]=o),f.push((o?"":"no-")+r.join("-"))}}function a(e){var n=c.className,s=Modernizr._config.classPrefix||"";if(u&&(n=n.baseVal),Modernizr._config.enableJSClass){var t=new RegExp("(^|\\s)"+s+"no-js(\\s|$)");n=n.replace(t,"$1"+s+"js$2")}Modernizr._config.enableClasses&&(n+=" "+s+e.join(" "+s),u?c.className.baseVal=n:c.className=n)}function i(){return"function"!=typeof n.createElement?n.createElement(arguments[0]):u?n.createElementNS.call(n,"http://www.w3.org/2000/svg",arguments[0]):n.createElement.apply(n,arguments)}var l=[],r={_version:"3.3.1",_config:{classPrefix:"",enableClasses:!0,enableJSClass:!0,usePrefixes:!0},_q:[],on:function(e,n){var s=this;setTimeout(function(){n(s[e])},0)},addTest:function(e,n,s){l.push({name:e,fn:n,options:s})},addAsyncTest:function(e){l.push({name:null,fn:e})}},Modernizr=function(){};Modernizr.prototype=r,Modernizr=new Modernizr;var f=[],c=n.documentElement,u="svg"===c.nodeName.toLowerCase(),p=r._config.usePrefixes?" -webkit- -moz- -o- -ms- ".split(" "):[];r._prefixes=p,Modernizr.addTest("csspositionsticky",function(){var e="position:",n="sticky",s=i("a"),t=s.style;return t.cssText=e+p.join(n+";"+e).slice(0,-e.length),-1!==t.position.indexOf(n)}),o(),a(f),delete r.addTest,delete r.addAsyncTest;for(var m=0;m<Modernizr._q.length;m++)Modernizr._q[m]();e.Modernizr=Modernizr}(window,document);