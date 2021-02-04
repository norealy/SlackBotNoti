const BaseServer = require('../../common/BaseServer');
const httpProxy = require('http-proxy');

const proxy = httpProxy.createProxyServer({});

proxy.on('proxyReq', function(proxyReq, req) {
	if(req.body) {
		let bodyData = JSON.stringify(req.body);
		proxyReq.setHeader('Content-Type','application/json');
		proxyReq.setHeader('Content-Length', Buffer.byteLength(bodyData));
		proxyReq.write(bodyData);
	}
});

class SlackWrapper extends BaseServer {
	constructor(instanceId, opt) {
		super(instanceId, opt);
	}

	chatServiceHandler(req, res, next) {
		return res.status(200).send("Watch chat service handler");
	}

	resourceServerHandler(req, res, next){
		try {
			proxy.web(req, res, {
				target: 'http://localhost:5001'
			})
		} catch (e) {
			return res.status(204).send("ERROR")
		}
	}
}

module.exports = SlackWrapper;

(async function() {
	const wrapper = new SlackWrapper(process.argv[2], {
		config: {
			path: process.argv[3],
			appRoot: __dirname,
		},
	});
	await wrapper.init();
})();
