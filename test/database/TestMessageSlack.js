const MessageSlack = require("../../models/MessageSlack");
const { assert, expect } = require("chai");
const mysql = require("./index");

describe("======= MessageSlack =======", function () {
	before("===========Connect DB===========", async function () {
		await mysql.raw("SELECT VERSION()");
	});
	describe("======= ADD MessageSlack =======", function () {
		it("ADD MessageSlack", function (done) {
			MessageSlack.query()
				.insert({
					id: "message_slack5",
					id_channel: "id_channel1",
					text: "text",
					type: "type",
					created_at: null,
					updated_at: null,
				})
				.then((data) => {
					assert.typeOf(data, "object");
					assert.equal(data.id, "message_slack5");
					assert.equal(data.text, "text");
					assert.equal(data.type, "type");
					assert.property(data, "id");
					assert.property(data, "id_channel");
					assert.property(data, "text");
					assert.property(data, "type");

					done();
				})
				.catch((err) => {
					done();
				});
		});

		it("ADD MessageSlack id EXIST", function (done) {
			MessageSlack.query()
				.insert({
					id: "message_slack5",
					id_channel: "id_channel1",
					text: "text",
					type: "type",
					created_at: null,
					updated_at: null,
				})
				.then((data) => {
					done();
				})
				.catch((err) => {
					const { nativeError } = error;
					assert.equal(nativeError.code, "ER_DUP_ENTRY");
					assert.equal(nativeError.errno, "1062");
					assert.equal(nativeError.sqlState, "23000");
					done(nativeError.sqlMessage);
				});
		});

		describe("======= UPDATE MessageSlack =======", function () {
			it("UPDATE MessageSlack TRUE", function (done) {
				const msSlaack = {
					id: "message_slack5",
					id_channel: "id_channel1",
					text: "text",
					type: "type321321",
					created_at: null,
					updated_at: null,
				};
				MessageSlack.query()
					.updateAndFetchById("message_slack5", msSlaack)
					.then((data) => {
						assert.typeOf(data, "object");
						assert.equal(data.type, "type321321");
						assert.property(data, "id");
						assert.property(data, "id_channel");
						assert.property(data, "text");
						assert.property(data, "type");
						done();
					})
					.catch((err) => {
						console.log(err);
						done();
					});
			});
		});

		it("UPDATE MessageSlack ID DONT EXIST", function (done) {
			it("UPDATE MessageSlack TRUE", function (done) {
				const msSlaack = {
					id: "message_slack33335",
					id_channel: "id_channel1",
					text: "text",
					type: "type321321",
					created_at: null,
					updated_at: null,
				};
				MessageSlack.query()
					.updateAndFetchById("message_slack5", msSlaack)
					.then((data) => {
						assert.typeOf(data, "object");
						assert.equal(data.type, "type321321");
						assert.property(data, "id");
						assert.property(data, "id_channel");
						assert.property(data, "text");
						assert.property(data, "type");
						done();
					})
					.catch((err) => {
						console.log(err);
						done();
					});
			});
		});
	});
});

describe("======= DELETE MessageSlack =======", function () {
	it("DELETE MessageSlack TRUE", function (done) {
		MessageSlack.query()
			.deleteById("message_slack5")
			.then((data) => {
				if (data >= 1) {
					assert.typeOf(data, "number");
					done();
				} else {
					done();
				}
			})
			.catch((err) => {
				done();
			});
	});

	it("DELETE MessageSlack ID DONT EXIST", function (done) {
		MessageSlack.query()
			.deleteById("message_slack5")
			.then((data) => {
				if (data == 0) {
					const err = new Error("DELETE CHANNELS NOT FOUND  ");
					done(err);
				} else {
					done();
				}
			})
			.catch((err) => {
				done();
			});
	});
});
