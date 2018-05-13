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
		this.activities$ = autoStream(this.query, this).pipe(
			map((arr) => orderBy(arr, "time", "desc")),
			multicast(new BehaviorSubject([])), // necessary for multicast here because of multi-threading for cancel listener
			refCount()
		);

		/** @type {Observable} */
		this.summary$ = autoStream(this.summary, this).pipe(
			multicast(new BehaviorSubject([])), // necessary for multicast here because of multi-threading for cancel listener
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

function autoStream(fn, context){
	return Observable.create((observer) => {
		function updateNext(e) {
			console.debug("updateNext", fn.name, e);
			observer.next(fn.apply(context));
		}

		updateNext("first");
		context.on("replicated", updateNext);
		context.on("write", updateNext);

		return function onComplete() {
			console.log("Completed", fn.name);
			context.removeListener("replicated", updateNext);
			context.removeListener("write", updateNext);
		};
	});
}