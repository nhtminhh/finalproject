var express = require('express')
const CartModel = require('../models/CartModel');
const ProductModel = require('../models/ProductModel');
const { checkCustomerSession, checkMultipleSession } = require('../middlewares/auth');

var router = express.Router()

router.get('/', checkCustomerSession, async (req, res) => {
    try {
        userId = req.session.userId;
        var cartList = await CartModel.findOne({ customer: userId, status: 'Ordering'}).populate('customer');

        if (!cartList) {
            console.log('Cart not found for user:', userId);
            res.render('cart/index', { cartList: [], layout: 'layout2' });
            return;
        }
        
        const products = cartList.products?.map(product => {
            return {
                quantity: Number(product.quantity),
                name: product.name,
                price: Number(product.price),
                image: product.image,
                total: Number(product.quantity) * Number(product.price),
                id: product._id.toString(),
            }
        })
        
        res.render('cart/index', { cartList: products, layout: 'layout2' });
        console.log(userId)
        console.log(cartList)
    }
    catch (err) {
        console.error(err);
        res.status(500).send('Internal Server Error');
    }
});

router.post('/add', checkCustomerSession, async (req, res) => {
    console.log(req.body);
    var product = req.body.id;
    var productData = await ProductModel.findById(product);
    var quantity = req.body.quantity
    var productPrice = productData.price
    var productName = productData.name
    var productImage = productData.image
    // var total = productPrice * quantity;

    var customer = req.session.userId;
    let existsCart = await CartModel.findOne({ customer: customer, status: 'Ordering'});

    if (existsCart) {
        const existsProduct = existsCart.products.findIndex(p => p.name === productName && p.price === productPrice && p.image === productImage);
        let updateData;
        if (existsProduct !== -1) {
            existsCart.products[existsProduct].quantity = existsCart.products[existsProduct].quantity + Number(quantity)
            updateData = existsCart.products
        } else {
              updateData = [...existsCart.products, {
                quantity: quantity,
                name: productName,
                price: productPrice,
                image: productImage
            }]
        }

        await CartModel.findOneAndUpdate({ _id: existsCart._id }, {
            products: updateData
        })
    }
    else {
        await CartModel.create({
            customer: customer,
            status: 'Ordering',
            products: [{
                quantity: quantity,
                name: productName,
                price: productPrice,
                image: productImage
            }],
        })
    }
    res.redirect('/product');
})

router.post('/changeStatus', checkCustomerSession, async (req, res) => {
    var customer = req.session.userId;
    await CartModel.findOneAndUpdate({ customer: customer, status: 'Ordering' }, {status: "Ordered"})
    res.redirect('/product');
})

router.get('/delete/:id', checkCustomerSession, async (req, res) => {
    var id = req.params.id;
    var customer = req.session.userId;
    let existsCart = await CartModel.findOne({ customer: customer, status: 'Ordering'});
    if (existsCart) {
        const products = existsCart.products.filter(p => p._id.toString() !== id);
        await CartModel.findOneAndUpdate({ _id: existsCart._id }, {
            products
        })
    }
    res.redirect('/cart');
});

module.exports = router;


