const GoogleCalendar = require('../../database/models/GoogleCalendar');
const { assert, expect } = require('chai');

describe('======= GoogleCalendar =======', function () {
    describe('======= ADD GoogleCalendar =======', function () {
        it('ADD GoogleCalendar', function (done) {
            GoogleCalendar
                .query()
                .insert({
                    id: 'id_calendarGG1',
                    name: 'google_calendar name',
                    created_at:null
                })
                .then((data) => {
                    assert.typeOf(data, 'object');
                    assert.equal(data.name, 'google_calendar name');
                    assert.property(data, 'id');
                    assert.property(data, 'name');
                    done();
                })
                .catch(done);
        });

        it('ADD GoogleCalendar id EXIST', function (done) {
            done();
        });

        describe('======= UPDATE GoogleCalendar =======', function () {
            it('UPDATE GoogleCalendar TRUE', function (done) {

                const ggCal = {
                    id: 'id_calendarGG1',
                    name: 'google_calendar Nameeeeee',
                    created_at:null
                };
                GoogleCalendar.query().updateAndFetchById('id_calendarGG1', ggCal)
                    .then((data) => {
                        assert.typeOf(data, 'object');
                        assert.equal(data.name, 'google_calendar Nameeeeee');
                        assert.property(data, 'name');
                        done();
                    })
                    .catch(done);
            });

            it('UPDATE GoogleCalendar ID DONT EXIST', function (done) {
                done();
            });

        });
    });

    describe('======= DELETE GoogleCalendar =======', function () {
        it('DELETE GoogleCalendar TRUE', function (done) {

            GoogleCalendar.query()
                .deleteById('id_calendarGG1')
                .then((data) => {
                    console.log(data)
                    assert.typeOf(data, 'number');
                    done();
                })
                .catch(done);

        });

        it('DELETE GoogleCalendar ID DONT EXIST', function (done) {
            done();
        });

    });

});