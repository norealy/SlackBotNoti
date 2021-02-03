const ChannelsCalendar = require("../../models/ChannelsCalendar");
const { assert, expect } = require("chai");
const mysql = require("./index");

describe("======= ChannelsCalendar =======", function () {
	before("===========Connect DB===========", async function () {
		await mysql.raw("SELECT VERSION()");
	});
	describe("======= ADD ChannelsCalendar =======", function () {
		it("ADD ChannelsCalendar", function (done) {
			ChannelsCalendar.query()
				.insert({
					id_calendar: "id_calendar4",
					id_channel: "id_channel1",
					watch: true,
					created_at: null,
					updated_at: null,
				})
				.then((data) => {
					assert.typeOf(data, "object");
					assert.equal(data.id_channel, "id_channel1");
					assert.property(data, "id_calendar");
					assert.property(data, "id_channel");
					done();
				})
				.catch(done);
		});

		it("ADD ChannelsCalendar id EXIST", function (done) {
			ChannelsCalendar.query()
				.insert({
					id_calendar: "id_calendar4",
					id_channel: "id_channel1",
					watch: true,
					created_at: null,
					updated_at: null,
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
	});
	describe("======= UPDATE ChannelsCalendar =======", function () {
		it("UPDATE ChannelsCalendar TRUE", function (done) {
			ChannelsCalendar.query()
				.findOne({
					id_calendar: "id_calendar4",
					id_channel: "id_channel1",
				})
				.then((channelsCal) => {
					channelsCal
						.$query()
						.patchAndFetch({
							watch: false,
						})
						.then((data) => {
							assert.typeOf(data, "object");
							assert.equal(data.id_channel, "id_channel1");
							assert.property(data, "id_calendar");
							assert.property(data, "id_channel");
							assert.isNotFalse(data.watch, "ok");
							done();
						})
						.catch((error) => {
							done();
						});
				})
				.catch((error) => {
					done();
				});
		});

		it("UPDATE ChannelsCalendar ID DONT EXIST", function (done) {
			ChannelsCalendar.query()
				.findOne({
					id_calendar: "id_calendar55",
					id_channel: "id_channel1",
				})
				.then((channelsCal) => {
					channelsCal
						.$query()
						.patchAndFetch({
							watch: "false",
						})
						.then((data) => {
							done();
						})
						.catch((error) => {
							done();
						});
				})
				.catch((error) => {
					assert.typeOf(error, "object");
					done();
				});
		});

		it("UPDATE ChannelsCalendar id_channel DONT EXIST", function (done) {
			ChannelsCalendar.query()
				.findOne({
					id_calendar: "id_calendar4",
					id_channel: "id_channel1",
				})
				.then((channelsCal) => {
					channelsCal
						.$query()
						.patchAndFetch({
							id_channel: "id_channel55",
							watch: false,
						})
						.then((data) => {
							done();
						})
						.catch((error) => {
							const { nativeError } = error;
							assert.equal(nativeError.code, "ER_NO_REFERENCED_ROW_2");
							assert.equal(nativeError.errno, "1452");
							assert.equal(nativeError.sqlState, "23000");
							done();
						});
				})
				.catch((error) => {
					done();
				});
		});
	});

	describe("======= DELETE ChannelsCalendar =======", function () {
		it("DELETE ChannelsCalendar TRUE", function (done) {
			ChannelsCalendar.query()
				.delete()
				.where({
					id_calendar: "id_calendar4",
					id_channel: "id_channel1",
				})
				.then((data) => {
					console.log(data);
					assert.typeOf(data, "number");
					done();
				})
				.catch(done);
		});
		it("DELETE ChannelsCalendar ID DONT EXIST", function (done) {
			ChannelsCalendar.query()
				.delete()
				.where({
					id_calendar: "id_calendar45",
					id_channel: "id_channel1",
				})
				.then((data) => {
					console.log(data);
					if (data == 0) {
						const err = new Error("DELETE ChannelsCalendar NOT FOUND  ");
						done(err);
					} else {
						done();
					}
				})
				.catch((err) => {
					console.log(err);
					done();
				});
		});
	});
});
