const mongoose = require("mongoose");
const CryptoJS = require("crypto-js");
const cfg = require("../config.js");

const userSchema = new mongoose.Schema({
	name: {
		type: String,
		required: true
	},
	email: {
		type: String,
		required: true,
		unique: true
	},
	password: {
		type: String
	},
	googleId: {
		type: String,
		default: ""
	},
	facebookId: {
		type: String,
		default: ""
	},
	bonus: []
});

const User = module.exports = mongoose.model("user", userSchema);

module.exports.regist = async (_name, _email, _pwd, _socialAppInfo) => {
	return new Promise((resolve, reject) => {
		let _timestamp = new Date().getTime().toString();
		let _newBonus = CryptoJS.AES.encrypt(_timestamp, _email).toString();
		let _encPwd = CryptoJS.AES.encrypt(_pwd, cfg.secret).toString();

		let _conditions = { 
			name: _name,
			email: _email,
			password: _encPwd,
			bonus: [_newBonus]
		};

		if(_socialAppInfo)
			_conditions[_socialAppInfo.key] = _socialAppInfo.val;

		User.create(_conditions, function (err, _user) {
			if(err)
				reject(err);
			else
				resolve(_user);
		});
	});
};