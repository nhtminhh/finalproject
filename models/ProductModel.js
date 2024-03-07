var mongoose = require('mongoose');
var ProductSchema = mongoose.Schema(
    {
        name: {
            type: String,
            minLength: [3, "Product name can not be smaller than 3 chracters"],
            maxLength: [20, "Product name can not be longer than 20 chracters"]
        },
        price: Number,
        remaining: Number,
        sold: Number,
        image: String,
        category: {           //"category"    : name of reference field
            type: mongoose.SchemaTypes.ObjectId,
            ref: 'categories'  //"categories"  : name of reference collection
         }
    }
)

var ProductModel = mongoose.model("products", ProductSchema, "products");
module.exports = ProductModel; 