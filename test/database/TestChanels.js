const Channels = require('../../database/models/Channels');
const { assert, expect } = require('chai');

describe('======= CHANNELS =======', function () {
    describe('======= ADD CHANNELS =======', function () {
        it('ADD CHANNELS', function (done) {
            Channels
                .query()
                .insert({
                    id: 'id_channel01',
                    name: 'name1',
                    created_at: null
                })
                .then((channel) => {
                    assert.typeOf(channel, 'object');
                    assert.equal(channel.name, 'name1');
                    assert.property(channel, 'id');
                    assert.property(channel, 'name');
                    done();
                })
                .catch(done);
        });

        it('ADD CHANNELS id EXIST', function (done) {
            //             console.log(Object.getOwnPropertyNames(error));
            //             assert.equal(error.message.split('-')[1], `Duplicate entry 'id_channel' for key 'PRIMARY'`, 'Add id exist fail OK !');
            //             assert.typeOf(error, 'object');
            //             done();
            done();
        });

        describe('======= UPDATE CHANNELS =======', function () {
            it('UPDATE CHANNELS TRUE', function (done) {

                const channel = {
                    id: 'id_channel01',
                    name: 'name10000',
                    created_at: null
                }
                Channels.query().updateAndFetchById('id_channel01', channel)
                    .then((data) => {
                        assert.typeOf(data, 'object');
                        assert.equal(data.name, 'name10000');
                        assert.property(data, 'name');
                        done();
                    })
                    .catch(done);
            });

            it('UPDATE CHANNELS ID DONT EXIST', function (done) {
                done();
            });

        });
    });

    describe('======= DELETE CHANNELS =======', function () {
        it('DELETE CHANNELS TRUE', function (done) {

            Channels.query()
                .deleteById('id_channel01')
                .then((data) => {
                    console.log(data)
                    assert.typeOf(data, 'number');
                    done();
                })
                .catch(done);

        });

        it('DELETE CHANNELS ID DONT EXIST', function (done) {
            done();
        });

    });

});