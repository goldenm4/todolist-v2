// jshint esversion: 6

// require and configure express
const express = require("express");
const port = 3000;
const app = express();

// require mongoose
const mongoose = require("mongoose");

// create and connect mongoose to a database
mongoose.connect("mongodb://localhost:27017/todolistDB", { useNewUrlParser: true });

//get the status of the mongoose connection to the database
const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", function () {
    console.log("Mongoose connected!");
});

// build schema(s)
const itemsSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "must include a name"]
    }
});

// compile the schema(s) into a model(s) (model = class/collection to construct documents)
const Item = mongoose.model("Item", itemsSchema);

// enable ejs
app.set("view engine", "ejs");

// require and configure body-parser
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: true }));

// require custom date module for node
const date = require(__dirname + "/date.js");

// enable use of local files (css, etc.)
app.use(express.static("public"));

app.get("/", function (req, res) {

    Item.find({}, function (err, items) {
        if (err) {
            console.log(err + "@ get / route");
        } else {

            const weekday = date.getDate();

            console.log("items: " + items + " weekday: " + weekday);

            res.render("list", {
                listTitle: weekday,
                itemsList: items
            });
        }
    });

});

app.post("/", function (req, res) {
    const newItem = new Item({
        name: req.body.newItem
    });

    if (req.body.newItemButton === "Work") {
        newItem.save();
        res.redirect("/work");
    } else {
        newItem.save();
        res.redirect("/");
    }
});

app.get("/work", function (req, res) {
    Item.find({}, function (err, items) {
        if (err) {
            console.log(err + "@ get /work route");
        } else {

            console.log("/work items: " + items);

            res.render("list", {
                listTitle: "Work list",
                itemsList: items
            });
        }
    });
});

app.post("/work", function (req, res) {
    const newItem = new Item({
        name: req.body.newItem
    });
    newItem.save();
    res.redirect("/work");
});

app.post("/delete", function (req, res) {
    const checkedItemID = req.body.checkbox;
    Item.findByIdAndRemove(checkedItemID, function (err) {
        if (err) {
            console.log(err + "@ /delete route");
        } else {
            console.log("successfully deleted document");
            res.redirect("/");
        }
    });
});

app.get("/about", function (req, res) {
    res.render("about");
});

app.listen(port, function () {
    console.log("app running on port " + port);
});