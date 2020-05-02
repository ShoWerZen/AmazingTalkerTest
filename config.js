module.exports = {
	db_url: "mongodb://at_mongo/test",
	secret: "amazingtalkertest", //password hash secret
	nodemailer_cfg: {
		service: 'gmail',
		auth: {
			user: "", //gmail account
		    pass: "", //gmail password
		}
	},
	mail_option_signup: {
		from: '', //gmail account
		subject: 'Register Success',
		html: '<p>Register Success</p>'
	},
	//facebook app setting
	facebook_api_id: "",
	facebook_api_version: "v6.0",
	facebook_token_empty_msg: "Facebook認證錯誤，Token不存在",
	facebook_api_me_options: {
		method: "GET",
	    uri: "https://graph.facebook.com/me",
	    qs: { fields: "name,email,id" },
	    json: true
	},
	//google app setting
	google_client_id: "",
	google_client_secret: "",
	google_redirect_url: "http://localhost:3000",
	google_code_empty_msg: "Google認證錯誤，Code不存在",
	//input setting
	name_empty_msg: "請輸入姓名",
	email_empty_msg: "請輸入Email",
	email_invalid_msg: "請輸入正確的Email",
	email_exist_msg: "Email已註冊",
	password_min_length: 8,
	password_invlid_msg: "請輸入至少8碼密碼",
	password_confirmation_invlid_msg: "請輸入至少8碼確認密碼",
	password_not_match_msg: "兩次密碼輸入不相同",
};