const MessageSlack = require('../../database/models/MessageSlack');
const { assert, expect } = require('chai');

describe('======= MessageSlack =======', function () {
    describe('======= ADD MessageSlack =======', function () {
        it('ADD MessageSlack', function (done) {
            MessageSlack
                .query()
                .insert({
                    id: 'message_slack2',
                    id_channel: 'id_channel1',
                    text: 'text',
                    type: 'type',
                    created_at: null,
                    updated_at: null
                })
                .then((data) => {
                    assert.typeOf(data, 'object');
                    assert.equal(data.id_channel, 'id_channel1');
                    assert.property(data, 'text');
                    assert.property(data, 'type');
                    done();
                })
                .catch(done);
        });

        it('ADD MessageSlack id EXIST', function (done) {
            done();
        });

        describe('======= UPDATE MessageSlack =======', function () {
            it('UPDATE MessageSlack TRUE', function (done) {
                MessageSlack
                    .query()
                    .findOne({
                        id: 'message_slack2'
                    }).then((messageSl) => {
                        messageSl.$query().patchAndFetch({
                            type: "created"
                        })
                            .then((data) => {
                                console.log(data);
                                done();
                            })
                            .catch(done);
                    })


            });

            it('UPDATE MessageSlack ID DONT EXIST', function (done) {
                done();
            });

        });
    });

    describe('======= DELETE MessageSlack =======', function () {
        it('DELETE MessageSlack TRUE', function (done) {

            MessageSlack.query()
                .delete()
                .where({
                    id: 'message_slack2'
                })
                .then((data) => {
                    console.log(data)
                    assert.typeOf(data, 'number');
                    done();
                })
                .catch(done);

        });

        it('DELETE MessageSlack ID DONT EXIST', function (done) {
            done();
        });

    });

});