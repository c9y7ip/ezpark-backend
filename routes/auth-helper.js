
/**
 * Authentication function are used to secure routes
 */
function checkAuth(req, res, next) {
    // used for routes only for authenticated users
    if(req.isAuthenticated()){
        return next()
    } else {
        res.redirect('/auth');
    }
}

function checkNotAuth(req, res, next) {
    // used for routes we don't want authenticated users
    if(req.isAuthenticated()){
        res.redirect('/')
    } else {
        next();
    }
}

module.exports = {checkAuth, checkNotAuth};