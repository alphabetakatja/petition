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
    res.setHeader("x-frame-options", "DENY");
    res.locals.csrfToken = req.csrfToken();
    next();
});

// routes
app.get("/", (req, res) => {
    res.redirect("/petition");
});

app.get("/petition", (req, res) => {
    res.render("petition", {
        layout: "main"
    });
});

app.post("/petition", (req, res) => {
    console.log("i am doing a post request");
    console.log("req: ", req.body);
    let firstName = req.body["first-name"];
    let lastName = req.body["last-name"];
    let signature = req.body["hidden-field"];
    db.addSignature(firstName, lastName, signature)
        .then(results => {
            // console.log(results);
            req.session.sigId = results.rows[0].id;
            res.redirect("/thank-you");
        })
        .catch(err => {
            console.log("add-signature err: ", err);
            res.render("petition", {
                message: "Oooops something went wrong!",
                layout: "main"
            });
        });
});

app.get("/thank-you", (req, res) => {
    console.log("/thankyou route: ", req.session);
    console.log("sigID is: ", req.session.sigId);
    let getSignaturePromise = db.getSignature(req.session.sigId);
    let numberOfSignersPromise = db.getSignatureCount();
    Promise.all([getSignaturePromise, numberOfSignersPromise])
        .then(results => {
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
        });
});

app.get("/signers-list", (req, res) => {
    db.getSigners()
        .then(results => {
            console.log("signers results:", results.rows[0]);
            let signers = results.rows[0];
            res.render("signerslist", {
                layout: "main",
                signers
            });
        })
        .catch(err => {
            console.log("err in /signers-list: ", err);
        });
});

app.get("/login", (req, res) => {
    res.render("login", {
        layout: "main"
    });
});

// app.post("/login", (req, res) => {});

app.get("/logout", (req, res) => {
    delete req.session.user;
    res.render("login", {
        layout: "main"
    });
});

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
    const password = req.body.password;
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
                        hashedPassword: hashedPassword
                    };
                    console.log(req.session.user);
                    res.redirect("/petition");
                }
            );
        })
        .catch(err => {
            console.log(err);
            res.render("register", {
                errMessage: "Oooops something went wrong!",
                layout: "main"
            });
        });
});

app.listen(8080, () => console.log("Listening!"));
