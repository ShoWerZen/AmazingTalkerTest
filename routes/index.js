const express = require('express');
const router = express.Router();
const cfg = require("../config.js");
const emailValidator = require("email-validator");
const nodemailer = require("nodemailer");
const transporter = nodemailer.createTransport(cfg.nodemailer_cfg);
const rp = require('request-promise');
const {google} = require('googleapis');
const oauth2 = google.oauth2('v2');
const oauth2Client = new google.auth.OAuth2(
  cfg.google_client_id,
  cfg.google_client_secret,
  cfg.google_redirect_url
);


const User = require("../models/user");

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { 
  	title: 'Express',
  	password_min_length: cfg.password_min_length,
  	googleClientId: cfg.google_client_id,
  	facebookApiId: cfg.facebook_api_id,
  	facebookApiVersion: cfg.facebook_api_version
  });
});

router.post("/signup", async function(req, res, next) {
	req.checkBody("name", cfg.name_empty_msg).isLength({ min: 1 });
	req.checkBody("email", cfg.email_empty_msg).isLength({ min: 1 });
	req.checkBody("password", cfg.password_invlid_msg).isLength({ min: cfg.password_min_length });
	req.checkBody("password_comfirmation", cfg.password_confirmation_invlid_msg).isLength({ min: cfg.password_min_length });
	
	let errors = req.validationErrors();
	if(errors)
		return res.status(500).send({error: errors[0].msg});
	else{
		let _name = req.body.name;
		let _email = req.body.email;
		let _password = req.body.password;
		let _password_comfirmation = req.body.password_comfirmation;
		if(emailValidator.validate(_email)){
			if(_password != _password_comfirmation)
				return res.status(500).send({error: cfg.password_not_match_msg});
			else{
				try{
					let _token = await signup(_name, _email, _password);
					res.send({token: _token});
				}
				catch(err){
					return res.status(500).send({error: err});
				}
			}
		}
		else
			return res.status(500).send({error: cfg.email_invalid_msg});
	}
});

router.post("/googlesignup", async function(req, res, next) {
	req.checkBody("code", cfg.google_code_empty_msg).isLength({ min: 1 });
	let errors = req.validationErrors();
	if(errors)
		return res.status(500).send({error: errors[0].msg});
	else{
		try{

			let {tokens} = await oauth2Client.getToken(req.body.code);
		   	oauth2Client.setCredentials(tokens);
		   	let _usr_info = await oauth2.userinfo.get({auth: oauth2Client});

		   	let _name = _usr_info.data.name;
		   	let _email = _usr_info.data.email;
		   	let _id = _usr_info.data.id;

		   	let _user = await User.findOne({googleId: _id}).exec();
		   	if(_user)
				return res.send({token: _user._id.toString()});
			else{
				let _password = randomPwd(8);
				let _socialAppInfo = {
					key: "googleId",
					val: _id
				};
				let _token = await signup(_name, _email, _password, _socialAppInfo);
				res.send({token: _token});
			}
		}
		catch(err){
			return res.status(500).send({error: err.toString()});
		}
	}
});

router.post("/facebooksignup", async function(req, res, next) {
	req.checkBody("token", cfg.facebook_token_empty_msg).isLength({ min: 1 });
	let errors = req.validationErrors();
	if(errors)
		return res.status(500).send({error: errors[0].msg});
	else{
		try{
			let _options = cfg.facebook_api_me_options;
			_options.qs.access_token = req.body.token;

			let _repos = await rp(_options);
		   	let _name = _repos.name;
		   	let _email = _repos.email;
		   	let _id = _repos.id;

		   	let _user = await User.findOne({facebookId: _id}).exec();
		   	if(_user)
				return res.send({token: _user._id.toString()});
			else{
				let _password = randomPwd(8);
				let _socialAppInfo = {
					key: "facebookId",
					val: _id
				};
				let _token = await signup(_name, _email, _password, _socialAppInfo);
				res.send({token: _token});
			}
		}
		catch(err){
			return res.status(500).send({error: err.toString()});
		}
	}
});




function signup(_name, _email, _password, _socialAppInfo = null){
	return new Promise(async (resolve, reject) => {
		try{
			let _user = await User.regist(_name, _email, _password, _socialAppInfo);
		
			let _mailOptions = cfg.mail_option_signup;
			_mailOptions.to = _email;
			transporter.sendMail(_mailOptions, function (err, info) {
			   	if(err)
			   		reject(err.toString());
			   	else{
			   		resolve(_user._id.toString());
			   	}
			});
		}
		catch(err){
			reject(cfg.email_exist_msg);
		}
	});
}

function randomPwd(_length) {
   let _result = "";
   let _characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
   for ( let i = 0; i < _length; i++ ) {
      _result += _characters.charAt(Math.floor(Math.random() * _characters.length));
   }
   return _result;
}

module.exports = router;
