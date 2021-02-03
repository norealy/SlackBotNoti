const MicrosoftAccount = require("../../models/MicrosoftAccount");
const { assert, expect } = require("chai");
const mysql = require("./index");

describe("======= MicrosoftAccount =======", function () {
	before("===========Connect DB===========", async function () {
		await mysql.raw("SELECT VERSION()");
	});
	describe("======= ADD MicrosoftAccount =======", function () {
		it("ADD MicrosoftAccount", function (done) {
			MicrosoftAccount.query()
				.insert({
					id: "id_ms4",
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

		it("ADD MicrosoftAccount id EXIST", function (done) {
			MicrosoftAccount.query()
				.insert({
					id: "id_ms4",
					name: "xdatgd",
					refresh_token: "refresh_token",
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

		describe("======= UPDATE MicrosoftAccount =======", function () {
			it("UPDATE MicrosoftAccount TRUE", function (done) {
				const msAcc = {
					id: "id_ms4",
					name: "name123444",
					refresh_token: "refresh_token1",
				};
				MicrosoftAccount.query()
					.updateAndFetchById("id_ms4", msAcc)
					.then((data) => {
						assert.typeOf(data, "object");
						assert.equal(data.name, "name123444");
						assert.property(data, "name");
						done();
					})
					.catch((err) => {
						done();
					});
			});

			it("UPDATE MicrosoftAccount ID DONT EXIST", function (done) {
				const msAcc = {
					id: "id_ms4000",
					name: "name123444",
					refresh_token: "refresh_token1",
				};
				MicrosoftAccount.query()
					.updateAndFetchById("id_ms4000", msAcc)
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

	describe("======= DELETE MicrosoftAccount =======", function () {
		it("DELETE MicrosoftAccount TRUE", function (done) {
			MicrosoftAccount.query()
				.deleteById("id_ms4")
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

		it("DELETE MicrosoftAccount ID DONT EXIST", function (done) {
			MicrosoftAccount.query()
				.deleteById("id_ms4")
				.then((data) => {
					if (data == 0) {
						const err = new Error("DELETE MicrosoftAccount NOT FOUND  ");
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
