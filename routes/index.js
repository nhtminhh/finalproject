var express = require('express');
var router = express.Router();
const { checkLoginSession } = require('../middlewares/auth');

router.get('/', checkLoginSession, function (req, res) {
  res.render('index', { layout: 'home_layout' });
});

router.get('/admin', (req, res) => {
  res.render('admin', {layout: 'layout'});
})

router.get('/customer', (req, res) => {
  res.render('customer', {layout: 'layout2'});
})

router.get('/manager', (req, res) => {
  res.render('manager', {layout: 'layout'});
})

module.exports = router;