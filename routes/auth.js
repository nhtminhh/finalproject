var express = require('express')
const UserModel = require('../models/UserModel');
var router = express.Router()
const moment = require('moment');


//import "bcryptjs" library
var bcrypt = require('bcryptjs');
const { checkAdminSession } = require('../middlewares/auth');
var salt = 8;                     
//random value

router.get('/register', (req, res) => {
    res.render('auth/register', { layout: 'auth_layout' })
 })

 router.post('/register', async (req, res) => {
   try {
      var userRegistration = req.body;
      var hashpassword = bcrypt.hashSync(userRegistration.password, salt);
      // var dobFormatted = moment(userRegistration.dob).format('DD/MM/YYYY');
      var user = {
         name: userRegistration.name,
         dob: userRegistration.dob,
         gender: userRegistration.gender,
         address: userRegistration.address,
         email: userRegistration.email,
         password: hashpassword,
         role: 'customer'
      }
      await UserModel.create(user);
      console.log(user);
      res.redirect('/auth/login')
   } catch (err) {
      res.send(err)
   }
})

 router.get('/login', (req, res) => {
    res.render('auth/login', { layout: 'auth_layout' })
 })


router.post('/login', async (req, res) => {
   try {
      var userLogin = req.body;
      var user = await UserModel.findOne({ email: userLogin.email })
      if (user) {
         var hash = bcrypt.compareSync(userLogin.password, user.password)
         if (hash) {
            //initialize session after login success
            req.session.name = user.name;
            req.session.role = user.role;
            req.session.id = user.id;
            var a = user.role
            var b = user.name;
            var c = user.id;
            console.log(a);
            console.log(b);
            console.log(c);

            if (user.role == 'admin') {
               res.redirect('/product');
            }
            else if(user.role == 'manager'){
               res.redirect('/product')
            }
            else {
               res.redirect('/product');
            }
         }
         else {
            res.redirect('/auth/login');
         }
      }
   } catch (err) {
      res.send(err)
   }
});

// -----------------------CRUD MANAGER--------------------------------
router.get('/manager', checkAdminSession, async (req, res) =>{
   var managerList = await UserModel.find({role: 'manager'});
   //load data
   res.render('manager/index', {managerList});
});

router.get('/manager/add', checkAdminSession, (req, res) => {
   res.render('manager/add')
});

router.post('/manager/add', checkAdminSession, async (req, res) =>{
   try {
      var userRegistration = req.body;
      var hashpassword = bcrypt.hashSync(userRegistration.password, salt);
      var manager = {
         name: userRegistration.name,
         dob: userRegistration.dob,
         gender: userRegistration.gender,
         address: userRegistration.address,
         email: userRegistration.email,
         password: hashpassword,
         role: 'manager'
      }
      await UserModel.create(manager);
      console.log(user);
      res.redirect('/manager/index')
   } catch (err) {
      res.send(err)
   }
});

router.get('/manager/edit/:id', checkAdminSession, async (req, res) =>{
   var id = req.params.id;
   var manager = await UserModel.findById(id);
   res.render('manager/edit', {manager})
});



router.get('/manager/delete/:id', checkAdminSession, async (req, res) => {
   //req.params: get value by url
   var id = req.params.id;
   await UserModel.findByIdAndDelete(id);
   res.redirect('/auth/manager');
});


//--------------------RU ADMIN---------------------------------------
router.get('/admin', checkAdminSession, async (req, res) =>{
   var adminList = await UserModel.find({role: 'admin'});
   res.render('admin/index', {adminList});
});

router.get('/admin/detail/:id', async (req, res) =>{
   var id = req.params.id;
   var admin = await UserModel.findById(id);
   res.render('admin/detail', {admin});
});


//-----------------RUD CUSTOMER---------------------------------------
router.get('/customer', checkAdminSession, async (req, res) =>{
   var customerList = await UserModel.find({role: 'customer'});
   res.render('customer/index', {customerList});
});

router.get('/customer/delete/:id', checkAdminSession, async (req, res) => {
   var id = req.params.id;
   await UserModel.findByIdAndDelete(id);
   res.redirect('/auth/customer');
});

router.post('/customer/search', checkAdminSession, async (req, res) => {
   var keyword = req.body.keyword;
   var customerList = await UserModel.find({ name: new RegExp(keyword, "i")});
   res.render('customer/index', { customerList })
})

router.get('/customer/detail/:id', async (req, res) =>{
   var id = req.body.id;
   var customer = await UserModel.findById(id);
   console.log(id);
   res.render('customer/detail', {customer, layout: 'layout2'});
});



//-------------------------LOGOUT-------------------------------------
 router.get('/logout', (req, res) => {
   req.session.destroy();
   res.redirect("/auth/login");
});

module.exports = router;