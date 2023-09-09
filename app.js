require('dotenv').config();
const mongoose = require('mongoose');
const passport = require('passport');
const express = require('express');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const expressLayouts = require('express-ejs-layouts');
const indexRoute = require('./routes/index');
const userRoute = require('./routes/user');

require('./config/passport')(passport);
const app = express();
const morgan = require('morgan');

mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
    .then(() => {
      console.log('Connected to MongoDB');
      
      app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
      });
    })
    .catch((error) => {
      console.error('Error connecting to MongoDB:', error);
    });

app.set('view engine', 'ejs');
app.use(expressLayouts);
app.use(morgan('dev'));

// SESSION MIDDLEWARE
const store = new MongoStore({  mongoUrl: process.env.MONGO_URI,
    mongoOptions: {
      useNewUrlParser: true,
      useUnifiedTopology: true
    },
    collection: 'sessions'
 });

app.use(session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: true }, 
    store: store
    }));

// PASSPORT MIDDLEWARE 
app.use(passport.initialize());
app.use(passport.session());

app.use((req, res, next)=>{
    if(req.isAuthenticated){
        console.log("Now we can set global variable");
        res.locals.user = req.user;
        next();
    }else{
        console.log("Now we can not set global variable");
        res.locals.user = null;
        next();
    }
});

app.use('/', indexRoute);
app.use('/auth', userRoute);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log('Server is running on: ' + PORT));