(function($) {
	
	"use strict";
	
	//Hide Loading Box (Preloader)
	function handlePreloader() {
		if($('.preloader').length){
			$('.preloader').delay(200).fadeOut(500);
		}
	}
	
	
	//Update Header Style and Scroll to Top
	function headerStyle() {
		if($('.main-header').length){
			var windowpos = $(window).scrollTop();
			var siteHeader = $('.main-header');
			var scrollLink = $('.scroll-to-top');
			if (windowpos >= 110) {
				siteHeader.addClass('fixed-header');
				scrollLink.fadeIn(300);
			} else {
				siteHeader.removeClass('fixed-header');
				scrollLink.fadeOut(300);
			}
		}
	}
	
	headerStyle();
	
	
	//Submenu Dropdown Toggle
	if($('.main-header .navigation li.dropdown ul').length){
		$('.main-header .navigation li.dropdown').append('<div class="dropdown-btn"><span class="fa fa-angle-down"></span></div>');
		
		//Dropdown Button
		$('.main-header .navigation li.dropdown .dropdown-btn').on('click', function() {
			$(this).prev('ul').slideToggle(500);
		});
		
		//Disable dropdown parent link
		$('.navigation li.dropdown > a').on('click', function(e) {
			e.preventDefault();
		});
	}
	
	
	//Price Range Slider
	if($('.price-range-slider').length){
		$( ".price-range-slider" ).slider({
			range: true,
			min: 0,
			max: 90,
			values: [ 8, 85 ],
			slide: function( event, ui ) {
			$( "input.property-amount" ).val( ui.values[ 0 ] + " - " + ui.values[ 1 ] );
			}
		});
		
		$( "input.property-amount" ).val( $( ".price-range-slider" ).slider( "values", 0 ) + " - $" + $( ".price-range-slider" ).slider( "values", 1 ) );	
	}
	
	
	//Tabs Box
	if($('.tabs-box').length){
		$('.tabs-box .tab-buttons .tab-btn').on('click', function(e) {
			e.preventDefault();
			var target = $($(this).attr('data-tab'));
			
			if ($(target).is(':visible')){
				return false;
			}else{
				target.parents('.tabs-box').find('.tab-buttons').find('.tab-btn').removeClass('active-btn');
				$(this).addClass('active-btn');
				target.parents('.tabs-box').find('.tabs-content').find('.tab').fadeOut(0);
				target.parents('.tabs-box').find('.tabs-content').find('.tab').removeClass('active-tab');
				$(target).fadeIn(300);
				$(target).addClass('active-tab');
			}
		});
	}
	
	
	//Event Countdown Timer
	if($('.time-countdown').length){  
		$('.time-countdown').each(function() {
		var $this = $(this), finalDate = $(this).data('countdown');
		$this.countdown(finalDate, function(event) {
			var $this = $(this).html(event.strftime('' + '<div class="counter-column"><span class="count">%D</span>Days</div> ' + '<div class="counter-column"><span class="count">%H</span>Hours</div>  ' + '<div class="counter-column"><span class="count">%M</span>Minutes</div>  ' + '<div class="counter-column"><span class="count">%S</span>Seconds</div>'));
		});
	 });
	}
	
	
	//Custom Seclect Box
	if($('.custom-select-box').length){
		$('.custom-select-box').selectmenu().selectmenu('menuWidget').addClass('overflow');
	}
	
	
	//Jquery Spinner / Quantity Spinner
	if($('.quantity-spinner').length){
		$("input.quantity-spinner").TouchSpin({
		  verticalbuttons: true
		});
	}
	
	
	// Two Item Carousel
	if ($('.two-item-carousel').length) {
		$('.two-item-carousel').owlCarousel({
			loop:true,
			margin:100,
			nav:true,
			smartSpeed: 500,
			autoplay: 4000,
			navText: [ '<span class="fa fa-angle-left"></span>', '<span class="fa fa-angle-right"></span>' ],
			responsive:{
				0:{
					items:1,
					margin:30
				},
				480:{
					items:1,
					margin:30
				},
				600:{
					items:1,
					margin:30
				},
				800:{
					items:2,
					margin:30
				},
				1024:{
					items:2,
					margin:30
				},
				1200:{
					items:2
				}
			}
		});    		
	}
	
	
	// Sponsors Carousel
	if ($('.sponsors-carousel').length) {
		$('.sponsors-carousel').owlCarousel({
			loop:true,
			margin:0,
			nav:true,
			smartSpeed: 500,
			autoplay: 4000,
			navText: [ '<span class="fa fa-angle-left"></span>', '<span class="fa fa-angle-right"></span>' ],
			responsive:{
				0:{
					items:1
				},
				480:{
					items:2
				},
				600:{
					items:3
				},
				800:{
					items:5
				},
				1024:{
					items:5
				}
			}
		});    		
	}
	
	
	//Fact Counter + Text Count
	if($('.count-box').length){
		$('.count-box').appear(function(){
	
			var $t = $(this),
				n = $t.find(".count-text").attr("data-stop"),
				r = parseInt($t.find(".count-text").attr("data-speed"), 10);
				
			if (!$t.hasClass("counted")) {
				$t.addClass("counted");
				$({
					countNum: $t.find(".count-text").text()
				}).animate({
					countNum: n
				}, {
					duration: r,
					easing: "linear",
					step: function() {
						$t.find(".count-text").text(Math.floor(this.countNum));
					},
					complete: function() {
						$t.find(".count-text").text(this.countNum);
					}
				});
			}
			
		},{accY: 0});
	}
	
	
	//Single Item Carousel
	if ($('.single-item-carousel').length) {
		$('.single-item-carousel').owlCarousel({
			loop:true,
			margin:0,
			nav:true,
			smartSpeed: 700,
			autoplay: 5000,
			navText: [ '<span class="fa fa-angle-left"></span>', '<span class="fa fa-angle-right"></span>' ],
			responsive:{
				0:{
					items:1
				},
				480:{
					items:1
				},
				
				768:{
					items:1
				},
				
				800:{
					items:1
				},
				960:{
					items:1
				},
				1024:{
					items:1
				}
			}
		});    		
	}
	
	
	//Accordion Box
	if($('.accordion-box').length){
		$(".accordion-box").on('click', '.acc-btn', function() {
			
			var outerBox = $(this).parents('.accordion-box');
			var target = $(this).parents('.accordion');
			
			if($(this).hasClass('active')!==true){
				$(outerBox).find('.accordion .acc-btn').removeClass('active');
			}
			
			if ($(this).next('.acc-content').is(':visible')){
				return false;
			}else{
				$(this).addClass('active');
				$(outerBox).children('.accordion').removeClass('active-block');
				$(outerBox).find('.accordion').children('.acc-content').slideUp(300);
				target.addClass('active-block');
				$(this).next('.acc-content').slideDown(300);	
			}
		});	
	}
	
	
	//LightBox / Fancybox
	if($('.lightbox-image').length) {
		$('.lightbox-image').fancybox({
			openEffect  : 'fade',
			closeEffect : 'fade',
			helpers : {
				media : {}
			}
		});
	}
	
	
	//Contact Form Validation
	if($('#contact-form').length){
		$('#contact-form').validate({
			rules: {
				username: {
					required: true
				},
				email: {
					required: true,
					email: true
				},
				subject: {
					required: true
				},
				message: {
					required: true
				}
			}
		});
	}
	
	
	// Scroll to a Specific Div
	if($('.scroll-to-target').length){
		$(".scroll-to-target").on('click', function() {
			var target = $(this).attr('data-target');
		   // animate
		   $('html, body').animate({
			   scrollTop: $(target).offset().top
			 }, 1000);
	
		});
	}
	
	
	// Elements Animation
	if($('.wow').length){
		var wow = new WOW(
		  {
			boxClass:     'wow',      // animated element css class (default is wow)
			animateClass: 'animated', // animation css class (default is animated)
			offset:       0,          // distance to the element when triggering the animation (default is 0)
			mobile:       false,       // trigger animations on mobile devices (default is true)
			live:         true       // act on asynchronously loaded content (default is true)
		  }
		);
		wow.init();
	}

	// Modern Mobile Navigation Controller
	function initMobileNavigation() {
		var $toggles = $('.main-menu .navbar-toggle');
		var $collapses = $('.main-header .navbar-collapse');
		var $backdrop = $('.letx-mobile-backdrop');

		if (!$backdrop.length) {
			$backdrop = $('<div class="letx-mobile-backdrop" aria-hidden="true"></div>').appendTo('body');
		}

		// Ensure mobile CTA button exists inside mobile navigation
		$('.main-header .navbar-collapse').each(function() {
			var $nav = $(this);
			if (!$nav.find('.letx-mobile-cta-box').length) {
				var $cta = $(
					'<div class="letx-mobile-cta-box visible-xs">' +
						'<a href="#" data-site-href="whatsapp" target="_blank" rel="noopener" class="theme-btn btn-style-one">Book a Demo</a>' +
					'</div>'
				);
				$nav.append($cta);
			}
		});

		// Hydrate WhatsApp destination if configured
		if (window.LETX_SITE_CONFIG && window.LETX_SITE_CONFIG.whatsappNumber) {
			var rawNumber = String(window.LETX_SITE_CONFIG.whatsappNumber).replace(/\D/g, "");
			if (rawNumber) {
				$('.letx-mobile-cta-box a[data-site-href="whatsapp"]').attr('href', 'https://wa.me/' + rawNumber);
			}
		}

		var isOpen = false;

		function openMenu() {
			isOpen = true;
			$toggles.addClass('is-active').attr('aria-expanded', 'true');
			$collapses.addClass('is-open in');
			$backdrop.addClass('is-active');
			$('body').addClass('letx-menu-open');
		}

		function closeMenu() {
			isOpen = false;
			$toggles.removeClass('is-active').attr('aria-expanded', 'false');
			$collapses.removeClass('is-open in');
			$backdrop.removeClass('is-active');
			$('body').removeClass('letx-menu-open');
		}

		function toggleMenu(e) {
			if (e) {
				e.preventDefault();
				e.stopPropagation();
			}
			if (isOpen) {
				closeMenu();
			} else {
				openMenu();
			}
		}

		// Disarm Bootstrap's collapse plugin data-api on navbar toggles to avoid height-calc/animation deadlocks
		$toggles.removeAttr('data-toggle').off('click.letxNav').on('click.letxNav', function(e) {
			toggleMenu(e);
		});

		$backdrop.off('click.letxNav').on('click.letxNav', function(e) {
			e.preventDefault();
			e.stopPropagation();
			closeMenu();
		});

		// Close menu smoothly when tapping any nav link on mobile
		$('.main-header .navbar-collapse .navigation a, .letx-mobile-cta-box a').off('click.letxNav').on('click.letxNav', function() {
			if ($(window).width() <= 767) {
				closeMenu();
			}
		});

		// Close on Escape key
		$(document).off('keydown.letxNav').on('keydown.letxNav', function(e) {
			if (e.keyCode === 27 && isOpen) {
				closeMenu();
			}
		});

		// Automatically close on viewport resize to desktop
		$(window).off('resize.letxNav').on('resize.letxNav', function() {
			if ($(window).width() > 767 && isOpen) {
				closeMenu();
			}
		});
	}

	initMobileNavigation();

/* ==========================================================================
   When document is Scrollig, do
   ========================================================================== */
	
	$(window).on('scroll', function() {
		headerStyle();
	});
	
/* ==========================================================================
   When document is loaded, do
   ========================================================================== */
	
	$(window).on('load', function() {
		handlePreloader();
	});	

})(window.jQuery);