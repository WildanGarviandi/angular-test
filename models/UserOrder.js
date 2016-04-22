'use strict';

module.exports = function(sequelize, DataTypes) {
    var UserOrder = sequelize.define('UserOrder', {});

    UserOrder = sequelize.define('UserOrder', {
        UserOrderID: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        UserOrderGuID: DataTypes.UUIDV4,
        UserID: DataTypes.INTEGER,
        DriverID: DataTypes.INTEGER,
        UserOrderNumber: DataTypes.STRING,
        PickupAddressID: DataTypes.INTEGER,
        DropoffAddressID: DataTypes.INTEGER,
        PickUpID: DataTypes.INTEGER,
        DropOffID: DataTypes.INTEGER,
        PickupTime: DataTypes.DATE,
        DropoffTime: DataTypes.DATE,
        PackageSizeID: DataTypes.INTEGER,
        RecipientMessage: DataTypes.STRING,
        OrderMessage: DataTypes.STRING,
        OrderVideoUrl: DataTypes.STRING,
        OrderBookingAmount: DataTypes.DECIMAL,
        OrderCost: DataTypes.DECIMAL,
        IsUserPromoCode: DataTypes.BOOLEAN,
        OrderStatusID: DataTypes.INTEGER,
        AddressLine1: DataTypes.STRING,
        Landmark: DataTypes.STRING,
        VerificationCode: DataTypes.STRING,
        Distance: DataTypes.DECIMAL,
        ETADelivery: DataTypes.INTEGER,
        IsTrunkeyOrder: DataTypes.BOOLEAN,
        IsRoutingComplete: DataTypes.BOOLEAN,
        WaitingTime: DataTypes.INTEGER,
        WaitingTimeCost: DataTypes.DECIMAL,
        FinalCost: DataTypes.DECIMAL,
        PackageQuantity: DataTypes.INTEGER,
        BookingTypeID: DataTypes.INTEGER,
        DeliveryInstructions: DataTypes.STRING,
        Share: DataTypes.DECIMAL,
        ContactID: {
            type: DataTypes.INTEGER,
            field: 'contactid'
        },
        ShipperAddressID: DataTypes.INTEGER,
        DeviceTypeID: DataTypes.INTEGER,
        OrderAccepted: DataTypes.INTEGER,
        WebOrderID: DataTypes.STRING,
        SearchDriverCount: DataTypes.INTEGER,
        PaymentMethod: DataTypes.STRING,
        PaymentType: DataTypes.INTEGER,
        TransactionValue: DataTypes.DECIMAL,
        DriverShare: {
            type: DataTypes.DECIMAL,
            field: 'driverShare'
        },
        LogisticShare: {
            type: DataTypes.DECIMAL,
            field: 'logisticShare'
        },
        FleetManagerID: {
            type: DataTypes.INTEGER,
            field: 'fleetManagerId'
        },
        PickupType: DataTypes.INTEGER,
        Rate: DataTypes.DECIMAL,
        TotalValue: DataTypes.DECIMAL,
        IncludeInsurance: DataTypes.BOOLEAN,
        RecipientName: DataTypes.STRING,
        RecipientPhone: DataTypes.STRING,
        RecipientSignature: DataTypes.STRING,
        RecipientPhoto: DataTypes.STRING,
        PackagePhoto: DataTypes.STRING,
        PackageWeight: DataTypes.DECIMAL,
        PackageVolume: DataTypes.DECIMAL,
        PackageWidth: DataTypes.INTEGER,
        PackageHeight: DataTypes.INTEGER,
        PackageLength: DataTypes.INTEGER,
        UseExtraHelper: DataTypes.BOOLEAN,
        WebstoreUserID: {
            type: DataTypes.INTEGER
        },
        NetDeliveryFee: DataTypes.DECIMAL,
        PriceMargin: DataTypes.DECIMAL,
        CurrentUserOrderRouteID: {
            type: DataTypes.INTEGER
        },
        PaidByParent: DataTypes.BOOLEAN,
    }, {
        tableName: 'UserOrder',
        timestamps: true,
        createdAt: 'CreatedDate',
        updatedAt: 'ModifiedDate'
    });

    return UserOrder;
};