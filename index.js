const express = require('express')
const app = express()
const port = 3000
const path = require('path')
const ejs = require('ejs')
const fs = require('fs')
const bodyParser = require ('body-parser')
const slug = require('slug');
const jquery = require('jquery')
const session = require('express-session')
const cookieParser = require('cookie-parser')

//database set-up
//used source: https://www.youtube.com/watch?v=ohmYRtEHktI&feature=youtu.be for setting up database
const mongodb = require('mongodb')
const mongoose = require('mongoose')
require('dotenv').config()


mongoose
.connect('mongodb://' + process.env.DB_HOST + ':' + process.env.DB_PORT + '/' + process.env.DB_NAME, {
    useUnifiedTopology: true,
    useNewUrlParser: true
})
.then(()=> console.log("DB Connected"))
.catch(err => {console.log( "DB Connection Error :" + err )
})

//schema set-up
let chatSchema = new mongoose.Schema({
    message: {
        type: String
    }
})
 
let berichten = mongoose.model('berichten', chatSchema)

let users = [{
    name: 'Jonny',
    age: 25,
    description: 'I am Jonny. I am looking for someone to take out into nature and have picknicks with.'
},
{
    name: 'Tonya',
    age: 19,
    description: 'I am Tonya Potter, I am new to dating and hope to explore it in a non-pressuring way.'

},
{
    name:'Codie',
    age: 29,
    description: 'My name is Codie. I am looking for someone to bond with for the long haul.'
},
{
    name: 'Sara',
    age: 21,
    description: "meow"
}]

let subjects = [{
    oneSubject: 'your favorite animal'
},
{
    oneSubject: 'your favorite food'
},
{
    oneSubject: 'your hobbies'
},
{
    oneSubject: 'your dream holiday'
},
{
    oneSubject: 'your work or school'
},
{
    oneSubject: 'your family'
},
{
    oneSubject: 'where you want to live'
},
{
    oneSubject: 'where you live'
},
{
    oneSubject: 'your favorite drink'
},
{
    oneSubject: 'how you feel about being vegetarian'
}]

//express set-up
app
    .use(express.static('static'))
    .use(bodyParser.urlencoded({extended: true}))
    //used source: https://www.youtube.com/watch?v=OH6Z0dJ_Huk for sessions
    .use(session({
        name: users.name,
        resave: false,
        saveUninitialized: true,
        secret: process.env.SESSION_SECRET
    }))
    .set('view engine', 'ejs')
    .set('views', 'views')
    
app
    .get('/chatoverview', showUserMsg)
    .get('/chatwindow', showMsg)
    .get('/', (req, res) => res.render('index'))
    .get('*', (req, res) => {res.send('Error 404: Page Not Found')})
    .post('/chatwindow', sendMsg)
    .post('/', setUser)

function verstuur(msg, usrid){
    let berichtje = new berichten({message: msg})
    berichtje.save().then((err, doc) =>{ 
        if (!err || err.message.search('__v:0')){
            console.log('message send door ' + users[usrid].name)
        } else {
            console.log('error during record insertion: ' + err)
        }
    })
}

//used source: https://www.youtube.com/watch?v=ohmYRtEHktI for Update and Delete
function wijzig(msg, id){
    berichten.findOne({_id : id}, function(err, oMsg){
        if(err){
            console.log(err);
        } else {
            oMsg.message = msg;
            oMsg.save(function(err, oUpdate) {
                if(err) {
                    console.log(err);
                } else {
                    console.log('record update' + oUpdate);
                }
            })
        }
    }
    )}

function del(id){
    berichten.findOneAndRemove({_id : id}, function(err, oMsg){
        if(err){
            console.log(err);
        }else{
            console.log('message delete')
        }
    })
}

function setUser(req, res){
    req.session.user = req.body.wie
    userID = req.session.user
    berichten.find(function(err, messages){
        if (err) {
            console.log(err)
        }else{
            res.render('chatoverview', {users: users, messages: messages, userID: userID})
        }
    })
}


function showUserMsg(req, res){ 
    berichten.find(function(err, messages){
        if (err) {
            console.log(err)
        }else{
            res.render('chatoverview', {users: users, messages: messages})
        }
    })
}

function showMsg(req, res) {
    berichten.find(function(err, messages){
        if (err) {
            console.log(err)
        }else{
            let sub = Math.floor(Math.random() * 10)
            res.render('chatwindow', {users: users, messages: messages, subjects: subjects, sub: sub})
        }
    })
}

function sendMsg(req, res){
    console.log('id = '+req.body.objectid)
    if(req.body.objectid === '0'){
        verstuur(req.body.message, req.session.user);
    }else if (req.body.delete === 'delete'){
        del(req.body.objectid)
    }else {
        wijzig(req.body.editMessage, req.body.objectid);
    }
        res.redirect(req.originalUrl)
}

app.listen(port, () => console.log('Example app listening on port ${port}!')); 