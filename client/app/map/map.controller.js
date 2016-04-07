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

    /**
     * Add marker to map
     * @param {Object} data - coordinate data
     * @param {String} type - type of place: hub, webstore, etc.
     */
    var addMarker = function (data, type) {
        var icon = {};
        var map_icon_label = '';
        if (type === 'hub') {
            icon = {
                    path: MAP_PIN,
                    fillColor: '#4A148C',
                    fillOpacity: 1,
                    strokeColor: '',
                    strokeWeight: 0
                };
            map_icon_label = '<span class="map-icon map-icon-storage"></span>'
        } else if (type === 'webstore') {
            icon = {
                    path: MAP_PIN,
                    fillColor: '#00C853',
                    fillOpacity: 1,
                    strokeColor: '',
                    strokeWeight: 0
                };
            map_icon_label = '<span class="map-icon map-icon-grocery-or-supermarket"></span>'
        }

        markers.push(new Marker({
            position: new google.maps.LatLng(data.lat, data.lng),
            title: data.title,
            animation: google.maps.Animation.DROP,
            map: map,
            icon: icon,
            map_icon_label: map_icon_label
        }));
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
                        title: hub.Name
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
                            title: webstore.FirstName + ' ' +webstore.LastName
                        };
                    } else {
                        data = {
                            lat: webstore.Latitude,
                            lng: webstore.Longitude,
                            title: webstore.FirstName + ' ' +webstore.LastName
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
    var addLine = function (from, to, lineColor, withArrow) {
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
        if (withArrow) {
            icons = [{
                icon: {
                    path: google.maps.SymbolPath.FORWARD_CLOSED_ARROW
                }
            }];
        }
        
        var fromToConnection = new google.maps.Polyline({
            path: connection,
            strokeColor: lineColor,
            strokeOpacity: 1.0,
            strokeWeight: 2,
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
                        addLine(from, to, '#D50000', true);
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
                        addLine(from, to, '#FFFF00', true);
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
                            addLine(from, to, '#1B5E20', false);
                        });
                    }
                }
            });
        });
    });
    
});