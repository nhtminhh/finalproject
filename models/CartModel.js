var mongoose = require('mongoose');
var CartSchema = mongoose.Schema(
    {
        total: Number,
        quantity: Number,
        customer:{
            type: mongoose.SchemaTypes.ObjectId,
            ref: 'user'
        },
        product: {           //"product"    : name of reference field
            type: mongoose.SchemaTypes.ObjectId,
            ref: 'products'  //"products"  : name of reference collection
         }
    }
)

var CartModel = mongoose.model("carts", CartSchema, "carts");
module.exports = CartModel;