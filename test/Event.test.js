
let chai = require('chai');
let chaiHttp = require('chai-http');
const expect = chai.expect;
let server = require('../server');
chai.use(chaiHttp);
const accessTokenAzure = "EwBwA8l6BAAU6k7+XVQzkGyMv7VHB/h4cHbJYRAAAS7phZrQcLRVdvHgInK2oJN0LR+JAlt5o32UqLQ+QJV+YdUXXUk4Yg8vVi17cGtslow+0iOpbLGLsJSKxhM5XIe+dRb6V2yzeahnhAimnYMN2O3sfzE/uO6YA9YIVlfe7gVEumjSWoChLeCBRyQdMX5Xv2vDVZRElYteOpicCDUuv86zLPVlh2GZUukG9zgLsCgbfJPdEuTivgP2DYbYESRKzQcGN1Jj5/oWcJsii/k5xUvwx8Dy2qc4+iYCSwOXkNtYnzxb0qv4N7w1SApjuBH/ri4zo72vu+/RMOF1lUO/yKFtX94XBs8ORkpnGiQzKcIbfqY2dw3/lpyqX4VjKZgDZgAACJqdMtSXdjKzQALT7zqWf79sTiL9l3xUzUPmhpP/wO0+oqwdWVrbtLmNlOvzs5NrEsHd8fQWiR3HooJYeYuCbUWz+8hqS3PZ1ax0Wq3wpzmNO3vGtU8BnN3+66+MGTJTWmriNsZB2vApj7VcLFu5+UShAjYOR0zPP/etoaJKaZB8n+RZGEVSC8Q8IDyz+3Yz6CHywfl9sKAjqfQAxAxEV4ZakFqcqs7HWxGWKj+uMh7IBhxQi6Qi2EEV/Jvl96KIrt84ha5sh8WFxlUp5XHugVVYcxqaBLnXTJGvXdownpso4u63bp0IdUsTrYuwj4CaHxcqTm1aa0mwcH+MxJt9ufHpbSROpIsa/xzQhz7t2Nhg9cyAw1QbUmfiWtl9PnE+kOQnZf63Oo7hXfEEWocCXOj3nmDrM7p1Tj3eXeRo0STQsQGQRXnkhyEO+stZW9S/+2ycg0SSwscBdt7+Gli9Ub3u29jyeasVbSyFDI/Ki+Z0dMj4bV44DsHDsfNaQLv1HyRw1GQGCtqAoqDw2ypqLIfVIz4Njjrc1687oZywsAioSsTkgtpShZ+sbR5Jcwx0KlTMFXA/MH15/z65Z0dBUURTUxxLE+SlxldU+hJoCVrPLySL+xPOpAt9IEyvTQTaQyollcjpeLS1fo6cvZX4QHxA4WDUrwH7zzm3qmaCrdPf7Dk+/KF+jnbdKgWUHEHMXiiufmT1DP99XFDSD69Gk+eL/znn2snFMH/JxprqMFRXcdUwVfdg9CuEs8KWXJhqK0DwoVoOwJz4ePN4Ag==";
const idEvent = "AQMkADAwATM3ZmYAZS0wMmIxLTczMwA3LTAwAi0wMAoARgAAA6ff2qnCPwlNlq5XDoFJyvIHAEYg0JrBN7BGju758rMnI5gAAAIBDQAAAEYg0JrBN7BGju758rMnI5gAA-q1JGEAAAA=";
const idCalendar = "AQMkADAwATM3ZmYAZS0wMmIxLTczMwA3LTAwAi0wMAoARgAAA6ff2qnCPwlNlq5XDoFJyvIHAEYg0JrBN7BGju758rMnI5gAAAIBBgAAAEYg0JrBN7BGju758rMnI5gAAAIgqgAAAA==";

describe('******************** Events test ********************', async function () {
    describe('+ Event get all', function () {
        it('Get all Events', function (done) {
            chai.request(server)
                .get('/events')
                .set('Cookie', `accessTokenAzure=${accessTokenAzure}`)
                .end(function (err, res) {
                    expect(res).to.have.status(200);
                    expect(res.body).to.be.an("array");
                    done();
                });
        });
        it(' Event get all miss access token', function (done) {
            chai.request(server)
                .get('/events')
                // .set('Cookie', `accessTokenAzure=${accessTokenAzure}`)
                .end(function (err, res) {
                    expect(res).to.have.status(401);
                    expect(res.body).to.be.an("Object");
                    done();
                });
        });
    });
    describe('+Event get by ID', function () {
        it('Event get by Id', function (done) {
            chai.request(server)
                .get(`/events/${idEvent}`)
                .set('Cookie', `accessTokenAzure=${accessTokenAzure}`)
                .end(function (err, res) {
                    expect(res).to.have.status(200);
                    expect(res.body).to.be.an("Object");
                    done();
                });
        });
        it('Event get by Id miss accessToken', function (done) {
            chai.request(server)
                .get(`/events/${idEvent}`)
                // .set('Cookie', `accessTokenAzure=${accessTokenAzure}`)
                .end(function (err, res) {
                    expect(res).to.have.status(401);
                    expect(res.body).to.be.an("Object");
                    done();
                });
        });
        it('Event get by Id wrong', function (done) {
            chai.request(server)
                .get(`/events/abc`)
                .set('Cookie', `accessTokenAzure=${accessTokenAzure}`)
                .end(function (err, res) {
                    expect(res).to.have.status(403);
                    expect(res.body).to.be.an("Object");
                    done();
                });
        });
    });

    describe('+ get Event in calendar', function () {
        it('get Event in calendar', function (done) {
            chai.request(server)
                .get(`/events/calendar/${idCalendar}`)
                .set('Cookie', `accessTokenAzure=${accessTokenAzure}`)
                .end(function (err, res) {
                    expect(res).to.have.status(200);
                    expect(res.body).to.be.an("array");
                    done();
                });
        });
        it('get Event in calendar miss accessToken', function (done) {
            chai.request(server)
                .get(`/events/calendar/${idCalendar}`)
                // .set('Cookie', `accessTokenAzure=${accessTokenAzure}`)
                .end(function (err, res) {
                    expect(res).to.have.status(401);
                    expect(res.body).to.be.an("Object");
                    done();
                });
        });
        it('get Event in calendar by id wrong', function (done) {
            chai.request(server)
                .get(`/events/calendar/abc`)
                .set('Cookie', `accessTokenAzure=${accessTokenAzure}`)
                .end(function (err, res) {
                    expect(res).to.have.status(403);
                    expect(res.body).to.be.an("Object");
                    done();
                });
        });
    });

    describe('+ create Event ', function () {
        it('create Event ok', function (done) {
            chai.request(server)
                .post(`/events/create`)
                .set('Cookie', `accessTokenAzure=${accessTokenAzure}`)
                .send({
                    "subject": "Event ABC",
                    "body": {
                        "contentType": "HTML",
                        "content": "Happy holidays!"
                    },
                    "start": {
                        "dateTime": "2021-01-22T15:30:00",
                        "timeZone": "Asia/Bangkok"
                    },
                    "end": {
                        "dateTime": "2021-01-23T16:00:00",
                        "timeZone": "Asia/Bangkok"
                    },
                    "location": {
                        "displayName": "Harry's Bar"
                    },
                    "attendees": [
                        {
                            "emailAddress": {
                                "address": "outlook_D814847BC8D772FA@outlook.com",
                                "name": "Nguyễn Đạt"
                            },
                            "type": "required"
                        }
                    ],
                    "allowNewTimeProposals": true
                })
                .end(function (err, res) {
                    expect(res).to.have.status(200);
                    expect(res.body).to.be.an("Object");
                    done();
                });
        });
        it('create Event  miss accessToken', function (done) {
            chai.request(server)
                .post(`/events/create`)
                // .set('Cookie', `accessTokenAzure=${accessTokenAzure}`)
                .send({
                    "subject": "Event ABC",
                    "body": {
                        "contentType": "HTML",
                        "content": "Happy holidays!"
                    },
                    "start": {
                        "dateTime": "2021-01-22T15:30:00",
                        "timeZone": "Asia/Bangkok"
                    },
                    "end": {
                        "dateTime": "2021-01-22T16:00:00",
                        "timeZone": "Asia/Bangkok"
                    },
                    "location": {
                        "displayName": "Harry's Bar"
                    },
                    "attendees": [
                        {
                            "emailAddress": {
                                "address": "outlook_D814847BC8D772FA@outlook.com",
                                "name": "Nguyễn Đạt"
                            },
                            "type": "required"
                        }
                    ],
                    "allowNewTimeProposals": true
                })
                .end(function (err, res) {
                    expect(res).to.have.status(401);
                    expect(res.body).to.be.an("Object");
                    done();
                });
        });
        it('create Event by body empty', function (done) {
            chai.request(server)
                .post(`/events/create`)
                .set('Cookie', `accessTokenAzure=${accessTokenAzure}`)
                .send()
                .end(function (err, res) {
                    expect(res).to.have.status(422);
                    expect(res.body).to.be.an("Object");
                    done();
                });
        });
    });
    // describe('+ Update Event ', function () {
    //     it('Update Event ok', function (done) {
    //         chai.request(server)
    //             .post(`/events/create`)
    //             .set('Cookie', `accessTokenAzure=${accessTokenAzure}`)
    //             .send({
    //                 "subject": "Event ABC",
    //                 "body": {
    //                     "contentType": "HTML",
    //                     "content": "Happy holidays!"
    //                 },
    //                 "start": {
    //                     "dateTime": "2021-01-22T15:30:00",
    //                     "timeZone": "Asia/Bangkok"
    //                 },
    //                 "end": {
    //                     "dateTime": "2021-01-23T16:00:00",
    //                     "timeZone": "Asia/Bangkok"
    //                 },
    //                 "location": {
    //                     "displayName": "Harry's Bar"
    //                 },
    //                 "attendees": [
    //                     {
    //                         "emailAddress": {
    //                             "address": "outlook_D814847BC8D772FA@outlook.com",
    //                             "name": "Nguyễn Đạt"
    //                         },
    //                         "type": "required"
    //                     }
    //                 ],
    //                 "allowNewTimeProposals": true
    //             })
    //             .end(function (err, res) {
    //                 expect(res).to.have.status(200);
    //                 expect(res.body).to.be.an("Object");
    //                 done();
    //             });
    //     });
    //     it('Update Event  miss accessToken', function (done) {
    //         chai.request(server)
    //             .post(`/events/create`)
    //             // .set('Cookie', `accessTokenAzure=${accessTokenAzure}`)
    //             .send({
    //                 "subject": "Event ABC",
    //                 "body": {
    //                     "contentType": "HTML",
    //                     "content": "Happy holidays!"
    //                 },
    //                 "start": {
    //                     "dateTime": "2021-01-22T15:30:00",
    //                     "timeZone": "Asia/Bangkok"
    //                 },
    //                 "end": {
    //                     "dateTime": "2021-01-22T16:00:00",
    //                     "timeZone": "Asia/Bangkok"
    //                 },
    //                 "location": {
    //                     "displayName": "Harry's Bar"
    //                 },
    //                 "attendees": [
    //                     {
    //                         "emailAddress": {
    //                             "address": "outlook_D814847BC8D772FA@outlook.com",
    //                             "name": "Nguyễn Đạt"
    //                         },
    //                         "type": "required"
    //                     }
    //                 ],
    //                 "allowNewTimeProposals": true
    //             })
    //             .end(function (err, res) {
    //                 expect(res).to.have.status(401);
    //                 expect(res.body).to.be.an("Object");
    //                 done();
    //             });
    //     });
    //     it('Update Event by body empty', function (done) {
    //         chai.request(server)
    //             .post(`/events/create`)
    //             .set('Cookie', `accessTokenAzure=${accessTokenAzure}`)
    //             .send({
    //             })
    //             .end(function (err, res) {
    //                 expect(res).to.have.status(422);
    //                 expect(res.body).to.be.an("Object");
    //                 done();
    //             });
    //     });
    // });
});