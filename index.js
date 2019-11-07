const express = require("express");
const app = express();
const hb = require("express-handlebars");
const db = require("./utils/db");

// handlebars
app.engine("handlebars", hb());
app.set("view engine", "handlebars");

// middleware that will run with any single route
app.use(express.static("./public"));

// routes
app.get("/petition", (req, res) => {
    res.render("petition", {
        layout: "main"
    });
});

app.post("/petition", (req, res) => {
    db.addSignature()
        .then(signature => {
            console.log("success!", signature);
        })
        .catch(err => {
            console.log("add-signature err: ", err);
        });
});

app.get("/signed", (req, res) => {
    db.getSignature()
        .then(() => {
            console.log("petition signed successfully!");
        })
        .catch(err => {
            console.log("/signed err: ", err);
        });
});

app.get("/thank-you", (req, res) => {
    res.render("thankyou", {
        layout: "main"
    });
});

app.get("/signers-list", (req, res) => {
    res.render("signerslist", {
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
