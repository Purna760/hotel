/* Activ'Map Plugin 2.0.0 (Fixed for AdvancedMarkerElement with MapID)
 * Fixed for: styles + mapId conflict, getPosition(), MarkerClusterer compatibility
 */

(function ($) {
    'use strict';
    $.activmap = {
        defaults: {
            places: [],
            lat: 20.9517,              // Odisha center latitude
            lng: 85.0985,        // India center longitude
            zoom: 5,               // Zoom level to show entire India
            cluster: false,
            mapType: 'roadmap',
            posPanel: 'left',
            showPanel: true,
            radius: 0,
            unit: 'km',
            country: 'IN',         // Set India as country filter
            autogeolocate: false,
            allowMultiSelect: true,
            icon: 'images/icons/marker.png',
            center_icon: 'images/icons/marker-center.png',
            request: 'large',
            locationTypes: ['geocode', 'establishment'],
            show_center: true,
            mapId: 'ccb8d870eec402f6b63bed30'
        }
    };

    $.arrayIntersect = function (a, b) {
        return $.grep(a, function (i) {
            return $.inArray(i, b) > -1;
        });
    };

    $.fn.extend({
        activmap: function (settings) {
            var s = $.extend({}, $.activmap.defaults, settings);

            var init_latlng = new google.maps.LatLng(s.lat, s.lng);
            var latlng = init_latlng;
            var opendInfoWindow = null;
            var markers = [];
            var infoWindow = [];
            var ids = [];
            var markerCluster;
            var centerMarker;
            var bounds = new google.maps.LatLngBounds();
            var num_places = 0;
            var old_results = 0;
            var mapTypeId = google.maps.MapTypeId.ROADMAP;
            var AdvancedMarkerElement = null;

            if (s.mapType === 'satellite' || s.mapType === 'perspective')
                mapTypeId = google.maps.MapTypeId.HYBRID;

            // Initialize map WITHOUT styles property (use mapId instead)
            var map = new google.maps.Map(document.getElementById('activmap-canvas'), {
                zoom: s.zoom,
                center: latlng,
                mapTypeId: mapTypeId,
                mapId: s.mapId, // REQUIRED for AdvancedMarkerElement
                // DO NOT include styles here when using mapId
                mapTypeControl: true,
                mapTypeControlOptions: {
                    style: google.maps.MapTypeControlStyle.HORIZONTAL_BAR,
                    position: google.maps.ControlPosition.BOTTOM_CENTER
                },
                zoomControl: true,
                zoomControlOptions: {
                    position: google.maps.ControlPosition.LEFT_CENTER
                },
                scaleControl: true,
                streetViewControl: true,
                streetViewControlOptions: {
                    position: google.maps.ControlPosition.RIGHT_BOTTOM
                },
                fullscreenControl: false
            });

            bounds.extend(init_latlng);

            if (s.mapType === 'perspective') map.setTilt(45);

            var activmap_canvas = $('#activmap-container');
            var activmap_places = $('#activmap-places');
            var map_w = activmap_canvas.width();
            var cont_w = activmap_places.outerWidth();

            if (!s.showPanel) activmap_places.hide();
            else {
                if (s.posPanel === 'left') {
                    activmap_places.css({ left: -cont_w, right: 'auto' });
                    activmap_canvas.css({ float: 'right' });
                } else {
                    activmap_places.css({ right: -cont_w, left: 'auto' });
                    activmap_canvas.css({ float: 'left' });
                }
            }

            if ($('input[name="activmap_radius"]').length) {
                $('input[name="activmap_radius"]').prop('checked', false).each(function () {
                    if (s.radius == $(this).val()) $(this).prop('checked', true);
                });
            }

            var createMarkerContent = function(iconUrl) {
                var div = document.createElement('div');
                div.style.width = '32px';
                div.style.height = '32px';
                div.style.backgroundImage = 'url(' + iconUrl + ')';
                div.style.backgroundSize = 'contain';
                div.style.backgroundRepeat = 'no-repeat';
                div.style.backgroundPosition = 'center';
                div.style.cursor = 'pointer';
                return div;
            };

            var _init,
                _sort_by_dist,
                _order,
                _update_center_marker,
                _geolocate,
                _handleNoGeolocation,
                _rad,
                _paddedBounds,
                _get_distance,
                _update_map,
                _map_resize,
                _update_places_bounds,
                _update_places_tag;

            _init = function () {
                $.each(s.places, function (i, place) {
                    place.num_tags = 0;
                    place.id = i;
                    var myLatlng = new google.maps.LatLng(place.lat, place.lng);
                    var myIcon = (place.icon && place.icon !== '') ? place.icon : s.icon;

                    var marker = new AdvancedMarkerElement({
                        map: map,
                        position: myLatlng,
                        content: createMarkerContent(myIcon),
                        title: place.title,
                        gmpClickable: true
                    });

                    // Add getPosition method for compatibility with clustering
                    marker.getPosition = function() {
                        return this.position;
                    };

                    var mycontent = '<div class="activmap-infowindow">';
                    if (place.img) mycontent += '<div class="activmap-brand"><img src="' + place.img + '"></div>';
                    mycontent += '<div class="activmap-details"><h4 class="activmap-title">' + place.title + '</h4>';
                    if (place.address) mycontent += '<div class="activmap-address">' + place.address + '</div>';
                    if (place.phone) mycontent += '<div class="activmap-phone">' + place.phone + '</div>';
                    if (place.url) mycontent += '<a href="' + place.url + '" target="_blank" class="activmap-url">' + place.url + '</a>';
                    if (place.custom) mycontent += '<div class="activmap-custom">' + place.custom + '</div>';
                    mycontent += '</div><div style="clear: both;"></div></div>';

                    infoWindow[i] = new google.maps.InfoWindow({ content: mycontent, position: myLatlng });

                    google.maps.event.addListener(infoWindow[i], 'closeclick', function () {
                        $('.activmap-place').removeClass('active');
                        activmap_places.scrollTop();
                    });

                    marker.addListener('click', function () {
                        if (opendInfoWindow != null) opendInfoWindow.close();
                        infoWindow[i].open(map, marker);
                        map.setCenter(marker.position);
                        var padbnds = _paddedBounds(20, 280, 50, 50);
                        map.fitBounds(padbnds);
                        opendInfoWindow = infoWindow[i];

                        $('.activmap-place').removeClass('active');
                        $('#activmap-place_' + i).addClass('active');
                        activmap_places.scrollTop(activmap_places.scrollTop() + $('#activmap-place_' + i).position().top);
                    });

                    marker.map = null;
                    place.marker = marker;
                    markers.push(marker);

                    place.title = place.title.replace(/<a\b[^>]*>(.*?)<\/a>/i, '$1');
                    place.html = '<div class="activmap-place" id="activmap-place_' + i + '">' +
                        '<div class="activmap-brand">' +
                            (place.img ? '<img src="' + place.img + '" alt="' + place.title.replace(/<[^>]*>/g, '') + '">' : '') +
                        '</div>' +
                        '<div class="activmap-details">' +
                            '<h3 class="activmap-title">' + place.title + '</h3>' +
                            (place.address ? '<div class="activmap-address">' + place.address + '</div>' : '') +
                            (place.phone ? '<div class="activmap-phone">' + place.phone + '</div>' : '') +
                            (place.custom ? '<div class="activmap-custom">' + place.custom + '</div>' : '') +
                            (place.url ? '<a href="' + place.url + '" class="activmap-url" target="_blank">View Details</a>' : '') +
                        '</div>' +
                    '</div>';

                    $.each(place.tags, function (j, tag) {
                        if (ids[tag] === undefined) ids[tag] = [];
                        ids[tag].push(place.id);
                    });
                });

                if (s.show_center) {
                    centerMarker = new AdvancedMarkerElement({
                        map: map,
                        position: latlng,
                        content: createMarkerContent((s.center_icon && s.center_icon !== '') ? s.center_icon : s.icon),
                        gmpClickable: false
                    });
                    centerMarker.getPosition = function() {
                        return this.position;
                    };
                    markers.push(centerMarker);
                }

                _order();

                if (s.autogeolocate === true) _geolocate();

                if ($('#activmap-geolocate').length) {
                    $('#activmap-geolocate').on('click', function () { _geolocate(); });
                }

                if ($('#activmap-target').length) {
                    $('#activmap-target').on('click', function () {
                        latlng = init_latlng;
                        _update_places_bounds();
                        _update_map();
                    });
                }

                if ($('#activmap-location').length) {
                    var options = s.country !== null
                        ? { types: s.locationTypes, componentRestrictions: { country: s.country } }
                        : { types: s.locationTypes };

                    var input = document.getElementById('activmap-location');
                    var autocomplete = new google.maps.places.Autocomplete(input, options);

                    google.maps.event.addListener(autocomplete, 'place_changed', function () {
                        var place = autocomplete.getPlace();
                        latlng = place.geometry.location;
                        if ($('.activmap-place').length) _order();
                        $('input[name="marker_type[]"], select[name="marker_type[]"]').each(function () {
                            _update_places_tag($(this), false);
                        });
                        _update_center_marker();
                        _update_map();
                    });
                }

                $('input[name="activmap_radius"]').on('change', function () {
                    s.radius = $(this).val();
                    $('input[name="marker_type[]"], select[name="marker_type[]"]').each(function () {
                        _update_places_tag($(this), false);
                    });
                    _update_map();
                });

                $('input[name="marker_type[]"], select[name="marker_type[]"]').on('change', function () {
                    _update_places_tag($(this), true);
                    _update_map();
                });

                $('#activmap-reset').on('click', function () {
                    $('input[name="marker_type[]"]').prop('checked', false);
                    $('select[name="marker_type[]"] > option').prop('selected', false);
                    $('input[name="marker_type[]"], select[name="marker_type[]"]').each(function () {
                        _update_places_tag($(this), false);
                    });
                    latlng = init_latlng;
                    _update_center_marker();
                    _update_map();
                    return false;
                });

                $(document).on('click', '.activmap-place', function () {
                    var id = $(this).attr('id').replace('activmap-place_', '');
                    google.maps.event.trigger(markers[id], 'click');
                });

                $(window).on('resize', function () { setTimeout(_update_map, 300); });

                $('input[name="marker_type[]"]:checked').add($('select[name="marker_type[]"]').prop('selected', true)).each(function () {
                    _update_places_tag($(this), false);
                });

                _update_map();
            };

            _sort_by_dist = function (a, b) {
                return ((a.dist < b.dist) ? -1 : ((a.dist > b.dist) ? 1 : 0));
            };

            _order = function () {
                $.each(s.places, function (i, place) {
                    place.dist = _get_distance(place.marker.position, latlng);
                });
                s.places.sort(_sort_by_dist);
                $('.activmap-place').remove();
                $.each(s.places, function (i, place) {
                    activmap_places.append(place.html);
                    if (place.isVisible) $('#activmap-place_' + place.id).show();
                });
            };

            _update_center_marker = function () {
                if (centerMarker) {
                    centerMarker.position = latlng;
                    _update_places_bounds();
                }
            };

            _geolocate = function () {
                if (navigator.geolocation) {
                    navigator.geolocation.getCurrentPosition(function (position) {
                        var initialLocation = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
                        latlng = initialLocation;
                        if ($('.activmap-place').length) _order();
                        $('input[name="marker_type[]"], select[name="marker_type[]"]').each(function () {
                            _update_places_tag($(this), false);
                        });
                        _update_center_marker();
                        _update_map();
                    }, function () {
                        _handleNoGeolocation(true);
                    });
                } else {
                    _handleNoGeolocation(false);
                }
            };

            _handleNoGeolocation = function (errorFlag) {
                console.log(errorFlag ? 'Geolocation service failed.' : 'Your browser doesn\'t support geolocation.');
                map.setCenter(latlng);
            };

            _rad = function (a) {
                return a * Math.PI / 180;
            };

            _paddedBounds = function (npad, spad, epad, wpad) {
                var SW = map.getBounds().getSouthWest();
                var NE = map.getBounds().getNorthEast();
                var topRight = map.getProjection().fromLatLngToPoint(NE);
                var bottomLeft = map.getProjection().fromLatLngToPoint(SW);
                var scale = Math.pow(2, map.getZoom());

                var SWtopoint = map.getProjection().fromLatLngToPoint(SW);
                var SWpoint = new google.maps.Point(((SWtopoint.x - bottomLeft.x) * scale) + wpad, ((SWtopoint.y - topRight.y) * scale) - spad);
                var SWworld = new google.maps.Point(SWpoint.x / scale + bottomLeft.x, SWpoint.y / scale + topRight.y);
                var pt1 = map.getProjection().fromPointToLatLng(SWworld);

                var NEtopoint = map.getProjection().fromLatLngToPoint(NE);
                var NEpoint = new google.maps.Point(((NEtopoint.x - bottomLeft.x) * scale) - epad, ((NEtopoint.y - topRight.y) * scale) + npad);
                var NEworld = new google.maps.Point(NEpoint.x / scale + bottomLeft.x, NEpoint.y / scale + topRight.y);
                var pt2 = map.getProjection().fromPointToLatLng(NEworld);

                return new google.maps.LatLngBounds(pt1, pt2);
            };

            _get_distance = function (p1, p2) {
                // FIXED: Use .lat() and .lng() methods or extract from position object
                var lat1 = typeof p1.lat === 'function' ? p1.lat() : p1.lat;
                var lng1 = typeof p1.lng === 'function' ? p1.lng() : p1.lng;
                var lat2 = typeof p2.lat === 'function' ? p2.lat() : p2.lat;
                var lng2 = typeof p2.lng === 'function' ? p2.lng() : p2.lng;

                var R = (s.unit === 'km') ? 6378137 : 3963190;
                var dLat = _rad(lat2 - lat1);
                var dLong = _rad(lng2 - lng1);
                var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                    Math.cos(_rad(lat1)) * Math.cos(_rad(lat2)) *
                    Math.sin(dLong / 2) * Math.sin(dLong / 2);
                var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
                return R * c;
            };

            _update_map = function () {
                map_w = $('#activmap-wrapper').width();
                cont_w = activmap_places.outerWidth();
                if (num_places > 0) {
                    if (old_results == 0 && s.showPanel) {
                        if (s.posPanel === 'left') activmap_places.stop(true, true).animate({ left: 0 }, 400);
                        else activmap_places.stop(true, true).animate({ right: 0 }, 400);
                        if (activmap_places.is(':visible')) activmap_canvas.animate({ width: map_w - cont_w }, 400);
                    } else {
                        if (s.showPanel && activmap_places.is(':visible') && $(window).width() + 17 > 1190)
                            activmap_canvas.width(map_w - cont_w);
                        else activmap_canvas.width(map_w);
                    }
                } else {
                    if (opendInfoWindow != null) opendInfoWindow.close();
                    if (s.showPanel && activmap_places.is(':visible') && $(window).width() + 17 > 1190) {
                        activmap_canvas.animate({ width: map_w }, 400);
                        if (s.posPanel === 'left') activmap_places.animate({ left: -cont_w }, 400);
                        else activmap_places.animate({ right: -cont_w }, 400);
                    } else activmap_canvas.width(map_w);
                }
                old_results = num_places;
                setTimeout(_map_resize, 400);
            };

            _map_resize = function () {
                google.maps.event.trigger(map, 'resize');
                if (num_places > 0) {
                    map.fitBounds(bounds);
                    var padbnds = _paddedBounds(10, 150, 50, 50);
                    map.fitBounds(padbnds);
                } else {
                    map.setZoom(s.zoom);
                    map.setCenter(latlng);
                }
            };

            _update_places_bounds = function () {
                bounds = new google.maps.LatLngBounds();
                var i = 0;
                $.each(s.places, function (j, place) {
                    if (place.isVisible === true) {
                        bounds.extend(place.marker.position);
                        i++;
                    }
                });
                if (centerMarker) bounds.extend(centerMarker.position);
                num_places = i;
            };

            _update_places_tag = function (input, uncheck) {
                if (!s.allowMultiSelect && uncheck) {
                    $('.marker-selector').removeClass('active');
                    $('input[name="marker_type[]"]').not(input).prop('checked', false);
                    $('select[name="marker_type[]"]').not(input).find('option').prop('selected', false);
                }

                var checked = (input.prop('tagName') === 'SELECT') ? input.prop('selected') : input.prop('checked');
                if (checked === true) input.parents('.marker-selector').addClass('active');
                else input.parents('.marker-selector').removeClass('active');

                var val, i = 0, p_ids = [], ids_copy = [];
                $('input[name="marker_type[]"]:checked').add($('select[name="marker_type[]"]').prop('selected', true)).each(function () {
                    val = $(this).val();
                    if (val !== '') {
                        if (ids[val] === undefined) ids[val] = [];
                        if (i === 0) p_ids = $.merge([], ids[val]);
                        else {
                            if (s.request === 'strict') p_ids = $.arrayIntersect(ids[val], p_ids);
                            if (s.request === 'large') {
                                ids_copy = $.merge([], ids[val]);
                                p_ids = $.merge(ids_copy, p_ids);
                            }
                        }
                        i++;
                    }
                });

                if (opendInfoWindow != null) opendInfoWindow.close();

                $.each(s.places, function (j, place) {
                    place.num_tags = 0;
                    place.dist = 0;
                    if ($.inArray(place.id, p_ids) >= 0) {
                        place.dist = _get_distance(place.marker.position, latlng);
                        if (s.radius == 0 || (s.radius > 0 && place.dist <= (s.radius * ((s.unit === 'km') ? 1000 : 1)))) {
                            place.isVisible = true;
                            place.marker.map = map;
                            $('#activmap-place_' + place.id).show();
                        } else {
                            place.isVisible = false;
                            place.marker.map = null;
                            $('#activmap-place_' + place.id).hide();
                        }
                    } else {
                        place.isVisible = false;
                        place.marker.map = null;
                        $('#activmap-place_' + place.id).hide();
                    }
                });

                _update_places_bounds();
                _order();
            };

            google.maps.importLibrary("marker").then(function(markerLibrary) {
                AdvancedMarkerElement = markerLibrary.AdvancedMarkerElement;
                
                if (!Array.isArray(s.places)) {
                    $.ajax({
                        url: s.places,
                        dataType: 'json',
                        cache: false,
                        success: function (data) {
                            try {
                                var obj = (typeof data === 'string') ? JSON.parse(data) : data;
                                s.places = obj.places;
                                _init();
                            } catch (e) {
                                console.error('Invalid JSON in places:', e);
                            }
                        },
                        error: function(jqXHR, textStatus, errorThrown) {
                            console.error('Error loading places:', textStatus, errorThrown);
                        }
                    });
                } else {
                    _init();
                }
            }).catch(function(error) {
                console.error('Failed to load marker library:', error);
            });
        }
    });
})(jQuery);
