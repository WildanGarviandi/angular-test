'use strict';

angular.module('adminApp')
.controller('MapCtrl', 
    function(
        $scope,
        $location,
        $window,
        Services,
        $rootScope
    ) {

    var markers = [];

    var map = new google.maps.Map(document.getElementById('map'), {
        zoom: 12,
        center: {lat: -6.2362126, lng: 106.8494174}
    });

    var lines = {
        webstoretohub: {
            strokeColor: '#D50000',
            strokeOpacity: 1.0,
            strokeWeight: 2,
            withArrow: true,
            label: 'Webstore to Hub'
        },
        hubtoparent: {
            strokeColor: '#FFFF00',
            strokeOpacity: 1.0,
            strokeWeight: 2,
            withArrow: true,
            label: 'Hub to Parent Hub'
        },
        parenttoparent: {
            strokeColor: '#1B5E20',
            strokeOpacity: 1.0,
            strokeWeight: 2,
            withArrow: false,
            label: 'Parent Hub to Parent Hub'
        }
    };

    var icons = {
        hub: {
            icon: {
                path: MAP_PIN,
                fillColor: '#4A148C',
                fillOpacity: 1,
                strokeColor: '',
                strokeWeight: 0
            },
            map_icon_label: '<span class="map-icon map-icon-storage legend-icon"></span>'
        },
        webstore: {
            icon: {
                path: MAP_PIN,
                fillColor: '#00C853',
                fillOpacity: 1,
                strokeColor: '',
                strokeWeight: 0
            },
            map_icon_label: '<span class="map-icon map-icon-grocery-or-supermarket legend-icon"></span>'
        }
    };

    var legend = document.getElementById('legend');
    for (var key in icons) {
        var type = icons[key];
        var div = document.createElement('div');
        div.innerHTML = 
            '<svg baseProfile="basic" xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 48 48">' + 
            '<path fill="' + type.icon.fillColor +'" d="M24 0c-9.8 0-17.7 7.8-17.7 17.4 0 15.5 17.7 30.6 17.7 30.6s17.7-15.4 17.7-30.6c0-9.6-7.9-17.4-17.7-17.4z">' +
            '</path></svg>' + type.map_icon_label + '<h5>' + key + '</h5>';
        legend.appendChild(div);
    }
    for (var key in lines) {
        var type = lines[key];
        var div = document.createElement('div');
        div.innerHTML = 
            '<svg baseProfile="basic" width="48" height="20" xmlns="http://www.w3.org/2000/svg">' +
                '<defs><marker id="markerArrow" markerWidth="13" markerHeight="13" refX="2" refY="6"orient="auto">' +
                    '<path d="M2,4 L2,8 L6,6 L2,4" style="fill:#000000;" /></marker></defs>' +
                '<path d="M 5 10 45 10 0" stroke="'+ type.strokeColor + '" stroke-width="4px" fill="none" ' +
                    'marker-end="url(#markerArrow)"/></svg>' +
            '<h5>' + type.label + '</h5>';
        legend.appendChild(div);
    }

    map.controls[google.maps.ControlPosition.LEFT_BOTTOM].push(legend);

    /**
     * Add marker to map
     * @param {Object} data - coordinate data
     * @param {String} type - type of place: hub, webstore, etc.
     */
    var addMarker = function (data, type) {
        var icon = {};
        var map_icon_label = '';
        if (type === 'hub') {
            type = (data.parent ? 'Main Hub ' : 'Hub ');
            icon = icons['hub'].icon;
            map_icon_label = icons['hub'].map_icon_label;
        } else if (type === 'webstore') {
            type = 'Webstore '
            icon = icons['webstore'].icon;
            map_icon_label = icons['webstore'].map_icon_label;
        }
        var marker = new Marker({
            position: new google.maps.LatLng(data.lat, data.lng),
            title: type + data.title,
            animation: google.maps.Animation.DROP,
            map: map,
            icon: icon,
            map_icon_label: map_icon_label
        });

        var contentString = '<h4>' + type + data.title + '</h4>';

        if (data.address) {
            contentString += '<p>Address: ' + data.address + '</p>';
        } else {
            contentString += '<p>Address: Unknown</p><br>';
        }

        if (data.phone) {
            contentString += '<p>Phone Number: ' + data.phone + '</p>';
        }

        var infowindow = new google.maps.InfoWindow({
            content: contentString
        })
        marker.addListener('click', function(){
            infowindow.open(map, marker);
        });

        markers.push(marker);
    };

    /**
     * Get all hubs data and add marker
     * 
     */
    var getHubs = function() {
        return new Promise(function (resolve, reject) {
            $rootScope.$emit('startSpin');
            $scope.isLoading = true;
            Services.getAll().$promise.then(function(data) {
                console.log('hubs', data);
                $scope.hubs = data.hubs;
                $scope.isLoading = false;
                $rootScope.$emit('stopSpin');

                $scope.hubs.forEach(function (hub, i) {
                    var data = {
                        lat: hub.Latitude,
                        lng: hub.Longitude,
                        title: hub.Name,
                        parent: (hub.ParentHubID === null),
                        address: hub.Address1
                    };
                    addMarker(data, 'hub');
                });
                resolve();
            });
        });
    };

    /**
     * Get all webstores data and add marker
     *
     */
    var getWebstores = function() {
        return new Promise(function (resolve, reject) {
            $rootScope.$emit('startSpin');
            $scope.isLoading = true;
            Services.getAllWebstores().$promise.then(function(data) {
                console.log('webstores', data);
                $scope.webstores = data.webstores;
                $scope.isLoading = false;
                $rootScope.$emit('stopSpin');
                $scope.webstores.forEach(function (webstore, i) {
                    var data = {};
                    if (webstore.WebstoreCompany && webstore.WebstoreCompany.UserAddress) {
                        data = {
                            lat: webstore.WebstoreCompany.UserAddress.Latitude,
                            lng: webstore.WebstoreCompany.UserAddress.Longitude,
                            title: webstore.FirstName + ' ' +webstore.LastName,
                            address: webstore.WebstoreCompany.UserAddress.Address1,
                            phone: ((webstore.CountryCode) ? webstore.CountryCode : '') + webstore.PhoneNumber
                        };
                    } else {
                        data = {
                            lat: webstore.Latitude,
                            lng: webstore.Longitude,
                            title: webstore.FirstName + ' ' +webstore.LastName,
                            phone: ((webstore.CountryCode) ? webstore.CountryCode : '') + webstore.PhoneNumber
                        };
                    }
                    
                    addMarker(data, 'webstore');
                });
                resolve();
            });
        });
    };

    /**
     * Add line to the map
     * @param {Object} from      - origin coordinate
     * @param {Object} to        - destination coordinate
     * @param {String} lineColor - line color hex
     * @param {Boolean} withArrow - with arrow or not
     */
    var addLine = function (from, to, type) {
        var connection = [
            {
                lat: from.lat,
                lng: from.lng
            },
            {
                lat: to.lat,
                lng: to.lng
            }
        ];
        var icons = [];
        if (lines[type].withArrow) {
            icons = [{
                icon: {
                    path: google.maps.SymbolPath.FORWARD_CLOSED_ARROW
                }
            }];
        }
        
        var fromToConnection = new google.maps.Polyline({
            path: connection,
            strokeColor: lines[type].strokeColor,
            strokeOpacity: lines[type].strokeOpacity,
            strokeWeight: lines[type].strokeWeight,
            icons: icons
        });
        fromToConnection.setMap(map);
    };

    // Call all functions
    getHubs().then(function () {
        getWebstores().then(function () {
            $scope.hubs.forEach(function (hub) {
                // Wesbtore to Hub connection
                var webstoresHub = $scope.webstores.filter(function (webstore) {
                    if (webstore.WebstoreCompany) {
                        return webstore.WebstoreCompany.HubID === hub.HubID;
                    } else {
                        return false;
                    }
                    
                });
                if (webstoresHub) {
                    webstoresHub.forEach(function (webstore) {
                        var from = {
                                lat: webstore.WebstoreCompany.UserAddress.Latitude,
                                lng: webstore.WebstoreCompany.UserAddress.Longitude
                            };
                        var to = {
                                lat: hub.Latitude,
                                lng: hub.Longitude
                            };
                        addLine(from, to, 'webstoretohub');
                    });
                }

                if (hub.ParentHubID !== null) {
                    // Hub to Parent Hub connection
                    var parentHub = $scope.hubs.find(function (result) {
                        return result.HubID === hub.ParentHubID;
                    });
                    if (parentHub) {
                        var from = {
                                lat: parentHub.Latitude,
                                lng: parentHub.Longitude
                            };
                        var to = {
                                lat: hub.Latitude,
                                lng: hub.Longitude
                            };
                        addLine(from, to, 'hubtoparent');
                    }
                } else {
                    // Parent Hub to Parent Hub connection
                    var parentHubs = $scope.hubs.filter(function (result) {
                        if (result.HubID === hub.HubID) {
                            return false;
                        } else {
                            return result.ParentHubID === null;
                        }
                    });
                    if (parentHubs) {
                        parentHubs.forEach(function (parentHub) {
                            var from = {
                                    lat: parentHub.Latitude,
                                    lng: parentHub.Longitude
                                };
                            var to = {
                                    lat: hub.Latitude,
                                    lng: hub.Longitude
                                };
                            addLine(from, to, 'parenttoparent');
                        });
                    }
                }
            });
        });
    });
});