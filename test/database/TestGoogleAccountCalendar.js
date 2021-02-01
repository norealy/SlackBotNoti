const GoogleAccountCalendar = require('../../database/models/GoogleAccountCalendar');
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
                    assert.equal(data.id_account, 'id_gg2',);
                    assert.property(data, 'id_calendar');
                    assert.property(data, 'id_account');
                    done();
                })
                .catch(done);
        });

        it('ADD GoogleAccountCalendar id EXIST', function (done) {
            done();
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
                                console.log(data)
                                done();
                            })
                            .catch(done);
                    });
            });

            it('UPDATE GoogleAccountCalendar ID DONT EXIST', function (done) {
                done();
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
                    console.log(data)
                    assert.typeOf(data, 'number');
                    done();
                })
                .catch(done);

        });

        it('DELETE GoogleAccountCalendar ID DONT EXIST', function (done) {
            done();
        });

    });

});