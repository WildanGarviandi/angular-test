'use strict';

angular.module('bookingApp')
  .controller('DashboardCtrl', function($scope, Auth, $rootScope, 
    Hub, moment, lodash, $state, $stateParams, $location, $http, $window) {

    Auth.getCurrentUser().$promise.then(function(data) {
      $scope.user = data.profile;
    });

    $scope.hub = {
        ParentHubID: null,
        Name: '',
        Type: '',
        Address1: '',
        Address2: '',
        Latitude: -6.2115,
        Longitude: 106.8452,
        City: '',
        State: '',
        Country: '',
        ZipCode: ''
      }

    /**
     * Pick location from maps
     * 
     * @return {void}
     */
    $scope.updateLocation = function(addressComponents) {
      console.log(addressComponents)
      $scope.hub.Address1 = addressComponents.addressLine1;
      //$scope.hub.City = addressComponents.city;
      $scope.hub.State = addressComponents.stateOrProvince;
      $scope.hub.ZipCode = addressComponents.postalCode;
      //$scope.hub.Country = addressComponents.country.long_name;
    }

    $scope.locationPicker = function() {
      console.log($scope.hub)
      $('#maps').locationpicker({
        location: {latitude: $scope.hub.Latitude, longitude: $scope.hub.Longitude},   
        radius: 300,
        inputBinding: {
            latitudeInput: $('#us2-lat'),
            longitudeInput: $('#us2-lon'),
            locationNameInput: $('#us2-address') 
        },
        enableAutocomplete: true,
        onchanged: function (currentLocation, radius, isMarkerDropped) {
            var addressComponents = $(this).locationpicker('map').location.addressComponents;
            $scope.updateLocation(addressComponents);
        },
      });
    }

    /**
     * Get single hub
     * 
     * @return {void}
     */
    $scope.getHubDetails = function() {
      $rootScope.$emit('startSpin');
      $scope.isLoading = true;
      $scope.id = $stateParams.hubID;
      Hub.getOne({
          _id: $scope.id,
        }).$promise.then(function(data) {
          $scope.hub = data.hub;
          if (data.parent) {
            $scope.parent = {key: data.parent.Name, value: data.parent.HubID};
          }
          $scope.locationPicker();
          $scope.isLoading = false;
          $rootScope.$emit('stopSpin');
      });
    }

    /**
     * Get all hubs
     * 
     * @return {void}
     */
    $scope.getHub = function() {
      $rootScope.$emit('startSpin');
      $scope.isLoading = true;
      Hub.get().$promise.then(function(data) {
        $scope.hubs = []; 
        data.hubs.forEach(function(hub) {
          $scope.hubs.push({key: hub.Name,value: hub.HubID});
        }) 
        $scope.displayed = data.hubs;
        $scope.isLoading = false;
        $rootScope.$emit('stopSpin');
      });
    }

    $scope.chooseParent = function(item) {
      $scope.hub.ParentHubID = item.value;
      $scope.parent = item;
    }

    $scope.loadManagePage = function() {
      $scope.getHub();
      if ($stateParams.hubID !== undefined) {
        $scope.getHubDetails();
        $scope.updatePage = true;
        $scope.addPage = false;
      } else {
        $scope.addPage = true;
        $scope.locationPicker();
      }
    }
    
    var createHub = function(callback) {
      var hub = {
        ParentHubID: $scope.hub.ParentHubID,
        Name: $scope.hub.Name,
    		Type: $scope.hub.Type,
    		Latitude: $scope.hub.Latitude,
    		Longitude: $scope.hub.Longitude,
    		Address1: $scope.hub.Address1,
    		Address2: $scope.hub.Address2,
    		City: $scope.hub.City,
    		State: $scope.hub.State,
    		Country: $scope.hub.Country,
    		ZipCode: $scope.hub.ZipCode,
    		CountryCode: null,
    		CityID: null,
    		StateID: null,
    		CountryID: null
      }
      console.log('create hub', hub);
      $rootScope.$emit('startSpin');
      Hub.createHub(hub)
        .$promise.then(function(response) {
          $rootScope.$emit('stopSpin');
          console.log('create hub response', response);
          if (response) {
            //var result = _.first(response.result)
            return callback(null, response)
          } else {
            return callback('failed')
          }
        })
        .catch(function() {
          $rootScope.$emit('stopSpin');
          return callback('failed')
        });
    }

    var updateHub = function(callback) {
      var hub = {
        HubID: $stateParams.hubID,
        ParentHubID: $scope.hub.ParentHubID,
        Name: $scope.hub.Name,
        Type: $scope.hub.Type,
        Latitude: $scope.hub.Latitude,
        Longitude: $scope.hub.Longitude,
        Address1: $scope.hub.Address1,
        Address2: $scope.hub.Address2,
        City: $scope.hub.City,
        State: $scope.hub.State,
        Country: $scope.hub.Country,
        ZipCode: $scope.hub.ZipCode,
        CountryCode: null,
        CityID: null,
        StateID: null,
        CountryID: null
      }
      console.log('update hub', hub);
      $rootScope.$emit('startSpin');
      Hub.updateHub(hub)
        .$promise.then(function(response) {
          $rootScope.$emit('stopSpin');
          console.log('update hub response', response);
          if (response) {
            //var result = _.first(response)
            return callback(null, response)
          } else {
            return callback('failed')
          }
        })
        .catch(function() {
          $rootScope.$emit('stopSpin');
          return callback('failed')
        });
    }

    /**
     * Create single hub
     * 
     * @return {void}
     */
    $scope.createHub = function() {
      createHub(function(err, hub) {        
        if (hub.status === false) {
          alert("error")
        };
        alert('Your hub ID:' + hub.data.HubID + ' has been successfully created.')
        $location.path('/dashboard');
      })
    }

    /**
     * Update single hub
     * 
     * @return {void}
     */
    $scope.updateHub = function() {
      console.log("update")
      updateHub(function(err, hub) {
        console.log(hub)
        if (hub.status === false) {
          alert("error")
        }
        alert('Your hub ID:' + hub.data.HubID + ' has been successfully updated.')
        $location.path('/dashboard');
      })
    }    

    /**
     * Delete single hub
     * 
     * @return {void}
     */
    $scope.deleteHub = function(id) {
      if ($window.confirm('Are you sure you want to delete this hub?')) {
        Hub.deleteHub({
            _id: id,
          })
          .$promise.then(function(result) {  
            alert("Success")
            $scope.getHub();
          }).catch(function() {
            alert("Failed")
          });
      }
    }
    
    $scope.callServer = function(state) {
      $scope.tableState = state;
      $scope.getHub();
      $scope.isFirstLoaded = true;
    }

    $scope.addHub = function() {
      window.location = '/add-hub';
    }

    $scope.editHub = function(id) {
      window.location = '/update-hub/' + id;
    }


    /**
     * Get locations
     * 
     * @return {void}
     */
    $scope.getCountries = function(val) {
      return $http.get('http://localhost:3000/location/country/', {
        params: {
          address: val
        }
      }).then(function(response){
        return response.data.countries.map(function(item){
          return item.Name;
        });
      });
    };
    $scope.getCountries();
    /*$scope.getCities = function(val) {
      return $http.get('http://localhost:3000/location/city/', {
        params: {
          address: val
        }
      }).then(function(response){
        return response.data.cities.map(function(item){
          return item.Name;
        });
      });
    };

    $scope.getStates = function(val) {
      return $http.get('http://localhost:3000/location/state/', {
        params: {
          address: val
        }
      }).then(function(response){
        return response.data.states.map(function(item){
          return item.Name;
        });
      });
    };


    $scope.getCities();
    $scope.getStates();*/

    $scope.loadManagePage();

  });
