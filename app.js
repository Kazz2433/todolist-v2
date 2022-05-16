//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash")

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect('mongodb+srv://Armit4ge:Marckdomsdds33@cluster0.t3haj.mongodb.net/todolistDB')

//Schemas
//--------------------------------------------------------------------
const itemsSchema = new mongoose.Schema({
  name: String,
})

const listSchema = new mongoose.Schema({
  name: String,
  items: [itemsSchema],
})

const Item = mongoose.model("Item", itemsSchema)
const List = mongoose.model("List", listSchema)

const mouse = Item({
  name:"Mouse"
})

const keyboard = Item({
  name:"Keyboard"
})

const monitor = Item({
  name:"Monitor"
})

const defaultItems = [mouse,keyboard,monitor]

// Item.deleteMany({name:'Monitor'},function (deletedcount) {
//   console.log(deletedcount);
// })

//Main Page
//--------------------------------------------------------------------

app.get("/", function(req, res) {

  Item.find({}, function(err,foundItems){

    if(foundItems.length === 0){
      Item.insertMany(defaultItems, function(err) {
        if (err){
          console.log(err);
        }else{
          console.log("All Goods!");
        }
      })     
      res.redirect('/')
    }else{
      res.render("list", {listTitle: "Today", newListItems: foundItems});
    }
  })

  

});

app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listName = req.body.list

  const item = Item({
    name: itemName
  })

  if(listName === "Today"){
    item.save()
    res.redirect("/")
  }else{
    List.findOne({name:listName}, function(err,foundList){
      foundList.items.push(item)
      foundList.save()
      res.redirect("/"+ listName)
    })
  }
});

app.post("/delete", function(req,res){
  const checkedItemId= req.body.checkbox
  const listName = req.body.listName

  if(listName === "Today"){
    Item.findByIdAndRemove(checkedItemId, function(err) {
      if(err){
        console.log(err);
      }else{
        console.log("Successfully deleted");
      }
    })
    res.redirect("/")
  }else{
    List.findOneAndUpdate({name: listName}, {$pull: {items:{_id: checkedItemId}}}, function(err,foundList){
      if (!err){
        res.redirect("/"+listName)
      }
    })
  }


})

//Custom
//--------------------------------------------------------------------

app.get("/:customListName", function(req,res){
  const customListName = _.capitalize(req.params.customListName)

  List.findOne({name:customListName}, function(err,results){
    if(results){
      //Show a existing list
      res.render("list", {listTitle:results.name, newListItems:results.items})
    }else{
      //Create a new one
      const list = new List({
        name: customListName,
        items: defaultItems
      })
    
      list.save()
      res.redirect("/"+customListName)
    }
  })
})

//--------------------------------------------------------------------

app.get("/about", function(req, res){
  res.render("about");
});

let port = process.env.PORT
// if(port == null || port == ""){
//   port = 3000
// }

app.listen(port, function() {
  console.log("Server started on port 3000");
});
