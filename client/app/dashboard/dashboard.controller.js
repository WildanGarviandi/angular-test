'use strict';

angular.module('adminApp')
.controller('DashboardCtrl', 
    function(
        $scope,
        $location,
        $window,
        Services2,
        Services,
        $rootScope,
        Webstores,
        $filter,
        $http,
        lodash,
        $cookieStore,
        config,
        $state,
        $stateParams,
        Notification,
        $q
    ) {

    $scope.totalDays = 4;
    $scope.reloadTime = 900000;
    $scope.colours = ['#5cb85c','#d9534f','#f0ad4e','#66b3ff'];
    $scope.itemsByPage = 20;
    $scope.offset = 0;

    $scope.status = {
        key: 'All',
        value: 'All',
        count: 0
    };

    /**
     * Get values from cookies
     * 
     * @return {void}
     */
     $scope.initCookieValues = function() {
        $scope.activeGoal = $cookieStore.get('goal') || config.activeGoal;
        var activeMerchants = $cookieStore.get('merchants');
        if (typeof activeMerchants !== 'undefined') {
            activeMerchants.forEach(function(id, index) {
                $scope.activeMerchant.push({key: id});
            });
        } else {
            config.activeMerchant.forEach(function(id, index) {
                $scope.activeMerchant.push({key: id});
            });
        }
    }

    /**
     * Init data variables
     * 
     * @return {void}
     */
    $scope.initDataValues = function() {   
        for (var i = ($scope.totalDays * -1); i <= ($scope.totalDays); i++) {
            $scope.daysRange.push(i);
            if (i === 0) {
                $scope.labels.push(moment().add(i, 'days').format('dddd') + ' (Today)'); 
            } else {
                $scope.labels.push(moment().add(i, 'days').format('dddd')); 
            }
        }

        $scope.activeMerchant.forEach(function(val, index) {
            $scope.chartData.push({total: [], remaining: []});
            val.dataTotal = $scope.chartData[index].total;
            val.dataRemaining = $scope.chartData[index].remaining;
        });

        for (var i = 0; i < $scope.chartData.length; i++) {
            for (var j = 0; j < $scope.totalDays; j++) {
                $scope.chartData[i].total.push([])
                $scope.chartData[i].remaining.push([])
            }
        }
    }

    /**
     * Get default values from config
     * 
     * @return {void}
     */
    var getDefaultValues = function() {
        $http.get('config/defaultValues.json').success(function(data) {
            $scope.pickupTypes = data.pickupTypes;
            $scope.pickupTypes.forEach(function(pickupType) {
                $scope.series.push(pickupType.key);
            });
        });
    };

    /**
     * Set goal to the chosen item
     * 
     * @return {void}
     */
    $scope.setGoal = function(data) {
        $scope.activeGoal = data;
        $cookieStore.put('goal', $scope.activeGoal);
    }

    /**
     * Get merchant selection
     * 
     * @return {void}
     */
    $scope.getMerchants = function() {
        $rootScope.$emit('startSpin');
        $scope.isLoading = true;        
        return $q(function (resolve) {
            Webstores.getWebstore().$promise.then(function(data) { 
                data.data.webstores.forEach(function(merchant) {
                    $scope.merchants.push({
                        key: merchant.webstore.UserID,
                        value: merchant.webstore.FirstName + ' ' + merchant.webstore.LastName
                    });
                });
                $scope.isLoading = false;
                $rootScope.$emit('stopSpin');
                resolve();
            });
        });
    }

    /**
     * Assign merchant to the chosen item
     * 
     * @return {void}
     */
    $scope.chooseMerchant = function(data, index) {
        $scope.activeMerchant[index].key = data;
        $cookieStore.put('merchants', _.map($scope.activeMerchant, function(n) { return n.key; }));
        var merchantSelected = lodash.find($scope.activeMerchant, {key: data}); 
        $scope.getSummaryMerchantSLA(merchantSelected, index);
        $scope.getMerchantSLATotal(merchantSelected, index);
        $scope.getMerchantSLARemaining(merchantSelected, index);
    }

    /**
     * Show merchant
     * 
     * @return {void}
     */
    $scope.showMerchant = function(i) {
        var selected = $filter('filter')($scope.merchants, {key: $scope.activeMerchant[i].key});
        return ($scope.activeMerchant[i].key && selected.length) ? selected[0].value : 'Not set';
    };

    /**
     * Handler on merchant hover
     * 
     * @return {void}
     */
    $scope.onMerchantHover = function($index, orderCriteria) {
        $scope.merchantSelected = $scope.activeMerchant[$index].key; 
        $scope.chartSelected = orderCriteria; 
    }

    /**
     * Handler on bar click
     * 
     * @return {void}
     */
    $scope.onBarClick = function(points, evt) {
        var chart = points[0]._chart.controller;
        var activePoint = chart.getElementAtEvent(evt);
        var dataset = activePoint[0]._datasetIndex;
        var serie = $scope.series[dataset];
        var clickedElementindex = activePoint[0]['_index'];
        var pickupTypeSelected = lodash.find($scope.pickupTypes, {key: serie}); 
        $scope.detailsPage($scope.merchantSelected, $scope.chartSelected, pickupTypeSelected.value, indexToDate(clickedElementindex));      
    }

    /**
     * Go to details page
     * 
     * @return {void}
     */
    $scope.detailsPage = function(merchant, chartSelected, pickupType, date) {
        if (chartSelected === 'total') {
            $window.open('/dashboard-details-total/' + merchant + '/' + pickupType + '/' + date); 
        } else if (chartSelected === 'remaining') {
            $window.open('/dashboard-details-remaining/' + merchant + '/' + pickupType + '/' + date);             
        }    
    }

    /**
     * Convert index from chart into date
     * 
     * @return {Date}
     */
    function indexToDate(i) {
        var daysToAdd = i - $scope.totalDays;
        return moment().add(daysToAdd, 'days').format('YYYY-MM-DD');
    }

    /**
     * Init table state
     * 
     * @return {void}
     */
    $scope.callServer = function(state) {        
        $scope.offset = state.pagination.start;
        $scope.tableState = state;
        $scope.getOrder();
    }

    /**
     * Get status
     * 
     * @return {void}
     */
    $scope.getStatus = function() {
        Services2.getStatus().$promise.then(function(data) {
            $scope.statuses = []; 
            $scope.statuses.push($scope.status);
            data.data.rows.forEach(function(status) {
                if ($scope.showedStatus.indexOf(status.OrderStatusID) > -1) {
                    $scope.statuses.push({key: status.OrderStatus, value: status.OrderStatusID});
                }
            }); 
        });
    }

    /**
     * Get single webstore
     * 
     * @return {void}
     */
    $scope.getMerchantDetails = function(merchantID) {
        $rootScope.$emit('startSpin');
        $scope.isLoading = true;
        Webstores.getWebstoreDetails({
            id: merchantID,
        }).$promise.then(function(result) {
            var data = result.data;
            $scope.webstoreName = data.User.FirstName + ' ' + data.User.LastName;
            $scope.getOrder();
            $scope.getMerchantStatusCount();
            $scope.isLoading = false;
            $rootScope.$emit('stopSpin');
        });
    }

    /**
     * Get merchant status count
     * 
     * @return {void}
     */
    $scope.getMerchantStatusCount = function() {
        $rootScope.$emit('startSpin');
        $scope.isLoading = true;
        var params = {
            id: $stateParams.merchantID,
            pickupType: $stateParams.pickupType,
            date: $stateParams.date,
        }
        if ($state.current.name === 'app.dashboard-details-total') {
            params.param = 'CutOffTime';
        } else if ($state.current.name === 'app.dashboard-details-remaining') {
            params.param = 'DueTime';    
        }    
        Services2.getMerchantStatusCount(params).$promise.then(function(data) {
            $scope.statuses = []; 
            var countAll = data.data['BOOKED'] + data.data['ACCEPTED'] + data.data['PICKUP'] + data.data['IN-TRANSIT'] + 
                data.data['DELIVERED'] + data.data['NOTASSIGNED'] + data.data['CANCELLED'] + data.data['RETURNED_WAREHOUSE'] + 
                data.data['RETURNED_SENDER'];
            $scope.statuses.push({key: 'ALL', value: 'All', count: countAll, color: '#a6a6a6' });
            $scope.statuses.push({key: 'BOOKED', value: 1, count: data.data['BOOKED'], color: '#f0ad4e' });
            $scope.statuses.push({key: 'NOT ASSIGNED', value: 6, count: data.data['NOTASSIGNED'], color: '#f0ad4e' });
            $scope.statuses.push({key: 'ACCEPTED', value: 2, count: data.data['ACCEPTED'], color: '#f0ad4e' });
            $scope.statuses.push({key: 'PICKUP', value: 3, count: data.data['PICKUP'], color: '#f0ad4e' });
            $scope.statuses.push({key: 'IN-TRANSIT', value: 4, count: data.data['IN-TRANSIT'], color: '#f0ad4e' });
            $scope.statuses.push({key: 'RETURNED WAREHOUSE', value: 15, count: data.data['RETURNED_WAREHOUSE'], color: '#66b3ff' });
            $scope.statuses.push({key: 'RETURNED SENDER', value: 16, count: data.data['RETURNED_SENDER'], color: '#66b3ff' });
            $scope.statuses.push({key: 'CANCELLED', value: 13, count: data.data['CANCELLED'], color: '#ff5a60' });
            $scope.statuses.push({key: 'DELIVERED', value: 5, count: data.data['DELIVERED'], color: '#5cb85c' });
        });
    }

    /**
     * Get all orders
     * 
     * @return {void}
     */
    $scope.getOrder = function() {
        var params = {
            offset: $scope.offset,
            limit: $scope.itemsByPage,
            merchant: $scope.webstoreName,
            pickupType: $stateParams.pickupType,
            status: $scope.status.value 
        }
        if ($state.current.name === 'app.dashboard-details-total') {
            params.cutOffTime = $stateParams.date;
        } else if ($state.current.name === 'app.dashboard-details-remaining') {
            params.dueTime = $stateParams.date;            
        }    
        $rootScope.$emit('startSpin');
        $scope.isLoading = true;
        Services2.getOrder(params).$promise.then(function(data) {
            $scope.orderFound = data.data.count;
            $scope.displayed = data.data.rows;
            $scope.displayed.forEach(function (val, index, array) {
                array[index].PickupType = (lodash.find($scope.pickupTypes, {value: val.PickupType})).key;
                if ([1, 2, 3, 4, 6].indexOf(val.OrderStatus.OrderStatusID) > -1) {
                    array[index].Color = 'yellow';
                }
                if ([5].indexOf(val.OrderStatus.OrderStatusID) > -1) {
                    array[index].Color = 'green';
                }
                if ([15, 16].indexOf(val.OrderStatus.OrderStatusID) > -1) {
                    array[index].Color = 'blue';
                }
                if ([13].indexOf(val.OrderStatus.OrderStatusID) > -1) {
                    array[index].Color = 'red';
                }
            });
            $rootScope.$emit('stopSpin');
            $scope.isLoading = false;
            $scope.tableState.pagination.numberOfPages = Math.ceil(
                data.data.count / $scope.tableState.pagination.number);
        });
    }

    /**
     * Get main SLA
     * 
     * @return {void}
     */
    $scope.getMainSLA = function() {
        $rootScope.$emit('startSpin');
        $scope.isLoading = true;
        Services2.getMainSLA({
            start: moment().startOf('isoWeek').format('YYYY-MM-DD'),
            end: moment().endOf('isoWeek').format('YYYY-MM-DD')
        }).$promise.then(function(data) {
            $scope.summaryTotal = data.data.summary.total;
            $scope.summaryDelivered = data.data.summary.delivered;
            var acceptedSDS = 0
              , deliveredSDS = 0
              , acceptedNDS = 0
              , deliveredNDS = 0
              , acceptedODS = 0
              , deliveredODS = 0
              , acceptedREG = 0
              , deliveredREG = 0;
            data.data.SLA.forEach(function(day) {
                acceptedSDS += day.SDS.accepted;
                deliveredSDS += day.SDS.delivered;
                acceptedNDS += day.NDS.accepted;
                deliveredNDS += day.NDS.delivered;
                acceptedODS += day.ODS.accepted;
                deliveredODS += day.ODS.delivered;
                acceptedREG += day.REG.accepted;
                deliveredREG += day.REG.delivered;
            });
            $scope.samedaySLA = (acceptedSDS / deliveredSDS * 100) || 0;
            $scope.nextdaySLA = (acceptedNDS / deliveredNDS * 100) || 0;
            $scope.ondemandSLA = (acceptedODS / deliveredODS * 100) || 0;
            $scope.regularSLA = (acceptedREG / deliveredREG * 100) || 0;
            $scope.totalSLA = (data.data.summary.accepted / data.data.summary.delivered * 100) || 0;
            $scope.samedayColor = ($scope.samedaySLA > 90) ? 'green' : 'red';
            $scope.nextdayColor = ($scope.nextdaySLA > 90) ? 'green' : 'red';
            $scope.ondemandColor = ($scope.ondemandSLA > 90) ? 'green' : 'red';
            $scope.regularColor = ($scope.regularSLA > 90) ? 'green' : 'red';
            $scope.totalColor = ($scope.totalSLA > 90) ? 'green' : 'red';
            $scope.isLoading = false;
            $rootScope.$emit('stopSpin');
        });
    }

    /**
     * Get orders per day
     * 
     * @return {void}
     */
    $scope.getOrdersPerDay = function() {
        $rootScope.$emit('startSpin');
        $scope.isLoading = true;
        Services2.getMainSLA({
            start: moment().add(($scope.totalDays * -1), 'days').format('YYYY-MM-DD'),
            end: moment().add($scope.totalDays, 'days').format('YYYY-MM-DD'),
            param: 'CutOffTime'
        }).$promise.then(function(data) {
            data.data.SLA.forEach(function(sla, index) {
                $scope.ordersPerDay.push({
                    day: moment().add(index - $scope.totalDays, 'days').format('ddd MMM DD'),
                    total: sla.summary.total
                })
            });
        });
    }

    /**
     * Get merchant SLA
     * 
     * @return {void}
     */
    $scope.getMerchantSLATotal = function(merchant, merchantIndex) {
        $rootScope.$emit('startSpin');
        $scope.isLoading = true;
        Services2.getMerchantSLA({
            id: merchant.key,
            start: moment().add(($scope.totalDays * -1), 'days').format('YYYY-MM-DD'),
            end: moment().add($scope.totalDays, 'days').format('YYYY-MM-DD'),
            param: 'CutOffTime'
        }).$promise.then(function(data) {
            $scope.daysRange.forEach(function(i) {
                $scope.chartData[merchantIndex].total[0][i+$scope.totalDays] = data.data.SLA[i+$scope.totalDays].SDS.total;
                $scope.chartData[merchantIndex].total[1][i+$scope.totalDays] = data.data.SLA[i+$scope.totalDays].NDS.total;
                $scope.chartData[merchantIndex].total[2][i+$scope.totalDays] = data.data.SLA[i+$scope.totalDays].ODS.total;
                $scope.chartData[merchantIndex].total[3][i+$scope.totalDays] = data.data.SLA[i+$scope.totalDays].REG.total;
            });
            $scope.isLoading = false;
            $rootScope.$emit('stopSpin');
        });
    }

    /**
     * Get merchant SLA
     * 
     * @return {void}
     */
    $scope.getMerchantSLARemaining = function(merchant, merchantIndex) {
        $rootScope.$emit('startSpin');
        $scope.isLoading = true;
        Services2.getMerchantSLA({
            id: merchant.key,
            start: moment().add(($scope.totalDays * -1), 'days').format('YYYY-MM-DD'),
            end: moment().add($scope.totalDays, 'days').format('YYYY-MM-DD'),
            param: 'DueTime'
        }).$promise.then(function(data) {
            $scope.daysRange.forEach(function(i) {
                $scope.chartData[merchantIndex].remaining[0][i+$scope.totalDays] = data.data.SLA[i+$scope.totalDays].SDS.ongoing;
                $scope.chartData[merchantIndex].remaining[1][i+$scope.totalDays] = data.data.SLA[i+$scope.totalDays].NDS.ongoing;
                $scope.chartData[merchantIndex].remaining[2][i+$scope.totalDays] = data.data.SLA[i+$scope.totalDays].ODS.ongoing;
                $scope.chartData[merchantIndex].remaining[3][i+$scope.totalDays] = data.data.SLA[i+$scope.totalDays].REG.ongoing;
            });
            $scope.isLoading = false;
            $rootScope.$emit('stopSpin');
        });
    }

    /**
     * Get summary merchant SLA
     * 
     * @return {void}
     */
    $scope.getSummaryMerchantSLA = function(merchant, merchantIndex) {
        $rootScope.$emit('startSpin');
        $scope.isLoading = true;
        Services2.getMerchantSLA({
            id: merchant.key,
            start: moment().startOf('isoWeek').format('YYYY-MM-DD'),
            end: moment().endOf('isoWeek').format('YYYY-MM-DD')
        }).$promise.then(function(data) {
            $scope.activeMerchant[merchantIndex].summaryTotal = data.data.summary.total;
            $scope.activeMerchant[merchantIndex].summaryDelivered = data.data.summary.delivered;
            $scope.activeMerchant[merchantIndex].summaryApproach = data.data.summary.approaching;
            $scope.activeMerchant[merchantIndex].over = data.data.summary.over;
            var acceptedSDS = 0
              , deliveredSDS = 0
              , acceptedNDS = 0
              , deliveredNDS = 0
              , acceptedODS = 0
              , deliveredODS = 0
              , acceptedREG = 0
              , deliveredREG = 0;
            data.data.SLA.forEach(function(day) {
                acceptedSDS += day.SDS.accepted;
                deliveredSDS += day.SDS.delivered;
                acceptedNDS += day.NDS.accepted;
                deliveredNDS += day.NDS.delivered;
                acceptedODS += day.ODS.accepted;
                deliveredODS += day.ODS.delivered;
                acceptedREG += day.REG.accepted;
                deliveredREG += day.REG.delivered;
            });
            $scope.activeMerchant[merchantIndex].samedaySLA = (acceptedSDS / deliveredSDS * 100) || 0;
            $scope.activeMerchant[merchantIndex].nextdaySLA = (acceptedNDS / deliveredNDS * 100) || 0;
            $scope.activeMerchant[merchantIndex].ondemandSLA = (acceptedODS / deliveredODS * 100) || 0;
            $scope.activeMerchant[merchantIndex].regularSLA = (acceptedREG / deliveredREG * 100) || 0;
            $scope.activeMerchant[merchantIndex].totalSLA = (data.data.summary.accepted / data.data.summary.delivered * 100) || 0; 
            $scope.activeMerchant[merchantIndex].samedayColor = ($scope.activeMerchant[merchantIndex].samedaySLA > 90) ? 'green' : 'red';
            $scope.activeMerchant[merchantIndex].nextdayColor = ($scope.activeMerchant[merchantIndex].nextdaySLA > 90) ? 'green' : 'red';
            $scope.activeMerchant[merchantIndex].ondemandColor = ($scope.activeMerchant[merchantIndex].ondemandSLA > 90) ? 'green' : 'red';
            $scope.activeMerchant[merchantIndex].regularColor = ($scope.activeMerchant[merchantIndex].regularSLA > 90) ? 'green' : 'red';
            $scope.activeMerchant[merchantIndex].totalColor = ($scope.activeMerchant[merchantIndex].totalSLA > 90) ? 'green' : 'red';
            var merchantSelected = lodash.find($scope.merchants, {key: $scope.activeMerchant[merchantIndex].key});  
            if ((data.data.summary.approaching + data.data.summary.over) > 0) {         
                Notification.error({
                    message: 'Merchant ' + merchantSelected.value + ' has approaching SLA order: ' + 
                        data.data.summary.approaching + ' and over SLA order: ' + data.data.summary.over +
                        ' (' + $scope.currentWeekStart + ' - ' + $scope.currentWeekEnd + ')', 
                    title: 'Warning',
                    delay: $scope.reloadTime - 10000
                });
            }
            $scope.isLoading = false;
            $rootScope.$emit('stopSpin');
        });
    }

    /**
     * Filter order by status
     * 
     * @return {void}
     */
    $scope.filterByStatus = function(statusID) {
        $scope.status.value = statusID;
        $scope.offset = 0;
        $scope.tableState.pagination.start = 0;
        $scope.getOrder();
    }

    /**
     * Load main dashboard page
     * 
     * @return {void}
     */
    $scope.loadDashboardPage = function() {
        $scope.activeMerchant = [];
        $scope.chartData = [];
        $scope.daysRange = [];   
        $scope.labels = [];
        $scope.series = [];
        $scope.merchants = [];
        $scope.pickupTypes = [];
        $scope.currentWeek = moment().week();
        $scope.currentWeekStart = moment().startOf('isoWeek').format('MMM DD');
        $scope.currentWeekEnd = moment().endOf('isoWeek').format('MMM DD');
        $scope.ordersPerDay = [];
        if ($stateParams.merchantID !== undefined) {
            getDefaultValues();
            $scope.getMerchantDetails($stateParams.merchantID);
        } else {
            getDefaultValues();
            $scope.initCookieValues();
            $scope.initDataValues();
            $scope.getMerchants()
            .then(function () {
                $scope.getMainSLA();
                $scope.getOrdersPerDay();
                $scope.activeMerchant.forEach(function(merchant, index){
                    $scope.getSummaryMerchantSLA(merchant, index);
                    $scope.getMerchantSLATotal(merchant, index);
                    $scope.getMerchantSLARemaining(merchant, index);
                });
            });
        }
    }

    $scope.loadDashboardPage();
    setInterval(function () {
        $scope.$apply(function () {
            Notification.clearAll();
            $scope.loadDashboardPage();
        });
    }, $scope.reloadTime);
});