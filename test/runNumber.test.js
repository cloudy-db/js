const RunNumber = require("../src/RunNumber");
const IPFSRepo = require('ipfs-repo')
const sleep = require("await-sleep");
const assert = require("chai").assert;
const uuid = require("uuid/v4");
const omit = require("lodash/omit");

/**
 * utility helper for waiting for database sync
 * @param {RunNumber} calendar
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

function deleteAll(instance) {
	let all = instance.db.query(() => true);
	all = all.map((doc) => instance.db.del(doc._id));
	return Promise.all(all);
}

function once(fn) {
    var returnValue, called = false;
    return function () {
        if (!called) {
            called = true;
            returnValue = fn.apply(this, arguments);
        }
        return returnValue;
    };
}

describe("The RunNumber class", function() {
	/** @type {RunNumber} */
	let instance1;
	/** @type {RunNumber} */
	let instance2;
	
	before(async () => {
		instance1 = await RunNumber.create({
			ipfsStorage: "./storage/ipfs-repo-for-test-instance1",
			orbitDbStorage: "./storage/orbitdb1",
			namespace: undefined,
		});


		await sleep(3600);
		console.log("now instance2");
		instance2 = await RunNumber.create({
			ipfsStorage: "./storage/ipfs-repo-for-test-instance2",
			orbitDbStorage: "./storage/orbitdb2",
			namespace: instance1.namespace,
		});

		console.log("initialized 2 instances");

		await deleteAll(instance2);

		console.log("Finished deleting existing records");
	});

	it("allows people to create events", async function() {

		const bill = {amount: 12345, currency: uuid(), time: new Date(), name: "Isaac", comment: "cool"};
		await instance1.addBill(bill);
		await waitTillReplicated(instance2);
		const results = instance2.query((billObj) => billObj.currency === bill.currency);
		assert.lengthOf(results, 1);
		assert.isOk(results[0]._id);
		assert.deepOwnInclude(results[0], omit(bill, ["time"]));
	});

	it("allows people to override events", async function() {
		const bill1 = {amount: 12345, currency: uuid(), time: new Date(), name: "Isaac2", comment: "nice"};
		await instance1.addBill(bill1);
		await waitTillReplicated(instance2);
		const results1 = instance2.query((billObj) => billObj.currency === bill1.currency);
		assert.lengthOf(results1, 1);
		assert.isOk(results1[0]._id);
		assert.deepOwnInclude(results1[0], omit(bill1, ["time"]));

		await instance2.addBill(Object.assign({}, bill1, {currency: "fun"}));
		await waitTillReplicated(instance1);
		const results2 = instance1.query((billObj) => billObj._id === bill1._id);
		assert.lengthOf(results2, 1);
		assert.isOk(results2[0]._id);
		assert.deepOwnInclude(results2[0], omit({...bill1, currency: "fun"}, ["time"]));
	});

	it("uses the injected wrtc implementation", function(done) {
		const cb = once(done);

		const wrtc = require("wrtc");

		class RTCPeerConnection extends wrtc.RTCPeerConnection {
			constructor() {
				cb();
				super(...Array.from(arguments));
			}
		}

		const fakeRtc = {
			RTCPeerConnection: RTCPeerConnection,
			RTCSessionDescription: wrtc.RTCSessionDescription,
			RTCIceCandidate: wrtc.RTCIceCandidate,
		};

		RunNumber.create({
			ipfsStorage: "./storage/ipfs-repo-for-test-instance4",
			orbitDbStorage: "./storage/orbitdb4",
			namespace: undefined,
			wrtc: fakeRtc,
		});
	}).timeout(10000);
});
