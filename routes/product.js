var express = require('express');
const ProductModel = require('../models/ProductModel');
const CategoryModel = require('../models/CategoryModel');
var router = express.Router();

//feature: show all product
//URL:  localhost:3000/product
//SQL: SELECT * FROM product
//IMPORTANCE: muse inlude "async", "await"
router.get('/', async (req, res) =>{
    var productList = await ProductModel.find({}).populate('category');
    //load data
    //res.send(productList);
    //File location: views/product/index.hbs

    // { layout: 'layout_name'} => set custom layout
    res.render('product/index', {productList, layout: 'layout2'});
});

router.get('/add', async (req, res) =>
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

module.exports = router;