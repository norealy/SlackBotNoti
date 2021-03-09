const Moment = require("moment");

/**
 *
 * @param {string} dateTime
 * @return {string}
 */
const blockTime = (dateTime) => {
  let hh = Moment(dateTime).format("HH");
  let mm = Moment(dateTime).format("mm");
  mm = Math.ceil(mm / 15) * 15;
  if (mm === 0) mm = `${mm}0`;
  if (mm === 60) {
    hh++;
    mm = "00"
  }
  hh = hh.toString().length === 1 ? `0${hh}` : hh;
  return `${hh}:${mm}`
};

/**
 * get duration day
 * @param {string} datetimeStart
 * @param {string} datetimeEnd
 * @return {number}
 */
const getDurationDay = (datetimeStart, datetimeEnd) => {
  let durationDay = 0;
  let currentDate = new Date(datetimeStart);
  const addDays = function (days) {
    let date = new Date(this.valueOf());
    date.setDate(date.getDate() + days);
    return date;
  };
  let lastDate = new Date(datetimeEnd);
  while (currentDate <= lastDate) {
    currentDate = addDays.call(currentDate, 1);
    durationDay += 1;
  }
  return durationDay - 1;
}

module.exports = {
  blockTime,
  getDurationDay,
};
