const MicrosoftAccount = require('../../database/models/MicrosoftAccount');
const { assert, expect } = require('chai');

describe('======= MicrosoftAccount =======', function () {
    describe('======= ADD MicrosoftAccount =======', function () {
        it('ADD MicrosoftAccount', function (done) {
            MicrosoftAccount
                .query()
                .insert({
                    id: 'id_ms4',
                    name: 'xdatgd',
                    refresh_token: 'refresh_token',
                    created_at: null,
                    updated_at: null
                })
                .then((data) => {
                    assert.typeOf(data, 'object');
                    assert.equal(data.name, 'xdatgd');
                    assert.property(data, 'id');
                    assert.property(data, 'name');
                    assert.property(data, 'refresh_token');
                    done();
                })
                .catch(done);
        });

        it('ADD MicrosoftAccount id EXIST', function (done) {
            done();
        });

        describe('======= UPDATE MicrosoftAccount =======', function () {
            it('UPDATE MicrosoftAccount TRUE', function (done) {

                const msAcc = { id: 'id_ms4', name: 'name123444',refresh_token:"refresh_token1"};
                MicrosoftAccount.query().updateAndFetchById('id_ms4', msAcc)
                    .then((data) => {
                        assert.typeOf(data, 'object');
                        assert.equal(data.name, 'name123444');
                        assert.property(data, 'name');
                        done();
                    })
                    .catch(done);
            });

            it('UPDATE MicrosoftAccount ID DONT EXIST', function (done) {
                done();
            });

        });
    });

    describe('======= DELETE MicrosoftAccount =======', function () {
        it('DELETE MicrosoftAccount TRUE', function (done) {

            MicrosoftAccount.query()
                .deleteById('id_ms4')
                .then((data) => {
                    console.log(data)
                    assert.typeOf(data, 'number');
                    done();
                })
                .catch(done);

        });

        it('DELETE Google Account ID DONT EXIST', function (done) {
            done();
        });

    });

});