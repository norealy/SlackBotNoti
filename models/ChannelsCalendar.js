const { Model } = require("objection");
const Channels = require("./Channels");

class ChannelsCalendar extends Model {
	/* tableName */
	static get tableName() {
		return "channels_calendar";
	}

	/* idColumn */
	static get idColumn() {
		return ["id_calendar", "id_channel"];
	}

	/* jsonSchema */
	static get jsonSchema() {
		return {
			type: "object",
			required: ["id_calendar", "id_channel"],
			properties: {
				id_calendar: { type: "string" },
				id_channel: { type: "string" },
				watch: { type: "boolean", default: true },
				created_at: { default: null },
				updated_at: { default: null },
			},
		};
	}

	static get relationMappings() {
		return {
			channel: {
				relation: Model.BelongsToOneRelation,
				modelClass: Channels,
				join: {
					from: "channels_calendar.id_calendar",
					to: "channel.id",
				},
			},
		};
	}
}

module.exports = ChannelsCalendar;
