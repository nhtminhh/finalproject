var express = require('express');
const ProductModel = require('../models/ProductModel');
const CategoryModel = require('../models/CategoryModel');
const { checkSingleSession, checkMultipleSession } = require('../middlewares/auth');
const { Model } = require('mongoose');
var router = express.Router();

//feature: show all product
//URL:  localhost:3000/product
//SQL: SELECT * FROM product
//IMPORTANCE: muse inlude "async", "await"
// router.get('/', async (req, res) =>{
//     var productList = await ProductModel.find({}).populate('category');
//     //load data
//     //res.send(productList);
//     //File location: views/product/index.hbs

//     // { layout: 'layout_name'} => set custom layout
//    //  res.render('product/index', {productList, layout: 'layout2'});
//     res.render('product/index', {productList});

// });

router.get('/', checkMultipleSession(['customer', 'admin', 'manager']), async (req, res) => {
   var productList = await ProductModel.find({}).populate('category');
   if (req.session.role == "customer"){
      res.render('product/indexUser', { productList, layout: 'layout2' });
   }
   else
      res.render('product/index', { productList });
});

router.get('/add', checkSingleSession, async (req, res) =>
{
    var categoryList = await CategoryModel.find({});
    res.render('product/add', {categoryList});
});

router.post('/add', async(req,res)=>{
    //get value from form: req.body
    var product = req.body
    await ProductModel.create(product);
    res.redirect('/product');


});

router.get('/edit/:id', async (req, res) => {
    var id = req.params.id;
    var product = await ProductModel.findById(id);
    res.render('product/edit', { product });
 })
 
 router.post('/edit/:id', async (req, res) => {
    var categoryList = await CategoryModel.find({});
    var id = req.params.id;
    var data = req.body;
    await ProductModel.findByIdAndUpdate(id, data);
    res.redirect('/product', {categoryList});
 })
 
 router.get('/delete/:id', async (req, res) => {
    var id = req.params.id;
    await ProductModel.findByIdAndDelete(id);
    res.redirect('/product');
 })

 router.post('/search', async (req, res) => {
    var kw = req.body.keyword;
    var productList = await ProductModel.find({name: new RegExp(kw, "i")}).populate('category') ;
    if (req.session.role == "customer"){
      res.render('product/indexUser', { productList, layout: 'layout2' });
   }
   else
      res.render('product/index', { productList });
 });

 router.get('/sort/name', async (req, res)=>{
    var productList = await ProductModel.find().sort({name: 1}).populate('category');
    res.render('product/index', {productList});
 });

 router.get('/sort/price', async (req, res)=>{
    var productList = await ProductModel.find().sort({price: 1}).populate('category');
    res.render('product/index', {productList});
 });

module.exports = router;