const MicrosoftCalendar = require('../../database/models/MicrosoftCalendar');
const { assert, expect } = require('chai');

describe('======= MicrosoftCalendar =======', function () {
    describe('======= ADD MicrosoftCalendar =======', function () {
        it('ADD MicrosoftCalendar', function (done) {
            MicrosoftCalendar
                .query()
                .insert({
                    id: 'id_calendarMS3',
                    name: 'Microsoft Calendar name 4',
                    address_owner:"address_owner",
                    created_at:null
                })
                .then((data) => {
                    assert.typeOf(data, 'object');
                    assert.equal(data.name, 'Microsoft Calendar name 4');
                    assert.property(data, 'address_owner');
                    assert.property(data, 'name');
                    done();
                })
                .catch(done);
        });

        it('ADD MicrosoftCalendar id EXIST', function (done) {
            done();
        });

        describe('======= UPDATE MicrosoftCalendar =======', function () {
            it('UPDATE MicrosoftCalendar TRUE', function (done) {

                const msCal = {
                    id: 'id_calendarMS3',
                    address_owner:"address_owner",
                    name: 'google_calendar Nameeeeee 44444',
                };
                MicrosoftCalendar.query().updateAndFetchById('id_calendarMS3', msCal)
                    .then((data) => {
                        assert.typeOf(data, 'object');
                        assert.equal(data.name, 'google_calendar Nameeeeee 44444');
                        assert.property(data, 'name');
                        done();
                    })
                    .catch(done);
            });

            it('UPDATE MicrosoftCalendar ID DONT EXIST', function (done) {
                done();
            });

        });
    });

    describe('======= DELETE MicrosoftCalendar =======', function () {
        it('DELETE MicrosoftCalendar TRUE', function (done) {

            MicrosoftCalendar.query()
                .deleteById('id_calendarMS3')
                .then((data) => {
                    console.log(data)
                    assert.typeOf(data, 'number');
                    done();
                })
                .catch(done);

        });

        it('DELETE MicrosoftCalendar ID DONT EXIST', function (done) {
            done();
        });

    });

});