const express = require('express');
const app = express();
const path = require('path');
const volleyball = require('volleyball');
const bodyParser = require('body-parser');
const session = require('express-session');
const passport=require('passport');
const {User}=require('./db/models')

/* "Enhancing" middleware (does not send response, server-side effects only) */
app.use(session({
	secret:'whatever',
	resave: false,
	saveUnintialized: true
}));

//middleware required to initialize passport
app.use(passport.initialize())
//hooks into the persistent sessions we are using
app.use(passport.session())


passport.serializeUser(function(user, done){
	done(null, user.id)
})
passport.deserializeUser(function(id, done){
	User.findById(id)
		.then(function(user){
			done(null, user);
		})
		.catch(done)

})

app.use(function(req, res, next){
	if (!req.session.counter) req.session.counter=0;
	console.log('counter', ++req.session.counter);
	next();
})

app.use(function(req, res, next){
	console.log('SESSION User-----', req.user)
	next();
})








app.use(volleyball);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

/* "Responding" middleware (may send a response back to client) */
app.use('/api', require('./api'));
app.use('/auth', require('./auth'));

const validFrontendRoutes = ['/', '/stories', '/users', '/stories/:id', '/users/:id', '/signup', '/login'];
const indexPath = path.join(__dirname, '../public/index.html');
validFrontendRoutes.forEach(stateRoute => {
  app.get(stateRoute, (req, res, next) => {
    res.sendFile(indexPath);
  });
});

/* Static middleware */
app.use(express.static(path.join(__dirname, '../public')))
app.use(express.static(path.join(__dirname, '../node_modules')))

app.use((err, req, res, next) => {
	console.error(err.stack);
	res.status(err.status || 500).send(err.message || 'Internal Error');
});

module.exports = app;