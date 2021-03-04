const Moment = require("moment");

/**
 *
 * @param {string} dateTime
 * @return {string}
 */
const blockTime = (dateTime) => {
  let hh = Moment(dateTime).format("HH");
  let mm = Moment(dateTime).format("mm");
  mm = Math.ceil(mm/15) * 15;
  if(mm === 0) mm = `${mm}0`;
  if(mm === 60){
    hh++;
    mm = "00"
  }
  hh = hh.toString().length === 1 ? `0${hh}` : hh;
  return `${hh}:${mm}`
}

module.exports = {
  blockTime
}
