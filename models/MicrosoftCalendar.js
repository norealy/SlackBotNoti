const { Model } = require("objection");
class MicrosoftCalendar extends Model {
	static get tableName() {
		return "microsoft_calendar";
	}
	/* idColumn */
	static get idColumn() {
		return "id";
	}

	/* jsonSchema */
	static get jsonSchema() {
		return {
			type: "object",
			required: ["id", "name", "address_owner"],
			properties: {
				id: { type: "string" },
				name: { type: "string" },
				address_owner: { type: "string" },
				created_at: { default: null },
			},
		};
	}
}

module.exports = MicrosoftCalendar;
