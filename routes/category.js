var express = require('express');
const CategoryModel = require('../models/CategoryModel');
const { checkAdminSession } = require('../middlewares/auth');
var router = express.Router();

//feature: show all category
//URL:  localhost:3000/category
//SQL: SELECT * FROM category
//IMPORTANCE: muse inlude "async", "await"
router.get('/', checkAdminSession, async (req, res) =>{
    var categoryList = await CategoryModel.find({});
    //load data
    res.render('category/index', {categoryList});
});

//SQL: DELETE FROM category WHERE id = 'id'
//router.get('/delete/:id', async(req, res) => {
//    await CategoryModel.findByIdAndDelete(req.params.id);
//    res.redirect('/category');
//});

router.get('/delete/:id', checkAdminSession, async (req, res) => {
   //req.params: get value by url
   var id = req.params.id;
   await CategoryModel.findByIdAndDelete(id);
   res.redirect('/category');
})

router.get('/add', checkAdminSession, (req, res) =>
{
    res.render('category/add');
});

router.post('/add', checkAdminSession, async(req,res)=>{
    //get value from form: req.body
    var category = req.body
    await CategoryModel.create(category);
    res.redirect('/category');
});

router.get('/edit/:id', checkAdminSession, async(req, res) =>
{
    var id = req.params.id;
    var category = await CategoryModel.findById(id);
    res.render('category/edit', {category});
});

router.post('/edit/:id', checkAdminSession, async(req,res)=>{
    var id = req.params.id
    var data = req.body;
    await CategoryModel.findByIdAndUpdate(id, data);
    res.redirect('/category');
});


module.exports = router;