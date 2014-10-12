if (!global.hasOwnProperty('db')) 
{
	var Sequelize = require('sequelize')
	  , sequelize = null;

	if (process.env.DATABASE_URL) 
	{
		var match = process.env.DATABASE_URL.match(/postgres:\/\/([^:]+):([^@]+)@([^:]+):(\d+)\/(.+)/);

		sequelize = new Sequelize(match[5], match[1], match[2], {
			dialect: 'postgres',
			protocol: 'postgres',
			port: match[4],
			host: match[3],
			logging: true
		});
	} 
	else 
	{
		sequelize = new Sequelize('chat', 'postgres', 'speare2014', {
			dialect: 'postgres',
			protocol: 'postgres',
			port: 5432,
			host: 'localhost',
			logging: true
		});
	}

	global.db = {
		Sequelize: Sequelize,
		sequelize: sequelize,
		User: sequelize.import(__dirname + '/user')
	};
}

module.exports = global.db;