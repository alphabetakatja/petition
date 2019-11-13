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
    console.log("firstName: ", firstName);
    const email = req.body.email;
    let password = req.body.password;
    hash(password)
        .then(hashedPassword => {
            console.log("hash: ", hashedPassword);
            // return hashedPassword;
            db.registerUser(firstName, lastName, email, hashedPassword)
                .then(results => {
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
                    res.redirect("/profile");
                })
                .catch(err => {
                    console.log("error in registerUser fn: ", err);
                    res.render("register", {
                        errMessage: "Oooops something went wrong!",
                        layout: "main"
                    });
                });
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
            let hashedPassword = results.rows[0].password;

            compare(password, hashedPassword)
                .then(match => {
                    console.log(match);
                    if (match) {
                        req.session.user = {};
                        req.session.user.id = results.rows[0].id;
                        req.session.user.sigId = results.rows[0].sigid;
                        console.log(
                            "checking if the user signed the petition: ",
                            results.rows
                        );

                        if (req.session.user.sigId != null) {
                            console.log("the user has signed the petition");
                            //the user has signed petition!
                            res.redirect("/thank-you");
                        } else {
                            res.redirect("/profile");
                        }
                    } else {
                        // if the passwords don't match
                        console.log("The passwords don't match!");
                        res.render("login", {
                            layout: "main",
                            errMessage: "Passwords don't match, try again!"
                        });
                    }
                })
                .catch(err => {
                    console.log("err present in getUserPassword query: ", err);
                });
            // ovdje zavrsava comment out
        })
        .catch(err => {
            console.log("err present in getUserInfo query: ", err);
            res.render("login", {
                layout: "main",
                errMessage:
                    "Something went wrong! Please type in your username and password again..."
            });
        });
});

// ***** LOGOUT ROUTE *****
app.get("/logout", (req, res) => {
    // delete req.session.user;
    req.session = null;
    // res.redirect("/login");
    res.render("logout", {
        layout: "main"
    });
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
            console.log("getSigners results:", results.rows);
            let signers = results.rows;
            res.render("signerslist", {
                layout: "main",
                signers
            });
        })
        .catch(err => {
            console.log("err in /signerslist route: ", err);
        });
});

app.get("/signers-list/:city", (req, res) => {
    const { city } = req.params;
    console.log(req.params.city);
    db.getSignersByCity(city).then(results => {
        console.log("getSignersByCity result: ", results.rows);
        res.render("signerslist", {
            layout: "main",
            signers: results.rows
        });
    });
});

// ***** PROFILE ROUTE *****
app.get("/profile", (req, res) => {
    res.render("profile", {
        layout: "main"
    });
});

app.post("/profile", (req, res) => {
    console.log("i am doing a post profile request");
    console.log("req: ", req.body);
    let age = req.body.age;
    let city = req.body.city;
    let homepage = req.body.url;
    let userID = req.session.user.id;

    const checkUrl = function(url) {
        if (
            !url.startsWith("http://") &&
            !url.startsWith("https://") &&
            !url.startsWith("//")
        ) {
            url = "http://" + url;
        }
        return url;
    };

    db.addProfile(age, city, checkUrl(homepage), userID)
        .then(results => {
            console.log("results in addProfile function: ", results.rows[0]);
            res.redirect("/petition");
        })
        .catch(err => {
            console.log("error in addProfile fn: ", err);
        });
});

// ***** EDIT PROFILE ROUTE *****
app.get("/profile/edit", (req, res) => {
    console.log("user cookie in get edit profile: ", req.session.user);
    let userID = req.session.user.id;
    db.editProfile(userID)
        .then(results => {
            console.log(
                "information pulled from editProfile fn: ",
                results.rows[0]
            );
            res.render("edit", {
                layout: "main",
                firstName: results.rows[0].firstname,
                lastName: results.rows[0].lastname,
                email: results.rows[0].email,
                age: results.rows[0].age || null,
                city: results.rows[0].city || null,
                url: results.rows[0].url || null
            });
        })
        .catch(err => {
            console.log("error in get edit profile route: ", err);
            res.render("edit", {
                layout: "main",
                errMessage:
                    "Sorry, something went wrong while editing your profile. Try again later..."
            });
        });
});

app.post("/profile/edit", (req, res) => {
    console.log("post route in edit profile: ", req.body);
    console.log("post route in edit profile cookie: ", req.session.user);
    let firstName = req.body["first_name"];
    let lastName = req.body["last_name"];
    let email = req.body.email;
    // let age = req.body.age;
    // let city = req.body.city;
    // let url = req.body.url;
    let userID = req.session.user.id;
    if (req.body.password == "") {
        db.updateProfileWithoutPass(firstName, lastName, email, userID)
            .then(results => {
                console.log("Profile updated without password: ", results.rows);
            })
            .catch(err => {
                console.log(
                    "There's an error in updateProfileWithoutPass: ",
                    err
                );
            });
    }
});

app.listen(process.env.PORT || 8080, () => console.log("Listening!"));
