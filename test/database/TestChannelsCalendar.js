const ChannelsCalendar = require('../../database/models/ChannelsCalendar');
const { assert, expect } = require('chai');

describe('======= ChannelsCalendar =======', function () {
    describe('======= ADD ChannelsCalendar =======', function () {
        it('ADD ChannelsCalendar', function (done) {
            ChannelsCalendar
                .query()
                .insert({
                    id_calendar: 'id_calendar4',
                    id_channel: 'id_channel1',
                    watch: true,
                    created_at: null,
                    updated_at: null
                })
                .then((data) => {
                    assert.typeOf(data, 'object');
                    assert.equal(data.id_channel, 'id_channel1');
                    assert.property(data, 'id_calendar');
                    assert.property(data, 'id_channel');
                    done();
                })
                .catch(done);
        });

        it('ADD ChannelsCalendar id EXIST', function (done) {
            done();
        });

        describe('======= UPDATE ChannelsCalendar =======', function () {
            it('UPDATE ChannelsCalendar TRUE', function (done) {
                const channelsCalendar = ChannelsCalendar
                    .query()
                    .findOne({
                        id_calendar: 'id_calendar4',
                        id_channel: 'id_channel1'
                    }).then((channelsCal) => {
                        channelsCal.$query().patchAndFetch({
                            watch: false
                        })
                            .then((data) => {
                                assert.isNotFalse(data.watch, 'FailOk');
                                done();
                            })
                            .catch(done);
                    })


            });

            it('UPDATE ChannelsCalendar ID DONT EXIST', function (done) {
                done();
            });

        });
    });

    describe('======= DELETE ChannelsCalendar =======', function () {
        it('DELETE ChannelsCalendar TRUE', function (done) {

            ChannelsCalendar.query()
                .delete()
                .where({
                    id_calendar: 'id_calendar4',
                    id_channel: 'id_channel1'
                })
                .then((data) => {
                    console.log(data)
                    assert.typeOf(data, 'number');
                    done();
                })
                .catch(done);

        });

        it('DELETE ChannelsCalendar ID DONT EXIST', function (done) {
            done();
        });

    });

});