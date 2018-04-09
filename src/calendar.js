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

async function connectPeers(ipfs1, ipfs2) {
	console.log("entered scope of ipfs1 / ipfs2");
	const id1 = await ipfs1.id()
	const id2 = await ipfs2.id()
	await ipfs1.swarm.connect(id2.addresses[0])
	await ipfs2.swarm.connect(id1.addresses[0])
}

/** @typedef {*} DocumentStore */

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
	 * @param {*} dbAddress existing database address (can be JS object), otherwise give a random name to initiate a new database
	 * @param {Object} storeOptions
	 * @param {...*} args options to pass to Cloudy.create
	 * @returns {Promise<Calendar>}
	 */
	static async create(dbAddress = "new-database", storeOptions = {}, otherPeer, ...args) {
		const cloudy = await Cloudy.create(...args);
		if (otherPeer) {
			await connectPeers(cloudy.ipfs, otherPeer);
			console.log("peers connected");
		}
		const db = await cloudy.store(dbAddress, storeOptions);
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
}

module.exports = Calendar;