var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = y[op[0] & 2 ? "return" : op[0] ? "throw" : "next"]) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [0, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var IPFS = require('ipfs');
var OrbitDB = require('orbit-db');
var IPFSRepo = require('ipfs-repo');
var Cloudy = /** @class */ (function (_super) {
    __extends(Cloudy, _super);
    /**
     * @param {IPFS} ipfs
     * @param {string} directory
     * @returns {Cloudy}
     */
    function Cloudy(ipfs, directory) {
        return _super.apply(this, arguments) || this;
    }
    /**
     * Preferred way of creating a Cloudy instance.
     * @param {Object} ipfsOptions
     * @return {Promise<Cloudy>} - Cloudy instance
     */
    Cloudy.create = function (ipfsOptions) {
        if (ipfsOptions === void 0) { ipfsOptions = {}; }
        if (typeof self === "undefined") {
            var wrtc = require('wrtc');
            var WStar = require('libp2p-webrtc-star');
            var wstar = new WStar({ wrtc: wrtc });
            ipfsOptions = Object.assign({
                repo: new IPFSRepo("./storage/ipfs-repo"),
                config: {
                    Addresses: {
                        Swarm: [
                            "/dns4/wrtc-star.discovery.libp2p.io/tcp/443/wss/p2p-webrtc-star",
                        ]
                    }
                }
            }, ipfsOptions, {
                libp2p: {
                    modules: {
                        transport: [wstar],
                        discovery: [wstar.discovery]
                    }
                }
            });
        }
        return new Promise(function (resolve, reject) {
            var ipfs = new IPFS(Object.assign({ EXPERIMENTAL: {
                    pubsub: true
                } }, ipfsOptions));
            ipfs.on("error", function (e) {
                reject(e);
            });
            ipfs.on("ready", function () {
                return __awaiter(this, void 0, void 0, function () {
                    return __generator(this, function (_a) {
                        resolve(new Cloudy(ipfs, "./storage/orbitdb"));
                        return [2 /*return*/];
                    });
                });
            });
        });
    };
    return Cloudy;
}(OrbitDB));
module.exports = Cloudy;
var Cloudy = require("./index");
var uuid = require('uuid/v4');
var reemit = require('re-emitter');
var EventEmitter = require('events');
/**
 * DAO for calendar objects (events, etc.)
 * See {@link http://tutorials.jenkov.com/java-persistence/dao-design-pattern.html}
 */
var Calendar = /** @class */ (function (_super) {
    __extends(Calendar, _super);
    function Calendar(cloudy, db) {
        var _this = _super.call(this) || this;
        _this.cloudy = cloudy;
        _this.db = db;
        reemit(_this.db.events, _this, ["replicated", "replicate", "load", "load.progress", "ready", "write"]);
        return _this;
    }
    /**
     * @param {string} dbAddress existing database address, otherwise give a random name to initiate a new database
     * @param {Object} ipfsOptions
     * @returns {Calendar}
     */
    Calendar.create = function (dbAddress, ipfsOptions) {
        if (dbAddress === void 0) { dbAddress = "new-database"; }
        if (ipfsOptions === void 0) { ipfsOptions = {}; }
        return __awaiter(this, void 0, void 0, function () {
            var cloudy, db, calendar;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, Cloudy.create(ipfsOptions)];
                    case 1:
                        cloudy = _a.sent();
                        return [4 /*yield*/, cloudy.docs(dbAddress, { indexBy: "id" })];
                    case 2:
                        db = _a.sent();
                        return [4 /*yield*/, db.load()];
                    case 3:
                        _a.sent();
                        calendar = new Calendar(cloudy, db);
                        return [2 /*return*/, calendar];
                }
            });
        });
    };
    /**
     * @param {Event} event - event to be saved. note that it might be mutated -- new events without ID attribute will be populated automatically
     * @returns {Event}
     */
    // previously: @returns {Promise<string>} the hash of the new doc
    Calendar.prototype.addEvent = function (event) {
        return __awaiter(this, void 0, void 0, function () {
            var hash;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!event.id) {
                            event.id = uuid();
                        }
                        return [4 /*yield*/, this.db.put(event)];
                    case 1:
                        hash = _a.sent();
                        return [2 /*return*/, event];
                }
            });
        });
    };
    /**
     * @callback eventFilter
     * @param {Event} event
     * @return {boolean}
     */
    /**
     * Gets the events in an unspecified order
     * @param {eventFilter} mapper
     * @returns {Event[]} array of events
     */
    Calendar.prototype.getEvents = function (mapper) {
        if (mapper === void 0) { mapper = (function () { return true; }); }
        return this.db.query(mapper).map(Calendar._mapEvents);
    };
    Object.defineProperty(Calendar.prototype, "address", {
        get: function () {
            return this.db.address;
        },
        enumerable: true,
        configurable: true
    });
    /**
     * utility function for mapping events into POJO/date instances
     * @param {Object} event
     * @returns {Event}
     * @private
     */
    Calendar._mapEvents = function (event) {
        event.date = new Date(event.date);
        return event;
    };
    return Calendar;
}(EventEmitter));
module.exports = Calendar;
module.exports = /** @class */ (function () {
    /**
     * @param {Date|string} date
     * @param {string} name
     * @param {string} id
     */
    function Event(date, name, id) {
        if (id === void 0) { id = ""; }
        /** @member {Date} */
        this.date = new Date(date);
        /** @member {string} */
        this.name = name;
        /** @member {string} */
        this.id = id;
    }
    return Event;
}());
//# sourceMappingURL=tsc.js.map