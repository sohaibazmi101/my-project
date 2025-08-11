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
    // NEW: Add a unique field for the auto-generated order number
    orderNumber: {
        type: String,
        unique: true,
    },
    paymentMethod: {
        type: String,
        // CORRECTED: Enum values must match frontend strings exactly
        enum: ['Cash on Delivery', 'UPI'],
        required: true,
    },
    status: {
        type: String,
        // CORRECTED: Enum values must match frontend strings exactly
        enum: ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'],
        default: 'Pending',
    },
    paymentStatus: {
        type: String,
        // CORRECTED: Enum values must match frontend strings
        enum: ['pending', 'completed', 'failed'],
        default: 'pending',
    },
}, { timestamps: true });

// NEW: Use a pre-save hook to generate the order number automatically
orderSchema.pre('save', async function(next) {
    // This hook only runs for new documents
    if (this.isNew) {
        try {
            // Find the most recently created order to get the last order number
            const lastOrder = await this.constructor.findOne({}, {}, { sort: { 'createdAt': -1 } });
            let nextNumber = 100001;

            if (lastOrder && lastOrder.orderNumber) {
                // Extract the number from the last order number (e.g., 'ORD100001' -> 100001)
                const lastNumber = parseInt(lastOrder.orderNumber.substring(3), 10);
                nextNumber = lastNumber + 1;
            }

            // Set the new order number on the current document
            this.orderNumber = `ORD${nextNumber}`;
            next();
        } catch (err) {
            // Pass any errors to the next middleware
            next(err);
        }
    } else {
        next();
    }
});

module.exports = mongoose.model('Order', orderSchema);
