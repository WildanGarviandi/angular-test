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
            url: config.url + ':module/:hubID/:controller',
            params: {
                module: 'hub',
                controller: 'zipcode',
                hubID: null
            },
        },
        deleteZipcodes: {
            method: 'DELETE',
            url: config.url + ':module/:hubID/:controller',
            params: {
                module: 'hub',
                controller: 'zipcode',
                hubID: null
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
        bulkCurrentLocation: {
            method: 'GET',
            params: {
                module: 'driver',
                controller: 'bulk-current-location'
            },
        },
        getBulkDistance: {
            method: 'GET',
            params: {
                module: 'driver',
                controller: 'bulk-distance',
                id: null
            },
        },
        getFleets: {
            method: 'GET',
            params: {
                module: 'fleet'
            },
        },
        getOneFleet: {
            method: 'GET',
            params: {
                module: 'fleet',
                id: null
            },
        },
        createFleet: {
            method: 'POST',
            params: {
                module: 'fleet'
            },
        },
        updateFleet: {
            method: 'POST',
            params: {
                module: 'fleet',
                id: null
            },
        },
        getDriverSchedules: {
            method: 'GET',
            params: {
                module: 'driverschedule'
            },
        },
        createUnavailableDriverSchedule: {
            method: 'POST',
            params: {
                module: 'driverschedule',
                controller: 'unavailable',
            },
        },
        getOneDriverSchedule: {
            method: 'GET',
            params: {
                module: 'driverschedule',
                id: null
            },
        },
        updateDriverSchedule: {
            method: 'POST',
            params: {
                module: 'driverschedule',
                id: null,
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
        exportWebstore: {
            method: 'GET',
            params: {
                module: 'webstore',
                submodule: 'export'
            }
        },
        exportWebstoreTotalOrder: {
            method: 'GET',
            params: {
                module: 'webstore',
                submodule: 'export',
                controller: 'webstore-total-order'
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
            url: config.url + ':module/:controller/:merchantID',
            params: {
                module: 'price',
                controller: 'merchant',
                merchantID: null
            },
        },
        getLatestPriceDownload: {
            method: 'GET',
            params: {
                module: 'ecommerce-price',
                controller: 'latest-price-download'
            }
        },
        saveEcommercePrice: {
            method: 'POST',
            url: config.url + ':module/:controller/:merchantID',
            params: {
                module: 'price',
                controller: 'merchant',
                merchantID: null
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
        getPorts: {
            method: 'GET',
            params: {
                module: 'port'
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
        updateUserReferralCode: {
            method: 'POST',
            params: {
                module: 'user',
                controller: 'update-referral'
            }
        },
        exportReferral: {
            method: 'GET',
            params: {
                module: 'user',
                controller: 'export-referral'
            }
        },
        exportDailyDistance: {
            method: 'GET',
            params: {
                module: 'driver',
                submodule: 'export',
                controller: 'daily-distance'
            }
        },
        getAdminFeatures: {
            method: 'GET',
            params: {
                module: 'features',
            }
        },
        updateUserPassword: {
            method: 'POST',
            params: {
                module: 'change-password'
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
        exportTrips: {
            method: 'GET',
            params: {
                module: 'trip',
                submodule: 'export',
                controller: 'normal'
            }
        },
        exportStandardFormat: {
            method: 'GET',
            params: {
                module: 'order',
                submodule: 'export',
                controller: 'combined'
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
        getCODPaymentsUnpaid: {
            method: 'GET',
            params: {
                module: 'codpayment',
                controller: 'unpaid',
                id: null
            }
        },
        getCODPaymentDetails: {
            method: 'GET',
            params: {
                module: 'codpayment',
                id: null
            },
        },
        setCODPaymentManualPaid: {
            method: 'POST',
            params: {
                module: 'codpayment',
                controller: 'manualpaid'
            }
        },  
        createCODPayment: {
            method: 'POST',
            params: {
                module: 'codpayment'
            },
        },
        exportCODPayment: {
            method: 'GET',
            params: {
                module: 'codpayment',
                controller: 'export-csv'
            }
        },
        getCODOrdersNoPayment: {
            method: 'GET',
            params: {
                module: 'codorder',
                controller: 'nopayment',
                id: null
            }
        },
        getNoPaymentSummary: {
            method: 'GET',
            params: {
                module: 'codorder',
                controller: 'nopayment-summary'
            }
        },
        bulkMarkAsPaidToVendor: {
            method: 'POST',
            params: {
                module: 'codorder',
                controller: 'bulk-paid-vendor'
            }
        },
        getMainSLA: {
            method: 'GET',
            params: {
                module: 'dashboard',
                controller: 'sla'
            }
        },
        getMerchantSLA: {
            method: 'GET',
            params: {
                module: 'dashboard',
                controller: 'sla',
                id: null
            }
        },
        getMerchantStatusCount: {
            method: 'GET',
            url: config.url + ':module/:controller/:id/:pickupType',
            params: {
                module: 'dashboard',
                controller: 'sla',
            },
        },
        bulkSetDeliveredStatus: {
            method: 'POST',
            params: {
                module: 'order',
                controller: 'mark-as-delivered'
            }
        },
        bulkUpdateAll: {
            method: 'POST',
            params: {
                module: 'order',
                controller: 'bulk-update-all'
            }
        },
        bulkReassignFleet: {
            method: 'POST',
            params: {
                module: 'order',
                controller: 'bulk-reassign-fleet'
            }
        },
        getReturnedOrders: {
            method: 'GET',
            params: {
                module: 'returnedorder'
            },
        },
        getReturnedOrderDetails: {
            method: 'GET',
            params: {
                module: 'returnedorder',
                id: null
            },
        },
        exportReturnedOrders: {
            method: 'GET',
            params: {
                module: 'returnedorder',
                controller: 'export'
            },
        },
        updateCod: {
            method: 'POST',
            params: {
                module: 'order',
                controller: 'cod',
                id: null
            }
        },
        getGoal: {
            method: 'GET',
            params: {
                module: 'dashboard',
                controller: 'goal'
            }
        },
        setGoal: {
            method: 'POST',
            params: {
                module: 'dashboard',
                controller: 'goal'
            }
        },
        getDailyNewMerchants: {
            method: 'GET',
            params: {
                module: 'dashboard',
                controller: 'daily-new-merchant'
            }
        },
        getDailyTotalOrders: {
            method: 'GET',
            params: {
                module: 'dashboard',
                controller: 'daily-total-orders'
            }
        },
        getDailyTotalRevenue: {
            method: 'GET',
            params: {
                module: 'dashboard',
                controller: 'daily-total-revenue'
            }
        },
        getTopLocationOrder: {
            method: 'GET',
            params: {
                module: 'dashboard',
                controller: 'top-location-order'
            }
        },
        getTopActiveMerchant: {
            method: 'GET',
            params: {
                module: 'dashboard',
                controller: 'total-active-merchant'
            }
        },
        getTopInactiveMerchant: {
            method: 'GET',
            params: {
                module: 'dashboard',
                controller: 'total-inactive-merchant'
            }
        },
        getWebsiteAnalyticsList: {
            method: 'GET',
            params: {
                module: 'dashboard',
                controller: 'website-analytics-list'
            }
        },
        getWebSessionAnalytic: {
            method: 'GET',
            params: {
                module: 'dashboard',
                controller: 'web-session-analytic',
                id: null
            }
        },
        getReasonReturns: {
            method: 'GET',
            params: {
                module: 'reasonReturn'
            },
        },
        bulkSetReturnWarehouse: {
            method: 'POST',
            params: {
                module: 'order',
                controller: 'bulk-return-warehouse'
            }
        },
        bulkSetReturnSender: {
            method: 'POST',
            params: {
                module: 'order',
                controller: 'bulk-return-customer'
            }
        },
        getDeliveryDistributions: {
            method: 'GET',
            params: {
                module: 'report',
                controller: 'deliveryDistribution'
            }
        },
        bulkSetPickupStatus: {
            method: 'POST',
            params: {
                module: 'order',
                controller: 'bulk-pickup-orders'
            }
        },
        createWebstoreChild: {
            method: 'POST',
            url: config.url + ':module/:id/:controller',
            params: {
                module: 'webstore',
                id: null,
                controller: 'parent',
            },
        },
        deleteWebstoreChild: {
            method: 'DELETE',
            url: config.url + ':module/:childId/:controller/:parentId',
            params: {
                module: 'webstore',
                childId: null,
                controller: 'parent',
                parentId: null
            },
        },
        rerouteOrders: {
            method: 'POST',
            params: {
                module: 'trip',
                controller: 'redirect'
            }
        },
        getTrack: {
            method: 'GET',
            params: {
                module: 'webtrack',
                controller: 'token'
            }
        },
        bulkCancelOrderStatus: {
            method: 'POST',
            params: {
                module: 'order',
                controller: 'bulk-cancel'   
            }
        },
        getFleetZipCodes: {
            method: 'GET',
            params: {
                module: 'fleet',
                controller: 'zipcodes'
            }
        },
        setFleetZipCodes: {
            method: 'POST',
            url: config.url + ':module/:fleetID/:controller',
            params: {
                module: 'fleet',
                fleetID: null,
                controller: 'zipcodes'
            }
        },
        deleteFleetZipcodes: {
            method: 'DELETE',
            url: config.url + ':module/:fleetID/:controller',
            params: {
                module: 'fleet',
                fleetID: null,
                controller: 'zipcodes'
            }
        },
        bulkSetFleetPrices: {
            method: 'POST',
            url: config.url + ':module/:fleetID/:controller',
            params: {
                module: 'fleet',
                fleetID: null,
                controller: 'bulk-price'
            }
        },
        bulkSetMissingStatus: {
            method: 'POST',
            params: {
                module: 'order',
                controller: 'bulk-missing'
            }
        },
        bulkSetClaimedVendor: {
            method: 'POST',
            params: {
                module: 'order',
                controller: 'bulk-claimed-vendor'
            }
        },
        bulkSetClaimedMerchant: {
            method: 'POST',
            params: {
                module: 'order',
                controller: 'bulk-claimed-merchant'
            }
        },
        getAdminRoles: {
            method: 'GET',
            params: {
                module: 'admin',
                controller: 'roles',
                id: null
            }
        },
        getAdminList: {
            method: 'GET',
            params: {
                module: 'admin'
            }
        },
        getAdminDetail: {
            method: 'GET',
            url: config.url + ':module/:userID',
            params: {
                module: 'admin',
                userID: null
            }
        },
        getHubUser: {
            method: 'GET',
            url: config.url + ':module/:controller/:userID',
            params: {
                module: 'admin',
                controller: 'hub-user',
                userID: null
            }
        },
        createAdmin: {
            method: 'POST',
            params: {
                module: 'admin'
            }
        },
        updateAdmin: {
            method: 'POST',
            params: {
                module: 'admin',
                id: null
            }
        },
        updateHubAdmin: {
            method: 'POST',
            url: config.url + ':module/:controller/:userID',
            params: {
                module: 'admin',
                controller: 'update-hub-admin',
                userID: null
            }
        },
        bulkSetHub: {
            method: 'POST',
            params: {
                module: 'order',
                controller: 'redirect'
            }
        },
        getListPayoutAndInvoice: {
            method: 'GET',
            params: {
                module: 'order',
                controller: 'order-completed'
            }
        },
        getDetailPayoutAndInvoice: {
            method: 'GET',
            url: config.url + ':module/:controller/:orderID',
            params: {
                module: 'order',
                controller: 'order-complete-detail',
                orderID: null
            }
        },
        exportPayoutAndInvoice: {
            method: 'GET',
            params: {
                module: 'order',
                controller: 'order-completed-export'
            }
        },
        exportProfitAndLoss: {
            method: 'GET',
            params: {
                module: 'order',
                controller: 'finance-profit-loss-summary'
            }
        },
        exportOrderSummary: {
            method: 'GET',
            params: {
                module: 'order',
                controller: 'finance-order-summary'
            }
        },
        orderUpdatePriceAuto: {
            method: 'POST',
            params: {
                module: 'order',
                controller: 'update-price-auto'
            }
        },
        orderUpdatePriceManual: {
            method: 'POST',
            params: {
                module: 'order',
                controller: 'update-price-manual'
            }
        },
        exportStandardFormatJson: {
            method: 'GET',
            params: {
                module: 'order',
                submodule: 'export',
                controller: 'combinedJson'
            }
        },
        exportUploadableFormatJson: {
            method: 'GET',
            params: {
                module: 'order',
                submodule: 'export',
                controller: 'uploadableJson'
            }
        },
        exportOrderCheckpointJson: {
            method: 'GET',
            params: {
                module: 'order',
                submodule: 'export',
                controller: 'order-checkpoint'
            }
        },
        setRecpientPhoto: {
            method: 'POST',
            url: config.url + ':module/:controller/:orderID',
            params: {
                module: 'order',
                controller: 'upload-pod',
                orderID: null
            }
        },
        bulkMarkAsDelivered: {
            method: 'POST',
            params: {
                module: 'order',
                controller: 'bulk-mark-as-delivered'
            }
        },
        getAvailableDriversForDriverSchedule: {
            method: 'GET',
            params: {
                module: 'driverschedule',
                controller: 'available-drivers'
            }
        },
        bulkSetDestroyed: {
            method: 'POST',
            params: {
                module: 'order',
                controller: 'bulk-destroyed'
            }
        },
        bulkUpdateReturnWarehouse: {
            method: 'POST',
            params: {
                module: 'order',
                controller: 'bulk-change-return-warehouse'
            }
        },
        getEmptyOrders: {
            method: 'GET',
            params: {
                module: 'order',
                controller: 'empty-orders'
            }
        },
        createEmptyOrders: {
            method: 'POST',
            params: {
                module: 'order',
                controller: 'create-empty-orders'
            }
        },
        getAllFleets: {
            method: 'GET',
            params: {
                module: 'company',
                controller: 'fleet'
            }
        },
        getAuditTrails: {
            method: 'GET',
            url: config.url + ':module',
            params: {
                module: 'audit-trail'
            }
        }
    });
});
