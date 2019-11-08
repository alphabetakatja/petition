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
    cookieSession({
        secret: `I'm always angry.`,
        maxAge: 1000 * 60 * 60 * 24 * 7 * 6
    })
);

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
    // it will add it to every single route with a form
    // res.locals.firstName = req.session.firstName;
    next();
});

// routes
app.get("/", (req, res) => {
    // console.log("********* / Route ************");
    // console.log("req.session before: ", req.session);
    // req.session.habanero = "<3";
    //
    // console.log("req.session after: ", req.session);
    // console.log("********* / Route ************");
    res.redirect("/petition");
});

app.get("/petition", (req, res) => {
    // console.log("********* / Petition ************");
    // console.log("req.session in petition: ", req.session);
    // console.log("********* / Petition ************");
    res.render("petition", {
        layout: "main"
        // csrfToken: req.csrfToken() there is a different way to do this
        // app.locals
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

// app.get("/signed", (req, res) => {
//     db.getSignature()
//         .then(() => {
//             console.log("petition signed successfully!");
//         })
//         .catch(err => {
//             console.log("/signed err: ", err);
//         });
// });

app.get("/thank-you", (req, res) => {
    console.log("/thankyou route: ", req.session);
    console.log("sigID is: ", req.session.sigId);
    db.getSignature(req.session.sigId)
        .then(results => {
            console.log(results);
            console.log(results.rows[0]);

            res.render("thankyou", {
                layout: "main",
                signature: results.rows[0].signature,
                numOfSigners: req.session.sigId
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

// app.post("/add-city", (req, res) => {
//     db.addCity("Sarajevo", 700000)
//         .then(() => {
//             console.log("success!");
//         })
//         .catch(err => {
//             console.log("add-city err:", err);
//         });
// });

// app.get("/cities", (req, res) => {
//     db.getCities()
//         .then(({ rows }) => {
//             // .then(results => {
//             console.log("rows results: ", rows);
//             // rows is the only property of results that we care about, it contains the actual data that we requested from the table
//             // console.log("getCities results: ", results);
//             // ROWS(each object represents a row) is always an array(of objects where each object represents a row)
//         })
//         .catch(err => {
//             console.log("cities db err: ", err);
//         });
// });

app.listen(8080, () => console.log("Listening!"));
