var express = require('express');
const ProductModel = require('../models/ProductModel');
const CategoryModel = require('../models/CategoryModel');
const { checkSingleSession, checkMultipleSession, checkAdminSession, checkCustomerSession } = require('../middlewares/auth');
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



router.get('/', checkMultipleSession(['customer', 'admin', 'manager']), async (req, res) => {
   var productList = await ProductModel.find({}).populate('category');
   if (req.session.role == "customer"){
      res.render('product/indexUser', { productList, layout: 'layout2' });
   }
   else if (req.session.role == "manager"){
      res.render('product/index', { productList, layout: 'layout3' });
   }
   else
      res.render('product/index', { productList });
});

router.get('/allproduct', checkCustomerSession, async(req, res)=>{
   var productList = await ProductModel.find({}).populate('category');
   res.render('product/indexUser', { productList, layout: 'layout2' });
})

// const ITEMS_PER_PAGE = 10; // Số lượng sản phẩm trên mỗi trang

// router.get('/', checkMultipleSession(['customer', 'admin', 'manager']), async (req, res) => {
//     try {
//         let page = parseInt(req.query.page) || 1; // Trang hiện tại, mặc định là trang 1
//         const productListCount = await ProductModel.countDocuments({}); // Tổng số sản phẩm

//         const totalPages = Math.ceil(productListCount / ITEMS_PER_PAGE); // Tính tổng số trang

//         // Giới hạn số trang từ 1 đến totalPages
//         page = Math.max(1, Math.min(page, totalPages));

//         // Tính chỉ số bắt đầu của sản phẩm trong database
//         const startIndex = (page - 1) * ITEMS_PER_PAGE;

        

//         // Lấy danh sách sản phẩm cho trang hiện tại
//         const productList = await ProductModel.find({})
//             .populate('category')
//             .skip(startIndex)
//             .limit(ITEMS_PER_PAGE);

//          const pageNumbers = [];
//          for (let i = 1; i <= totalPages; i++) {
//             pageNumbers.push(i);
//          }
//         // Render view với danh sách sản phẩm và thông tin phân trang
//         if (req.session.role === "customer") {
//             res.render('product/indexUser', { productList, currentPage: page, totalPages, layout: 'layout2' });
//         } else if (req.session.role === "manager") {
//             res.render('product/index', { productList, currentPage: page, totalPages, layout: 'layout3' });
//         } else {
//             res.render('product/index', { productList, currentPage: page, totalPages });
//         }
//     } catch (err) {
//         console.error(err);
//         res.status(500).send('Internal Server Error');
//     }
// });

router.get('/detail/:id', async (req, res) =>{
   var id = req.params.id;
   var product = await ProductModel.findById(id).populate('category');
   res.render('product/detail', {product, layout: 'layout2' });
});

// router.get('dashboard', async(req, res)=>{
   
// })

router.get('/add', checkMultipleSession(['admin', 'manager']), async (req, res) =>
{
   var categoryList = await CategoryModel.find({});
   if (req.session.role == "manager"){
    res.render('product/add', {categoryList, layout: 'layout3'});
   }
   else
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

router.get('/edit/:id', checkMultipleSession(['admin', 'manager']), async (req, res) => {
    var id = req.params.id;
    var categoryList = await CategoryModel.find({});
    var product = await ProductModel.findById(id);
    if (req.session.role == "manager"){
   res.render('product/edit', { product, categoryList, layout:'layout3' });
    }
    else
    res.render('product/edit', { product, categoryList });
 })
 

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


// router.post('/addProduct/:id', async(req, res)=>{
//    var product = req.params.id;
//    var productData = await ProductModel.findById(product);
//    var quantity = req.body.quantity
//    var productPrice = productData.price
//    var total = productPrice * quantity;

//    var customer = req.session.id;
//    await CartModel.create({
//        customer: customer,
//        product : product,
//        quantity: quantity,
//        total: total,
//    })
//    res.render('/product')
// })


 router.get('/delete/:id', checkMultipleSession(['admin', 'manager']), async (req, res) => {
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
   else if (req.session.role == "manager"){
      res.render('product/index', { productList, layout: 'layout3' });
   }
   else
      res.render('product/index', { productList });
 });

 router.get('/sort/name', async (req, res)=>{
    var productList = await ProductModel.find().sort({name: 1}).populate('category');
    if (req.session.role == "customer"){
   res.render('product/indexUser', { productList, layout: 'layout2' });
    }
    else if (req.session.role == "manager"){
      res.render('product/index', { productList, layout: 'layout3' });
   }
    else
    res.render('product/index', {productList});
 });

 router.get('/sort/price', async (req, res)=>{
    var productList = await ProductModel.find().sort({price: 1}).populate('category');
    if (req.session.role == "customer"){
      res.render('product/indexUser', { productList, layout: 'layout2' });
    }
    else if (req.session.role == "manager"){
      res.render('product/index', { productList, layout: 'layout3' });
   }
    else
    res.render('product/index', {productList});
 });

module.exports = router;