const Model = require('../baseModel');
class MicrosoftAccount extends Model {
    static get tableName() {
        return 'microsoft_account';
    }

    /* idColumn */
    static get idColumn() {
        return 'id';
    }

    /* jsonSchema */
    static get jsonSchema() {
        return {
            type: 'object',
            required: ['id', 'name', 'refresh_token'],
            properties: {
                id: { type: 'string' },
                name: { type: 'string' },
                refresh_token: { type: 'string' },
                created_at: { default: null },
                updated_at: { default: null },
            }
        };
    }

}

module.exports = MicrosoftAccount