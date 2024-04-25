var mongoose = require('mongoose');
var OrderSchemes = mongoose.Schema({
    name: {
        type: String
    },
    
    
    
    }
);
var CategoryModel = mongoose.model("orders", CategorySchema, "orders");
//Note: "categories" is collection name
module.exports = CategoryModel;
