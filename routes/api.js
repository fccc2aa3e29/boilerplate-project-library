/*
*
*
*       Complete the API routing below
*       
*       
*/

'use strict';

var expect = require('chai').expect;
var MongoClient = require('mongodb').MongoClient;
var ObjectId = require('mongodb').ObjectId;
const MONGODB_CONNECTION_STRING = process.env.DB;
//Example connection: MongoClient.connect(MONGODB_CONNECTION_STRING, function(err, db) {});

module.exports = function (app) {

  app.route('/api/books')
    .get(function (req, res){
      //response will be array of book objects
      //json res format: [{"_id": bookid, "title": book_title, "commentcount": num_of_comments },...]
    MongoClient.connect(MONGODB_CONNECTION_STRING, (err, db) => {
      
      db.collection('books').find({}, {comments: 0}).toArray((err, data) => {
        if (err) res.send("error");
        res.send(data);
      });
    });  
  })
    
    .post(function (req, res){  
    var title = req.body.title;
      //response will contain new book object including atleast _id and title
    if (!title) res.send("missing title");
    else{
    MongoClient.connect(MONGODB_CONNECTION_STRING, (err, db) => {
      
      db.collection('books').insertOne({title: req.body.title, comments: [], commentcount: 0}, (err, data) => {
        if (err) res.send("error");
        res.json({title: data.ops[0].title, _id: data.ops[0]._id});
      });
    });
    }
  })
    
    .delete(function(req, res){
      //if successful response will be 'complete delete successful'
    MongoClient.connect(MONGODB_CONNECTION_STRING, (err, db) => {
      
      db.collection('books').deleteMany({}, (err, data) => {
        if (err) res.send("error");
        res.send("complete delete successful");
      });
    });  
  });



  app.route('/api/books/:id')
    .get(function (req, res){
      var bookid = req.params.id;
      //json res format: {"_id": bookid, "title": book_title, "comments": [comment,comment,...]}
    MongoClient.connect(MONGODB_CONNECTION_STRING, (err, db) => {
      
      db.collection('books').findOne({_id: ObjectId(bookid)}, {commentcount: 0}, (err, data) => {
        if (err) res.send("error");
        if (!data) res.send("no book exists");
        else res.json(data);
      });
    });
  })
    
    .post(function(req, res){
    var bookid = req.params.id;  
    var comment = req.body.comment;
      //json res format same as .get
    MongoClient.connect(MONGODB_CONNECTION_STRING, (err, db) => {
      
      db.collection('books').updateOne({_id: ObjectId(bookid)}, {$push: {comments: comment}, $inc: {commentcount: 1}}, (err, data) => {
        if (err) res.send("error");
        else if (!data) res.send("no book exists");
        else{
        db.collection('books').findOne({_id: ObjectId(bookid)}, {commentcount: 0}, (err, data) => {
          if (err) res.send("error");
          res.json(data);
        });
        }
      });
    });
    
    })
    
    .delete(function(req, res){
      var bookid = req.params.id;
      //if successful response will be 'delete successful'
    MongoClient.connect(MONGODB_CONNECTION_STRING, (err, db) => {
      
      db.collection('books').deleteOne({_id: ObjectId(bookid)}, (err, data) => {
        if (err) res.send("error");
        if (!data) res.send("no book exists");
        else res.send("delete successful");
      });
    });  
  });
  
};
