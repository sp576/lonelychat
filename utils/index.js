var bcrypt = require('bcrypt');

module.exports.generatePasswordHash = function(password) {
 	return bcrypt.hashSync(password, 12);
 	/*
 	bcrypt.genSalt(12, function(err, salt) {
	 	bcrypt.hash(password, salt, function(err, hash){
	 		console.log("hash - " + hash);
	 		console.log("he - " + err);
	 		if (!err) {
	 			return hash;	
	 		}
	 		throw err;
	 	});
 	});
	*/
};

module.exports.checkPasswordHash = function(password, hash) {
	/*
	bcrypt.compare(password, hash, function(err, res) {
		return res;
	});
	*/
	return bcrypt.compareSync(password, hash);
}