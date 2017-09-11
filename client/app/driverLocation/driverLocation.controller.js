'use strict';

angular.module('adminApp')
    .controller('DriverLocationCtrl',
        function(
            $scope,
            Auth,
            $rootScope,
            Services,
            Services2,
            SweetAlert,
            moment,
            lodash,
            $state,
            $stateParams,
            $location,
            $http,
            $window,
            ngDialog,
            $q
        ) {

    Auth.getCurrentUser().then(function(data) {
        $scope.user = data.profile;
    });

    $scope.companies = [{
        FleetID: 0,
        CompanyDetailID: 0,
        CompanyName: 'All Fleet'
    }];
    $scope.company = $scope.companies[0];

    var map = '';
    var markers = [];

    // Here, model and param have same naming format
    var pickedVariables = {
        'Company': {
            model: 'company',
            pick: 'FleetID',
            collection: 'companies'
        }
    };

    // Generates
    // chooseCompany
    lodash.each(pickedVariables, function (val, key) {
        $scope['choose' + key] = function(item) {
            $location.search(val.model, item[val.pick]);
            $scope[val.model] = item;

            $rootScope.$emit('startSpin');
            return getDriverLocations();
        };
    });

    /**
     * Get all companies
     * 
     * @return {Object} Promise
     */
    var getCompanies = function() {
        return $q(function (resolve) {
            $rootScope.$emit('startSpin');
            Services2.getAllCompanies()
            .$promise.then(function(result) {
                var temp = [];
                result.data.Companies.forEach(function (v, i) {
                    var obj = {};
                        obj.FleetID = v.User.UserID;
                        obj.CompanyDetailID = v.CompanyDetailID;
                        obj.CompanyName = v.CompanyName;

                    temp.push(obj);
                });
                var temp = lodash.sortBy(temp, function (i) { 
                    return i.CompanyName.toLowerCase(); 
                });
                $scope.companies = $scope.companies.concat(temp);
                $rootScope.$emit('stopSpin');
                resolve();
            });
        });
    };

    var initMap = function () {
        map = new google.maps.Map(document.getElementById('map'), {
            zoom: 12,
            center: {lat: -6.2362126, lng: 106.8494174}
        });
    }

    /**
     * Add marker to map
     * @param {Object} data - coordinate data
     * @param {String} type - type of place: hub, webstore, etc.
     */
    var addMarker = function (data, type) {
        var icon = {};
        var map_icon_label = '';
        var type = 'Driver ';

        var marker = new Marker({
            position: new google.maps.LatLng(data.lat, data.lng),
            title: type + data.title,
            animation: google.maps.Animation.DROP,
            map: map
        });

        var contentString = '<h5>' + type + data.title + '</h5>';

        if (data.phone) {
            contentString += '<p>Phone Number: ' + data.phone + '</p>';
        }

        if (data.fleet) {
            contentString += '<p>Fleet: ' + data.fleet + '</p>';
        }

        var infowindow = new google.maps.InfoWindow({
            content: contentString
        })
        marker.addListener('click', function(){
            infowindow.open(map, marker);
        });

        markers.push(marker);
    };


    var getDriverLocations = function () {
        initMap();
        return new Promise(function (resolve, reject) {

            lodash.each(pickedVariables, function (val, key) {
                var value = $location.search()[val.model] || $scope[val.model][val.pick];
                var findObject = {};
                findObject[val.pick] = (parseInt(value)) ? parseInt(value) : value;
                $scope[val.model] = lodash.find($scope[val.collection], findObject);
            });
            
            var params = {};

            if ($scope.company.FleetID) {
                params.fleetID = $scope.company.FleetID;
            }

            Services2.bulkCurrentLocation(params)
            .$promise.then(function (data) {
                var drivers = data.data;
                $rootScope.$emit('stopSpin');

                drivers.forEach(function (v, i) {
                    var driver = {};
                        driver.lat = v.Latitude;
                        driver.lng = v.Longitude;

                    if (v.Driver) {
                        driver.title = v.Driver.FirstName + ' ' + v.Driver.LastName;
                        driver.phone = v.Driver.PhoneNumber;
                        driver.fleet = '-';
                        if (v.Driver.Driver && v.Driver.Driver.CompanyDetail) {
                            driver.fleet = v.Driver.Driver.CompanyDetail.CompanyName;
                        }
                    }

                    addMarker(driver);
                });
                resolve();
            });
        });
    }

    $scope.initDriverLocation = function () {
        getCompanies()
        .then(getDriverLocations);
    }

    $scope.initDriverLocation();

});