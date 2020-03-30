const { Model } = require('objection');

class Request extends Model {
  static get tableName() {
    return 'requests';
  }

  contactInfo() {

    if (this.email && !this.phone_number) {
      return `You can email me at: *${this.email}*`;
    } else if (this.phone_number && !this.email) {
      return `You can call me at: *${this.phone_number}*`;
    } else if (this.email && this.phone_number) {
      return `You can contact me at either: *${this.email}* or *${this.phone_number}*`;
    }

    return '';

  }

  addressLine() {

    return `${this.street_address}, ${this.city}, ${this.state} ${this.zipcode}`;

  }

}

module.exports = { Request };