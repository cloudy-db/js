const RunNumberStreamify = require("../src/RunNumberStreamify");
const uuid = require("uuid/v4");

describe("The RunNumberStreamify class", function() {
	/** @type {RunNumberStreamify} */
	let instance1;
	/** @type {RunNumberStreamify} */
	let instance2;

	before(async () => {
		const name = "test" + Math.floor(Math.random() * 1000000);
		instance1 = await RunNumberStreamify.create({
			ipfsStorage: "./storage/ipfs-repo-for-test-instance3",
			orbitDbStorage: "./storage/orbitdb3",
			namespace: undefined,
		});


		console.log("now instance2");
		instance2 = await RunNumberStreamify.create({
			ipfsStorage: "./storage/ipfs-repo-for-test-instance4",
			orbitDbStorage: "./storage/orbitdb4",
			namespace: instance1.namespace,
		});

		console.log("initialized 2 instances");
	});

	it("returns existing activities", function(done) {
		const activities = instance1.activities$;

		const subscription = activities.subscribe({
			next: function(val) {
				console.log("next: ", val);
			},
			complete: () => {done();}
		});
		setTimeout(() => {
			subscription.complete();
		}, 4000);
	});

	it("fires on new activities (local)", function(done) {
		const activities = instance1.activities$;
		const bill = {amount: 12345, currency: uuid(), time: new Date(), name: "Isaac", comment: "cool"};
		
		const subscription = activities.subscribe((bills) => {
			const bills2 = bills.filter((bill2) => bill2.currency === bill.currency);
			if (bills2.length > 0) {
				done();
				subscription.complete();
			} else {
				console.log("Not accepting because does not contain required UUID:", bill.currency, bills);
			}
		});

		instance1.addBill(bill);
	});

	it("fires on new activities (remote)", function(done) {
		const activities = instance1.activities$;
		const bill = {amount: 12345, currency: uuid(), time: new Date(), name: "Isaac", comment: "cool"};
		
		const subscription = activities.subscribe((bills) => {
			const bills2 = bills.filter((bill2) => bill2.currency === bill.currency);
			if (bills2.length > 0) {
				done();
				subscription.complete();
			} else {
				console.log("Not accepting because does not contain required UUID:", bill.currency, bills);
			}
		});

		instance2.addBill(bill);
	});

});