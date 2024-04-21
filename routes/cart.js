var express = require('express')
const CartModel = require('../models/CartModel');
var router = express.Router()

router.get('/', async (req, res) =>{
    var cartList = await CartModel.find({});
    res.render('cart/index', {cartList, layout: 'layout2'});
});

module.exports = router;