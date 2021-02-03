const GoogleAccount = require("../../models/GoogleAccount");
const { assert, expect } = require("chai");
const mysql = require("./index");
describe("======= GoogleAccount =======", function () {
	before("===========Connect DB===========", async function () {
		await mysql.raw("SELECT VERSION()");
	});
	describe("======= ADD GoogleAccount =======", function () {
		it("ADD Google Account", function (done) {
			GoogleAccount.query()
				.insert({
					id: "id_gg4",
					name: "xdatgd",
					refresh_token: "refresh_token",
					created_at: null,
					updated_at: null,
				})
				.then((data) => {
					assert.typeOf(data, "object");
					assert.equal(data.name, "xdatgd");
					assert.property(data, "id");
					assert.property(data, "name");
					assert.property(data, "refresh_token");
					done();
				})
				.catch((err) => {
					done();
				});
		});

		it("ADD Google Account id EXIST", function (done) {
			GoogleAccount.query()
				.insert({
					id: "id_gg4",
					name: "xdatgd",
					refresh_token: "refresh_token",
					created_at: null,
					updated_at: null,
				})
				.then((data) => {
					done();
				})
				.catch((error) => {
					const { nativeError } = error;
					assert.equal(nativeError.code, "ER_DUP_ENTRY");
					assert.equal(nativeError.errno, "1062");
					assert.equal(nativeError.sqlState, "23000");
					done(nativeError.sqlMessage);
				});
		});

		describe("======= UPDATE Google Account =======", function () {
			it("UPDATE Google Account TRUE", function (done) {
				const ggAcc = {
					id: "id_gg4",
					name: "name123",
					refresh_token: "refresh_token1",
				};
				GoogleAccount.query()
					.updateAndFetchById("id_gg4", ggAcc)
					.then((data) => {
						assert.typeOf(data, "object");
						assert.equal(data.name, "name123");
						assert.equal(data.refresh_token, "refresh_token1");
						assert.property(data, "name");
						done();
					})
					.catch((err) => {
						done();
					});
			});
		});

		it("UPDATE Google Account ID DONT EXIST", function (done) {
			const ggAcc = {
				id: "id_gg455",
				name: "name123",
				refresh_token: "refresh_token1",
			};
			GoogleAccount.query()
				.updateAndFetchById("id_gg455", ggAcc)
				.then((data) => {
					assert.typeOf(data, "undefined");
					done();
				})
				.catch((err) => {
					done();
				});
		});
	});
});

describe("======= DELETE Google Account =======", function () {
	it("DELETE Google Account TRUE", function (done) {
		GoogleAccount.query()
			.deleteById("id_gg4")
			.then((data) => {
				if (data > 0) {
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

	it("DELETE Google Account ID DONT EXIST", function (done) {
		GoogleAccount.query()
			.deleteById("id_gg4")
			.then((data) => {
				if (data == 0) {
					const err = new Error("DELETE Google Account NOT FOUND  ");
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
