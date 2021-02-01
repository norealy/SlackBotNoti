const GoogleAccount = require('../../database/models/GoogleAccount');
const { assert, expect } = require('chai');

describe('======= GoogleAccount =======', function () {
    describe('======= ADD GoogleAccount =======', function () {
        it('ADD Google Account', function (done) {
            GoogleAccount
                .query()
                .insert({
                    id: 'id_gg1',
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

        it('ADD Google Account id EXIST', function (done) {
            done();
        });

        describe('======= UPDATE Google Account =======', function () {
            it('UPDATE Google Account TRUE', function (done) {

                const ggAcc = { id: 'id_gg1', name: 'name123',refresh_token:"refresh_token1"};
                GoogleAccount.query().updateAndFetchById('id_gg1', ggAcc)
                    .then((data) => {
                        assert.typeOf(data, 'object');
                        assert.equal(data.name, 'name123');
                        assert.property(data, 'name');
                        done();
                    })
                    .catch(done);
            });

            it('UPDATE Google Account ID DONT EXIST', function (done) {
                done();
            });

        });
    });

    describe('======= DELETE Google Account =======', function () {
        it('DELETE Google Account TRUE', function (done) {

            GoogleAccount.query()
                .deleteById('id_gg1')
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