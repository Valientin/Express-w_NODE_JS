const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const GoogleStrategy = require('passport-google-oauth20');
const User = require('../models/user');
const keys = require('./keys');
const bcrypt = require('bcryptjs');

module.exports = function(passport){
	//Local strategy
	passport.use(new LocalStrategy(function(username, password, done){
		//Match Username
		let query = {username};
		User.findOne(query, function(err, user){
			if(err) throw err;
			if(!user) {
				return done(null, false, {message: 'No user found'});
			}
			//Match password
			bcrypt.compare(password, user.password, function(err, isMatch){
				if(err) throw err;
				if(isMatch) {
					return done(null, user);
				} else {
					return done(null, false, {message: 'Wrong password'})
				}
			})
		})
	}));

	//Google strategy
	passport.use(new GoogleStrategy({
		//options for the google strat
		callbackURL: 'users/redirect',
		clientID: keys.google.clientID,
		clientSecret: keys.google.clientSecret
	}, (accessToken, refreshToken, profile, done) => {
		//check user in db
		User.findOne({googleId: profile.id})
		.then((currentUser) => {
			if(currentUser){
				console.log(`User is ${currentUser}`);
				done(null, currentUser);
			} else {
				new User({
					name: profile.name.familyName,
					googleId: profile.id,
					email: profile.emails[0].value,
					username: profile.displayName
				})
				.save()
				.then(function(newUser) {
					console.log(`new user created ${newUser}`);
					done(null, newUser);
				})
				.catch(function(err){
					console.log(err);
				});
			}
		})
		.catch(function(err){
			console.log(err);
		});
	}));

	passport.serializeUser(function(user, done) {
		done(null, user.id);
	});

	passport.deserializeUser(function(id, done) {
		User.findById(id, function(err, user){
			done(err, user);
		});
	});
}