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
      var retype = userRegistration.retype;
      var password = userRegistration.password;
      if (password !== retype) {
         return res.render('auth/register', {layout: 'auth_layout', error: 'Retyped password does not match!' });
      }
      var existingUser = await UserModel.findOne({ email: userRegistration.email });
      if (existingUser) {
         return res.render('auth/register', { layout: 'auth_layout', error: 'Email already exists!' });
      }
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
            req.session.name = user.name;
            req.session.role = user.role;
            req.session.userId = user.id;
            var a = req.session.name;
            var b = req.session.role;
            var c = req.session.userId;
            console.log(a);
            console.log(b);
            console.log(c);
            // initialize session after login success
            req.session.name = user.name;
            req.session.role = user.role;
            req.session.userId = user.id;
            if (user.role == 'admin') {
               res.redirect('/product');
            } else if (user.role == 'manager') {
               res.redirect('/product')
            } else {
               res.redirect('/product/');
            }
         } else {
            return res.render('auth/login', {layout: 'auth_layout' ,error: 'Email or Password is wrong!!!' });
            

         }
      } else {
         return res.render('auth/login', {layout: 'auth_layout' , error: 'Email or Password is wrong!!!' });
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
   console.log(req.session.userId)

});

router.get('/manager/add', checkAdminSession, (req, res) => {
   res.render('manager/add')
});

router.post('/manager/add', checkAdminSession, async (req, res) =>{
   try {
      var userRegistration = req.body;
      var retype = userRegistration.retype;
      var password = userRegistration.password;
      if (password !== retype) {
         return res.render('manager/add', {error: 'Retyped password does not match!' });
      }
      var existingUser = await UserModel.findOne({ email: userRegistration.email });
      if (existingUser) {
         return res.render('manager/add', {error: 'Email already exists!' });
      }
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
      console.log(manager);
      res.redirect('/auth/manager')
   } catch (err) {
      res.send(err)
   }
});

router.get('/manager/edit/:id', checkAdminSession, async (req, res) =>{
   try {
      var id = req.params.id;
      var manager = await UserModel.findById(id);
      res.render('manager/edit', { manager });
   } catch (err) {
      res.send(err);
   }
});

router.post('/manager/edit/:id', checkAdminSession, async (req, res) =>{
   try {
      var id = req.params.id;
      var updatedManager = req.body;
      var manager = await UserModel.findById(id);
      if (!manager) {
         return res.status(404).send("Not found user");
      }
      if (updatedManager.email !== manager.email) {
         var existingUser = await UserModel.findOne({ email: updatedManager.email });
         if (existingUser) {
            return res.render('manager/edit', { manager, error: 'Email already exists!' });
         }
      }
      manager.name = updatedManager.name;
      manager.dob = updatedManager.dob;
      manager.gender = updatedManager.gender;
      manager.address = updatedManager.address;
      manager.email = updatedManager.email;
      await manager.save();
      res.redirect('/auth/manager');
   } catch (err) {
      res.send(err);
   }
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

router.get('/customer/edit/:id', checkAdminSession, async (req, res) =>{
   try {
      var id = req.params.id;
      var customer = await UserModel.findById(id);
      res.render('customer/edit', { customer });
   } catch (err) {
      res.send(err);
   }
});

router.post('/customer/edit/:id', checkAdminSession, async (req, res) =>{
   try {
      var id = req.params.id;
      var updatedCustomer = req.body;
      var customer = await UserModel.findById(id);
      if (!customer) {
         return res.status(404).send("Not found user");
      }
      if (updatedCustomer.email !== customer.email) {
         var existingUser = await UserModel.findOne({ email: updatedCustomer.email });
         if (existingUser) {
            return res.render('customer/edit', { customer, error: 'Email already exists!' });
         }
      }
      customer.name = updatedCustomer.name;
      customer.dob = updatedCustomer.dob;
      customer.gender = updatedCustomer.gender;
      customer.address = updatedCustomer.address;
      customer.email = updatedCustomer.email;
      await customer.save();
      res.redirect('/auth/customer');
   } catch (err) {
      res.send(err);
   }
});


//-----------------------DETAIL-------------------------------------------
router.get('/detail/:userId', async(req,res) =>{
   try {
      var id = req.params.userId;
      var user = await UserModel.findById(id);
      if (!user) {
          return res.status(404).send("User not found");
      }

      if (!req.session || !req.session.role) {
          return res.status(403).send("Unauthorized access");
      }
      if (req.session.role === 'customer') {
          return res.render('customer/detail', { user, layout: 'layout2' });
      } else if (req.session.role === 'manager') {
          return res.render('manager/detail', { user, layout: 'layout3' });
      } else {
          return res.render('admin/detail', { user });
      }
  } catch (error) {
      console.error("Error:", error);
      return res.status(500).send("Internal Server Error");
  }
});

router.get('/edit/:userId', async(req, res) => {
   try {
       var id = req.params.userId;
       var user = await UserModel.findById(id);

       if (!user) {
           return res.status(404).send("User not found");
       }

       if (req.session.role === 'customer') {
           res.render('auth/editProfile', { user, layout: 'layout2' });
       } else if (req.session.role === 'manager') {
           res.render('auth/editProfile', { user, layout: 'layout3' });
       } else {
           res.render('auth/editProfile', { user });
       }
   } catch (error) {
       console.error("Error:", error);
       return res.status(500).send("Internal Server Error");
   }
});

router.post('/edit/:userId', async (req, res) => {
   try {
      var userId = req.params.userId;
      var updatedUser = req.body;
      var user = await UserModel.findById(userId);
      if (!user) {
         return res.status(404).send("Not found user");
      }
      if (updatedUser.email !== user.email) {
         var existingUser = await UserModel.findOne({ email: updatedUser.email });
         if (existingUser) {
            // return res.render('auth/editProfile', { user, error: 'Email already exists!' });
            if (req.session.role === 'customer') {
               // res.render('auth/editProfile', { user, layout: 'layout2' });
               return res.render('auth/editProfile', { user, error: 'Email already exists!',  layout: 'layout2' });

           } else if (req.session.role === 'manager') {
               // res.render('auth/editProfile', { user, layout: 'layout3' });
               return res.render('auth/editProfile', { user, error: 'Email already exists!', layout: 'layout3' });
           } else {
               // res.render('auth/editProfile', { user });
               return res.render('auth/editProfile', { user, error: 'Email already exists!' });

           }
         }
      }
      user.name = updatedUser.name;
      user.dob = updatedUser.dob;
      user.gender = updatedUser.gender;
      user.address = updatedUser.address;
      user.email = updatedUser.email;
      await user.save();
      res.redirect('/product');
   } catch (err) {
      res.send(err);
   }
});



//-------------------------LOGOUT-------------------------------------
 router.get('/logout', (req, res) => {
   req.session.destroy();
   res.redirect("/auth/login");
});

module.exports = router;