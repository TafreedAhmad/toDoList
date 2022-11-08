//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const date = require(__dirname + "/date.js");
const mongoose = require("mongoose");
const _ = require("lodash");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

// const items = ["Buy Food", "Cook Food", "Eat Food"];
// const workItems = [];
mongoose.connect("mongodb://localhost:27017/todoListDB", { useNewUrlParser: true })

const itemsSchema = {
  name: String
};
const Item = mongoose.model("Item", itemsSchema);

const item1 = new Item({
  name: 'Welcome to your toDoList'
});
const item2 = new Item({
  name: "Welcome to your toDoList Again"
});
const item3 = new Item({
  name: "Welcome to your toDoList and once again"
});

const defaultItems = [item1, item2, item3];

const listSchema = {
  name: String,
  items: [itemsSchema]
};

const List = mongoose.model("List", listSchema);




const day = date.getDate();
app.get("/", function (req, res) {

  Item.find({}, function (err, foundItems) {
    if (foundItems.length === 0) {
      Item.insertMany(defaultItems, function (err) {
        if (err) {
          console.log(err);
        } else {
          console.log("Success");
        }
      })
      res.redirect("/");
    }
    else {

      res.render("list", { listTitle: day, newListItems: foundItems });
    }

  });


});

app.post("/", function (req, res) {

  const itemName = req.body.newItem;
  const listT = req.body.list;

  const item = new Item({
    name: itemName
  });
  if (listT === day) {
    item.save();//saves directly to the collection of the model
    res.redirect("/");

  }
  else {
    List.findOne({ name: listT }, function (err, foundlist) {
      if (!err) {
        foundlist.items.push(item);
        foundlist.save();
        res.redirect("/" + listT);
      }
    })

  }




});

app.post("/delete", function (req, res) {
  const checkedItem = req.body.checkbox;
  const listname = req.body.listname;

  if (listname === day) {
    Item.findByIdAndRemove(checkedItem, function (err) {
      if (!err) {
        console.log("Successfully deleted");
      }
      else {
        console.log(err);
      }
      res.redirect("/");
    })
  }
  else {
    List.findOneAndUpdate({ name: listname }, { $pull: { items: { _id: checkedItem } } }, function (err, foundlist) {
      console.log("Successfully deleted!")
      res.redirect("/" + listname);
    })

  }
})

app.get("/:customListName", function (req, res) {
  const customListName = _.capitalize(req.params.customListName);

  List.findOne({ name: customListName }, function (err, foundlist) {
    if (!err) {
      if (!foundlist) {
        //if not found make a new list
        const list = new List({
          name: customListName,
          items: defaultItems
        });

        list.save();
        res.redirect("/" + customListName);

      }
      else {
        //if found then show the existing list
        res.render("list", { listTitle: foundlist.name, newListItems: foundlist.items })

      }
    }
  })



});

app.get("/about", function (req, res) {
  res.render("about");
});

app.listen(3000, function () {
  console.log("Server started on port 3000");
});
