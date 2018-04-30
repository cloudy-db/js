const Calendar = require("../src/calendar");
const Event = require("../src/pojo/Event");
const IPFSRepo = require('ipfs-repo')
const sleep = require("await-sleep");
const assert = require("chai").assert;
  

/**
 * utility helper for waiting for database sync
 * @param {Calendar} calendar
 * @returns {Promise<>} a prmoise that resolves when `replicated` event is emitted
 */ 
function waitTillReplicated(calendar) {
	return new Promise(function(resolve, reject) {
		calendar.once("replicated", function() {
			resolve(arguments);
		});
	});
}

async function connectIpfsNodes (ipfs1, ipfs2) {
	const id1 = await ipfs1.id()
	const id2 = await ipfs2.id()
	await ipfs1.swarm.connect(id2.addresses[0])
	await ipfs2.swarm.connect(id1.addresses[0])
}

describe("The Calendar class", function() {
	/** @type {Calendar} */
	let instance1;
	/** @type {Calendar} */
	let instance2;
	
	before(async () => {
		const name = "test" + Math.floor(Math.random() * 1000000);
		instance1 = await Calendar.create(name, null, {create: true, sync: false}, {
			repo: new IPFSRepo("./storage/ipfs-repo-for-test-instance1"),
		}, "./storage/orbitdb1");


		// await sleep(3600);
		instance2 = await Calendar.create(name, instance1.namespace, {sync: true}, {
			repo: new IPFSRepo("./storage/ipfs-repo-for-test-instance2"),
		}, "./storage/orbitdb2");

		console.log("initialized 2 instances");

		// await connectPeers(instance1, instance2);

		console.log("connected peers");
	});

	it("allows people to create events", async function() {
		const date = new Date();
		const event = new Event(date, "test only haha");
		await instance1.addEvent(event);
		await waitTillReplicated(instance2);
		const results = instance2.getEvents((eventObj) => eventObj.name === "test only haha");
		assert.lengthOf(results, 1);
		assert.isOk(results[0]._id);
		assert.deepOwnInclude(results[0], {name: "test only haha", date: date});
	});

	it("allows people to override events", async function() {
		const date = new Date();
		const event = new Event(date, "test jar haha");
		await instance1.addEvent(event);
		await waitTillReplicated(instance2);
		const results = instance2.getEvents((eventObj) => eventObj.name === "test jar haha");
		assert.lengthOf(results, 1);
		assert.isOk(results[0]._id);
		assert.deepOwnInclude(results[0], {name: "test jar haha", date: date});

		await instance2.addEvent(Object.assign({}, event, {name: "test 1234"}));
		await waitTillReplicated(instance1);
		const results2 = instance1.getEvents((eventObj) => eventObj._id == event._id);
		assert.lengthOf(results2, 1);
		assert.isOk(results2[0]._id);
		assert.deepOwnInclude(results2[0], {name: "test 1234", date: date});
	});
});