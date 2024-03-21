//check login only
const checkLoginSession = (req, res, next) => {
    if (req.session.name) {
       next();
    } else {
       res.redirect('/auth/login');
    }
 }
 
 //check single role
 const checkSingleSession = (req, res, next) => {
    if (req.session.name && req.session.role == 'admin', 'manager') {
       next();
    }
    else {
       res.redirect('/auth/login');
       return;
    }
 }
 
 //check multiple roles
 const checkMultipleSession = (allowedRoles) => (req, res, next) => {
    if (req.session.name && allowedRoles.includes(req.session.role)) {
       next();
    } else {
       res.redirect('/auth/login');
    }
 }
 
 module.exports = {
    checkLoginSession,
    checkSingleSession,
    checkMultipleSession
 }
 
 