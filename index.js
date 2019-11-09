const express = require("express");
const app = express();
const hb = require("express-handlebars");
const db = require("./utils/db");
const cookieSession = require("cookie-session");
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
    // console.log("/thankyou route: ", req.session);
    console.log("sigID is: ", req.session.sigId);
    let getSignaturePromise = db.getSignature(req.session.sigId);
    let numberOfSignersPromise = db.getSignatureCount();
    Promise.all([getSignaturePromise, numberOfSignersPromise])
        .then(results => {
            const signedCount = results[1].rows[0].count;
            const signature = results[0].rows[0].signature;
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
    res.render("signerslist", {
        layout: "main"
    });
});

app.get("/login", (req, res) => {
    res.render("login", {
        layout: "main"
    });
});

app.get("/register", (req, res) => {
    res.render("register", {
        layout: "main"
    });
});

app.listen(8080, () => console.log("Listening!"));
