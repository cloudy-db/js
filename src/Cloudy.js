const IPFS = require("ipfs");
const OrbitDB = require("orbit-db");
const IPFSRepo = require("ipfs-repo");
const EventEmitter = require("events");
const uuid = require("uuid/v4");

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

let wrtc, WStar;
if (typeof self === "undefined") {
	wrtc = require("wrtc");
	WStar = require("libp2p-webrtc-star");
} else {
	console.error("Browser not implemented -- proceed with caution");
	// throw new Error("Browser not implemented");
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
  * @param {Object} ipfsOrOptions options to be passed to IPFS constructor
  * @returns {Promise<IPFS>}
  */
function initIpfsInstance(ipfsOrOptions) {
	return new Promise((resolve, reject) => {
		const wstar = new WStar({ wrtc: wrtc, spOptions: spOptions });
		ipfsOrOptions = Object.assign({
			repo: new IPFSRepo("./storage/ipfs-repo"),
			config: {
				Addresses: {
					Swarm: [
						// "/dns4/star-signal.cloud.ipfs.team/tcp/443/wss/p2p-webrtc-star",
						// "/ip4/0.0.0.0/tcp/" + (10000 + Math.floor(Math.random()*55535)),
						// "/ip4/172.28.2.3/tcp/9090/ws/p2p-webrtc-star",
						"/dns4/nas1.isaac.pw/tcp/9090/ws/p2p-webrtc-star",
						// "/dns6/rpi-ipv6.test/tcp/9090/ws/p2p-webrtc-star",
					],					  
				},
				Bootstrap: [],
			}
		}, ipfsOrOptions, {
			libp2p: {
				modules: {
					transport: [wstar],
					discovery: [wstar.discovery],
				}
			}
		});
		const ipfs = new IPFS(Object.assign({EXPERIMENTAL: {
			pubsub: true,
		}}, ipfsOrOptions));

		ipfs.on("error", (e) => {
			console.error("error in ipfs", e);
			reject(e);
		});
		ipfs.on("ready", async () => {
			ipfs._libp2pNode.on("peer:discovery", (peer) => {
				console.log("Discovered:", peer.id.toB58String());
			});
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
	 * @param {IPFS|Object} ipfsOrOptions ready-ed IPFS instance OR an object which will be passed to the IPFS constructor
	 * @param {string} [directory]
	 * @param {?string} [namespace] database address for syncing devices. null for new Cloudy database
	 * @param {string} [deviceId] unique device ID -- should be SAME each time user invokes the app
	 * @param {Function} [wakeupFunction] a function to wake up the device for syncing. return a promise to pause the sync
	 * @param {Object} [storeDefaults] default options for stores 
	 * @param {*} [options] options to pass to OrbitDB constructor
	 */
	constructor(ipfsOrOptions = {}, directory = "./storage/orbitdb", namespace, deviceId, wakeupFunction, storeDefaults, options) {
		super();

		/** @type {Object} default options for stores  */
		this.storeDefaults = Object.assign(namespace === null ? {sync: false} : {sync: true}, {admin: ["*"], write: ["*"]}, storeDefaults);
		this.namespace = namespace || uuid();

		if (ipfsOrOptions._libp2pNode) {
			this.ipfs = ipfsOrOptions;
		}
		(async () => {
			try {
				if (!this.ipfs) {
					this.ipfs = await initIpfsInstance(ipfsOrOptions);
				}
	
				/** @type {OrbitDB} */
				// @ts-ignore
				this.orbitDb = new OrbitDB(this.ipfs, directory, options);
				/* const optsForDevicesDb = {admin: ["*"], write: ["*"]};
				this.orbitDb.docstore("devices", optsForDevicesDb).then((store) => {
					/** @type {DocumentStore} 
					this.devices = store;
					// store.
				}); */
	
				this.emit("ready");
			} catch (e) {
				this.emit("error", e);
			}
		})();
	}

	/**
	 * Short hand to create a Cloudy instance.
	 * @param {IPFS|Object} ipfsOrOptions ready-ed IPFS instance OR an object which will be passed to the IPFS constructor
	 * @param {string} [directory]
	 * @param {?string} [namespace] database address for syncing devices. null for new Cloudy database
	 * @param {string} [deviceId] unique device ID -- should be SAME each time user invokes the app
	 * @param {Function} [wakeupFunction] a function to wake up the device for syncing. return a promise to pause the sync
	 * @param {Object} [storeDefaults] default options for stores 
	 * @param {*} [options] options to pass to OrbitDB constructor
	 * @return {Promise<Cloudy>} - Cloudy instance 
	 */
	static create(ipfsOrOptions, directory, namespace, deviceId, wakeupFunction, storeDefaults, options) {
		return new Promise((resolve, reject) => {
			const cloudy = new Cloudy(ipfsOrOptions, directory, namespace, deviceId, wakeupFunction, storeDefaults, options);
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
	store(nameOrAddress, options = {}) {
		options = Object.assign({}, this.storeDefaults, options);
		// nameOrAddress = nameOrAddress.toString().startsWith && nameOrAddress.toString().startsWith("/orbitdb/") ? nameOrAddress : `${this.namespace}/${nameOrAddress}`;
		return this.orbitDb.docs(nameOrAddress, options);
	}
}

module.exports = Cloudy;