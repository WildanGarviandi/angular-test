var AWS = require('aws-sdk');
var Promise = require('bluebird');
var config = require('../config');

AWS.config.update({
	accessKeyId: config.aws.accessKeyId,
	secretAccessKey: config.aws.secretAccessKey,
});
AWS.config.apiVersion = '2015-10-13';

var s3 = new AWS.S3({ 
	region: 'ap-southeast-1',
	params: {Bucket: config.aws_s3.bucket} 
});
s3 = Promise.promisifyAll(s3);


module.exports.s3 = s3;