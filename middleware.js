/// middleware functions
module.exports.requireLoggedOutUser = function(req, res, next) {
    if (req.session.user) {
        res.redirect("/petition");
    } else {
        next();
    }
};

module.exports.requireNoSignature = function(req, res, next) {
    if (req.session.user.sigId) {
        res.redirect("/thanks");
    } else {
        next();
    }
};

//
module.exports.requireSignature = function(req, res, next) {
    if (!req.session.user.sigId) {
        res.redirect("/petition");
    } else {
        next();
    }
};

exports.requireLoggedInUser = function(req, res, next) {
    if (!req.session.user && req.url != "/register" && req.url != "/login") {
        res.redirect("/register");
    } else {
        next();
    }
};
