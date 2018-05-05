const RunNumberStreamify = require("../src/RunNumberStreamify");

describe("The RunNumberStreamify class", function() {
	/** @type {RunNumberStreamify} */
	let instance1;
	/** @type {RunNumberStreamify} */
	let instance2;

	before(async () => {
		const name = "test" + Math.floor(Math.random() * 1000000);
		instance1 = await RunNumberStreamify.create({
			ipfsStorage: "./storage/ipfs-repo-for-test-instance1",
			orbitDbStorage: "./storage/orbitdb1",
			namespace: undefined,
		});


		/*await sleep(3600);
		console.log("now instance2");
		instance2 = await RunNumber.create({
			ipfsStorage: "./storage/ipfs-repo-for-test-instance2",
			orbitDbStorage: "./storage/orbitdb2",
			namespace: instance1.namespace,
		});

		console.log("initialized 2 instances");

		await deleteAll(instance2);

		console.log("Finished deleting existing records");*/
	});

	it("returns existing activities", function(done) {
		const activities = instance1.activities;
		activities.subscribe({
			next: console.log.bind(console),
			complete: () => {done();}
		});
	});
});