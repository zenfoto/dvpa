
$().ready(function() {

	$('#menu').click(function(e) {
		e.preventDefault();
		$('#global-nav').toggleClass('open');
		$('html').toggleClass('noscroll');
/*		
		$('#global-nav ul').toggle("slow", "swing", function() {
		
		});
*/
	});

	$('#submenu').click(function(e) {
 		e.preventDefault();
		$('#subnav').toggleClass('open');
//		$('html').toggleClass('noscroll');
/*		
		$('#global-nav ul').toggle("slow", "swing", function() {
		
		});
*/
	});

});

$(window).resize(function() {

	// TODO: might need to check if they exist first?

	$('#global-nav').removeClass('open');
	$('#subnav').removeClass('open');
	$('html').removeClass('noscroll');

});

$(window).scroll(function() {
	$('#subnav').removeClass('open');
});
