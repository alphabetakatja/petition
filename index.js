const express = require("express");
const app = express();
const hb = require("express-handlebars");
const db = require("./utils/db");
const cookieSession = require("cookie-session");
// importing both fns from bcrypt
const { hash, compare } = require("./utils/bc");
// csurf -cross-site request forger
const csurf = require("csurf");
// handlebars
app.engine("handlebars", hb());
app.set("view engine", "handlebars");

// middleware that will run with any single route
app.use(express.static("./public"));

app.use(
    express.urlencoded({
        extended: false
    })
);

// cookies
app.use(
    cookieSession({
        secret: `I'm always angry.`,
        maxAge: 1000 * 60 * 60 * 24 * 14
    })
);

app.use(csurf());

app.use(function(req, res, next) {
    res.locals.csrfToken = req.csrfToken();
    res.setHeader("x-frame-options", "DENY");
    next();
});

// ******************************    ROUTES   **********************************
// ***** HOME ROUTE *****
app.get("/", (req, res) => {
    res.redirect("/register");
});

// ***** REGISTER ROUTE *****
app.get("/register", (req, res) => {
    res.render("register", {
        layout: "main"
    });
});

app.post("/register", (req, res) => {
    console.log("req body in /register: ", req.body);
    const firstName = req.body["first_name"];
    const lastName = req.body["last_name"];
    const email = req.body.email;
    let password = req.body.password;
    hash(password)
        .then(hashedPassword => {
            console.log("hash: ", hashedPassword);
            // return hashedPassword;
            db.registerUser(firstName, lastName, email, hashedPassword).then(
                results => {
                    console.log("registerUser fn results: ", results.rows[0]);
                    const userID = results.rows[0].id;

                    req.session.user = {
                        id: userID,
                        firstName: firstName,
                        lastName: lastName,
                        email: email,
                        password: hashedPassword
                    };
                    console.log(req.session.user);
                    res.redirect("/petition");
                }
            );
        })
        .catch(err => {
            console.log("error in register route: ", err);
            res.render("register", {
                errMessage: "Oooops something went wrong!",
                layout: "main"
            });
        });
});

// ***** LOGIN ROUTE *****
app.get("/login", (req, res) => {
    if (req.session.user) {
        res.redirect("/petition");
        return;
    }
    res.render("login", {
        layout: "main"
    });
});

app.post("/login", (req, res) => {
    console.log("req body in /login: ", req.body);
    const email = req.body.email;
    let password = req.body.password;
    db.getUserInfo(email)
        .then(results => {
            console.log("getUser results ", results.rows[0]);
            // const user = results.rows[0];
            let hashedPassword = results.rows[0].password;
            compare(password, hashedPassword)
                .then(match => {
                    console.log(match);
                    if (match) {
                        req.session.user = {};
                        req.session.user.id = results.rows[0].id;
                        // req.session.user.id = results.rows[0].id;
                        console.log("cookie login", req.session);
                        db.checkIfSigned(req.session.user.id)
                            .then(results => {
                                console.log(
                                    "checking if the user signed the petition: ",
                                    results.rows
                                );
                                if (results.rows.length > 0) {
                                    console.log(
                                        "the user has signed the petition"
                                    );
                                    //the user has signed petition!
                                    req.session.user.sigId = results.rows[0].id;
                                    // req.session.sigId = results.rows[0].id;
                                    res.redirect("/thank-you");
                                } else {
                                    res.redirect("/petition");
                                }
                            })
                            .catch(err => {
                                console.log("error in /login route", err);
                            });
                    } else {
                        // if the passwords don't match
                        res.render("login", {
                            layout: "main",
                            errMessage: "Passwords dont match, try again!"
                        });
                    }
                })
                .catch(err => {
                    console.log("err present in getUserPassword query: ", err);
                });
        })
        .catch(err => {
            console.log("err present in getUserInfo query: ", err);
            res.render("login", {
                layout: "main",
                errMessage: "bla!"
            });
        });
});

// ***** LOGOUT ROUTE *****
app.get("/logout", (req, res) => {
    // delete req.session.user;
    req.session = null;
    res.redirect("/login");
});

// ***** PETITION ROUTE *****
app.get("/petition", (req, res) => {
    res.render("petition", {
        layout: "main"
    });
});

app.post("/petition", (req, res) => {
    console.log("i am doing a post request");
    console.log("req: ", req.body);
    let signature = req.body["hidden-field"];
    let userID = req.session.user.id;
    db.addSignature(signature, userID)
        .then(results => {
            // console.log(results);
            req.session.user.sigId = results.rows[0].id;
            res.redirect("/thank-you");
        })
        .catch(err => {
            console.log("addSignature fn err: ", err);
            res.render("petition", {
                errMessage:
                    "Oooops something went wrong! Make sure you fill out the signature field!",
                layout: "main"
            });
        });
});

// ***** THANK-YOU ROUTE *****
app.get("/thank-you", (req, res) => {
    console.log("/thank-you route: ", req.session);
    console.log("sigID is: ", req.session.user.sigId);
    let getSignaturePromise = db.getSignature(req.session.user.sigId);
    let numberOfSignersPromise = db.getSignatureCount();
    Promise.all([getSignaturePromise, numberOfSignersPromise])
        .then(results => {
            console.log("results in thankyou promise all: ", results);
            console.log(
                "results in thankyou promise all: ",
                results[0].rows[0]
            );

            const signature = results[0].rows[0].signature;
            const signedCount = results[1].rows[0].count;
            console.log(signedCount);
            res.render("thankyou", {
                layout: "main",
                signature: signature,
                numOfSigners: signedCount
            });
        })
        .catch(err => {
            console.log("/thank-you route err: ", err);
            res.render("thankyou", {
                layout: "main",
                errMessage: "Oooops something went wrong! Try again..."
            });
        });
});

// ***** SIGNERS-LIST ROUTE *****
app.get("/signers-list", (req, res) => {
    db.getSigners()
        .then(results => {
            console.log("signers results:", results.rows[0]);
            let signers = results.rows;
            res.render("signerslist", {
                layout: "main",
                signers
            });
        })
        .catch(err => {
            console.log("err in /signers-list: ", err);
        });
});

// ***** PROFILE ROUTE *****
app.get("/profile", (req, res) => {
    res.render("profile", {
        layout: "main"
    });
});

app.listen(8080, () => console.log("Listening!"));
