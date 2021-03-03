const Env = require('../../utils/Env');
const Axios = require('axios');
const Redis = require('../../utils/redis/index');
const ChannelsCalendar = require('../../models/ChannelsCalendar');
const moment = require('moment-timezone');
const _ = require('lodash');


/**
 * Get google calendar event updates
 * @param {object} headers
 * @return {Promise}
 */
const getEventUpdate = (headers, idAccount) => {
	return new Promise((resolve, reject) => {
		const dateNow = new Date();
		const options = {
			url: headers['x-goog-resource-uri'],
			method: 'GET',
			headers: {'X-Google-AccountId': idAccount},
			params: {
				updatedMin: new Date(dateNow - (5 * 60 * 1000)).toISOString(),
			},
		};
		Axios(options)
			.then(result => {
				const {items = []} = result.data;
				const legItem = items.length;
				if (legItem === 0) resolve(null);
				resolve(items[legItem - 1])
			})
			.catch(err => {
				reject(err)
			});
	});
}
/**
 *
 * @param {string} idChanel
 * @param {string}showEvent
 * @param{string}event
 * @returns {Promise}
 */
const sendWatchNoti = async (idChanel, showEvent, event) => {
	const tokenBot = Env.chatServiceGet("BOT_TOKEN");
	const options = {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			Authorization: `Bearer ${tokenBot}`,
		},
		data: {
			channel: idChanel,
			blocks: [...showEvent.blocks],
		},
		url:
			Env.chatServiceGet("API_URL") +
			Env.chatServiceGet("API_POST_MESSAGE"),
	};
	const created = event.created.split('T')[1].split('.')[0].split('Z')[0];
	const updated = event.updated.split('T')[1].split('.')[0].split('Z')[0];
	const datetimeStart = moment(event.start.dateTime).utc(true).tz(event.timezone);
	const datetimeEnd = moment(event.end.dateTime).utc(true).tz(event.timezone);
	options.data.blocks[1].text.text = event.summary
	if (event.recurrence) {
		options.data.blocks[2].text.text = event.recurrence[0].split('=')[1]

	}
	if (event.start.date && event.end.date) {
		options.data.blocks[3].fields[0].text = datetimeStart.format("DD-MM-YYYY");
		options.data.blocks[3].fields[1].text = "All Day"
	} else if (event.start.dateTime && event.end.dateTime) {

		options.data.blocks[3].fields[0].text = datetimeStart.format("DD-MM-YYYY");
		options.data.blocks[3].fields[1].text = datetimeStart.format("hh:ss:mm") +
			"-" + datetimeEnd.format("hh:ss:mm");
	}
	if (event.location) {
		options.data.blocks[4].text.text = event.location
	}
	if (event.description) {
		options.data.blocks[5].text.text = event.location
	}

	if (created === updated) {
		options.data.blocks[0].elements[1].text = "*Create Event*"
	} else if (created != updated) {
		options.data.blocks[0].elements[1].text = "*Update Event*"
	}
	if(event.status ==="cancelled"){
		console.log("delete")
		options.data.blocks[0].elements[1].text = "*Delete Event*"
	}

	return await Axios(options)
}

module.exports = {
	getEventUpdate,
	sendWatchNoti
}
