const express=require('express');
require('dotenv').config()
const { MongoClient } = require('mongodb');
const cors = require('cors');
const ObjectId =require('mongodb').ObjectId;  //for delete operation
const { ObjectID } = require('bson');


//creating app by calling express
const app=express();

//middleware for CRUD operation
app.use(express.json());
app.use(cors());



// dynamic port (for heroku) configuration for app.listen (port)
const port = process.env.PORT || 7500



app.get('/', (req, res) => {
    res.send('Thriftbooks Database is Working Fine!')
  })


const uri = `mongodb+srv://${process.env.DB_USER_NAME}:${process.env.DB_USER_PASSWORD}@cluster0.cnvk9.mongodb.net/${process.env.DATABASE_NAME}?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });


client.connect(err => {
  const bookCollection = client.db(`${process.env.DATABASE_NAME}`).collection("books");
  bookCollection.createIndex({bookName: "text"});

  const orderCollection=client.db(`${process.env.DATABASE_NAME}`).collection("orders")

  //book management
  app.post('/addBook',(req,res)=>{
      const book=req.body;
      console.log(book)
      bookCollection.insertOne(book)
      .then(result=>{
        console.log(result)
        // console.log(result.insertedCount);
        res.send(result.insertedCount)
      })
  })

  app.get('/books',(req,res)=>{
    bookCollection.find({})
    .toArray((err,docs)=>res.send(docs))
  })

  app.delete('/delete/:id',(req,res)=>{
    bookCollection.deleteOne({_id:ObjectId(req.params.id)})
    .then(result =>{
      res.send(result.deletedCount > 0)
    })
  })

  app.patch('/update/:id',(req,res)=>{
 
     bookCollection.updateOne({_id:ObjectId(req.params.id)},
     
     {
       $set: req.body
     })

     .then(result=>{
       res.send(result.modifiedCount > 0)
     })
  })

  //order management

  app.post('/addOrder',(req,res)=>{
    const order=req.body
    console.log(order)
    orderCollection.insertOne(order)
    .then(result=>{
      res.send(result.insertedCount)
    })
  })

  app.get('/orders',(req,res)=>{
    const queryEmail=req.query.email;  // according to client email order list will be different
    orderCollection.find({email: queryEmail})
    .toArray((err,docs)=>res.send(docs))
  })


});





  
  app.listen(port);