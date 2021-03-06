'use strict';

angular.module('adminApp')
    .factory('Services', function($resource) {
    return $resource('/:module/:submodule/:controller/:action/:id', {
        id: '@_id'
    }, {
        get: {
            method: 'POST',
            params: {
                module: 'hubs',
                controller: 'show'
            },
        },
        getAll: {
            method: 'POST',
            params: {
                module: 'hubs',
                controller: 'all'
            },
        },
        getOne: {
            method: 'GET',
            params: {
                module: 'hubs',
                controller: 'one'
            },
        },
        createHub: {
            method: 'POST',
            params: {
                module: 'hubs',
                controller: 'create'
            },
        },
        updateHub: {
            method: 'POST',
            params: {
                module: 'hubs',
                controller: 'update'
            },
        },
        deleteHub: {
            method: 'POST',
            params: {
                module: 'hubs',
                controller: 'delete',
                id: null
            },
        },
        showCompanies: {
            method: 'GET',
            params: {
                module: 'company',
                controller: 'all'
            },
        },
        showWebstores: {
            method: 'GET',
            params: {
                module: 'webstore',
                controller: 'all'
            },
        },
        showLogisticPrices: {
            method: 'POST',
            params: {
                module: 'price',
                controller: 'logistic'
            },
        },
        saveLogisticFee: {
            method: 'POST',
            params: {
                module: 'price',
                controller: 'logistic',
                action: 'update'
            },
        },
        addZipCodes: {
            method: 'POST',
            params: {
                module: 'hubs',
                controller: 'add-zipcodes',
                id: null
            },
        },
        showCustomerPrices: {
            method: 'POST',
            params: {
               module: 'price',
               controller: 'customer'
            },
        },
        saveCustomerPrices: {
            method: 'POST',
            params: {
               module: 'price',
               controller: 'saveCustomer'
            },
        },
        getCountries: {
            method: 'GET',
            params: {
                module: 'location',
                controller: 'country'
            },
        },
        getStates: {
            method: 'GET',
            params: {
                module: 'location',
                controller: 'state'
            },
        },
        getCities: {
            method: 'GET',
            params: {
                module: 'location',
                controller: 'city'
            },
        },
        getCountryStates: {
            method: 'POST',
            params: {
                module: 'location',
                controller: 'states'
            }
        },
        getOneDistrictData: {
            method: 'GET',
            params: {
                module: 'districts',
                controller: 'one'
            }
        },
        getAllDistrictsData: {
            method: 'GET',
            params: {
                module: 'districts',
                controller: 'all'
            }
        },
        searchDistricts: {
            method: 'GET',
            params: {
                module: 'districts',
                controller: 'search'
            }
        },
        createDistrict: {
            method: 'POST',
            params: {
                module: 'districts',
                controller: 'create'
            },
        },
        updateDistrict: {
            method: 'PUT',
            params: {
                module: 'districts',
                controller: 'update'
            },
        },
        deleteDistrict: {
            method: 'DELETE',
            params: {
                module: 'districts',
                controller: 'delete'
            },
        },
        addDistrictZipCodes: {
            method: 'POST',
            params: {
                module: 'districts',
                controller: 'add-zipcodes'
            }
        },
        getAllWebstores: {
            method: 'GET',
            params: {
                module: 'webstore',
                controller: 'all'
            },
        },
        getWebstores: {
            method: 'POST',
            params: {
                module: 'webstore',
                controller: 'show'
            },
        },
        getWebstoreDetails: {
            method: 'GET',
            params: {
                module: 'webstore',
                controller: 'one'
            },
        },
        createWebstore: {
            method: 'POST',
            params: {
                module: 'webstore',
                controller: 'create'
            },
        },
        updateWebstore: {
            method: 'POST',
            params: {
                module: 'webstore',
                controller: 'update'
            },
        },
        getAllCities: {
            method: 'GET',
            params: {
                module: 'city',
                id: null
            },
        },
        createCity: {
            method: 'POST',
            params: {
                module: 'city',
                controller: 'create'
            },
        },
        updateCity: {
            method: 'POST',
            params: {
                module: 'city',
                controller: 'update'
            },
        },
        deleteCity: {
            method: 'POST',
            params: {
                module: 'city',
                controller: 'delete'
            },
        },
        getTrip: {
            method: 'GET',
            params: {
                module: 'trip'
            },
        },
        getTripDetails: {
            method: 'GET',
            params: {
                module: 'trip',
                id: null
            },
        },
        getStatus: {
            method: 'GET',
            params: {
                module: 'status'
            },
        },
        getVehicles: {
            method: 'GET',
            params: {
                module: 'price',
                controller: 'vehicles'
            }
        },
        getEcommercePrice: {
            method: 'POST',
            params: {
                module: 'price',
                controller: 'ecommerce'
            }
        },
        addEcommercePrice: {
            method: 'POST',
            params: {
                module: 'price',
                controller: 'ecommerce',
                action: 'save'
            }
        }
    });
});
