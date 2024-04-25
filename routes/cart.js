var express = require('express')
const CartModel = require('../models/CartModel');
const ProductModel = require('../models/ProductModel');
const { checkCustomerSession } = require('../middlewares/auth');

var router = express.Router()

router.get('/', checkCustomerSession, async (req, res) =>{
    try{
        userId = req.session.userId;
        var cartList = await CartModel.find({customer: userId}).populate('product').populate('customer');
        res.render('cart/index', {cartList, layout: 'layout2'});
        console.log(userId)
        // console.log(cartList)
    }
    catch(err){
        console.error(err);
        res.status(500).send('Internal Server Error');
    }
});

router.post('/add', checkCustomerSession, async(req, res)=>{
    var product = req.body.id;
    var productData = await ProductModel.findById(product);
    var quantity = req.body.quantity
    var productPrice = productData.price
    var total = productPrice * quantity;

    var customer = req.session.id;
    await CartModel.create({
        customer: customer,
        product : product,
        quantity: quantity,
        total: total,
    })
    res.render('/product')
})

router.get('/delete/:id', checkCustomerSession, async (req, res) =>{
    var id = req.params.id;
    await CartModel.findByIdAndDelete(id);
    res.redirect('/cart');
});

module.exports = router;