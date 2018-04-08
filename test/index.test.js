const Cloudy = require("../src/index");

describe("index.js", function() {
	it("creates a Cloudy instance", async function() {
		const cloudy = await Cloudy.create();
	}, 10000);
});