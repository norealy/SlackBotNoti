const GoogleAccountCalendar = require('../../models/GoogleAccountCalendar');
const { assert, expect } = require('chai');

describe('======= GoogleAccountCalendar =======', function () {
    describe('======= ADD GoogleAccountCalendar =======', function () {
        it('ADD GoogleAccountCalendar', function (done) {
            GoogleAccountCalendar
                .query()
                .insert({
                    id_calendar: 'id_calendar1',
                    id_account: 'id_gg2',
                    created_at: null,
                })
                .then((data) => {
                    assert.typeOf(data, 'object');
                    assert.equal(data.id_account, 'id_gg2');
                    assert.property(data, 'id_calendar');
                    assert.property(data, 'id_account');
                    done();
                })
                .catch((err) => {
                    done("Test fail")
                });
        });

        it('ADD GoogleAccountCalendar id EXIST', function (done) {
            GoogleAccountCalendar
                .query()
                .insert({
                    id_calendar: 'id_calendar1',
                    id_account: 'id_gg2',
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

        describe('======= UPDATE GoogleAccountCalendar =======', function () {
            it('UPDATE GoogleAccountCalendar TRUE', function (done) {
                GoogleAccountCalendar
                    .query()
                    .findOne({
                        id_calendar: 'id_calendar1',
                        id_account: 'id_gg2',
                    }).then((ggAccCal) => {
                        ggAccCal.$query().patchAndFetch({
                            id_calendar: 'id_calendar2'
                        })
                            .then((data) => {
                                done();
                            })
                            .catch((err) => {
                                console.log(console.err)
                                done("Test fail")
                            });
                    });
            });

            it('UPDATE GoogleAccountCalendar ID id_calendar DONT EXIST', function (done) {
                GoogleAccountCalendar
                    .query()
                    .findOne({
                        id_calendar: 'id_calendar1',
                        id_account: 'id_gg2',
                    })
                    .then((ggAccCal) => {
                        ggAccCal.$query().patchAndFetch({
                            id_calendar: 'id_calendar200'
                        })
                            .then((data) => {
                                done("TEST FAIL");
                            })
                            .catch((err) => {
                                const { nativeError } = error
                                assert.equal(nativeError.code, 'ER_NO_REFERENCED_ROW_2');
                                assert.equal(nativeError.errno, '1452');
                                assert.equal(nativeError.sqlState, '23000');
                                done(" GoogleAccountCalendar id_channel DONT EXIST");
                                
                            });
                    });
            });

        });
    });

    describe('======= DELETE GoogleAccountCalendar =======', function () {
        it('DELETE GoogleAccountCalendar TRUE', function (done) {

            GoogleAccountCalendar.query()
                .delete()
                .where({
                    id_calendar: 'id_calendar2',
                    id_account: 'id_gg2',
                })
                .then((data) => {
                    assert.typeOf(data, 'number');
                    done();
                })
                .catch(done);
        });

        it('DELETE GoogleAccountCalendar ID DONT EXIST', function (done) {
            GoogleAccountCalendar.query()
            .delete()
            .where({
                id_calendar: 'id_calendar2',
                id_account: 'id_gg2',
            })
            .then((data) => {
                if (data == 0) {
                    const err = new Error("DELETE Google Account Calendar NOT FOUND  ");
                    done(err);
                } else {
                    done("TEST FAIL");
                }
            })
            .catch((err)=>{
                done("TEST FAIL");
            });
        });

    });

});