const { Model } = require("objection");
class Channels extends Model {
	/* tableName */
	static get tableName() {
		return "channels";
	}

	/* idColumn */
	static get idColumn() {
		return "id";
	}

	/* jsonSchema */
	static get jsonSchema() {
		return {
			type: "object",
			required: ["id", "name"],
			properties: {
				id: { type: "string" },
				name: { type: "string", minLength: 1, maxLength: 255 },
				created_at: { default: null },
			},
		};
	}
}

module.exports = Channels;
