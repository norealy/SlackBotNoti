const GoogleAccount = require('../../models/GoogleAccount');
const { assert, expect } = require('chai');

describe('======= GoogleAccount =======', function () {
    describe('======= ADD GoogleAccount =======', function () {
        it('ADD Google Account', function (done) {
            GoogleAccount
                .query()
                .insert({
                    id: 'id_gg4',
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
                .catch((err) => {
                    done("Test fail")
                });
        });

        it('ADD Google Account id EXIST', function (done) {
            GoogleAccount
                .query()
                .insert({
                    id: 'id_gg4',
                    name: 'xdatgd',
                    refresh_token: 'refresh_token',
                    created_at: null,
                    updated_at: null
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

        describe('======= UPDATE Google Account =======', function () {
            it('UPDATE Google Account TRUE', function (done) {

                const ggAcc = {
                    id: 'id_gg4',
                    name: 'name123',
                    refresh_token: "refresh_token1"
                };
                GoogleAccount.query().updateAndFetchById('id_gg4', ggAcc)
                    .then((data) => {
                        assert.typeOf(data, 'object');
                        assert.equal(data.name, 'name123');
                        assert.equal(data.refresh_token, 'refresh_token1');
                        assert.property(data, 'name');
                        done();
                    })
                    .catch((err) => {
                        done("Test fail")
                    });
            });
        });

        it('UPDATE Google Account ID DONT EXIST', function (done) {
            const ggAcc = {
                id: 'id_gg455',
                name: 'name123',
                refresh_token: "refresh_token1"
            };
            GoogleAccount.query().updateAndFetchById('id_gg455', ggAcc)
                .then((data) => {
                    assert.typeOf(data, 'undefined');
                    done("Not found id Google Account");
                })
                .catch((err) => {
                    done("Test fail")
                });
        });

    });
});

describe('======= DELETE Google Account =======', function () {
    it('DELETE Google Account TRUE', function (done) {

        GoogleAccount.query()
            .deleteById('id_gg4')
            .then((data) => {
                if (data > 0) {
                    assert.typeOf(data, 'number');
                    done();
                } else {
                    done("TEST FAIL");
                }
            })
            .catch((err) => {
                done("TEST FAIL");
            });

    });

    it('DELETE Google Account ID DONT EXIST', function (done) {
        GoogleAccount.query()
            .deleteById('id_gg4')
            .then((data) => {
                if (data == 0) {
                    const err = new Error("DELETE Google Account NOT FOUND  ");
                    done(err);
                } else {
                    done("TEST FAIL");
                }
            })
            .catch((err) => {
                done("TEST FAIL");
            });
    });

});