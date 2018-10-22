'use strict';

var express  = require('express');
var mongo    = require('mongodb');
var mongoose = require('mongoose');
var dns      = require("dns");
var shortid  = require("shortid");

var cors = require('cors');

var bodyParser = require("body-parser");
//app.use(bodyParser.urlencoded({extended: false}));

var app = express();

// Basic Configuration 
var port = process.env.PORT || 3000;

/** this project needs a db !! **/ 
 mongoose.connect(process.env.MONGOLAB_URI,{ useNewUrlParser: true });

app.use(cors());

/** this project needs to parse POST bodies **/
// you should mount the body-parser here
app.use( bodyParser.json() );       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
  extended: true
})); 

app.use('/public', express.static(process.cwd() + '/public'));

app.get('/', function(req, res){
  res.sendFile(process.cwd() + '/views/index.html');
});

var urlSchema = new mongoose.Schema({
original_url:String,
short_url:String
});
var Url = mongoose.model("Url",urlSchema);
app.post("/api/shorturl/new",(req, res)=>{
  let randomShortenedUrl = shortid.generate();
  var url = req.body.url.split("/")[2];
dns.lookup(url,(err, addresses, family)=>{
  if(err||addresses==null){res.json({"error":"invalid URL"});}
  else{
  var data = {"original_url":req.body.url, "short_url":randomShortenedUrl};
  //var data = {"original_url":req.body.url, "shortened_url":randomShortenedUrl,"full_shortened_url":"https://time-snipe.glitch.me/api/shorturl/"+randomShortenedUrl};
 
  var saveUrl = new Url(data);
    saveUrl.save(function(err){
    if(err){throw err;}
      res.json(data);
})
  }
})
})
app.get("/api/shorturl/:shortUrl?",(req,res)=>{
  var temporaryUrl = req.params.shortUrl;
  Url.findOne({"short_url":req.params.shortUrl},(err,data)=>{
  if(err){ throw err;}
  res.redirect(data.original_url)
  })
})

app.listen(port, function () {
  console.log('Node.js listening ...');
});