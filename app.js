var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
//3A. declare router (1 collection => 1 router)
var productRouter = require('./routes/product');
var categoryRouter = require('./routes/category');
var authRouter = require('./routes/auth');
var cartRouter = require('./routes/cart');
var orderRouter = require('./routes/order');


var app = express();

//import "express-session" library
var session = require('express-session');
//set session timeout
const timeout = 10000 * 60 * 60 * 24;  // 24 hours (in milliseconds)
//config session parameters
app.use(session({
  secret: "practice_makes_perfect",  // Secret key for signing the session ID cookie
  resave: false,                     // Forces a session that is "uninitialized" to be saved to the store
  saveUninitialized: true,           // Forces the session to be saved back to the session store
  cookie: { maxAge: timeout },
}));

//1.config mongoose library (connect and work with database)
//1.A connect db
var mongoose = require('mongoose');

//1.B set mongodb connection string
var database = "mongodb+srv://project:1234Wibu123@project.drkkgnx.mongodb.net/project";

//1.C connect to mongodb
mongoose.connect(database)
  .then(() => console.log('connect to db succeed! '))
  .catch((err) => console.log('Error: ' + err));

//2. config body-parser library (get data from client-side)
var bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({extended: false}));



// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

//make session value can be accessible in view (hbs)
//IMPORTANT: place this code before setting router url
app.use((req, res, next) => {
  res.locals.name = req.session.name;
  res.locals.userId = req.session.userId;
  res.locals.role = req.session.role;
  next();
});

//set user authorization for whole router
//IMPORTANT: place this code before setting router url

const { checkSingleSession, checkAdminSession, checkCustomerSession } = require('./middlewares/auth');
app.use('/category', checkSingleSession);
app.use('/product', checkSingleSession);
app.use('/cart', checkCustomerSession);
app.use('/order', checkSingleSession);



app.use('/', indexRouter);
//3B. declare URL (path) of routers
app.use('/category', categoryRouter);
app.use('/product', productRouter);
app.use('/auth', authRouter);
app.use('/cart', cartRouter);
app.use('/order', orderRouter);


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
