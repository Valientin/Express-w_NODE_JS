const express = require('express');
const router = express.Router();

// Bring in Article Models
let User = require('../models/user');
let Article = require('../models/article');



router.get('/add', ensureAuthenticated, function(req, res){
	res.render('add_article', {
		title: "Article page",
		text: "Add article"
	});
});

//Get single Article
router.get('/:id', function(req, res){
	Article.findById(req.params.id, function(err, article){
		User.findById(article.author, function(err, user){
			res.render('article', {
				article: article,
				author: user.name
			});
		});
	});
});


//POST add article
router.post('/add', function(req, res){
	req.checkBody('title', 'Title min lenght is 5').isLength({ min: 5 });
	req.checkBody('body', 'Body min lenght is 15').isLength({ min: 15 });

	let errors = req.validationErrors();

	if(errors) {
		res.render('add_article', {
			title: "Article page",
			text: "Add article",
			errors: errors
		});
	} else {
		let article = new Article();
		article.title = req.body.title;
		article.author = req.user._id;
		article.body = req.body.body;

		article.save(function(err){
			if(err){
				console.log(err);
				return;
			} else {
				req.flash('success', 'Article added');
				res.redirect('/');
			}
		});
	}
});

//Load edit form
router.get('/edit/:id', ensureAuthenticated, function(req, res){
	Article.findById(req.params.id, function(err, article){
		if (article.author != req.user._id){
			req.flash('danger', 'Yon dont edit this article!');
			res.redirect('/');
		} else {
			res.render('edit_article', {
				text: 'Edit article',
				article: article
			});	
		}
	});
});

//POST edit article
router.post('/edit/:id', function(req, res){
	req.checkBody('title', 'Title min lenght is 5').isLength({ min: 5 });
	req.checkBody('body', 'Body min lenght is 15').isLength({ min: 15 });

	let errors = req.validationErrors();

	if(errors){
		Article.findById(req.params.id, function(err, article){
			res.render('edit_article', {
				text: 'Edit article',
				article: article,
				errors
			});
		});
	} else {
		let article = {};
		article.title = req.body.title;
		article.body = req.body.body;

		let query = {_id:req.params.id}

		Article.update(query, article, function(err){
			if(err){
				console.log(err);
				return;
			} else {
				req.flash('success', "Update article");
				res.redirect('/');
			}
		});
	}
});

router.delete('/:id', function(req, res){
	if(!req.user._id){
		res.status(500).send();
	}

	let query = {_id:req.params.id}

	Article.findById(req.params.id, function(err, article){
		if(article.author != req.user._id){
			res.status(500).send();
		} else {
			Article.remove(query, function(err){
				if(err){
					console.log(err);
				}
				req.flash('success', "Article deleted");
				res.send('Success');
			});
		}
	});
});

//Access Control
function ensureAuthenticated(req, res, next) {
	if(req.isAuthenticated()){
		return next();
	} else {
		req.flash('danger', "Please login");
		res.redirect('/users/login');
	}
}

module.exports = router;