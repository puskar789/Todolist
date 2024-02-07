//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");
// const date = require(__dirname + "/date.js");

const app = express();

app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

// MONGOOOSE + MONGODB
mongoose.connect(
  "mongodb+srv://alienufo678:!L7Z.A.Fkv!6xRe@todolistyu.lz7lgcx.mongodb.net/todolistDB"
);

const itemsSchema = {
  name: String,
};

const Item = mongoose.model("Item", itemsSchema);

const item1 = new Item({ name: "Welcome to your todolist!!" });
const item2 = new Item({ name: "Hit the + button to add a new item" });
const item3 = new Item({ name: "<-- Hit this to delete an item" });

const defaultItems = [item1, item2, item3];

const listSchema = {
  name: String,
  items: [itemsSchema],
};

const List = mongoose.model("List", listSchema);

app.get("/", function (req, res) {
  // const day = date.getDate();

  Item.find({}).then((items) => {
    if (items.length === 0) {
      Item.insertMany(defaultItems);
      res.redirect("/");
    } else {
      res.render("list", { listTitle: "Today", newListItems: items });
    }
  });
});

app.post("/", function (req, res) {
  const itemName = req.body.newItem;
  const listName = req.body.list;

  const item = new Item({ name: itemName });

  if (listName === "Today") {
    item.save();
    res.redirect("/");
  } else {
    List.findOne({ name: listName }).then((foundList) => {
      foundList.items.push(item);
      foundList.save();
      res.redirect("/" + listName);
    });
  }
  // if (req.body.list === "Work") {
  //   workItems.push(item);
  //   res.redirect("/work");
  // } else {
  //   items.push(item);
  //   res.redirect("/");
  // }
});

app.post("/delete", (req, res) => {
  const checkedItemId = req.body.checkbox;
  const listName = req.body.listName;

  if (listName === "Today") {
    console.log(checkedItemId);
    Item.findOneAndDelete({ _id: checkedItemId }).then((err) => {
      if (err) {
        console.log("Not deleted");
      } else {
        console.log("deleted");
      }
      res.redirect("/");
    });
  } else {
    console.log(listName, checkedItemId);
    List.findOneAndUpdate(
      { name: listName },
      { $pull: { items: { _id: checkedItemId } } }
      //{ returnDocument: "after" }
    ).then(() => {
      res.redirect("/" + listName);
    });
  }
  // const found = Item.find({ _id: "65a27de4f6d965a8d3121de9" });
  // console.log(found.name);
});

// CUSTOM LISTS
app.get("/:customListName", (req, res) => {
  const customListName = _.capitalize(req.params.customListName);

  List.findOne({ name: customListName }).then((result) => {
    if (result) {
      res.render("list", {
        listTitle: result.name,
        newListItems: result.items,
      });
    } else {
      const list = new List({
        name: customListName,
        items: defaultItems,
      });

      list.save();
      res.redirect("/" + customListName);
    }
  });
});

app.get("/work", function (req, res) {
  res.render("list", { listTitle: "Work List", newListItems: workItems });
});

app.get("/about", function (req, res) {
  res.render("about");
});

app.listen(process.env.PORT || 3000, function () {
  console.log("Server started on port 3000");
});
