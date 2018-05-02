module.exports = class CalendarEvent {
	/**
	 * @param {Date|string} date
	 * @param {string} name
	 * @param {string} id
	 */
	constructor(date, name, id = "") {
		/** @member {Date} */
		this.date = date instanceof Date ? date : new Date(date);
		/** @member {string} */
		this.name = name;
		/** @member {string} */
		this._id = id;
	}
};