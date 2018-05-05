const RunNumber = require("./RunNumber");
const Observable = require('rxjs/Observable').Observable;
const Subject = require('rxjs/Subject').Subject;
const Rx = require('rxjs/Rx');

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
		this.activities = Observable.create(function (observer) {
			observer.next(1);
			observer.next(2);
			observer.next(3);
			setTimeout(() => {
				observer.next(4);
				observer.complete();
			}, 1000);
		}).merge(Rx.Observable.from(this.query())).multicast(new Subject()).refCount();
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