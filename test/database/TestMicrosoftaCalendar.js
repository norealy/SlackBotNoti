const MicrosoftCalendar = require("../../models/MicrosoftCalendar");
const { assert, expect } = require("chai");
const mysql = require("./index");

describe("======= MicrosoftCalendar =======", function () {
	before("===========Connect DB===========", async function () {
		await mysql.raw("SELECT VERSION()");
	});
	describe("======= ADD MicrosoftCalendar =======", function () {
		it("ADD MicrosoftCalendar", function (done) {
			MicrosoftCalendar.query()
				.insert({
					id: "id_calendarMS3",
					name: "Microsoft Calendar name 4",
					address_owner: "address_owner",
					created_at: null,
				})
				.then((data) => {
					assert.typeOf(data, "object");
					assert.equal(data.name, "Microsoft Calendar name 4");
					assert.property(data, "address_owner");
					assert.property(data, "name");
					done();
				})
				.catch(done);
		});

		it("ADD MicrosoftCalendar id EXIST", function (done) {
			MicrosoftCalendar.query()
				.insert({
					id: "id_calendarMS3",
					name: "Microsoft Calendar name 4",
					address_owner: "address_owner",
					created_at: null,
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

		describe("======= UPDATE MicrosoftCalendar =======", function () {
			it("UPDATE MicrosoftCalendar TRUE", function (done) {
				const msCal = {
					id: "id_calendarMS3",
					address_owner: "address_owner",
					name: "google_calendar Nameeeeee 44444",
				};
				MicrosoftCalendar.query()
					.updateAndFetchById("id_calendarMS3", msCal)
					.then((data) => {
						assert.typeOf(data, "object");
						assert.equal(data.name, "google_calendar Nameeeeee 44444");
						assert.property(data, "name");
						done();
					})
					.catch(done);
			});

			it("UPDATE MicrosoftCalendar ID DONT EXIST", function (done) {
				const msCal = {
					id: "id_calendarMS333",
					address_owner: "address_owner",
					name: "google_calendar Nameeeeee 44444",
				};
				MicrosoftCalendar.query()
					.updateAndFetchById("id_calendarMS33355", msCal)
					.then((data) => {
						assert.typeOf(data, "undefined");
						done();
					})
					.catch((error) => {
						done();
					});
			});
		});
	});

	describe("======= DELETE MicrosoftCalendar =======", function () {
		it("DELETE MicrosoftCalendar TRUE", function (done) {
			MicrosoftCalendar.query()
				.deleteById("id_calendarMS3")
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

		it("DELETE MicrosoftCalendar ID DONT EXIST", function (done) {
			MicrosoftCalendar.query()
				.deleteById("id_calendarMS3")
				.then((data) => {
					if (data == 0) {
						const err = new Error("DELETE MicrosoftCalendar NOT FOUND  ");
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
