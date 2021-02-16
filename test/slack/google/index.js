let chai = require('chai');
let chaiHttp = require('chai-http');
const assert = chai.assert;
const SlackGoogle = require('../../../slack/google');
chai.use(chaiHttp);

describe('======= Slack and Google =======', function () {

	// initialize server
	const pipeline = new SlackGoogle(process.argv[3], {
		config: {
			path: process.argv[4],
			appRoot: __dirname,
		},
	});
	before(async function() {
		await pipeline.init();
	});
	const server = pipeline.app;

	describe('UNIT TEST', function () {
		it('eg ....', function (done) {
			done();
		});
	})

	describe('FUNCTION TEST', function () {
		it('GET /health-check', function (done) {
			chai.request(server)
				.get('/health-check')
				.end(function (err, res) {
					assert.equal(res.statusCode, 200);
					assert.equal(res.type, 'application/json');
					assert.isObject(res.body, "response body is object");
					assert.equal(res.body.pong, "OK");
					done();
				});
		});
	})

});
