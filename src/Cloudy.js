const IPFS = require("ipfs");
const OrbitDB = require("orbit-db");
const IPFSRepo = require("ipfs-repo");
const EventEmitter = require("events");
const uuid = require("uuid/v4");
const isFunction = require("lodash/isFunction");

const spOptions = {
	trickle: true,
	config: {
		iceServers: [
			{
				urls: "stun:stun.l.google.com:19302",
			},
			{
				urls: "stun:global.stun.twilio.com:3478?transport=udp",
			},
			{
				urls: "turn:numb.viagenie.ca",
				username: "numb.viagenie.ca@isaac.pw",
				credential: "f2LZVN5PdXKRUT",
			},
		]
	}
};

function getLibp2pInject(wrtc) {
	if (wrtc) {
		// console.debug("Using injected wrtc");
	// @ts-ignore
	} else if (typeof global.RTCPeerConnection !== "undefined" && typeof global.RTCSessionDescription !== "undefined" && typeof global.RTCIceCandidate !== "undefined") {
		console.debug("Using 'global' scope WebRTC implementation");
		wrtc = {
			// @ts-ignore
			RTCPeerConnection: global.RTCPeerConnection,
			// @ts-ignore
			RTCSessionDescription: global.RTCSessionDescription,
			// @ts-ignore
			RTCIceCandidate: global.RTCIceCandidate,
		};
	} else {
		wrtc = require("wrtc"); // leave it for https://github.com/substack/get-browser-rtc/
	}

	const WStar = require("libp2p-webrtc-star");
	const wstar = new WStar({ wrtc: wrtc, spOptions: spOptions });
	return {
		libp2p: {
			modules: {
				transport: [wstar],
				discovery: [wstar.discovery],
			}
		},
	};
}

/** @typedef {*} IPFS */
/** @typedef {*} DocumentStore */

/**
 * OrbitDB class {@link https://github.com/orbitdb/orbit-db}
 * @typedef {*} OrbitDB
 * @property {EventEmitter} events events: replicated, replicate, replicate.progress, load, load.progress, ready, write
 * 
 */

/**
  * helper method to create an IPFS instance based on user-supplied params
  * @param {Object|undefined} ipfsOrOptions options to be passed to IPFS constructor
  * @returns {Promise<IPFS>}
  */
function initIpfsInstance(ipfsOrOptions, ipfsStorage, wrtc) {
	return new Promise((resolve, reject) => {
		ipfsOrOptions = Object.assign({
			repo: new IPFSRepo(ipfsStorage || "./storage/ipfs-repo"),
			init: true,
			config: {
				Addresses: {
					Swarm: [
						// "/dns4/star-signal.cloud.ipfs.team/tcp/443/wss/p2p-webrtc-star",
						// "/ip4/0.0.0.0/tcp/" + (10000 + Math.floor(Math.random()*55535)),
						// "/ip4/172.28.2.3/tcp/9090/ws/p2p-webrtc-star",
						"/dns4/nas1.isaac.pw/tcp/9090/wss/p2p-webrtc-star",
						"/dns4/cloudy-star.isaac.pw/tcp/9090/wss/p2p-webrtc-star",
						// "/dns6/rpi-ipv6.test/tcp/9090/ws/p2p-webrtc-star",
					],					  
				},
				Bootstrap: [],
			}
		}, ipfsOrOptions, {
			EXPERIMENTAL: {
				pubsub: true,
			}
		}, getLibp2pInject(wrtc));
		const ipfs = new IPFS(ipfsOrOptions);

		ipfs.on("error", (e) => {
			console.error("error in ipfs", e);
			reject(e);
		});
		ipfs.on("ready", async () => {
			/*ipfs._libp2pNode.on("peer:discovery", (peer) => {
				console.debug("Discovered:", peer.id.toB58String());
			});*/
			ipfs._libp2pNode.on("peer:connect", (peer) => {
				console.log("Connection established to:", peer.id.toB58String());
			});
			resolve(ipfs);
		});
	});
}

/**
 * Super-powered OrbitDB instance
 */
class Cloudy extends EventEmitter {

	/**
	 * @typedef {Object} CloudyOptions
	 * @property {IPFS|Object} [ipfsOrOptions] - ready-ed IPFS instance OR an object which will be passed to the IPFS constructor
	 * @property {Object} [orbitDbOptions] - options to pass to OrbitDB constructor
	 * @property {string} [orbitDbStorage] - directory for OrbitDB
	 * @property {string} [ipfsStorage] - directory for IPFS
	 * @property {?string} [namespace] - database address for syncing devices. falsy for new Cloudy database
	 * @property {string} [deviceId] - unique device ID -- should be SAME each time user invokes the app
	 * @property {Object} [storeDefaults] - default options for stores 
	 * @property {Object} [wrtc] - WebRTC implementation following the interface at https://github.com/substack/get-browser-rtc/blob/master/index.js
	 */

	/**
	 * @param {CloudyOptions} options
	 */
	constructor(options = {}) {
		super();

		/** @type {Object} default options for stores  */
		this.storeDefaults = Object.assign(options.namespace ? {sync: false} : {sync: true}, {admin: ["*"], write: ["*"]}, options.storeDefaults);
		this.namespace = options.namespace || uuid();

		if (options.ipfsOrOptions && options.ipfsOrOptions._libp2pNode) {
			this.ipfs = options.ipfsOrOptions;
		}
		(async () => {
			try {
				if (!this.ipfs) {
					this.ipfs = await initIpfsInstance(options.ipfsOrOptions, options.ipfsStorage, options.wrtc);
				}
	
				/** @type {OrbitDB} */
				// @ts-ignore
				this.orbitDb = new OrbitDB(this.ipfs, options.orbitDbStorage || "./storage/orbitdb", options.orbitDbOptions);

				/** @type {DocumentStore} */
				this.devices = await this.store("devices");

				this.emit("ready");
			} catch (e) {
				this.emit("error", e);
			}
		})();
	}

	/**
	 * Short hand to create a Cloudy instance.
	 * @param {CloudyOptions} options
	 * @return {Promise<Cloudy>} - Cloudy instance 
	 */
	static create(options) {
		return new Promise((resolve, reject) => {
			const cloudy = new Cloudy(options);
			cloudy.once("ready", () => {
				resolve(cloudy);
			});
			cloudy.once("error", (e) => {
				reject(e);
			});
		});
	}

	/**
	 * create a new docstore
	 * @param {string} nameOrAddress existing database address (can be JS object), otherwise give a random name to initiate a (possibly new) database
	 * @param {*} options
	 * @returns {Promise<DocumentStore>}
	 */
	async store(nameOrAddress, options = {}) {
		options = Object.assign({}, this.storeDefaults, options);
		// nameOrAddress = nameOrAddress.toString().startsWith && nameOrAddress.toString().startsWith("/orbitdb/") ? nameOrAddress : `${this.namespace}/${nameOrAddress}`;
		const db = await this.orbitDb.docs(this.namespace + "/" + nameOrAddress, options);
		db.events.on("write", () => {
			console.log("Write detected. Usually I'd wake up other devices, but because it's not impl-ed yet, I'm going to pretend that they are all awake :D");
		});
		return db;
	}

	/**
	 * stops the underlying OrbitDB instance
	 */
	stop() {
		return this.orbitDb.stop();
	}

	/**
	 * PUBLIC function to update wakeup function
	 * @param {Function} [func] - wake up function
	 * @param {string} [deviceId] - unique ID for device
	 */
	updateWakeupFunction(func, deviceId) {
		/** @type {string} */
		this.deviceId = deviceId;

		return this.devices.put({
			_id: deviceId,
			func: func.toString()
		});
	}

	/**
	 * trigger all other devices to wake up
	 */
	async wakeupAll() {
		if (!this.deviceId) {
			console.warn("this.deviceId is NOT set. This means that this device itself will get a notification.");
		}
		const notMyself = !this.deviceId ? function constantTrue() { return true; } : (device) => device._id != this.deviceId;
		const otherDevices = this.devices.query(notMyself);
		
		for (const device of otherDevices) {
			const func = Function("return " + device.func)(); // https://stackoverflow.com/a/7781900/1348400
			console.info("pretending to wake up", device._id, func);
		}
	}
}

module.exports = Cloudy;