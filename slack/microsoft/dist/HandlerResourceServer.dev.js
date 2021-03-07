"use strict";

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance"); }

function _iterableToArray(iter) { if (Symbol.iterator in Object(iter) || Object.prototype.toString.call(iter) === "[object Arguments]") return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = new Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } }

var Env = require('../../utils/Env');

var axios = require('axios');

var Redis = require('../../utils/redis/index');

var ChannelsCalendar = require('../../models/ChannelsCalendar');

var MicrosoftAccount = require('../../models/MicrosoftAccount');

var MicrosoftCalendar = require('../../models/MicrosoftCalendar');

var moment = require('moment');

var _ = require('lodash');
/**
 *  Lay event
 * @param {string} idUser
 * @param {string} idEvent
 * @returns {Promise}
 */


var getEvent = function getEvent(idUser, idEvent) {
  var options = {
    method: 'GET',
    headers: {
      'X-Microsoft-AccountId': idUser
    },
    url: "".concat(Env.resourceServerGOF("GRAPH_URL")).concat(Env.resourceServerGOF("GRAPH_MY_EVENT"), "/").concat(idEvent)
  };
  return axios(options);
};
/**
 *
 * @param {string} key
 * @returns {*} Values
 */


function getValueRedis(key) {
  return new Promise(function (resolve, reject) {
    Redis.client.get(key, function (err, reply) {
      if (err) reject(null);
      resolve(reply);
    });
  });
}
/**
 * Gui tin nhan ve channel
 * @param {number} lv
 * @param {object} event
 * @param {string} idChan
 * @param {json} messageFormat
 */


var sendMessage = function sendMessage(lv, event, idChan, messageFormat) {
  var options = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer ".concat(Env.chatServiceGet("BOT_TOKEN"))
    },
    data: {
      channel: idChan,
      blocks: _toConsumableArray(messageFormat.blocks)
    },
    url: Env.chatServiceGet("API_URL") + Env.chatServiceGet("API_POST_MESSAGE")
  };
  options.data.blocks[0].elements[0].image_url = 'https://apis.iceteait.com/public/icon/MICROSOFT.png';
  options.data.blocks[1].fields[0].text = "*".concat(event.subject, "*");
  options.data.blocks[1].fields[1].text = "*Calendar: ".concat(event.nameCalendar, "*");
  var datetimeStart = moment(event.start.dateTime).utc(true).utcOffset(event.timezone);
  var datetimeEnd = moment(event.end.dateTime).utc(true).utcOffset(event.timezone);
  options.data.blocks[2].fields[0].text = datetimeStart.format("DD-MM-YYYY");
  options.data.blocks[2].fields[1].text = datetimeStart.format("hh:mm") + " - " + datetimeEnd.format("hh:mm");

  if (event.locations.length > 0) {
    options.data.blocks[3].text.text = event.locations.map(function (value) {
      return value.displayName;
    }).join(", ");
  }

  if (event.bodyPreview) {
    options.data.blocks[4].text.text = "_".concat(event.bodyPreview, "_");
  }

  if (event.isAllDay) {
    options.data.blocks[2].fields[1].text = datetimeEnd.format("DD-MM-YYYY");
  }

  if (!event.bodyPreview) {
    options.data.blocks.splice(4, 1);
  }

  if (!event.locations[0]) {
    options.data.blocks.splice(3, 1);
  }

  if (lv === 2) {
    options.data.blocks[0].elements[2].text = "*Type: Updated event*";
  } else if (lv === 3) {
    options.data.blocks[0].elements[2].text = "*Type: Deleted event*";
  }

  return axios(options);
};
/**
 * Kiem tra event da gui cach day 5s
 * @param {string} idEvent
 * @param {string} idUser
 */


var checkEventExist = function checkEventExist(idEvent, idUser) {
  var event, eventRedis, data, checked;
  return regeneratorRuntime.async(function checkEventExist$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          // let result = await getEvent(idUser, idEvent);
          // const { status = null } = result;
          // if (status === 404) {
          //   const event = await getValueRedis(idEvent);
          //   if (!event) return false;
          //   result.data = event;
          // }
          event = result.data;
          _context.next = 3;
          return regeneratorRuntime.awrap(getValueRedis(event.id));

        case 3:
          eventRedis = _context.sent;

          if (!eventRedis) {
            _context.next = 9;
            break;
          }

          data = JSON.parse(eventRedis);
          checked = _.isEqual(event, data);

          if (!checked) {
            _context.next = 9;
            break;
          }

          return _context.abrupt("return", false);

        case 9:
          Redis.client.setex(event.id, 5, JSON.stringify(event));
          return _context.abrupt("return", event);

        case 11:
        case "end":
          return _context.stop();
      }
    }
  });
};
/**
 *
 * @param {string} idSub
 * @param {object} resource
 * @param {json} showEvent
 */


var handlerCreated = function handlerCreated(idSub, resource, showEvent) {
  var idEvent, idUser, idCal, event, arrChenCal, account, calendar;
  return regeneratorRuntime.async(function handlerCreated$(_context2) {
    while (1) {
      switch (_context2.prev = _context2.next) {
        case 0:
          idEvent = resource.split('/')[3];
          idUser = resource.split('/')[1];
          _context2.next = 4;
          return regeneratorRuntime.awrap(getValueRedis(idSub));

        case 4:
          idCal = _context2.sent;
          _context2.next = 7;
          return regeneratorRuntime.awrap(checkEventExist(idEvent, idUser));

        case 7:
          event = _context2.sent;

          if (!(!event || !idCal)) {
            _context2.next = 10;
            break;
          }

          return _context2.abrupt("return", null);

        case 10:
          _context2.next = 12;
          return regeneratorRuntime.awrap(ChannelsCalendar.query().where({
            id_calendar: idCal,
            watch: true
          }));

        case 12:
          arrChenCal = _context2.sent;
          _context2.next = 15;
          return regeneratorRuntime.awrap(MicrosoftAccount.query().findById(idUser));

        case 15:
          account = _context2.sent;
          event.timezone = account.timezone;
          _context2.next = 19;
          return regeneratorRuntime.awrap(MicrosoftCalendar.query().findById(idCal));

        case 19:
          calendar = _context2.sent;
          event.nameCalendar = calendar.name;
          Promise.all(arrChenCal.map(function (item) {
            return sendMessage(1, event, item.id_channel, showEvent);
          }));

        case 22:
        case "end":
          return _context2.stop();
      }
    }
  });
};
/**
 *
 * @param {string} idSub
 * @param {object} resource
 * @param {json} showEvent
 */


var handlerUpdated = function handlerUpdated(idSub, resource, showEvent) {
  var idEvent, idUser, idCal, event, arrChenCal, account, calendar;
  return regeneratorRuntime.async(function handlerUpdated$(_context3) {
    while (1) {
      switch (_context3.prev = _context3.next) {
        case 0:
          idEvent = resource.split('/')[3];
          idUser = resource.split('/')[1];
          _context3.next = 4;
          return regeneratorRuntime.awrap(sleep(1500));

        case 4:
          _context3.next = 6;
          return regeneratorRuntime.awrap(getValueRedis(idSub));

        case 6:
          idCal = _context3.sent;
          _context3.next = 9;
          return regeneratorRuntime.awrap(checkEventExist(idEvent, idUser));

        case 9:
          event = _context3.sent;

          if (!(!event || !idCal)) {
            _context3.next = 12;
            break;
          }

          return _context3.abrupt("return", null);

        case 12:
          _context3.next = 14;
          return regeneratorRuntime.awrap(ChannelsCalendar.query().where({
            id_calendar: idCal,
            watch: true
          }));

        case 14:
          arrChenCal = _context3.sent;
          _context3.next = 17;
          return regeneratorRuntime.awrap(MicrosoftAccount.query().findById(idUser));

        case 17:
          account = _context3.sent;
          event.timezone = account.timezone;
          _context3.next = 21;
          return regeneratorRuntime.awrap(MicrosoftCalendar.query().findById(idCal));

        case 21:
          calendar = _context3.sent;
          event.nameCalendar = calendar.name;
          Promise.all(arrChenCal.map(function (item) {
            return sendMessage(2, event, item.id_channel, showEvent);
          }));

        case 24:
        case "end":
          return _context3.stop();
      }
    }
  });
};
/**
 *
 * @param {string} idSub
 * @param {object} resource
 * @param {json} showEvent
 */


var handlerDeleted = function handlerDeleted(idSub, resource, showEvent) {
  var idEvent, idUser, idCal, event, arrChenCal, account, calendar;
  return regeneratorRuntime.async(function handlerDeleted$(_context4) {
    while (1) {
      switch (_context4.prev = _context4.next) {
        case 0:
          idEvent = resource.split('/')[3];
          idUser = resource.split('/')[1];
          _context4.next = 4;
          return regeneratorRuntime.awrap(getValueRedis(idSub));

        case 4:
          idCal = _context4.sent;
          _context4.next = 7;
          return regeneratorRuntime.awrap(checkEventExist(idEvent, idUser));

        case 7:
          event = _context4.sent;

          if (!(!event || !idCal)) {
            _context4.next = 10;
            break;
          }

          return _context4.abrupt("return", null);

        case 10:
          _context4.next = 12;
          return regeneratorRuntime.awrap(ChannelsCalendar.query().where({
            id_calendar: idCal,
            watch: true
          }));

        case 12:
          arrChenCal = _context4.sent;
          _context4.next = 15;
          return regeneratorRuntime.awrap(MicrosoftAccount.query().findById(idUser));

        case 15:
          account = _context4.sent;
          event.timezone = account.timezone;
          _context4.next = 19;
          return regeneratorRuntime.awrap(MicrosoftCalendar.query().findById(idCal));

        case 19:
          calendar = _context4.sent;
          event.nameCalendar = calendar.name;
          Promise.all(arrChenCal.map(function (item) {
            return sendMessage(3, event, item.id_channel, showEvent);
          }));

        case 22:
        case "end":
          return _context4.stop();
      }
    }
  });
};
/**
 * sleep
 * @param {number} ms
 * @returns {Promise}
 */


function sleep(ms) {
  return new Promise(function (resolve) {
    return setTimeout(resolve, ms);
  });
}

module.exports = {
  handlerCreated: handlerCreated,
  handlerUpdated: handlerUpdated,
  handlerDeleted: handlerDeleted,
  getEvent: getEvent,
  getValueRedis: getValueRedis
};