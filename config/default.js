// default config
// config property should only be 1 level deep, doesn't support 2 level config for now 
// because it will be overwritten when extending by .env.json
var merge = require('merge');
var _ = require('underscore');
var path = require('path');

var config = {};

// prepare merge with .hidden.json if exist
var hiddenConf = null;
try {
	hiddenConf = require('./.env.json');
	if (hiddenConf){
		// merge 1 level only
		_.each(hiddenConf, function(v, k) {
		})
	}
} catch (ex){
	console.error('Error: ' + ex);
}

function defineConfig(key, obj) {
	config[key] = obj;
	// directly override after defining default value
	if (hiddenConf && hiddenConf[key]) {
		if (typeof config[key] === 'object') {
			config[key] = _.extend(config[key], hiddenConf[key]);
		} else {
			config[key] = hiddenConf[key];
		}
	}
}

defineConfig('env', 'development');
defineConfig('hostname', 'localhost');
defineConfig('port', 3001);

defineConfig('app',{
	debug: true, // set true to show stacktrace when error
	url: 'http://localhost:' + config.port,
	request_limit: '50mb',
});

defineConfig('ajax', {
	origins: ['http://localhost'],
});

// knex
defineConfig('knex', {
	debug: false,
})

// msql database
defineConfig('mssql', {
	host: '',
	database: '',
	user: '',
	password: '',
})

// smtp
defineConfig('email', {
	host: 'email-smtp.eu-west-1.amazonaws.com',
	tls: true,
	from: 'Karental Support <support@karental.id>',
})

//crypt
defineConfig('crypt', {
	salt_work_factor: 10, // for hashing strong password like user password
})

//paging
defineConfig('paging', {
	limit: 20,
})

// AWS
defineConfig('aws',{

})
defineConfig('aws_s3',{
	bucket: 'files.localdev.karental.id',
})

// file upload
defineConfig('upload',{
	url: config.app.url,	// url to access uploaded file
	storage: 'file',
	storage_path: './storage/',	// must end with '/'
	path_picture: 'upload/picture/',
})
// example config if using s3
//config.upload.storage = 's3';
//config.upload.url = 'https://s3-ap-southeast-1.amazonaws.com/files.localdev.karental.id';

// phantom js
defineConfig('phantom',{
	// how phantom calls the node server to get template to render, usually localhost
	template_url: 'http://localhost:' + config.port,
})

//root
defineConfig('root', path.normalize(__dirname + '/..'));

//secret codes

defineConfig('secret_codes', 'admin-app');



module.exports = config;

