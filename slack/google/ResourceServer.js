const Env = require('../../utils/Env');
const Axios = require('axios');
const Redis = require('../../utils/redis/index');
const ChannelsCalendar = require('../../models/ChannelsCalendar');
const _ = require('lodash');


/**
 * Get google calendar event updates
 * @param {object} headers
 * @return {Promise}
 */
const getEventUpdate = (headers,idAccount) => {
	return new Promise((resolve, reject) => {
		const dateNow = new Date();
		const options = {
			url: headers['x-goog-resource-uri'],
			method: 'GET',
			headers: {'X-Google-AccountId': idAccount},
			params: {
				updatedMin: new Date(dateNow - (5*60*1000)).toISOString(),
			},
		};
		Axios(options)
			.then(result => {
				const {items = []} = result.data;
				const legItem = items.length;
				if(legItem === 0) resolve(null);
				resolve(items[legItem - 1])
			})
			.catch(err => {
				reject(err)
			});
	});
}

const sendWatchNoti = async (idChanel,showEvent,event)=>{

	const tokenBot = Env.chatServiceGet("BOT_TOKEN");
	const options = {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			Authorization: `Bearer ${tokenBot}`,
		},
		data: {
			channel: idChanel,
			blocks: showEvent,
		},
		url:
			Env.chatServiceGet("API_URL") +
			Env.chatServiceGet("API_POST_MESSAGE"),
	};
	const cutosm = options.data;
	cutosm.blocks[1].text.text = event.summary
	cutosm.blocks[3].fields[0].text = event.start;
	// cutosm.blocks[3].fields[1].text = event.start.dateTime.split('T')[1].split('.0000000')[0] + "-";
//	cutosm.blocks[3].fields[1].text = +event.end.dateTime.split('T')[1].split('.0000000')[0] + "-";

	cutosm.blocks[4].text.text = event.location
	cutosm.blocks[5].text.text = event.description
	console.log("optionssendWatchNoti",options.data.blocks[3])
	return await Axios(options)
}

module.exports = {
	getEventUpdate,
	sendWatchNoti
}
