var express = require('express');
const { checkMultipleSession } = require('../middlewares/auth');
const CartModel = require('../models/CartModel');
var router = express.Router()

router.get('/', checkMultipleSession(['customer', 'admin', 'manager']), async (req, res) => {
    var orderList = await CartModel.find({ status: 'Ordered'}).populate('customer'); 

    if (req.session.role == "customer"){
        userId = req.session.userId;
        var orderCustomer = await CartModel.findOne({ customer: userId, status: 'Ordered'}).populate('customer');
        console.log(orderCustomer)
        res.render('order/indexUser', {orderCustomer, layout: 'layout2' });
    }

    else if (req.session.role == "manager"){
        res.render('order/index', {orderList, layout: 'layout3' });
    }
    else
    res.render('order/index', {orderList});
});


module.exports = router;