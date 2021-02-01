const MicrosoftAccountCalendar = require('../../database/models/MicrosoftAccountCalendar');
const { assert, expect } = require('chai');

describe('======= MicrosoftAccountCalendar =======', function () {
    describe('======= ADD MicrosoftAccountCalendar =======', function () {
        it('ADD MicrosoftAccountCalendar', function (done) {
            MicrosoftAccountCalendar
                .query()
                .insert({
                    id_calendar: 'id_calendar1',
                    id_account: 'id_ms3',
                    created_at: null,
                })
                .then((data) => {
                    assert.typeOf(data, 'object');
                    assert.equal(data.id_account, 'id_ms3',);
                    assert.property(data, 'id_calendar');
                    assert.property(data, 'id_account');
                    done();
                })
                .catch(done);
        });

        it('ADD MicrosoftAccountCalendar id EXIST', function (done) {
            done();
        });

        describe('======= UPDATE MicrosoftAccountCalendar =======', function () {
            it('UPDATE MicrosoftAccountCalendar TRUE', function (done) {
                MicrosoftAccountCalendar
                    .query()
                    .findOne({
                        id_calendar: 'id_calendar1',
                        id_account: 'id_ms3',
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

            it('UPDATE MicrosoftAccountCalendar ID DONT EXIST', function (done) {
                done();
            });

        });
    });

    describe('======= DELETE MicrosoftAccountCalendar =======', function () {
        it('DELETE MicrosoftAccountCalendar TRUE', function (done) {

            MicrosoftAccountCalendar.query()
                .delete()
                .where({
                    id_calendar: 'id_calendar2',
                    id_account: 'id_ms3',
                })
                .then((data) => {
                    console.log(data)
                    assert.typeOf(data, 'number');
                    done();
                })
                .catch(done);

        });

        it('DELETE MicrosoftAccountCalendar ID DONT EXIST', function (done) {
            done();
        });

    });

});