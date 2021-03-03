const Path = require('path');
const Fs = require('fs-extra');
const Env = require('../../utils/Env');

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
		this.eventStartDate = null;
	}

	/**
	 * Read config file from config folder(either depending on the service you want to run)
	 * @param pathFile
	 * @returns {Promise<unknown>}
	 */
	readFileTemplate(pathFile) {
		return new Promise((resolve, reject) => {
			Fs.readJson(Path.join(pathFile), (err, text) => {
				if (err) reject(err);
				resolve(text)
			});
		});
	}

	renameBlockId(prefix) {
		const props = Object.keys(this);
		props.forEach((value, i) => {
			if(this[value].blocks && this[value].blocks.length > 0){
				this[value].blocks.forEach((element, idx) => {
					if(element.block_id) element.block_id = `${prefix}_${element.block_id}`;
					else element.block_id = `${prefix}_${element.type}_${idx}`
				})
			} else if(this[value] instanceof Array) {
				this[value].forEach((element, idx) => {
					if(element.block_id) element.block_id = `${prefix}_${element.block_id}`;
					else element.block_id = `${prefix}_${element.type}_${idx}`
				})
			} else {
				if(this[value].block_id) this[value].block_id = `${prefix}_${this[value].block_id}`;
				else this[value].block_id = `${prefix}_${this[value].type}_${i}`
			}
		})
	}

	getBlockId(id) {
		return `${this._prefix}_${id}`
	}

	async init(prefix) {
		try {
			let pathFile = Env.appRoot + '/slack/views';
			this.addEvent = await this.readFileTemplate(`${pathFile}/AddEvent.json`);
			this.deleteEvent = await this.readFileTemplate(`${pathFile}/DeleteEvent.json`);
			this.editEvent = await this.readFileTemplate(`${pathFile}/EditEvent.json`);
			this.eventEndDate = await this.readFileTemplate(`${pathFile}/EventEndDate.json`);
			this.eventTimeStart = await this.readFileTemplate(`${pathFile}/EventTimeStart.json`);
			this.eventTimeEnd = await this.readFileTemplate(`${pathFile}/EventTimeEnd.json`);
			this.homePage = await this.readFileTemplate(`${pathFile}/HomePage.json`);
			this.listCalendar = await this.readFileTemplate(`${pathFile}/ListCalendar.json`);
			this.listEvent = await this.readFileTemplate(`${pathFile}/ListEvent.json`);
			this.loginResource = await this.readFileTemplate(`${pathFile}/LoginResource.json`);
			this.showEvent = await this.readFileTemplate(`${pathFile}/ShowEvent.json`);
			this.systemSetting = await this.readFileTemplate(`${pathFile}/SystemSetting.json`);
			this.eventStartDate = await this.readFileTemplate(`${pathFile}/EventStartDate.json`);
			this.renameBlockId(prefix);
			this._prefix = prefix;
			return this;
		} catch (err) {
			throw err
		}
	}
}

let template = "";
module.exports =  function () {
	if(!template) {
		template = new TemplateSlack();
		return template
	}
	return template
};
