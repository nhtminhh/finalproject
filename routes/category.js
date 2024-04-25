var express = require('express');
const CategoryModel = require('../models/CategoryModel');
const { checkSingleSession, checkMultipleSession, checkAdminSession } = require('../middlewares/auth');
var router = express.Router();

//feature: show all category
//URL:  localhost:3000/category
//SQL: SELECT * FROM category
//IMPORTANCE: muse inlude "async", "await"
router.get('/', checkMultipleSession(['admin', 'manager']), async (req, res) =>{
    var categoryList = await CategoryModel.find({});
    //load data
    if (req.session.role == "manager"){
        res.render('category/index', {categoryList, layout: 'layout3'});
    }
    else
        res.render('category/index', {categoryList});
});

//SQL: DELETE FROM category WHERE id = 'id'
//router.get('/delete/:id', async(req, res) => {
//    await CategoryModel.findByIdAndDelete(req.params.id);
//    res.redirect('/category');
//});

router.get('/delete/:id', checkMultipleSession(['admin', 'manager']), async (req, res) => {
   //req.params: get value by url
   var id = req.params.id;
   await CategoryModel.findByIdAndDelete(id);
   res.redirect('/category');
})

router.get('/add', checkMultipleSession(['admin', 'manager']), (req, res) =>
{
    if (req.session.role == "manager"){
    res.render('category/add', {layout: 'layout3'});
    }
    else
    res.render('category/add');
});

router.post('/add', checkMultipleSession(['admin', 'manager']), async(req,res)=>{
    //get value from form: req.body
    var category = req.body
    await CategoryModel.create(category);
    res.redirect('/category');
});

router.get('/edit/:id', checkMultipleSession(['admin', 'manager']), async(req, res) =>
{
    var id = req.params.id;
    var category = await CategoryModel.findById(id);
    if (req.session.role == "manager"){
    res.render('category/edit', {category, layout:'layout3'});
    }
    else
    res.render('category/edit', {category});
});

router.post('/edit/:id', checkMultipleSession(['admin', 'manager']), async(req,res)=>{
    var id = req.params.id
    var data = req.body;
    await CategoryModel.findByIdAndUpdate(id, data);
    res.redirect('/category');
});


module.exports = router;