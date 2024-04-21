var express = require('express');
const ProductModel = require('../models/ProductModel');
const CategoryModel = require('../models/CategoryModel');
const { checkSingleSession, checkMultipleSession, checkAdminSession } = require('../middlewares/auth');
const { Model } = require('mongoose');
var router = express.Router();

var multer = require('multer');
var prefix = Date.now();

const storage = multer.diskStorage(
   {
      destination: (req, file, cb) => {
         cb(null, './public/images/'); //set image upload location
      },
      filename: (req, file, cb) => {
         let fileName = prefix + "_" + file.originalname; //set final image name
         cb(null, fileName);
      }
   }
);

const upload = multer({ storage: storage })

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

router.get('/detail/:id', async (req, res) =>{
   var id = req.params.id;
   var product = await ProductModel.findById(id).populate('category');
   res.render('product/detail', {product, layout: 'layout2' });
});

router.get('dashboard', async(req, res)=>{
   
})

   //var productQuantity = product.quantity;

router.get('/add', checkAdminSession, async (req, res) =>
{
    var categoryList = await CategoryModel.find({});
    res.render('product/add', {categoryList});
});

router.post('/add', upload.single('image'), async(req,res)=>{
   try{
      //get value from form: req.body
      var product = req.body
      product.image = prefix + "_" + req.file.originalname;
      product.sold = 0;
      await ProductModel.create(product);
      res.redirect('/product');
   }
   catch (err){
      if (err.name === 'ValidationError') {
         let InputErrors = {};
         for (let field in err.errors) {
            InputErrors[field] = err.errors[field].message;
         }
         res.render('product/add', { InputErrors, product });
      }
   }
});

router.get('/edit/:id', async (req, res) => {
    var id = req.params.id;
    var categoryList = await CategoryModel.find({});
    var product = await ProductModel.findById(id);
    res.render('product/edit', { product, categoryList });
 })
 
//  router.post('/edit/:id', upload.single('image'), async (req, res) => {
//    try{
//       var id = req.params.id;
//       var data = req.body;
//       var product = await ProductModel.findById(id);
//       product.image = prefix + "_" + req.file.originalname;
//       await ProductModel.findByIdAndUpdate(id, data);
//       res.redirect('/product');
//    }
//    catch(err){
//       if (err.name === 'ValidationError') {
//          let InputErrors = {};
//          for (let field in err.errors) {
//             InputErrors[field] = err.errors[field].message;
//          }
//          res.render('product/edit:id', { InputErrors, product });
//       }
//    }   
//  })

router.post('/edit/:id', upload.single('image'), async (req, res) => {
   try {
      var id = req.params.id;
      var data = req.body;
      var product = await ProductModel.findById(id);
      if (!product) {
         return res.status(404).send("Product not found");
      }
      // Kiểm tra xem có file được gửi kèm không
      if (req.file) {
         data.image = prefix + "_" + req.file.originalname;
      }

      // Kiểm tra tính hợp lệ của dữ liệu
      // (cần thêm logic kiểm tra validation ở đây)

      // Cập nhật dữ liệu vào database
      await ProductModel.findByIdAndUpdate(id, data);

      res.redirect('/product');
   } catch (err) {
      // Xử lý lỗi
      if (err.name === 'ValidationError') {
         let InputErrors = {};
         for (let field in err.errors) {
            InputErrors[field] = err.errors[field].message;
         }
         // Truyền dữ liệu cũ vào form edit
         var id = req.params.id;
         var categoryList = await CategoryModel.find({});
         var product = await ProductModel.findById(id);
         res.render('product/edit', { product, categoryList, InputErrors });
      } else {
         res.status(500).send("Internal Server Error");
      }
   }
});


 
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
    if (req.session.role == "customer"){
   res.render('product/indexUser', { productList, layout: 'layout2' });
    }
    else
    res.render('product/index', {productList});
 });

 router.get('/sort/price', async (req, res)=>{
    var productList = await ProductModel.find().sort({price: 1}).populate('category');
    if (req.session.role == "customer"){
      res.render('product/indexUser', { productList, layout: 'layout2' });
    }
    else
    res.render('product/index', {productList});
 });

module.exports = router;