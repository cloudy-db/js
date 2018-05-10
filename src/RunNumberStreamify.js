const RunNumber = require("./RunNumber");
const Cloudy = require("./Cloudy");
const { Observable, BehaviorSubject } = require("rxjs");
const { multicast, refCount, map } = require("rxjs/operators");
const orderBy = require("lodash/orderBy");

// const Rx = require('rxjs/Rx');

/**
* augmented with RxJS
* useful for Angular
* @extends RunNumber
*/
class RunNumberStreamify extends RunNumber {
	constructor(cloudy, db) {
		super(cloudy, db);

		/** @type {Observable} */
		this.activities$ = Observable.create((observer) => {
			const updateNext = () => {observer.next(this.query());};
			updateNext();
			this.on("replicated", () => {
				updateNext();
				console.log("updated2 - replicated event");
			});
			this.on("write", () => {
				updateNext();
				console.log("updated1 - write event");
			});

			return () => { // complete function
				console.log("Completed activities$");
				this.removeListener("replicated", updateNext);
			};
		}).pipe(
			map((arr) => orderBy(arr, "time", "desc")),
			multicast(new BehaviorSubject([])), // necessary because of multi-threading for cancel listener
			refCount()
		);
	}

	/**
	 * copied from super class RunNumber, not a good practice!
	 * make sure it gets GC'd
	 * @param {Object} cloudyOptions
	 * @param {Object} storeOptions
	 * @returns {Promise<RunNumber>} Ready'd RunNumber instance
	 */
	static async create(cloudyOptions, storeOptions) {
		const cloudy = await Cloudy.create(cloudyOptions);
		const db = await cloudy.store("runNumber", storeOptions);
		await db.load();
		return new RunNumberStreamify(cloudy, db);
	}
}

module.exports = RunNumberStreamify; // JSDoc, sorry