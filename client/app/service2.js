'use strict';

angular.module('adminApp')
    .factory('Services2', function($resource, config) {
    return $resource(config.url + ':module/:submodule/:controller/:action/:id', {
        id: '@_id'
    }, {
        getHubs: {
            method: 'GET',
            params: {
                module: 'hub'
            },
        },
        getOneHub: {
            method: 'GET',
            params: {
                module: 'hub',
                id: null
            },
        },
        createHub: {
            method: 'POST',
            params: {
                module: 'hub',
            },
        },
        updateHub: {
            method: 'POST',
            params: {
                module: 'hub',
                id: null
            },
        },
        deleteHub: {
            method: 'DELETE',
            params: {
                module: 'hub',
                id: null
            },
        },
        saveZipcodes: {
            method: 'POST',
            params: {
                module: 'hub',
                controller: 'saveZipcodes',
                id: null
            },
        },
        getDistrict: {
            method: 'GET',
            params: {
                module: 'district'
            }
        },
        getDistrictMaster: {
            method: 'GET',
            params: {
                module: 'district-master'
            }
        },
        getMultipleDistricts: {
            method: 'GET',
            params: {
                module: 'district'
            }
        },
        getMultipleDistrictsMaster: {
            method: 'GET',
            params: {
                module: 'district-master',
            }
        },
        createDistrict: {
            method: 'POST',
            params: {
                module: 'district'
            }
        },
        updateDistrict: {
            method: 'POST',
            params: {
                module: 'district'
            }
        },
        deleteDistrict: {
            method: 'DELETE',
            params: {
                module: 'district'
            }
        },
        getDistrictZipCodes: {
            method: 'GET',
            params: {
                module: 'district',
                controller: 'zipcodes'
            }
        },
        addDistrictZipCodes: {
            method: 'POST',
            params: {
                module: 'district',
                controller: 'zipcodes'
            }
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
        getCities: {
            method: 'GET',
            params: {
                module: 'city'
            },
        },
        getOneCity: {
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
            },
        },
        updateCity: {
            method: 'POST',
            params: {
                module: 'city',
                id: null
            },
        },
        deleteCity: {
            method: 'DELETE',
            params: {
                module: 'city',
                id: null
            },
        },
        getDrivers: {
            method: 'GET',
            params: {
                module: 'driver'
            },
        },
        getOneDriver: {
            method: 'GET',
            params: {
                module: 'driver',
                id: null
            },
        },
        updateDriver: {
            method: 'POST',
            params: {
                module: 'driver',
                id: null
            },
        },
        getUserStatus: {
            method: 'GET',
            params: {
                module: 'status',
                controller: 'user',
            },
        },
        getWebstores: {
            method: 'GET',
            params: {
                module: 'webstore',
            },
        },
        getCutoffTimes: {
            method: 'GET',
            params: {
                module: 'webstore',
                submodule: 'cutoff'
            }
        },
        setCutoffTimes: {
            method: 'POST',
            params: {
                module: 'webstore',
                submodule: 'cutoff'
            }
        },
        getVehicles: {
            method: 'GET',
            params: {
                module: 'vehicle',
            },
        },
        getEcommercePrices: {
            method: 'GET',
            params: {
                module: 'ecommerce-price'
            },
        },
        saveEcommercePrice: {
            method: 'POST',
            params: {
                module: 'ecommerce-price',
                id: null
            },
        },
        deleteEcommercePrice: {
            method: 'DELETE',
            params: {
                module: 'ecommerce-price'
            }
        },
        getDistancePrices: {
            method: 'GET',
            params: {
                module: 'price',
                controller: 'distance'
            }
        },
        saveDistancePrice: {
            method: 'POST',
            params: {
                module: 'price',
                controller: 'distance'
            }
        },
        getStates: {
            method: 'GET',
            params: {
                module: 'state'
            },
        },
        getCountries: {
            method: 'GET',
            params: {
                module: 'country'
            },
        },
        getLogisticFees: {
            method: 'GET',
            params: {
                module: 'price',
                controller: 'logistic'
            }
        },
        updateMultipleLogisticFees: {
            method: 'POST',
            params: {
                module: 'price',
                controller: 'logistic'
            }
        },
        getAllCompanies: {
            method: 'GET',
            params: {
                module: 'company'
            }
        },
        getOrder: {
            method: 'GET',
            params: {
                module: 'order'
            },
        },
        getOrderDetails: {
            method: 'GET',
            params: {
                module: 'order',
                id: null
            },
        },
        updateAddress: {
            method: 'POST',
            params: {
                module: 'address',
                id: null
            },
        },
        getUserProfile: {
            method: 'GET',
            params: {
                module: 'user',
                controller: 'me'
            }
        },
        updateUserProfile: {
            method: 'POST',
            params: {
                module: 'user'
            }
        },
        getCODOrder: {
            method: 'GET',
            params: {
                module: 'codorder'
            },
        },
        getCODOrderDetails: {
            method: 'GET',
            params: {
                module: 'codorder',
                id: null
            },
        },
<<<<<<< HEAD
        returnCustomer: {
            method: 'POST',
            params: {
                module: 'order',
                controller: 'return-customer',
                id: null
            }
        },
        cancelOrder: {
            method: 'POST',
            params: {
                module: 'order',
                controller: 'cancel'
            }
        },
        copyCancelledOrder: {
            method: 'POST',
            params: {
                module: 'order',
                controller: 'copy-cancelled'
            }
        },
        reassignDriver: {
            method: 'POST',
            params: {
                module: 'order',
                controller: 'reassign'
            }
        },
        exportNormalOrders: {
            method: 'GET',
            params: {
                module: 'order',
                submodule: 'export',
                controller: 'normal'
            },
        },
        exportUploadableOrders: {
            method: 'GET',
            params: {
                module: 'order',
                submodule: 'export',
                controller: 'uploadable'
            },
        },
        exportCompletedOrders: {
            method: 'GET',
            params: {
                module: 'order',
                submodule: 'export',
                controller: 'completed'
            },
        },
        getZipcodes: {
            method: 'GET',
            params: {
                module: 'zip'
            },
        },
        getUsers: {
            method: 'GET',
            params: {
                module: 'user'
            }
        },
        getExistOrder: {
            method: 'GET',
            params: {
                module: 'order',
                controller: 'check-exist'
            }
        },
        getCODPayment: {
            method: 'GET',
            params: {
                module: 'codpayment'
            },
        },
        getCODPaymentDetails: {
            method: 'GET',
            params: {
                module: 'codpayment',
                id: null
            },
        }
    });
});
