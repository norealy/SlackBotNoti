const MicrosoftAccountCalendar = require('../../models/MicrosoftAccountCalendar');
const { assert, expect } = require('chai');

describe('======= MicrosoftAccountCalendar =======', function () {
    describe('======= ADD MicrosoftAccountCalendar =======', function () {
        it('ADD MicrosoftAccountCalendar', function (done) {
            MicrosoftAccountCalendar
                .query()
                .insert({
                    id_calendar: 'id_calendar1',
                    id_account: 'id_ms2',
                    created_at: null,
                })
                .then((data) => {
                    assert.typeOf(data, 'object');
                    assert.equal(data.id_account, 'id_ms2');
                    assert.equal(data.id_calendar, 'id_calendar1');
                    assert.property(data, 'id_calendar');
                    assert.property(data, 'id_account');
                    done();
                })
                .catch((err) => {
                    done("Test fail")
                });
        });

        it('ADD MicrosoftAccountCalendar id EXIST', function (done) {
            MicrosoftAccountCalendar
                .query()
                .insert({
                    id_calendar: 'id_calendar1',
                    id_account: 'id_ms2',
                    created_at: null,
                })
                .then((data) => {
                    done("Test fail");
                })
                .catch((error) => {
                    const { nativeError } = error
                    assert.equal(nativeError.code, 'ER_DUP_ENTRY');
                    assert.equal(nativeError.errno, '1062');
                    assert.equal(nativeError.sqlState, '23000');
                    done(nativeError.sqlMessage);
                });
        });

    });

    describe('======= UPDATE MicrosoftAccountCalendar =======', function () {
        it('UPDATE MicrosoftAccountCalendar TRUE', function (done) {
            MicrosoftAccountCalendar
                .query()
                .findOne({
                    id_calendar: 'id_calendar1',
                    id_account: 'id_ms2',
                }).then((AccCal) => {
                    AccCal.$query().patchAndFetch({
                        id_calendar: 'id_calendar3'
                    })
                        .then((data) => {
                            done();
                        })
                        .catch((err) => {
                            console.log(err)
                            done("Test fail")
                        });
                });
        });

        it('UPDATE MicrosoftAccountCalendar ID DONT EXIST', function (done) {
            MicrosoftAccountCalendar
                .query()
                .findOne({
                    id_calendar: 'id_calendar1',
                    id_account: 'id_ms2',
                }).then((AccCal) => {
                    AccCal.$query().patchAndFetch({
                        id_calendar: 'id_calendar3000'
                    })
                        .then((data) => {
                            done("TEST FAIL");
                        })
                        .catch((err) => {
                            const { nativeError } = error
                            assert.equal(nativeError.code, 'ER_NO_REFERENCED_ROW_2');
                            assert.equal(nativeError.errno, '1452');
                            assert.equal(nativeError.sqlState, '23000');
                            done(" id_channel DONT EXIST");
                        });
                });
        });

    });

    describe('======= DELETE MicrosoftAccountCalendar =======', function () {
        it('DELETE MicrosoftAccountCalendar TRUE', function (done) {

            MicrosoftAccountCalendar.query()
                .delete()
                .where({
                    id_calendar: 'id_calendar1',
                    id_account: 'id_ms2',
                })
                .then((data) => {
                    console.log(data)
                    assert.typeOf(data, 'number');
                    done();
                })
                .catch(done);

        });

        it('DELETE MicrosoftAccountCalendar ID DONT EXIST', function (done) {
            MicrosoftAccountCalendar.query()
                .delete()
                .where({
                    id_calendar: 'id_calendar1',
                    id_account: 'id_ms2',
                })
                .then((data) => {
                    console.log(data);
                    if (data == 0) {
                        const err = new Error("DELETE MicrosoftAccountCalendar NOT FOUND  ");
                        done(err);
                    } else {
                        done("TEST FAIL");
                    }
                })
                .catch((err) => {
                    console.log(err);
                    done("TEST FAIL");
                });
        });

    });

});