const mongoose = require('mongoose');

let UserSchema = mongoose.Schema({
	name: {
		type: String,
		required: true
	},
	googleId: {
		type: String,
		required: false
	},
	email: {
		type: String,
		required: true
	},
	username: {
		type: String,
		required: true
	},
	password: {
		type: String,
		required: function(){
			return this.googleId ? false : true;
		}
	}
});

const User = module.exports = mongoose.model('User', UserSchema);