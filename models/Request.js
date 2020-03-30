const { Model } = require('objection');

class Request extends Model {
  static get tableName() {
    return 'requests';
  }
}

module.exports = { Request };