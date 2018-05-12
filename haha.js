const obj = new (require("window-mock").default)();
obj.crypto = require("isomorphic-webcrypto");
global.self = obj;