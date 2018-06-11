const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const passport = require('passport');

// Bring in Article Models

let User = require('../models/user');

//Register form
router.get('/register', function(req, res) {
	if(req.isAuthenticated()){
		req.flash('danger', "You are login!");
		res.redirect('/');
	}else {
		res.render('register', {
			title: 'EXPRESS Register'
		});
	};
})

//Register Proccess
router.post('/register', function(req, res){
	const name = req.body.name;
	const email = req.body.email;
	const username = req.body.username;
	const password = req.body.password;
	const password2 = req.body.password2;

	req.checkBody('name', 'Name min lenght is 5').isLength({ min: 5 });
	req.checkBody('email', 'Email is required').notEmpty();
	req.checkBody('email', 'Email is not valid').isEmail();
	req.checkBody('username', 'Username min lenght is 5').isLength({ min: 5 });
	req.checkBody('password', 'Password is required').notEmpty();
	req.checkBody('password2', 'Password2 do not match').equals(req.body.password);

	let errors = req.validationErrors();

	if(errors) {
		res.render('register', {
			title: 'EXPRESS Register',
			errors: errors
		});
	} else {
		let newUser = new User({
			name,
			email,
			username,
			password
		});

		bcrypt.genSalt(10, function(err, salt){
			bcrypt.hash(newUser.password, salt, function(err, hash){
				if(err){
					console.log(err);
				}
				newUser.password = hash;
				newUser.save(function(err){
					if(err){
						console.log(err);
						return;
					} else{
						req.flash('success', 'You are now registered and now you can login');
						res.redirect('/users/login');
					}
				});
			});
		});
	}
});


//Login form
router.get('/login', function(req, res){
	if(req.isAuthenticated()){
		req.flash('danger', "You are login!");
		res.redirect('/');
	}else {
		res.render('login', {
			title: 'EXPRESS Login'
		});
	}
});

//Login Proccess
router.post('/login', function(req, res, next){
	passport.authenticate('local', {
		successRedirect: '/',
		failureRedirect: '/users/login',
		failureFlash: true
	})(req, res, next);
});

//Google route
router.get('/google', passport.authenticate('google', {
	scope: [
		'https://www.googleapis.com/auth/userinfo.profile',
		'https://www.googleapis.com/auth/userinfo.email'
	]
}));

router.get('/redirect', passport.authenticate('google'), function(req, res){
	res.redirect('/');
});

//Logout
router.get('/logout', function(req, res){
	req.logout();
	req.flash('success', 'You are logged out');
	res.redirect('/users/login');
})

module.exports = router;