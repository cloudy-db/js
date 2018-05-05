const RunNumber = require("./RunNumber");
const { Observable, BehaviorSubject, Subject } = require("rxjs");
const { multicast, refCount, tap, map } = require("rxjs/operators");
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
			const updateNext = () => {observer.next(this.query());}
			updateNext();
			this.on("replicated", () => {
				updateNext();
				console.log("updated2 - replicated event");
			});
			this.on("write", () => {
				updateNext();
				console.log("updated1 - write event");
			});

			return function completed() {
				console.log("Completed activities$");
				this.removeListener("replicated", updateNext);
			}
		}).pipe(
			map((arr) => orderBy(arr, 'time', 'desc')),
			tap((val) => {console.log("from source", val);}),
			multicast(new BehaviorSubject([])),
			refCount(),
		);
	}

	/**
	 * @param {Object} cloudyOptions
	 * @param {Object} storeOptions
	 * @returns {Promise<RunNumber>} Ready'd RunNumber instance
	 */
	static async create(cloudyOptions, storeOptions) {
		const runNumber = await super.create(cloudyOptions, storeOptions);
		runNumber._reemit();
		return new RunNumberStreamify(runNumber.cloudy, runNumber.db);
	}
}

module.exports = RunNumberStreamify; // JSDoc, sorry