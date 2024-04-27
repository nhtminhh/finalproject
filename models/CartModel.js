var mongoose = require('mongoose');
var CartSchema = mongoose.Schema(
    {      
        customer:{
            type: mongoose.SchemaTypes.ObjectId,
            ref: 'users'
        },
        products: [{     
            quantity: Number,
            name: String,
            price: Number,
            image: String
         }],
         status: String
    }
)

var CartModel = mongoose.model("carts", CartSchema, "carts");
module.exports = CartModel;