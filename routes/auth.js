var express = require('express')
const UserModel = require('../models/UserModel');
var router = express.Router()

//import "bcryptjs" library
var bcrypt = require('bcryptjs');
var salt = 8;                     
//random value

router.get('/register', (req, res) => {
    res.render('auth/register', { layout: 'auth_layout' })
 })

 router.post('/register', async (req, res) => {
   try {
      var userRegistration = req.body;
      var hashpassword = bcrypt.hashSync(userRegistration.password, salt);
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
            var a = user.role
            var b = user.name;
            console.log(a);
            console.log(b);

            if (user.role == 'admin') {
               res.redirect('/admin');
            }
            else if(user.role == 'manager'){
               res.redirect('/manager')
            }
            else {
               res.redirect('/customer');
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
router.get('/manager', async (req, res) =>{
   var managerList = await UserModel.find({role: 'manager'});
   //load data
   res.render('manager/index', {managerList});
});

router.get('/manager/add', (req, res) => {
   res.render('manager/add')
});

router.post('/manager/add', async (req, res) =>{
   try {
      var userRegistration = req.body;
      var hashpassword = bcrypt.hashSync(userRegistration.password, salt);
      var user = {
         name: userRegistration.name,
         dob: userRegistration.dob,
         gender: userRegistration.gender,
         address: userRegistration.address,
         email: userRegistration.email,
         password: hashpassword,
         role: 'manager'
      }
      await UserModel.create(user);
      res.redirect('manager/index')
   } catch (err) {
      res.send(err)
   }
});

router.get('/manager/delete/:id', async (req, res) => {
   //req.params: get value by url
   var id = req.params.id;
   await UserModel.findByIdAndDelete(id);
   res.redirect('/auth/manager');
});


//--------------------READ ADMIN---------------------------------------
router.get('/admin', async (req, res) =>{
   var adminList = await UserModel.find({role: 'admin'});
   res.render('admin/index', {adminList});
});

//-----------------RUD CUSTOMER---------------------------------------
router.get('/customer', async (req, res) =>{
   var customerList = await UserModel.find({role: 'customer'});
   res.render('customer/index', {customerList});
});

router.get('/customer/delete/:id', async (req, res) => {
   var id = req.params.id;
   await UserModel.findByIdAndDelete(id);
   res.redirect('/auth/customer');
});

router.post('/customer/search', async (req, res) => {
   var keyword = req.body.keyword;
   var customerList = await UserModel.find({ name: new RegExp(keyword, "i")});
   res.render('customer/index', { customerList })
})



//-------------------------LOGOUT-------------------------------------
 router.get('/logout', (req, res) => {
   res.redirect("/auth/login");
});

module.exports = router;