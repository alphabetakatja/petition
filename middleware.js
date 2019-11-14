/// middleware functions
module.exports.requireLoggedOutUser = function(req, res, next) {
    if (req.session.user.id) {
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
    if (!req.session.user.id) {
        res.redirect("/");
    } else {
        next();
    }
};
