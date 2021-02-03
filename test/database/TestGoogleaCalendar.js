const GoogleCalendar = require("../../models/GoogleCalendar");
const { assert, expect } = require("chai");
const mysql = require("./index");

describe("======= GoogleCalendar =======", function () {
	before("===========Connect DB===========", async function () {
		await mysql.raw("SELECT VERSION()");
	});
	describe("======= ADD GoogleCalendar =======", function () {
		it("ADD GoogleCalendar", function (done) {
			GoogleCalendar.query()
				.insert({
					id: "id_calendarGG1",
					name: "google_calendar name",
					created_at: null,
				})
				.then((data) => {
					assert.typeOf(data, "object");
					assert.equal(data.name, "google_calendar name");
					assert.property(data, "id");
					assert.property(data, "name");
					done();
				})
				.catch(done);
		});

		it("ADD GoogleCalendar id EXIST", function (done) {
			GoogleCalendar.query()
				.insert({
					id: "id_calendarGG1",
					name: "google_calendar name",
					created_at: null,
				})
				.then((data) => {
					const error = new Error(" TEST Add channel fail");
					done(error);
				})
				.catch((error) => {
					const { nativeError } = error;
					assert.equal(nativeError.code, "ER_DUP_ENTRY");
					assert.equal(nativeError.errno, "1062");
					assert.equal(nativeError.sqlState, "23000");
					done(nativeError.sqlMessage);
				});
		});

		describe("======= UPDATE GoogleCalendar =======", function () {
			it("UPDATE GoogleCalendar TRUE", function (done) {
				const ggCal = {
					id: "id_calendarGG1",
					name: "google_calendar Nameeeeee",
					created_at: null,
				};
				GoogleCalendar.query()
					.updateAndFetchById("id_calendarGG1", ggCal)
					.then((data) => {
						assert.typeOf(data, "object");
						assert.equal(data.name, "google_calendar Nameeeeee");
						assert.property(data, "name");
						done();
					})
					.catch(() => {
						done();
					});
			});

			it("UPDATE GoogleCalendar ID DONT EXIST", function (done) {
				const ggCal = {
					id: "id_calendarGG10",
					name: "google_calendar Nameeeeee",
					created_at: null,
				};
				GoogleCalendar.query()
					.updateAndFetchById("id_calendarGG10", ggCal)
					.then((data) => {
						console.log("data:", data);
						if (!data) {
							const error = new Error("GoogleCalendar ID DONT EXIST");
							done(error);
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

	describe("======= DELETE GoogleCalendar =======", function () {
		it("DELETE GoogleCalendar TRUE", function (done) {
			GoogleCalendar.query()
				.deleteById("id_calendarGG1")
				.then((data) => {
					console.log(data);
					assert.typeOf(data, "number");
					done();
				})
				.catch(() => {
					done();
				});
		});

		it("DELETE GoogleCalendar ID DONT EXIST", function (done) {
			GoogleCalendar.query()
				.deleteById("id_calendarGG1")
				.then((data) => {
					console.log(data);
					if (data == 0) {
						const err = new Error("DELETE GoogleCalendar NOT FOUND  ");
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
