const MicrosoftAccount = require("../models/MicrosoftAccount");
const MicrosoftCalendar = require("../models/MicrosoftCalendar");

const saveUerProfile = async (profile) => {
	try {
    const mysql = require("./index");
    await mysql.raw("SELECT VERSION()");
		console.log(profile);
		const user = await MicrosoftAccount.query().findById(profile.id);
		if (user) {
			return true;
		}
		await MicrosoftAccount.query().insert(profile);
		return true;
	} catch (error) {
		console.log("saveUerProfile Error", error);
		return false;
	}
};
const saveListCalendar = async (arrCal) => {
	try {
    const mysql = require("./index");
    await mysql.raw("SELECT VERSION()");
		console.log(arrCal);
		if (!arrCal) return false;
		arrCal.forEach(async (item) => {
			const acc = await MicrosoftCalendar.query()
				.findOne({ id: item.id, address_owner: item.address_owner });
			if (!acc) {
				await MicrosoftCalendar.query().insert(item);
			}
		});
		return true;
	} catch (error) {
		return false;
	}
};

module.exports = {
	saveUerProfile,
	saveListCalendar,
};
