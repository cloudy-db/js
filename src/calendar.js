/* eslint-disable no-unused-vars */
const Cloudy = require("./index");
const uuid = require("uuid/v4");
const reemit = require("re-emitter");
const EventEmitter = require("events");
const Event = require("./pojo/Event");
/* eslint-disable no-unused-vars */

// so that it can be optimized
function mapEvents(event) {
	event.date = new Date(event.date);
	return event;
}

/** @typedef {*} DocumentStore */
/** @typedef {*} OrbitDBAddress */

/**
 * DAO for calendar objects (events, etc.)
 * See {@link http://tutorials.jenkov.com/java-persistence/dao-design-pattern.html}
 */
class Calendar extends EventEmitter {
	constructor(cloudy, db) {
		super();
		/** @type {Cloudy} */
		this.cloudy = cloudy;
		/** @type {DocumentStore} */
		this.db = db;

		reemit(this.db.events, this, ["replicated", "replicate", "replicate.progress", "load", "load.progress", "ready", "write"]);
	}

	/**
	 * @param {?string} [namespace] database address for syncing devices. null for new Cloudy database
	 * @param {Object} storeOptions
	 * @param {...*} args options to pass to Cloudy.create
	 * @returns {Promise<Calendar>}
	 */
	static async create(namespace, storeOptions = {}, ...args) {
		args[2] = namespace;
		// @ts-ignore
		const cloudy = await Cloudy.create(...args);
		const db = await cloudy.store("calendar", storeOptions);
		await db.load();
		const calendar = new Calendar(cloudy, db);
		return calendar;
	}

	/**
	 * @param {Event} event - event to be saved. note that it might be mutated -- new events without ID attribute will be populated automatically
	 * @returns {Promise<Event>}
	 */
	// previously: @returns {Promise<string>} the hash of the new doc
	async addEvent(event) {
		if (!event._id) {
			event._id = uuid();
		}
		await this.db.put(event);
		return event;
	}

	/**
	 * Gets the events in an unspecified order
	 * @param {Function} mapper
	 * @returns {Event[]} array of events
	 */
	getEvents(mapper = (() => true)) {
		return this.db.query(mapper).map(mapEvents);
	}

	get address() {
		return this.db.address;
	}

	get namespace() {
		return this.cloudy.namespace;
	}
}

module.exports = Calendar;