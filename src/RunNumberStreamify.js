const RunNumber = require("./RunNumber");
const Observable = require('rxjs').Observable;
const BehaviorSubject = require('rxjs').BehaviorSubject;
const Subject = require('rxjs').Subject;

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
			const updateNext = observer.next(this.query());
			updateNext();
			this.on("replicated", updateNext);

			return function completed() {
				this.removeListener("replicated", updateNext);
			}
		}).multicast(BehaviorSubject.create()).refCount();
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