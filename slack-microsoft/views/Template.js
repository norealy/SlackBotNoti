const Path = require('path');
const Fs = require('fs-extra');
const Env = require('../../utils/Env')

class TemplateSlack {
	constructor() {
		this.addEvent = null;
		this.deleteEvent = null;
		this.editEvent = null;
		this.eventEndDate = null;
		this.eventTimeStart = null;
		this.eventTimeEnd = null;
		this.homePage = null;
		this.listCalendar = null;
		this.listEvent = null;
		this.loginResource = null;
		this.showEvent = null;
		this.systemSetting = null;
	}

	/**
	 * Read config file from config folder(either depending on the service you want to run)
	 * @param pathFile
	 * @returns {Promise<unknown>}
	 */
	readFileTemplate(pathFile) {
		return new Promise((resolve, reject) => {
			Fs.readJson(Path.join(pathFile), (err, text) => {
				if (err) {
					reject(err);
				} else {
					resolve(text);
				}
			});
		});
	}

	async init() {
		try {
			let pathFile = Env.appRoot + '/slack-microsoft/views'
			console.log("Path File : ",pathFile);
			this.addEvent = await this.readFileTemplate(`${pathFile}/AddEvent.json`)
			this.deleteEvent = await this.readFileTemplate(`${pathFile}/DeleteEvent.json`)
			this.editEvent = await this.readFileTemplate(`${pathFile}/EditEvent.json`)
			this.eventEndDate = await this.readFileTemplate(`${pathFile}/EventEndDate.json`)
			this.eventTimeStart = await this.readFileTemplate(`${pathFile}/EventTimeStart.json`)
			this.eventTimeEnd = await this.readFileTemplate(`${pathFile}/EventTimeEnd.json`)
			this.homePage = await this.readFileTemplate(`${pathFile}/HomePage.json`)
			this.listCalendar = await this.readFileTemplate(`${pathFile}/ListCalendar.json`)
			this.listEvent = await this.readFileTemplate(`${pathFile}/ListEvent.json`)
			this.loginResource = await this.readFileTemplate(`${pathFile}/LoginResource.json`)
			this.showEvent = await this.readFileTemplate(`${pathFile}/ShowEvent.json`)
			this.systemSetting = await this.readFileTemplate(`${pathFile}/SystemSetting.json`)
		} catch (err) {
			throw err
		}
	}
}

let template = "";
module.exports =  function () {
	if(!template) {
		template = new TemplateSlack()
		return template
	}
	return template
}
