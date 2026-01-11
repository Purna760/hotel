/* =====================================================================
 * DOCUMENT READY
 * =====================================================================
 */
$(document).ready(function(){
    'use strict';
    $(window).resize(function(){
		Modernizr.addTest('ipad', function(){
			return !!navigator.userAgent.match(/iPad/i);
		});
		if(!Modernizr.ipad){	
			pms_initializeMainMenu(); 
		}
	});
	pms_initializeMainMenu();
    $('body').addClass('loaded');
    $('body').on('click', 'a[href^="#"]:not(a[href$="#"]):not(.popup-modal)', function(e){
        e.preventDefault();
        var obj = $(this);
        var target = obj.attr('href');
        $('html, body').animate({
            scrollTop: $(target).offset().top - parseInt($('body').css('padding-top'))
        }, 1400, 'easeInOutCirc');
        return false;
    });
    $('a.anchor-toggle').on('click', function(e){
        e.preventDefault();
        var obj = $(this);
        var target = obj.data('target');
        if($(target).hasClass('collapsed')) $(target).trigger('click');
        $('html, body').animate({
            scrollTop: $(target).offset().top - parseInt($('body').css('padding-top'))
        }, 1400, 'easeInOutCirc');
        return false;
    });
    $('a#toTop').on('click', function(e){
        e.preventDefault();
        $('html, body').animate({scrollTop: '0px'});
    });
    $('body').bind('touchmove', function(e){
        $(window).trigger('scroll');
    });
    $(window).on('onscroll scrollstart touchmove', function(){
        $(window).trigger('scroll');
    });
    $(window).scroll(function(){
        var scroll_1 = $('html, body').scrollTop();
        var scroll_2 = $('body').scrollTop();
        var scrolltop = scroll_1;
        if(scroll_1 == 0) scrolltop = scroll_2;
        
        if(scrolltop >= 200) $('a#toTop').css({bottom: '30px'});
        else $('a#toTop').css({bottom: '-40px'});
        if(scrolltop > 0) $('.navbar-fixed-top').addClass('fixed');
        else $('.navbar-fixed-top').removeClass('fixed');
    });
    $(window).trigger('scroll');

    /* =================================================================
     * COOKIES
     * =================================================================
     */
    if($('#cookies-notice').length){
        $('#cookies-notice button').on('click', function(){
            $.cookie('cookies_enabled', '1', {expires: 7});
            $('#cookies-notice').fadeOut();
        });
     }
    /* =================================================================
     * WEATHER
     * =================================================================
     */
    if($('.simple-weather').length){
        $('.simple-weather').each(function(){
            var item = $(this);
            $.simpleWeather({
                location: item.data('location'),
                woeid: '',
                unit: item.data('unit'),
                success: function(weather) {
                  html = '<i class="w-icon-'+weather.code+'"></i> <span class="temp">'+weather.temp+'&deg;'+weather.units.temp+'</span>';

                  item.html(html);
                },
                error: function(error) {
                  item.html('<p>'+error+'</p>');
                }
            });
        });
     }
    /* =================================================================
     * PRICE RANGE SLIDER
     * =================================================================
     */
    if($('.nouislider').length){
		$('.nouislider').each(function(){
			var slider = $(this);
			noUiSlider.create(slider.get(0), {
				start: slider.data('start'),
				connect: true,
				tooltips: false,
				step: slider.data('step'),
				range: {
					'min': slider.data('min'),
					'max': slider.data('max')
				},
				format: wNumb({
					decimals: 0,
					thousand: ''
				})
			});
			slider.get(0).noUiSlider.on('update', function(values, handle){
				$('#'+slider.data('input')).val(values[0]+' - '+values[1]);
			});
		});
    }
    /* =================================================================
     * LIVE SEARCH
     * =================================================================
     */
    if($('.liveSearch').length){
        $('.liveSearch').each(function(){
            var elm = $(this);
            var scriptUrl = elm.data('url');
            var wrapperID = elm.data('wrapper');
            var targetID = elm.data('target');
            if(scriptUrl != ''){
                $('.liveSearch').liveSearch({
                    url: scriptUrl+'?q=',
                    id: wrapperID
                });
                $('#'+wrapperID).on('click', '.live-search-result', function(){
                    elm.val($(this).data('descr'));
                    $('#'+targetID).val($(this).data('id'));
                });
                $('.liveSearch').on('change', function(){
                    if($(this).val() == '') $('#'+targetID).val('0');
                });
            }
        });
    }
    
    /* =================================================================
     * SIGN UP/LOG IN FORM
     * =================================================================
     */
    $(function(){
        $('.login-form').show();
        $('.signup-form').hide();
        $('.pass-form').hide();
        
        $('.open-signup-form').on('click', function(){
            $('.pass-form').slideUp();
            $('.login-form').slideUp();
            $('.signup-form').slideDown();
            return false;
        });
        $('.open-login-form').on('click', function(){
            $('.pass-form').slideUp();
            $('.signup-form').slideUp();
            $('.login-form').slideDown();
            return false;
        });
        $('.open-pass-form').on('click', function(){
            $('.signup-form').slideUp();
            $('.login-form').slideUp();
            $('.pass-form').slideDown();
            return false;
        });
    });
     
    /* =================================================================
     * MAGNIFIC POPUP (MODAL)
     * =================================================================
     */
    function init_carousel(content){
        if($('.owl-carousel', content).length){
            $('.owl-carousel', content).each(function(){
                $(this).addClass('owlWrapper').owlCarousel({
                    items: $(this).data('items'),
                    nav: $(this).data('nav'),
                    dots: $(this).data('dots'),
                    autoplay: $(this).data('autoplay'),
                    mouseDrag: $(this).data('mousedrag'),
                    rtl: $(this).data('rtl'),
                    responsive : {
                        0 : {
                            items: 1
                        },
                        768 : {
                            items: $(this).data('items')
                        }
                    }
                });
            });
        }
    }
	if($('.popup-modal').length || $('.ajax-popup-link').length){
        if($('.popup-modal').length){
            $('.popup-modal').magnificPopup({
                type: 'inline',
                preloader: false,
                closeBtnInside: false,
                callbacks: {
                    open: function(){
                        init_carousel($(this.content));
                    }
                }
            });
            $('.popup-modal').on('click', function(e){
                e.preventDefault();
            });
            $('.popup-modal.hide').trigger('click');
        }
        if($('.ajax-popup-link').length){
            $('.ajax-popup-link').each(function(){
                $(this).magnificPopup({
                    type: 'ajax',
                    ajax: {
                        settings: {
                            method: 'POST',
                            data: $(this).data('params')
                        }
                    },
                    callbacks: {
                        open: function(){
                            
                        },
                        ajaxContentAdded: function(){
                            init_carousel($(this.content));
                        }
                    }
                });
            });
        }
        $(document).on('click', '.popup-modal-dismiss', function(e){
            e.preventDefault();
            $.magnificPopup.close();
        });
    }
    
    /* =================================================================
     * DATEPICKER
     * =================================================================
     */
    if($('#from_picker').length && $('#to_picker').length){
        $('#from_picker').datepicker({
            dateFormat: 'dd/mm/yy',
            minDate: 0,
            onClose: function(selectedDate){
                var a = selectedDate.split('/');
                var d = new Date(a[2]+'/'+a[1]+'/'+a[0]);
                var t = new Date(d.getTime()+86400000);
                var date = t.getDate()+'/'+(t.getMonth()+1)+'/'+t.getFullYear();
                $('#to_picker').datepicker('option', 'minDate', date);
            }
        });
        $('#to_picker').datepicker({
            dateFormat: 'dd/mm/yy',
            defaultDate: '+1w'
        });
    }

    /* =================================================================
     * CALENDAR
     * =================================================================
     */
    if($('.hb-calendar').length > 0){
        $('.hb-calendar').each(function(){
            var obj = $(this);
            obj.eCalendar({
                ajaxDayLoader : obj.data('day_loader'),
                customVar : obj.data('custom_var'),
                currentMonth : obj.data('cur_month'),
                currentYear : obj.data('cur_year')
            });
        });
    }

    /* =================================================================
     * BOOTSTRAP MINUS AND PLUS
     * =================================================================
     */
    $('.btn-number').on('click', function(e){
        e.preventDefault();
        var fieldName = $(this).attr('data-field');
        var type = $(this).attr('data-type');
        var input = $('input[name="'+fieldName+'"]');
        var currentVal = parseInt(input.val());
        if(!isNaN(currentVal)){
            if(type == 'minus'){
                if(currentVal > input.attr('min'))
                    input.val(currentVal - 1).trigger('change');
                if(parseInt(input.val()) == input.attr('min'))
                    $(this).attr('disabled', true);
            }else if(type == 'plus'){
                if(currentVal < input.attr('max'))
                    input.val(currentVal + 1).trigger('change');
                if(parseInt(input.val()) == input.attr('max'))
                    $(this).attr('disabled', true);
            }
        }else
            input.val(0);
    });
    $('.input-number').focusin(function(){
       $(this).data('oldValue', $(this).val());
    });
    $('.input-number').on('change',function(){
        var minValue =  parseInt($(this).attr('min'));
        var maxValue =  parseInt($(this).attr('max'));
        var valueCurrent = parseInt($(this).val());
        var name = $(this).attr('name');
        if(valueCurrent >= minValue)
            $('.btn-number[data-type="minus"][data-field="'+name+'"]').removeAttr('disabled');
        else{
            alert('Sorry, the minimum value was reached');
            $(this).val($(this).data('oldValue'));
        }
        if(valueCurrent <= maxValue)
            $('.btn-number[data-type="plus"][data-field="'+name+'"]').removeAttr('disabled');
        else{
            alert('Sorry, the maximum value was reached');
            $(this).val($(this).data('oldValue'));
        } 
    });
    $('.input-number').keydown(function(e){
        if($.inArray(e.keyCode, [46, 8, 9, 27, 13, 190]) !== -1 ||
            (e.keyCode == 65 && e.ctrlKey === true) || 
            (e.keyCode >= 35 && e.keyCode <= 39))
                 return;
                 
        if((e.shiftKey || (e.keyCode < 48 || e.keyCode > 57)) && (e.keyCode < 96 || e.keyCode > 105))
            e.preventDefault();
    });

    /* =================================================================
     * ISOTOPE
     * =================================================================
     */
    if($('.isotopeWrapper').length){
        var $container = $('.isotopeWrapper');
        var $resize = $('.isotopeWrapper').attr('id');
        setTimeout(function(){
            $container.addClass('loaded').isotope({
                layoutMode: 'masonry',
                itemSelector: '.isotopeItem',
                resizable: false,
                masonry: {
                    columnWidth: $container.width() / $resize
                }
            });
        }, 800);
        $('#filter a').on('click', function(e){
            e.preventDefault();
            $('#filter a').removeClass('current');
            $(this).addClass('current');
            var selector = $(this).attr('data-filter');
            $container.isotope({
                filter: selector,
                animationOptions: {
                    duration: 300,
                    easing: 'easeOutQuart'
                }
            });
            return false;
        });
    }
    
    /* =================================================================
     * IMAGE FILL - Initialize Function
     * =================================================================
     */
    function initImageFill(context){
        context = context || document;
        if($('.img-container', context).not('.lazyload').length){
            $('.img-container', context).not('.lazyload').imagefill();
        }
    }
    
    // Initial call
    initImageFill();
    
    $('.panel-collapse').on('shown.bs.collapse', function(e){
        initImageFill(this);
    });
    
    /* =================================================================
     * LAZYLOAD IMAGES - Initialize Function
     * =================================================================
     */
    function initLazyLoad(context){
        context = context || document;
        
        // For standard lazy loaded images
        if($('.lazyload:not(.img-container)', context).length){
            $('.lazyload:not(.img-container)', context).each(function(){
                var img = $(this);
                if(img.attr('data-src') && !img.hasClass('lazy-loaded')){
                    img.addClass('lazy-loaded');
                    var newImg = new Image();
                    newImg.onload = function(){
                        img.attr('src', img.attr('data-src'));
                        img.addClass('loaded');
                    };
                    newImg.onerror = function(){
                        console.error('Failed to load image:', img.attr('data-src'));
                    };
                    newImg.src = img.attr('data-src');
                }
            });
        }
        
        // For img-container with lazy loading
        if($('.img-container.lazyload', context).length){
            $('.img-container.lazyload img', context).each(function(){
                var img = $(this);
                if(img.attr('data-src') && !img.hasClass('lazy-loaded')){
                    img.addClass('lazy-loaded');
                    var newImg = new Image();
                    newImg.onload = function(){
                        img.attr('src', img.attr('data-src'));
                        img.addClass('loaded');
                        if(img.parents('.img-container').length > 0){
                            img.parents('.img-container').imagefill();
                        }
                    };
                    newImg.onerror = function(){
                        console.error('Failed to load image:', img.attr('data-src'));
                    };
                    newImg.src = img.attr('data-src');
                }
            });
        }
    }
    
    // Initial call
    initLazyLoad();
    
    /* =================================================================
     * SHARRRE
     * =================================================================
     */
    var sharrre_media = "";
    var sharrre_descr = "";
    if($('meta[itemprop="image"]').length)
        sharrre_media = $('meta[itemprop="image"]').attr('content');
    if($('meta[name="description"]').length)
        sharrre_descr = $('meta[name="description"]').attr('content');
    
    if($('#twitter').length){
        $('#twitter').sharrre({
            share: {
                twitter: true
            },
            template: '<a class="count" href="#">{total}</a><a class="share">Tweet</a>',
            enableHover: false,
            enableTracking: false,
            enableCounter: false,
            buttons: { twitter: {}},
            click: function(api, options){
                api.simulateClick();
                api.openPopup('twitter');
            }
        });
    }
    if($('#facebook').length){
        $('#facebook').sharrre({
            share: {
                facebook: true
            },
            template: '<a class="count" href="#">{total}</a><a class="share">Share</a>',
            enableHover: false,
            enableTracking: false,
            enableCounter: false,
            buttons: { facebook: {}},
            click: function(api, options){
                api.simulateClick();
                api.openPopup('facebook');
            }
        });
    }
    if($('#pinterest').length){
        $('#pinterest').sharrre({
            share: {
                pinterest: true
            },
            template: '<a class="count" href="#">{total}</a><a class="share">Pin it</a>',
            enableHover: false,
            enableTracking: true,
            enableCounter: false,
            buttons: {
                pinterest: {
                    media: sharrre_media,
                    description: sharrre_descr,
                    layout: 'vertical'
                }
            },
            click: function(api, options){
                api.simulateClick();
                api.openPopup('pinterest');
            }
        });
    }
    /* =================================================================
     * ROYAL SLIDER
     * =================================================================
     */
    if($('.royalSlider').length){
		
		function playSlideVideo(slider){
			if(slider.currSlide.content.find('.rsPlayBtn').length) {
				slider.playVideo();
			}
		}
		
        function royalSliderInit(mode){
            if(mode == 'load' || $('.royalSlider').hasClass('fullSized')){
                var height = window.innerHeight || $(window).height();
                height = height-parseInt($('body').css('padding-top'));
                if(height > 1200 && pms_isMobile) height = 667;
				var width = $(window).width();
                $('.royalSlider').height(height);
                if($('.royalSlider').hasClass('fullWidth')){
                    var settings = {
                        arrowsNav: true,
                        loop: true,
                        keyboardNavEnabled: true,
                        controlsInside: false,
                        imageScaleMode: 'fill',
                        arrowsNavAutoHide: false,
                        autoHeight: false,
                        autoScaleSlider: false,
                        autoScaleSliderWidth: width,     
                        autoScaleSliderHeight: height,
                        controlNavigation: 'bullets',
                        thumbsFitInViewport: false,
                        navigateByClick: true,
                        startSlideId: 0,
                        autoPlay: {
                            enabled: true,
                            pauseOnHover: false,
                            delay: 4000
                        },
                        transitionType:'fade',
                        globalCaption: false,
                        deeplinking: {
                            enabled: true,
                            change: false
                        },
                        video: {
							autoHideArrows: false,
							youTubeCode: '<div class="videoWrapper"><iframe src="https://www.youtube-nocookie.com/embed/%id%?rel=0&autoplay=1&showinfo=0&controls=0&modestbranding=1&wmode=transparent&start=%start%" allowfullscreen frameborder="0" allow="autoplay; encrypted-media"></iframe></div>'
						}
                    };
                }else{
                    var settings = {
                        controlNavigation: 'thumbnails',
                        autoScaleSlider: true, 
                        autoScaleSliderWidth: 960,     
                        autoScaleSliderHeight: 850,
                        autoHeight: true,
                        loop: false,
                        imageScaleMode: 'fit-if-smaller',
                        navigateByClick: true,
                        numImagesToPreload:2,
                        arrowsNav:true,
                        arrowsNavAutoHide: true,
                        arrowsNavHideOnTouch: true,
                        keyboardNavEnabled: true,
                        fadeinLoadedSlide: true,
                        globalCaption: false,
                        globalCaptionInside: false,
                        video: {
							autoHideArrows: false,
							youTubeCode: '<div class="videoWrapper"><iframe src="https://www.youtube-nocookie.com/embed/%id%?rel=0&autoplay=1&showinfo=0&controls=0&modestbranding=1&wmode=transparent&start=%start%" allowfullscreen frameborder="0" allow="autoplay; encrypted-media"></iframe></div>'
						}
                    };
                }
                setTimeout(function(){
                    $('.royalSlider').royalSlider(settings).show();
                    var slider = $('.royalSlider').data('royalSlider');
					slider.ev.on('rsAfterSlideChange', function(){
						playSlideVideo(slider);
					});
					slider.ev.on('rsAfterContentSet', function(e, slideObject) {
						playSlideVideo(slider);
					});
                }, 400);
                
                if($('.stellar').length){
                    $.stellar('destroy');
                    stellarInit();
                }
            }
        }
        
        $(window).resize(function(){
            royalSliderInit('resize');
        });
        royalSliderInit('load');
    }
    /* =================================================================
     * LAZY LOADER - WITH CALLBACK FOR NEW CONTENT
     * =================================================================
     */
    if($('.lazy-wrapper').length){
        $('.lazy-wrapper').each(function(){
            var wrapper = $(this);
            wrapper.lazyLoader({
                loader: wrapper.data('loader'),
                mode: wrapper.data('mode'),
                limit: wrapper.data('limit'),
                pages: wrapper.data('pages'),
                variables: wrapper.data('variables'),
                isIsotope: wrapper.data('is_isotope'),
                more_caption: wrapper.data('more_caption'),
                // Add callback for when content is loaded
                onContentLoaded: function(newContent){
                    console.log('New content loaded, initializing plugins...');
                    
                    // Initialize lazy load for new images
                    initLazyLoad(newContent);
                    
                    // Initialize imagefill for new images
                    initImageFill(newContent);
                    
                    // If using isotope, refresh layout
                    if(wrapper.data('is_isotope') && $('.isotopeWrapper').length){
                        var $container = $('.isotopeWrapper');
                        
                        // Wait for images to load before updating isotope
                        var images = $('img', newContent);
                        var imagesToLoad = images.length;
                        
                        if(imagesToLoad === 0){
                            // No images, update isotope immediately
                            $container.isotope('appended', newContent).isotope('layout');
                        }else{
                            images.each(function(){
                                var img = $(this);
                                if(img[0].complete){
                                    imagesToLoad--;
                                    if(imagesToLoad === 0){
                                        $container.isotope('appended', newContent).isotope('layout');
                                    }
                                }else{
                                    img.on('load error', function(){
                                        imagesToLoad--;
                                        if(imagesToLoad === 0){
                                            $container.isotope('appended', newContent).isotope('layout');
                                        }
                                    });
                                }
                            });
                        }
                    }
                }
            });
        });
    }
    
    /* =================================================================
     * OWL CAROUSEL
     * =================================================================
     */
    if($('.owlWrapper').length){
        $('.owlWrapper').each(function(){
            $(this).owlCarousel({
                items: $(this).data('items'),
                nav: $(this).data('nav'),
                dots: $(this).data('dots'),
                autoplay: $(this).data('autoplay'),
                mouseDrag: $(this).data('mousedrag'),
                rtl: $(this).data('rtl'),
                responsive : {
                    0 : {
                        items: 1
                    },
                    768 : {
                        items: $(this).data('items')
                    }
                }
            });
        });
    }
    /*==================================================================
     * GOOGLE MAPS
     * =================================================================
     */
	if($('#mapWrapper').length){
		var gscript = document.createElement('script');
		gscript.type = 'text/javascript';
		gscript.src = '//maps.google.com/maps/api/js?callback=pms_gmaps_callback';
		if($('meta[name="gmaps_api_key"]').length) gscript.src += '&key='+$('meta[name="gmaps_api_key"]').attr('content');
		document.body.appendChild(gscript);
	}
    /*==================================================================
     * ACTIV'MAP
     * =================================================================
     */
    if ($('#activmap-wrapper').length) {
        const apiKey = $('meta[name="gmaps_api_key"]').attr('content') || '';
        const script = document.createElement('script');
        script.type = 'text/javascript';
        script.src = 'https://maps.googleapis.com/maps/api/js?key=' + apiKey + '&libraries=places,marker&loading=async&callback=activmap_init';
        script.async = true;
        script.defer = true;
        document.body.appendChild(script);
    }

});

function activmap_init(){
    'use strict';
    console.log('Activmap initializing...');
    console.log('Locations:', pms_locations);
    
	var elm = $('#activmap-wrapper');
	if(elm.length && typeof elm.activmap === 'function'){
        console.log('Zoom level:', elm.data('zoom'));
        elm.activmap({
            places: pms_locations,
            icon: elm.data('icon'),
            icon_center: elm.data('icon_center'),
            lat: 20.9517,              // Odisha center latitude
            lng: 85.0985,       
            radius: 0,
            cluster: false,
            country: 'IN',
            posPanel: 'right',
            mapType: 'roadmap',
            request: 'large',
            allowMultiSelect: true,
            zoom: 5,
            show_center: true,
            locationTypes: ['geocode','establishment'],
            mapId: 'ccb8d870eec402f6b63bed30'
        });
    }else{
        console.error('Activmap plugin not found or element does not exist');
    }
}

function pms_gmaps_callback(){
	'use strict';
    
    console.log('Google Maps API loaded successfully');
    
    /* =================================================================
     * GEOLOCATION
     * =================================================================
     */
    if($('meta[name="autogeolocate"]').length){
        function handleNoGeolocation(errorFlag){
            if(errorFlag == true)
                console.log('Geolocation service failed.');
            else
                console.log('Your browser doesn\'t support geolocation.');
        }
        if(navigator.geolocation){
            navigator.geolocation.getCurrentPosition(function(position){
                
                var latlng = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);

                var geocoder = new google.maps.Geocoder();
                geocoder.geocode({ 'latLng': latlng }, function (results, status){
                    if(status == google.maps.GeocoderStatus.OK){
                    
                        if(results[1]){
                            for(var i = 0; i < results[0].address_components.length; i++){
                                for(var j = 0; j < results[0].address_components[i].types.length; j++){
                                    if(results[0].address_components[i].types[j] == 'country'){
                                        var countryCode = results[0].address_components[i].short_name;
                                        
                                        $.getJSON('https://restcountries.com/v3.1/alpha/'+countryCode)
                                        .done(function(data){
                                            if(data[0] && data[0].currencies){
                                                console.log('Currency detected:', data[0].currencies);
                                            }
                                        });
                                        
                                        break;
                                    }
                                }
                            }
                        }
                     } 
                });
            }, function(){
                handleNoGeolocation(true);
            });
        }else
            handleNoGeolocation(false);
    }
    /* =================================================================
     * GMAPS INIT - FIXED VERSION
     * =================================================================
     */
    var gmaps_id = 'mapWrapper';
    if($('#'+gmaps_id).length){
        var overlayTitle = 'Agencies';
        
        // Get marker image URL
        var imageUrl = $('#'+gmaps_id).attr('data-marker');
        
        // Create marker icon object with proper configuration
        var markerIcon = null;
        if(imageUrl && imageUrl !== ''){
            markerIcon = {
                url: imageUrl,
                scaledSize: new google.maps.Size(32, 32),
                origin: new google.maps.Point(0, 0),
                anchor: new google.maps.Point(16, 32)
            };
        }
        
        var map = new google.maps.Map(document.getElementById(gmaps_id),{
            mapTypeId: google.maps.MapTypeId.ROADMAP,
            scrollwheel: false,
            zoomControl: true,
            zoomControlOptions:{
                style: google.maps.ZoomControlStyle.LARGE,
                position: google.maps.ControlPosition.LEFT_CENTER
            },
            streetViewControl:true,
            scaleControl:false,
            zoom: 12,
            styles:[
                {
                    'featureType': 'water',
                    'stylers': [{'color': '#AAC6ED'}]
                },
                {
                    'featureType': 'road',
                    'elementType': 'geometry.fill',
                    'stylers': [{'color': '#FCFFF5'}]
                },
                {
                    'featureType': 'road',
                    'elementType': 'geometry.stroke',
                    'stylers': [{'color': '#808080'}, {'lightness': 54}]
                },
                {
                    'featureType': 'landscape.man_made',
                    'elementType': 'geometry.fill',
                    'stylers': [{'color': '#D5D8E0'}]
                },
                {
                    'featureType': 'poi.park',
                    'elementType': 'geometry.fill',
                    'stylers': [{'color': '#CBDFAB'}]
                },
                {
                    'featureType': 'road',
                    'elementType': 'labels.text.fill',
                    'stylers': [{'color': '#767676'}]
                },
                {
                    'featureType': 'road',
                    'elementType': 'labels.text.stroke',
                    'stylers': [{'color': '#ffffff'}]
                },
                {
                    'featureType': 'road.highway',
                    'elementType': 'geometry.fill',
                    'stylers': [{'color': '#888888'}]
                },
                {
                    'featureType': 'landscape.natural',
                    'elementType': 'geometry.fill',
                    'stylers': [{'visibility': 'on'}, {'color': '#efefef'}]
                },
                {
                    'featureType': 'poi.park',
                    'stylers': [{'visibility': 'on'}]
                },
                {
                    'featureType': 'poi.sports_complex',
                    'stylers': [{'visibility': 'on'}]
                },
                {
                    'featureType': 'poi.medical',
                    'stylers': [{'visibility': 'on'}]
                },
                {
                    'featureType': 'poi.business',
                    'stylers': [{'visibility': 'simplified'}]
                }
            ]
        });
        
        var myLatlng;
        var marker, i;
        var bounds = new google.maps.LatLngBounds();
        var infowindow = new google.maps.InfoWindow({ content: 'loading...' });
        
        if(typeof pms_locations === 'undefined' || !pms_locations.length){
            console.error('pms_locations is not defined or empty');
            return;
        }
        
        for(i = 0; i < pms_locations.length; i++){ 
            if(pms_locations[i][2] !== undefined && pms_locations[i][3] !== undefined){
                var content = '<div class="infoWindow">'+pms_locations[i][0]+'<br>'+pms_locations[i][1]+'</div>';
                (function(content, index){
                    myLatlng = new google.maps.LatLng(pms_locations[index][2], pms_locations[index][3]);
                    
                    var markerOptions = {
                        position: myLatlng,
                        title: overlayTitle,
                        map: map,
                        optimized: false
                    };
                    
                    if(markerIcon !== null){
                        markerOptions.icon = markerIcon;
                    }
                    
                    marker = new google.maps.Marker(markerOptions);
                    
                    google.maps.event.addListener(marker, 'click', function(){
                        infowindow.setContent(content);
                        infowindow.open(map, this);
                    });
                    
                    if(pms_locations.length > 1){
                        bounds.extend(myLatlng);
                        map.fitBounds(bounds);
                    }else{
                        map.setCenter(myLatlng);
                    }
                })(content, i);
            }else{
                var geocoder = new google.maps.Geocoder();
                var info = pms_locations[i][0];
                var addr = pms_locations[i][1];
                var latLng = pms_locations[i][1];
                
                (function(info, addr, index){
                    geocoder.geocode({'address': latLng}, function(results, status){
                        if(status === 'OK' && results[0]){
                            myLatlng = results[0].geometry.location;
                            
                            var markerOptions = {
                                position: myLatlng,
                                title: overlayTitle,
                                map: map,
                                optimized: false
                            };
                            
                            if(markerIcon !== null){
                                markerOptions.icon = markerIcon;
                            }
                            
                            marker = new google.maps.Marker(markerOptions);
                            
                            var $content = '<div class="infoWindow">'+info+'<br>'+addr+'</div>';
                            
                            google.maps.event.addListener(marker, 'click', function(){
                                infowindow.setContent($content);
                                infowindow.open(map, this);
                            });
                            
                            if(pms_locations.length > 1){
                                bounds.extend(myLatlng);
                                map.fitBounds(bounds);
                            }else{
                                map.setCenter(myLatlng);
                            }
                        }else{
                            console.error('Geocode was not successful: ' + status);
                        }
                    });
                })(info, addr, i);
            }
        }
    }
}

/* =====================================================================
 * MAIN MENU
 * =====================================================================
 */
function pms_initializeMainMenu(){
	'use strict';
	var $mainMenu = $('#mainMenu').children('ul');
	if(Modernizr.mq('only all and(max-width: 991px)')){
		var addActiveClass = false;
		$('a.hasSubMenu').unbind('click');
		$('li',$mainMenu).unbind('mouseenter mouseleave');
		$('a.hasSubMenu').on('click', function(e){
			e.preventDefault();
			addActiveClass = $(this).parent('li').hasClass('Nactive');
			if($(this).parent('li').hasClass('primary'))
				$('li', $mainMenu).removeClass('Nactive');
			else
				$('li:not(.primary)', $mainMenu).removeClass('Nactive');
			
			if(!addActiveClass)
				$(this).parents('li').addClass('Nactive');
			else
				$(this).parent().parent('li').addClass('Nactive');
			
			return false;
		});
	}else if(Modernizr.mq('only all and(max-width: 1024px)') && Modernizr.touch){	
		$('a.hasSubMenu').attr('href', '');
		$('a.hasSubMenu').on('touchend',function(e){
			e.preventDefault();
			var $li = $(this).parent(),
			$subMenu = $li.children('.subMenu');
			if($(this).data('clicked_once')){
				if($li.parent().is($(':gt(1)', $mainMenu))){
					if($subMenu.css('display') == 'block'){
						$li.removeClass('hover');
						$subMenu.css('display', 'none');
					}else{
						$('.subMenu').css('display', 'none');
						$subMenu.css('display', 'block'); 
					}
				}else
					$('.subMenu').css('display', 'none');
				$(this).data('clicked_once', false);	
			}else{
				$li.parent().find('li').removeClass('hover');	
				$li.addClass('hover');
				if($li.parent().is($(':gt(1)', $mainMenu))){
					$li.parent().find('.subMenu').css('display', 'none');
					$subMenu.css('left', $subMenu.parent().outerWidth(true));
					$subMenu.css('display', 'block');
				}else{
					$('.subMenu').css('display', 'none');
					$subMenu.css('display', 'block');
				}
				$('a.hasSubMenu').data('clicked_once', false);
				$(this).data('clicked_once', true);
			}
			return false;
		});
		window.addEventListener('orientationchange', function(){
			$('a.hasSubMenu').parent().removeClass('hover');
			$('.subMenu').css('display', 'none');
			$('a.hasSubMenu').data('clicked_once', false);
		}, true);
	}else{
		$('li', $mainMenu).removeClass('Nactive');
		$('a', $mainMenu).unbind('click');
		$('li',$mainMenu).hover(
			function(){
				var $this = $(this),
				$subMenu = $this.children('.subMenu');
				if($subMenu.length){
					$this.addClass('hover').stop();
				}else{
					if($this.parent().is($(':gt(1)', $mainMenu))){
						$this.stop(false, true).fadeIn('slow');
					}
				}
				if($this.parent().is($(':gt(1)', $mainMenu))){
					$subMenu.stop(true, true).fadeIn(200,'easeInOutQuad'); 
					$subMenu.css('left', $subMenu.parent().outerWidth(true));
				}else
					$subMenu.stop(true, true).delay(300).fadeIn(200,'easeInOutQuad');
			},
            function(){
				var $nthis = $(this),
				$subMenu = $nthis.children('ul');
				if($nthis.parent().is($(':gt(1)', $mainMenu))){
					$nthis.children('ul').hide();
					$nthis.children('ul').css('left', 0);
				}else{
					$nthis.removeClass('hover');
					$('.subMenu').stop(true, true).delay(300).fadeOut();
				}
				if($subMenu.length){$nthis.removeClass('hover');}
            }
        );
	}
}
