const Channels = require("../../models/Channels");
const { assert, expect } = require("chai");
const mysql = require("./index");

describe("======= CHANNELS =======", async function () {
	before("===========Connect DB===========", async function () {
		await mysql.raw("SELECT VERSION()");
	});
	describe("======= ADD CHANNELS =======", function () {
		it("ADD CHANNELS", function (done) {
			Channels.query()
				.insert({
					id: "id_channel01",
					name: "name1",
					created_at: null,
				})
				.then((channel) => {
					assert.typeOf(channel, "object");
					assert.equal(channel.name, "name1");
					assert.equal(channel.id, "id_channel01");
					assert.property(channel, "id");
					assert.property(channel, "name");
					done();
				})
				.catch((error) => {
					done();
				});
		});

		it("ADD CHANNELS id EXIST", function (done) {
			Channels.query()
				.insert({
					id: "id_channel01",
					name: "name1",
					created_at: null,
				})
				.then((data) => {
					const error = new Error(" TEST Add channel fail");
					done(error);
				})
				.catch((error) => {
					// console.log(error)
					const { nativeError } = error;
					assert.equal(nativeError.code, "ER_DUP_ENTRY");
					assert.equal(nativeError.errno, "1062");
					assert.equal(nativeError.sqlState, "23000");
					assert.equal(
						nativeError.sqlMessage,
						`Duplicate entry 'id_channel01' for key 'PRIMARY'`
					);
					done(nativeError.sqlMessage);
				});
		});
	});

	describe("======= UPDATE CHANNELS =======", function () {
		it("UPDATE CHANNELS TRUE", function (done) {
			const channel1 = {
				id: "id_channel01",
				name: "name12345",
				created_at: null,
			};
			Channels.query()
				.updateAndFetchById("id_channel01", channel1)
				.then((data) => {
					if (!data) {
						const error = new Error("TEST UPDATE CHANNELS Fail");
						done(error);
					}
					assert.typeOf(data, "object");
					assert.equal(data.name, "name12345");
					assert.equal(data.id, "id_channel01");
					assert.property(data, "id");
					assert.property(data, "name");
					done();
				})
				.catch((error) => {
					done();
				});
		});
		it("UPDATE CHANNELS ID DONT EXIST", function (done) {
			const channel1 = {
				id: "id_channel0102",
				name: "name12345",
				created_at: null,
			};
			Channels.query()
				.updateAndFetchById("id_channel0102", channel1)
				.then((data) => {
					assert.typeOf(data, "undefined");
					done();
				})
				.catch((error) => {
					done();
				});
		});
	});

	describe("======= DELETE CHANNELS =======", function () {
		it("DELETE CHANNELS TRUE", function (done) {
			Channels.query()
				.deleteById("id_channel01")
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

		it("DELETE CHANNELS NOT FOUND", function (done) {
			Channels.query()
				.deleteById("id_channel0001")
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
});
