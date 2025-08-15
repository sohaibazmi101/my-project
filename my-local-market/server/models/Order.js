const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    customer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Customer',
        required: true,
    },
    shop: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Shop',
        required: true,
    },
    products: [{
        product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product',
            required: true,
        },
        quantity: {
            type: Number,
            required: true,
            min: 1,
        },
    }],
    totalAmount: {
        type: Number,
        required: true,
    },
    deliveryCharge: {
        type: Number,
        default: 0,
    },
    platformFee: {
        type: Number,
        default: 0,
    },
    customerLocation: {
        lat: Number,
        lon: Number,
    },
    orderNumber: {
        type: String,
        unique: true,
    },
    paymentMethod: {
        type: String,
        enum: ['Cash on Delivery', 'UPI'],
        required: true,
    },
    status: {
        type: String,
        enum: ['Pending', 'PickedUp', 'Delivered', 'Cancelled'],
        default: 'Pending',
    },
    paymentStatus: {
        type: String,
        enum: ['pending', 'success', 'failed'],
        default: 'pending',
    },
    assignedDeliveryBoy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'DeliveryBoy',
    },
    secretCode: {
        type: String,
    },
}, { timestamps: true });

orderSchema.pre('save', async function(next) {
    if (this.isNew) {
        try {
            const lastOrder = await this.constructor.findOne({}, {}, { sort: { 'createdAt': -1 } });
            let nextNumber = 100001;

            if (lastOrder && lastOrder.orderNumber) {
                const lastNumber = parseInt(lastOrder.orderNumber.substring(3), 10);
                nextNumber = lastNumber + 1;
            }
            this.orderNumber = `ORD${nextNumber}`;

            // Generate 6-digit secret code
            this.secretCode = Math.floor(100000 + Math.random() * 900000).toString();

            next();
        } catch (err) {
            next(err);
        }
    } else {
        next();
    }
});

module.exports = mongoose.model('Order', orderSchema);
