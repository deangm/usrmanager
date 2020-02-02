const express = require('express');
const bodyParser = require('body-parser');
const passport = require('passport');
const path = require('path')
const router = express.Router()
const app = express();
const fs = require('fs')
const uuid4 = require('uuid4');

let userList = [];
let count = 0;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(require('express-session')({
    secret: 'some random strings',
    resave: true,
    saveUninitialized: true
}));

app.use('/user', router);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

router.get(/.*/, (req, res, next) => {
    console.log("NEW PAGE")
    if (userList.length < 1) {
        try {
            userList = JSON.parse(fs.readFileSync('./users.json'));
        }
        catch (error) {
            console.log(error);
        }
    }
    next()
})
app.get("/", (req, res) => {
    try {
        userList = JSON.parse(fs.readFileSync('./users.json'));
    }
    catch (error) {
        console.log(error);
    }

    res.render("index");
})
router.get("/create", (req, res) => {
    res.render("createUserForm")
})
router.post("/create", (req, res) => {
    let user = {
        ...req.body,
        id: uuid4().slice(0, 4)
    }
    userList.push(user);
    fs.writeFileSync("./users.json", JSON.stringify(userList));
    res.redirect('/user/list');
})

router.get("/list", (req, res) => {
    res.render("userList", { users: userList })
})

router.get('/delete/:id', (req, res) => {
    userList = userList.filter(user => user.id != req.params.id);
    fs.writeFileSync("./users.json", JSON.stringify(userList))
    userList = JSON.parse(fs.readFileSync('./users.json'));;
    res.redirect('/user/list');
})

router.get('/update/:id', (req, res) => {
    let user = userList.filter(user => user.id == req.params.id);

    res.render('updateUser', { user: user[0] })
})

router.post('/update/:id', (req, res) => {
  
    userList.forEach(user => {
        if(user.id == req.params.id){
            user.firstName = req.body.firstName;
            user.email = req.body.email;
            user.age = req.body.age;
        }
    })
   
     res.redirect('/user/list');
})
app.listen(3000, () => {
    console.log(`Server started on 3000`);
});