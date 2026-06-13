var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __require = /* @__PURE__ */ ((x) => typeof require !== "undefined" ? require : typeof Proxy !== "undefined" ? new Proxy(x, {
  get: (a, b) => (typeof require !== "undefined" ? require : a)[b]
}) : x)(function(x) {
  if (typeof require !== "undefined") return require.apply(this, arguments);
  throw Error('Dynamic require of "' + x + '" is not supported');
});
var __esm = (fn, res, err) => function __init() {
  if (err) throw err[0];
  try {
    return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
  } catch (e) {
    throw err = [e], e;
  }
};
var __commonJS = (cb, mod) => function __require2() {
  try {
    return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
  } catch (e) {
    throw mod = 0, e;
  }
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// node_modules/ws/lib/constants.js
var require_constants = __commonJS({
  "node_modules/ws/lib/constants.js"(exports, module) {
    "use strict";
    var BINARY_TYPES = ["nodebuffer", "arraybuffer", "fragments"];
    var hasBlob = typeof Blob !== "undefined";
    if (hasBlob) BINARY_TYPES.push("blob");
    module.exports = {
      BINARY_TYPES,
      CLOSE_TIMEOUT: 3e4,
      EMPTY_BUFFER: Buffer.alloc(0),
      GUID: "258EAFA5-E914-47DA-95CA-C5AB0DC85B11",
      hasBlob,
      kForOnEventAttribute: /* @__PURE__ */ Symbol("kIsForOnEventAttribute"),
      kListener: /* @__PURE__ */ Symbol("kListener"),
      kStatusCode: /* @__PURE__ */ Symbol("status-code"),
      kWebSocket: /* @__PURE__ */ Symbol("websocket"),
      NOOP: () => {
      }
    };
  }
});

// node_modules/ws/lib/buffer-util.js
var require_buffer_util = __commonJS({
  "node_modules/ws/lib/buffer-util.js"(exports, module) {
    "use strict";
    var { EMPTY_BUFFER } = require_constants();
    var FastBuffer = Buffer[Symbol.species];
    function concat(list, totalLength) {
      if (list.length === 0) return EMPTY_BUFFER;
      if (list.length === 1) return list[0];
      const target = Buffer.allocUnsafe(totalLength);
      let offset = 0;
      for (let i = 0; i < list.length; i++) {
        const buf = list[i];
        target.set(buf, offset);
        offset += buf.length;
      }
      if (offset < totalLength) {
        return new FastBuffer(target.buffer, target.byteOffset, offset);
      }
      return target;
    }
    function _mask(source, mask, output, offset, length) {
      for (let i = 0; i < length; i++) {
        output[offset + i] = source[i] ^ mask[i & 3];
      }
    }
    function _unmask(buffer, mask) {
      for (let i = 0; i < buffer.length; i++) {
        buffer[i] ^= mask[i & 3];
      }
    }
    function toArrayBuffer(buf) {
      if (buf.length === buf.buffer.byteLength) {
        return buf.buffer;
      }
      return buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.length);
    }
    function toBuffer(data) {
      toBuffer.readOnly = true;
      if (Buffer.isBuffer(data)) return data;
      let buf;
      if (data instanceof ArrayBuffer) {
        buf = new FastBuffer(data);
      } else if (ArrayBuffer.isView(data)) {
        buf = new FastBuffer(data.buffer, data.byteOffset, data.byteLength);
      } else {
        buf = Buffer.from(data);
        toBuffer.readOnly = false;
      }
      return buf;
    }
    module.exports = {
      concat,
      mask: _mask,
      toArrayBuffer,
      toBuffer,
      unmask: _unmask
    };
    if (!process.env.WS_NO_BUFFER_UTIL) {
      try {
        const bufferUtil = __require("bufferutil");
        module.exports.mask = function(source, mask, output, offset, length) {
          if (length < 48) _mask(source, mask, output, offset, length);
          else bufferUtil.mask(source, mask, output, offset, length);
        };
        module.exports.unmask = function(buffer, mask) {
          if (buffer.length < 32) _unmask(buffer, mask);
          else bufferUtil.unmask(buffer, mask);
        };
      } catch (e) {
      }
    }
  }
});

// node_modules/ws/lib/limiter.js
var require_limiter = __commonJS({
  "node_modules/ws/lib/limiter.js"(exports, module) {
    "use strict";
    var kDone = /* @__PURE__ */ Symbol("kDone");
    var kRun = /* @__PURE__ */ Symbol("kRun");
    var Limiter = class {
      /**
       * Creates a new `Limiter`.
       *
       * @param {Number} [concurrency=Infinity] The maximum number of jobs allowed
       *     to run concurrently
       */
      constructor(concurrency) {
        this[kDone] = () => {
          this.pending--;
          this[kRun]();
        };
        this.concurrency = concurrency || Infinity;
        this.jobs = [];
        this.pending = 0;
      }
      /**
       * Adds a job to the queue.
       *
       * @param {Function} job The job to run
       * @public
       */
      add(job) {
        this.jobs.push(job);
        this[kRun]();
      }
      /**
       * Removes a job from the queue and runs it if possible.
       *
       * @private
       */
      [kRun]() {
        if (this.pending === this.concurrency) return;
        if (this.jobs.length) {
          const job = this.jobs.shift();
          this.pending++;
          job(this[kDone]);
        }
      }
    };
    module.exports = Limiter;
  }
});

// node_modules/ws/lib/permessage-deflate.js
var require_permessage_deflate = __commonJS({
  "node_modules/ws/lib/permessage-deflate.js"(exports, module) {
    "use strict";
    var zlib = __require("zlib");
    var bufferUtil = require_buffer_util();
    var Limiter = require_limiter();
    var { kStatusCode } = require_constants();
    var FastBuffer = Buffer[Symbol.species];
    var TRAILER = Buffer.from([0, 0, 255, 255]);
    var kPerMessageDeflate = /* @__PURE__ */ Symbol("permessage-deflate");
    var kTotalLength = /* @__PURE__ */ Symbol("total-length");
    var kCallback = /* @__PURE__ */ Symbol("callback");
    var kBuffers = /* @__PURE__ */ Symbol("buffers");
    var kError = /* @__PURE__ */ Symbol("error");
    var zlibLimiter;
    var PerMessageDeflate2 = class {
      /**
       * Creates a PerMessageDeflate instance.
       *
       * @param {Object} [options] Configuration options
       * @param {(Boolean|Number)} [options.clientMaxWindowBits] Advertise support
       *     for, or request, a custom client window size
       * @param {Boolean} [options.clientNoContextTakeover=false] Advertise/
       *     acknowledge disabling of client context takeover
       * @param {Number} [options.concurrencyLimit=10] The number of concurrent
       *     calls to zlib
       * @param {Boolean} [options.isServer=false] Create the instance in either
       *     server or client mode
       * @param {Number} [options.maxPayload=0] The maximum allowed message length
       * @param {(Boolean|Number)} [options.serverMaxWindowBits] Request/confirm the
       *     use of a custom server window size
       * @param {Boolean} [options.serverNoContextTakeover=false] Request/accept
       *     disabling of server context takeover
       * @param {Number} [options.threshold=1024] Size (in bytes) below which
       *     messages should not be compressed if context takeover is disabled
       * @param {Object} [options.zlibDeflateOptions] Options to pass to zlib on
       *     deflate
       * @param {Object} [options.zlibInflateOptions] Options to pass to zlib on
       *     inflate
       */
      constructor(options) {
        this._options = options || {};
        this._threshold = this._options.threshold !== void 0 ? this._options.threshold : 1024;
        this._maxPayload = this._options.maxPayload | 0;
        this._isServer = !!this._options.isServer;
        this._deflate = null;
        this._inflate = null;
        this.params = null;
        if (!zlibLimiter) {
          const concurrency = this._options.concurrencyLimit !== void 0 ? this._options.concurrencyLimit : 10;
          zlibLimiter = new Limiter(concurrency);
        }
      }
      /**
       * @type {String}
       */
      static get extensionName() {
        return "permessage-deflate";
      }
      /**
       * Create an extension negotiation offer.
       *
       * @return {Object} Extension parameters
       * @public
       */
      offer() {
        const params = {};
        if (this._options.serverNoContextTakeover) {
          params.server_no_context_takeover = true;
        }
        if (this._options.clientNoContextTakeover) {
          params.client_no_context_takeover = true;
        }
        if (this._options.serverMaxWindowBits) {
          params.server_max_window_bits = this._options.serverMaxWindowBits;
        }
        if (this._options.clientMaxWindowBits) {
          params.client_max_window_bits = this._options.clientMaxWindowBits;
        } else if (this._options.clientMaxWindowBits == null) {
          params.client_max_window_bits = true;
        }
        return params;
      }
      /**
       * Accept an extension negotiation offer/response.
       *
       * @param {Array} configurations The extension negotiation offers/reponse
       * @return {Object} Accepted configuration
       * @public
       */
      accept(configurations) {
        configurations = this.normalizeParams(configurations);
        this.params = this._isServer ? this.acceptAsServer(configurations) : this.acceptAsClient(configurations);
        return this.params;
      }
      /**
       * Releases all resources used by the extension.
       *
       * @public
       */
      cleanup() {
        if (this._inflate) {
          this._inflate.close();
          this._inflate = null;
        }
        if (this._deflate) {
          const callback = this._deflate[kCallback];
          this._deflate.close();
          this._deflate = null;
          if (callback) {
            callback(
              new Error(
                "The deflate stream was closed while data was being processed"
              )
            );
          }
        }
      }
      /**
       *  Accept an extension negotiation offer.
       *
       * @param {Array} offers The extension negotiation offers
       * @return {Object} Accepted configuration
       * @private
       */
      acceptAsServer(offers) {
        const opts = this._options;
        const accepted = offers.find((params) => {
          if (opts.serverNoContextTakeover === false && params.server_no_context_takeover || params.server_max_window_bits && (opts.serverMaxWindowBits === false || typeof opts.serverMaxWindowBits === "number" && opts.serverMaxWindowBits > params.server_max_window_bits) || typeof opts.clientMaxWindowBits === "number" && !params.client_max_window_bits) {
            return false;
          }
          return true;
        });
        if (!accepted) {
          throw new Error("None of the extension offers can be accepted");
        }
        if (opts.serverNoContextTakeover) {
          accepted.server_no_context_takeover = true;
        }
        if (opts.clientNoContextTakeover) {
          accepted.client_no_context_takeover = true;
        }
        if (typeof opts.serverMaxWindowBits === "number") {
          accepted.server_max_window_bits = opts.serverMaxWindowBits;
        }
        if (typeof opts.clientMaxWindowBits === "number") {
          accepted.client_max_window_bits = opts.clientMaxWindowBits;
        } else if (accepted.client_max_window_bits === true || opts.clientMaxWindowBits === false) {
          delete accepted.client_max_window_bits;
        }
        return accepted;
      }
      /**
       * Accept the extension negotiation response.
       *
       * @param {Array} response The extension negotiation response
       * @return {Object} Accepted configuration
       * @private
       */
      acceptAsClient(response) {
        const params = response[0];
        if (this._options.clientNoContextTakeover === false && params.client_no_context_takeover) {
          throw new Error('Unexpected parameter "client_no_context_takeover"');
        }
        if (!params.client_max_window_bits) {
          if (typeof this._options.clientMaxWindowBits === "number") {
            params.client_max_window_bits = this._options.clientMaxWindowBits;
          }
        } else if (this._options.clientMaxWindowBits === false || typeof this._options.clientMaxWindowBits === "number" && params.client_max_window_bits > this._options.clientMaxWindowBits) {
          throw new Error(
            'Unexpected or invalid parameter "client_max_window_bits"'
          );
        }
        return params;
      }
      /**
       * Normalize parameters.
       *
       * @param {Array} configurations The extension negotiation offers/reponse
       * @return {Array} The offers/response with normalized parameters
       * @private
       */
      normalizeParams(configurations) {
        configurations.forEach((params) => {
          Object.keys(params).forEach((key) => {
            let value = params[key];
            if (value.length > 1) {
              throw new Error(`Parameter "${key}" must have only a single value`);
            }
            value = value[0];
            if (key === "client_max_window_bits") {
              if (value !== true) {
                const num = +value;
                if (!Number.isInteger(num) || num < 8 || num > 15) {
                  throw new TypeError(
                    `Invalid value for parameter "${key}": ${value}`
                  );
                }
                value = num;
              } else if (!this._isServer) {
                throw new TypeError(
                  `Invalid value for parameter "${key}": ${value}`
                );
              }
            } else if (key === "server_max_window_bits") {
              const num = +value;
              if (!Number.isInteger(num) || num < 8 || num > 15) {
                throw new TypeError(
                  `Invalid value for parameter "${key}": ${value}`
                );
              }
              value = num;
            } else if (key === "client_no_context_takeover" || key === "server_no_context_takeover") {
              if (value !== true) {
                throw new TypeError(
                  `Invalid value for parameter "${key}": ${value}`
                );
              }
            } else {
              throw new Error(`Unknown parameter "${key}"`);
            }
            params[key] = value;
          });
        });
        return configurations;
      }
      /**
       * Decompress data. Concurrency limited.
       *
       * @param {Buffer} data Compressed data
       * @param {Boolean} fin Specifies whether or not this is the last fragment
       * @param {Function} callback Callback
       * @public
       */
      decompress(data, fin, callback) {
        zlibLimiter.add((done) => {
          this._decompress(data, fin, (err, result) => {
            done();
            callback(err, result);
          });
        });
      }
      /**
       * Compress data. Concurrency limited.
       *
       * @param {(Buffer|String)} data Data to compress
       * @param {Boolean} fin Specifies whether or not this is the last fragment
       * @param {Function} callback Callback
       * @public
       */
      compress(data, fin, callback) {
        zlibLimiter.add((done) => {
          this._compress(data, fin, (err, result) => {
            done();
            callback(err, result);
          });
        });
      }
      /**
       * Decompress data.
       *
       * @param {Buffer} data Compressed data
       * @param {Boolean} fin Specifies whether or not this is the last fragment
       * @param {Function} callback Callback
       * @private
       */
      _decompress(data, fin, callback) {
        const endpoint = this._isServer ? "client" : "server";
        if (!this._inflate) {
          const key = `${endpoint}_max_window_bits`;
          const windowBits = typeof this.params[key] !== "number" ? zlib.Z_DEFAULT_WINDOWBITS : this.params[key];
          this._inflate = zlib.createInflateRaw({
            ...this._options.zlibInflateOptions,
            windowBits
          });
          this._inflate[kPerMessageDeflate] = this;
          this._inflate[kTotalLength] = 0;
          this._inflate[kBuffers] = [];
          this._inflate.on("error", inflateOnError);
          this._inflate.on("data", inflateOnData);
        }
        this._inflate[kCallback] = callback;
        this._inflate.write(data);
        if (fin) this._inflate.write(TRAILER);
        this._inflate.flush(() => {
          const err = this._inflate[kError];
          if (err) {
            this._inflate.close();
            this._inflate = null;
            callback(err);
            return;
          }
          const data2 = bufferUtil.concat(
            this._inflate[kBuffers],
            this._inflate[kTotalLength]
          );
          if (this._inflate._readableState.endEmitted) {
            this._inflate.close();
            this._inflate = null;
          } else {
            this._inflate[kTotalLength] = 0;
            this._inflate[kBuffers] = [];
            if (fin && this.params[`${endpoint}_no_context_takeover`]) {
              this._inflate.reset();
            }
          }
          callback(null, data2);
        });
      }
      /**
       * Compress data.
       *
       * @param {(Buffer|String)} data Data to compress
       * @param {Boolean} fin Specifies whether or not this is the last fragment
       * @param {Function} callback Callback
       * @private
       */
      _compress(data, fin, callback) {
        const endpoint = this._isServer ? "server" : "client";
        if (!this._deflate) {
          const key = `${endpoint}_max_window_bits`;
          const windowBits = typeof this.params[key] !== "number" ? zlib.Z_DEFAULT_WINDOWBITS : this.params[key];
          this._deflate = zlib.createDeflateRaw({
            ...this._options.zlibDeflateOptions,
            windowBits
          });
          this._deflate[kTotalLength] = 0;
          this._deflate[kBuffers] = [];
          this._deflate.on("data", deflateOnData);
        }
        this._deflate[kCallback] = callback;
        this._deflate.write(data);
        this._deflate.flush(zlib.Z_SYNC_FLUSH, () => {
          if (!this._deflate) {
            return;
          }
          let data2 = bufferUtil.concat(
            this._deflate[kBuffers],
            this._deflate[kTotalLength]
          );
          if (fin) {
            data2 = new FastBuffer(data2.buffer, data2.byteOffset, data2.length - 4);
          }
          this._deflate[kCallback] = null;
          this._deflate[kTotalLength] = 0;
          this._deflate[kBuffers] = [];
          if (fin && this.params[`${endpoint}_no_context_takeover`]) {
            this._deflate.reset();
          }
          callback(null, data2);
        });
      }
    };
    module.exports = PerMessageDeflate2;
    function deflateOnData(chunk) {
      this[kBuffers].push(chunk);
      this[kTotalLength] += chunk.length;
    }
    function inflateOnData(chunk) {
      this[kTotalLength] += chunk.length;
      if (this[kPerMessageDeflate]._maxPayload < 1 || this[kTotalLength] <= this[kPerMessageDeflate]._maxPayload) {
        this[kBuffers].push(chunk);
        return;
      }
      this[kError] = new RangeError("Max payload size exceeded");
      this[kError].code = "WS_ERR_UNSUPPORTED_MESSAGE_LENGTH";
      this[kError][kStatusCode] = 1009;
      this.removeListener("data", inflateOnData);
      this.reset();
    }
    function inflateOnError(err) {
      this[kPerMessageDeflate]._inflate = null;
      if (this[kError]) {
        this[kCallback](this[kError]);
        return;
      }
      err[kStatusCode] = 1007;
      this[kCallback](err);
    }
  }
});

// node_modules/ws/lib/validation.js
var require_validation = __commonJS({
  "node_modules/ws/lib/validation.js"(exports, module) {
    "use strict";
    var { isUtf8 } = __require("buffer");
    var { hasBlob } = require_constants();
    var tokenChars = [
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      // 0 - 15
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      // 16 - 31
      0,
      1,
      0,
      1,
      1,
      1,
      1,
      1,
      0,
      0,
      1,
      1,
      0,
      1,
      1,
      0,
      // 32 - 47
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      0,
      0,
      0,
      0,
      0,
      0,
      // 48 - 63
      0,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      // 64 - 79
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      0,
      0,
      0,
      1,
      1,
      // 80 - 95
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      // 96 - 111
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      0,
      1,
      0,
      1,
      0
      // 112 - 127
    ];
    function isValidStatusCode(code) {
      return code >= 1e3 && code <= 1014 && code !== 1004 && code !== 1005 && code !== 1006 || code >= 3e3 && code <= 4999;
    }
    function _isValidUTF8(buf) {
      const len = buf.length;
      let i = 0;
      while (i < len) {
        if ((buf[i] & 128) === 0) {
          i++;
        } else if ((buf[i] & 224) === 192) {
          if (i + 1 === len || (buf[i + 1] & 192) !== 128 || (buf[i] & 254) === 192) {
            return false;
          }
          i += 2;
        } else if ((buf[i] & 240) === 224) {
          if (i + 2 >= len || (buf[i + 1] & 192) !== 128 || (buf[i + 2] & 192) !== 128 || buf[i] === 224 && (buf[i + 1] & 224) === 128 || // Overlong
          buf[i] === 237 && (buf[i + 1] & 224) === 160) {
            return false;
          }
          i += 3;
        } else if ((buf[i] & 248) === 240) {
          if (i + 3 >= len || (buf[i + 1] & 192) !== 128 || (buf[i + 2] & 192) !== 128 || (buf[i + 3] & 192) !== 128 || buf[i] === 240 && (buf[i + 1] & 240) === 128 || // Overlong
          buf[i] === 244 && buf[i + 1] > 143 || buf[i] > 244) {
            return false;
          }
          i += 4;
        } else {
          return false;
        }
      }
      return true;
    }
    function isBlob(value) {
      return hasBlob && typeof value === "object" && typeof value.arrayBuffer === "function" && typeof value.type === "string" && typeof value.stream === "function" && (value[Symbol.toStringTag] === "Blob" || value[Symbol.toStringTag] === "File");
    }
    module.exports = {
      isBlob,
      isValidStatusCode,
      isValidUTF8: _isValidUTF8,
      tokenChars
    };
    if (isUtf8) {
      module.exports.isValidUTF8 = function(buf) {
        return buf.length < 24 ? _isValidUTF8(buf) : isUtf8(buf);
      };
    } else if (!process.env.WS_NO_UTF_8_VALIDATE) {
      try {
        const isValidUTF8 = __require("utf-8-validate");
        module.exports.isValidUTF8 = function(buf) {
          return buf.length < 32 ? _isValidUTF8(buf) : isValidUTF8(buf);
        };
      } catch (e) {
      }
    }
  }
});

// node_modules/ws/lib/receiver.js
var require_receiver = __commonJS({
  "node_modules/ws/lib/receiver.js"(exports, module) {
    "use strict";
    var { Writable } = __require("stream");
    var PerMessageDeflate2 = require_permessage_deflate();
    var {
      BINARY_TYPES,
      EMPTY_BUFFER,
      kStatusCode,
      kWebSocket
    } = require_constants();
    var { concat, toArrayBuffer, unmask } = require_buffer_util();
    var { isValidStatusCode, isValidUTF8 } = require_validation();
    var FastBuffer = Buffer[Symbol.species];
    var GET_INFO = 0;
    var GET_PAYLOAD_LENGTH_16 = 1;
    var GET_PAYLOAD_LENGTH_64 = 2;
    var GET_MASK = 3;
    var GET_DATA = 4;
    var INFLATING = 5;
    var DEFER_EVENT = 6;
    var Receiver2 = class extends Writable {
      /**
       * Creates a Receiver instance.
       *
       * @param {Object} [options] Options object
       * @param {Boolean} [options.allowSynchronousEvents=true] Specifies whether
       *     any of the `'message'`, `'ping'`, and `'pong'` events can be emitted
       *     multiple times in the same tick
       * @param {String} [options.binaryType=nodebuffer] The type for binary data
       * @param {Object} [options.extensions] An object containing the negotiated
       *     extensions
       * @param {Boolean} [options.isServer=false] Specifies whether to operate in
       *     client or server mode
       * @param {Number} [options.maxBufferedChunks=0] The maximum number of
       *     buffered data chunks
       * @param {Number} [options.maxFragments=0] The maximum number of message
       *     fragments
       * @param {Number} [options.maxPayload=0] The maximum allowed message length
       * @param {Boolean} [options.skipUTF8Validation=false] Specifies whether or
       *     not to skip UTF-8 validation for text and close messages
       */
      constructor(options = {}) {
        super();
        this._allowSynchronousEvents = options.allowSynchronousEvents !== void 0 ? options.allowSynchronousEvents : true;
        this._binaryType = options.binaryType || BINARY_TYPES[0];
        this._extensions = options.extensions || {};
        this._isServer = !!options.isServer;
        this._maxBufferedChunks = options.maxBufferedChunks | 0;
        this._maxFragments = options.maxFragments | 0;
        this._maxPayload = options.maxPayload | 0;
        this._skipUTF8Validation = !!options.skipUTF8Validation;
        this[kWebSocket] = void 0;
        this._bufferedBytes = 0;
        this._buffers = [];
        this._compressed = false;
        this._payloadLength = 0;
        this._mask = void 0;
        this._fragmented = 0;
        this._masked = false;
        this._fin = false;
        this._opcode = 0;
        this._totalPayloadLength = 0;
        this._messageLength = 0;
        this._fragments = [];
        this._errored = false;
        this._loop = false;
        this._state = GET_INFO;
      }
      /**
       * Implements `Writable.prototype._write()`.
       *
       * @param {Buffer} chunk The chunk of data to write
       * @param {String} encoding The character encoding of `chunk`
       * @param {Function} cb Callback
       * @private
       */
      _write(chunk, encoding, cb) {
        if (this._opcode === 8 && this._state == GET_INFO) return cb();
        if (this._maxBufferedChunks > 0 && this._buffers.length >= this._maxBufferedChunks) {
          cb(
            this.createError(
              RangeError,
              "Too many buffered chunks",
              false,
              1008,
              "WS_ERR_TOO_MANY_BUFFERED_PARTS"
            )
          );
          return;
        }
        this._bufferedBytes += chunk.length;
        this._buffers.push(chunk);
        this.startLoop(cb);
      }
      /**
       * Consumes `n` bytes from the buffered data.
       *
       * @param {Number} n The number of bytes to consume
       * @return {Buffer} The consumed bytes
       * @private
       */
      consume(n) {
        this._bufferedBytes -= n;
        if (n === this._buffers[0].length) return this._buffers.shift();
        if (n < this._buffers[0].length) {
          const buf = this._buffers[0];
          this._buffers[0] = new FastBuffer(
            buf.buffer,
            buf.byteOffset + n,
            buf.length - n
          );
          return new FastBuffer(buf.buffer, buf.byteOffset, n);
        }
        const dst = Buffer.allocUnsafe(n);
        do {
          const buf = this._buffers[0];
          const offset = dst.length - n;
          if (n >= buf.length) {
            dst.set(this._buffers.shift(), offset);
          } else {
            dst.set(new Uint8Array(buf.buffer, buf.byteOffset, n), offset);
            this._buffers[0] = new FastBuffer(
              buf.buffer,
              buf.byteOffset + n,
              buf.length - n
            );
          }
          n -= buf.length;
        } while (n > 0);
        return dst;
      }
      /**
       * Starts the parsing loop.
       *
       * @param {Function} cb Callback
       * @private
       */
      startLoop(cb) {
        this._loop = true;
        do {
          switch (this._state) {
            case GET_INFO:
              this.getInfo(cb);
              break;
            case GET_PAYLOAD_LENGTH_16:
              this.getPayloadLength16(cb);
              break;
            case GET_PAYLOAD_LENGTH_64:
              this.getPayloadLength64(cb);
              break;
            case GET_MASK:
              this.getMask();
              break;
            case GET_DATA:
              this.getData(cb);
              break;
            case INFLATING:
            case DEFER_EVENT:
              this._loop = false;
              return;
          }
        } while (this._loop);
        if (!this._errored) cb();
      }
      /**
       * Reads the first two bytes of a frame.
       *
       * @param {Function} cb Callback
       * @private
       */
      getInfo(cb) {
        if (this._bufferedBytes < 2) {
          this._loop = false;
          return;
        }
        const buf = this.consume(2);
        if ((buf[0] & 48) !== 0) {
          const error = this.createError(
            RangeError,
            "RSV2 and RSV3 must be clear",
            true,
            1002,
            "WS_ERR_UNEXPECTED_RSV_2_3"
          );
          cb(error);
          return;
        }
        const compressed = (buf[0] & 64) === 64;
        if (compressed && !this._extensions[PerMessageDeflate2.extensionName]) {
          const error = this.createError(
            RangeError,
            "RSV1 must be clear",
            true,
            1002,
            "WS_ERR_UNEXPECTED_RSV_1"
          );
          cb(error);
          return;
        }
        this._fin = (buf[0] & 128) === 128;
        this._opcode = buf[0] & 15;
        this._payloadLength = buf[1] & 127;
        if (this._opcode === 0) {
          if (compressed) {
            const error = this.createError(
              RangeError,
              "RSV1 must be clear",
              true,
              1002,
              "WS_ERR_UNEXPECTED_RSV_1"
            );
            cb(error);
            return;
          }
          if (!this._fragmented) {
            const error = this.createError(
              RangeError,
              "invalid opcode 0",
              true,
              1002,
              "WS_ERR_INVALID_OPCODE"
            );
            cb(error);
            return;
          }
          this._opcode = this._fragmented;
        } else if (this._opcode === 1 || this._opcode === 2) {
          if (this._fragmented) {
            const error = this.createError(
              RangeError,
              `invalid opcode ${this._opcode}`,
              true,
              1002,
              "WS_ERR_INVALID_OPCODE"
            );
            cb(error);
            return;
          }
          this._compressed = compressed;
        } else if (this._opcode > 7 && this._opcode < 11) {
          if (!this._fin) {
            const error = this.createError(
              RangeError,
              "FIN must be set",
              true,
              1002,
              "WS_ERR_EXPECTED_FIN"
            );
            cb(error);
            return;
          }
          if (compressed) {
            const error = this.createError(
              RangeError,
              "RSV1 must be clear",
              true,
              1002,
              "WS_ERR_UNEXPECTED_RSV_1"
            );
            cb(error);
            return;
          }
          if (this._payloadLength > 125 || this._opcode === 8 && this._payloadLength === 1) {
            const error = this.createError(
              RangeError,
              `invalid payload length ${this._payloadLength}`,
              true,
              1002,
              "WS_ERR_INVALID_CONTROL_PAYLOAD_LENGTH"
            );
            cb(error);
            return;
          }
        } else {
          const error = this.createError(
            RangeError,
            `invalid opcode ${this._opcode}`,
            true,
            1002,
            "WS_ERR_INVALID_OPCODE"
          );
          cb(error);
          return;
        }
        if (!this._fin && !this._fragmented) this._fragmented = this._opcode;
        this._masked = (buf[1] & 128) === 128;
        if (this._isServer) {
          if (!this._masked) {
            const error = this.createError(
              RangeError,
              "MASK must be set",
              true,
              1002,
              "WS_ERR_EXPECTED_MASK"
            );
            cb(error);
            return;
          }
        } else if (this._masked) {
          const error = this.createError(
            RangeError,
            "MASK must be clear",
            true,
            1002,
            "WS_ERR_UNEXPECTED_MASK"
          );
          cb(error);
          return;
        }
        if (this._payloadLength === 126) this._state = GET_PAYLOAD_LENGTH_16;
        else if (this._payloadLength === 127) this._state = GET_PAYLOAD_LENGTH_64;
        else this.haveLength(cb);
      }
      /**
       * Gets extended payload length (7+16).
       *
       * @param {Function} cb Callback
       * @private
       */
      getPayloadLength16(cb) {
        if (this._bufferedBytes < 2) {
          this._loop = false;
          return;
        }
        this._payloadLength = this.consume(2).readUInt16BE(0);
        this.haveLength(cb);
      }
      /**
       * Gets extended payload length (7+64).
       *
       * @param {Function} cb Callback
       * @private
       */
      getPayloadLength64(cb) {
        if (this._bufferedBytes < 8) {
          this._loop = false;
          return;
        }
        const buf = this.consume(8);
        const num = buf.readUInt32BE(0);
        if (num > Math.pow(2, 53 - 32) - 1) {
          const error = this.createError(
            RangeError,
            "Unsupported WebSocket frame: payload length > 2^53 - 1",
            false,
            1009,
            "WS_ERR_UNSUPPORTED_DATA_PAYLOAD_LENGTH"
          );
          cb(error);
          return;
        }
        this._payloadLength = num * Math.pow(2, 32) + buf.readUInt32BE(4);
        this.haveLength(cb);
      }
      /**
       * Payload length has been read.
       *
       * @param {Function} cb Callback
       * @private
       */
      haveLength(cb) {
        if (this._payloadLength && this._opcode < 8) {
          this._totalPayloadLength += this._payloadLength;
          if (this._totalPayloadLength > this._maxPayload && this._maxPayload > 0) {
            const error = this.createError(
              RangeError,
              "Max payload size exceeded",
              false,
              1009,
              "WS_ERR_UNSUPPORTED_MESSAGE_LENGTH"
            );
            cb(error);
            return;
          }
        }
        if (this._masked) this._state = GET_MASK;
        else this._state = GET_DATA;
      }
      /**
       * Reads mask bytes.
       *
       * @private
       */
      getMask() {
        if (this._bufferedBytes < 4) {
          this._loop = false;
          return;
        }
        this._mask = this.consume(4);
        this._state = GET_DATA;
      }
      /**
       * Reads data bytes.
       *
       * @param {Function} cb Callback
       * @private
       */
      getData(cb) {
        let data = EMPTY_BUFFER;
        if (this._payloadLength) {
          if (this._bufferedBytes < this._payloadLength) {
            this._loop = false;
            return;
          }
          data = this.consume(this._payloadLength);
          if (this._masked && (this._mask[0] | this._mask[1] | this._mask[2] | this._mask[3]) !== 0) {
            unmask(data, this._mask);
          }
        }
        if (this._opcode > 7) {
          this.controlMessage(data, cb);
          return;
        }
        if (this._compressed) {
          this._state = INFLATING;
          this.decompress(data, cb);
          return;
        }
        if (data.length) {
          if (this._maxFragments > 0 && this._fragments.length >= this._maxFragments) {
            const error = this.createError(
              RangeError,
              "Too many message fragments",
              false,
              1008,
              "WS_ERR_TOO_MANY_BUFFERED_PARTS"
            );
            cb(error);
            return;
          }
          this._messageLength = this._totalPayloadLength;
          this._fragments.push(data);
        }
        this.dataMessage(cb);
      }
      /**
       * Decompresses data.
       *
       * @param {Buffer} data Compressed data
       * @param {Function} cb Callback
       * @private
       */
      decompress(data, cb) {
        const perMessageDeflate = this._extensions[PerMessageDeflate2.extensionName];
        perMessageDeflate.decompress(data, this._fin, (err, buf) => {
          if (err) return cb(err);
          if (buf.length) {
            this._messageLength += buf.length;
            if (this._messageLength > this._maxPayload && this._maxPayload > 0) {
              const error = this.createError(
                RangeError,
                "Max payload size exceeded",
                false,
                1009,
                "WS_ERR_UNSUPPORTED_MESSAGE_LENGTH"
              );
              cb(error);
              return;
            }
            if (this._maxFragments > 0 && this._fragments.length >= this._maxFragments) {
              const error = this.createError(
                RangeError,
                "Too many message fragments",
                false,
                1008,
                "WS_ERR_TOO_MANY_BUFFERED_PARTS"
              );
              cb(error);
              return;
            }
            this._fragments.push(buf);
          }
          this.dataMessage(cb);
          if (this._state === GET_INFO) this.startLoop(cb);
        });
      }
      /**
       * Handles a data message.
       *
       * @param {Function} cb Callback
       * @private
       */
      dataMessage(cb) {
        if (!this._fin) {
          this._state = GET_INFO;
          return;
        }
        const messageLength = this._messageLength;
        const fragments = this._fragments;
        this._totalPayloadLength = 0;
        this._messageLength = 0;
        this._fragmented = 0;
        this._fragments = [];
        if (this._opcode === 2) {
          let data;
          if (this._binaryType === "nodebuffer") {
            data = concat(fragments, messageLength);
          } else if (this._binaryType === "arraybuffer") {
            data = toArrayBuffer(concat(fragments, messageLength));
          } else if (this._binaryType === "blob") {
            data = new Blob(fragments);
          } else {
            data = fragments;
          }
          if (this._allowSynchronousEvents) {
            this.emit("message", data, true);
            this._state = GET_INFO;
          } else {
            this._state = DEFER_EVENT;
            setImmediate(() => {
              this.emit("message", data, true);
              this._state = GET_INFO;
              this.startLoop(cb);
            });
          }
        } else {
          const buf = concat(fragments, messageLength);
          if (!this._skipUTF8Validation && !isValidUTF8(buf)) {
            const error = this.createError(
              Error,
              "invalid UTF-8 sequence",
              true,
              1007,
              "WS_ERR_INVALID_UTF8"
            );
            cb(error);
            return;
          }
          if (this._state === INFLATING || this._allowSynchronousEvents) {
            this.emit("message", buf, false);
            this._state = GET_INFO;
          } else {
            this._state = DEFER_EVENT;
            setImmediate(() => {
              this.emit("message", buf, false);
              this._state = GET_INFO;
              this.startLoop(cb);
            });
          }
        }
      }
      /**
       * Handles a control message.
       *
       * @param {Buffer} data Data to handle
       * @return {(Error|RangeError|undefined)} A possible error
       * @private
       */
      controlMessage(data, cb) {
        if (this._opcode === 8) {
          if (data.length === 0) {
            this._loop = false;
            this.emit("conclude", 1005, EMPTY_BUFFER);
            this.end();
          } else {
            const code = data.readUInt16BE(0);
            if (!isValidStatusCode(code)) {
              const error = this.createError(
                RangeError,
                `invalid status code ${code}`,
                true,
                1002,
                "WS_ERR_INVALID_CLOSE_CODE"
              );
              cb(error);
              return;
            }
            const buf = new FastBuffer(
              data.buffer,
              data.byteOffset + 2,
              data.length - 2
            );
            if (!this._skipUTF8Validation && !isValidUTF8(buf)) {
              const error = this.createError(
                Error,
                "invalid UTF-8 sequence",
                true,
                1007,
                "WS_ERR_INVALID_UTF8"
              );
              cb(error);
              return;
            }
            this._loop = false;
            this.emit("conclude", code, buf);
            this.end();
          }
          this._state = GET_INFO;
          return;
        }
        if (this._allowSynchronousEvents) {
          this.emit(this._opcode === 9 ? "ping" : "pong", data);
          this._state = GET_INFO;
        } else {
          this._state = DEFER_EVENT;
          setImmediate(() => {
            this.emit(this._opcode === 9 ? "ping" : "pong", data);
            this._state = GET_INFO;
            this.startLoop(cb);
          });
        }
      }
      /**
       * Builds an error object.
       *
       * @param {function(new:Error|RangeError)} ErrorCtor The error constructor
       * @param {String} message The error message
       * @param {Boolean} prefix Specifies whether or not to add a default prefix to
       *     `message`
       * @param {Number} statusCode The status code
       * @param {String} errorCode The exposed error code
       * @return {(Error|RangeError)} The error
       * @private
       */
      createError(ErrorCtor, message, prefix, statusCode, errorCode) {
        this._loop = false;
        this._errored = true;
        const err = new ErrorCtor(
          prefix ? `Invalid WebSocket frame: ${message}` : message
        );
        Error.captureStackTrace(err, this.createError);
        err.code = errorCode;
        err[kStatusCode] = statusCode;
        return err;
      }
    };
    module.exports = Receiver2;
  }
});

// node_modules/ws/lib/sender.js
var require_sender = __commonJS({
  "node_modules/ws/lib/sender.js"(exports, module) {
    "use strict";
    var { Duplex } = __require("stream");
    var { randomFillSync } = __require("crypto");
    var {
      types: { isUint8Array }
    } = __require("util");
    var PerMessageDeflate2 = require_permessage_deflate();
    var { EMPTY_BUFFER, kWebSocket, NOOP } = require_constants();
    var { isBlob, isValidStatusCode } = require_validation();
    var { mask: applyMask, toBuffer } = require_buffer_util();
    var kByteLength = /* @__PURE__ */ Symbol("kByteLength");
    var maskBuffer = Buffer.alloc(4);
    var RANDOM_POOL_SIZE = 8 * 1024;
    var randomPool;
    var randomPoolPointer = RANDOM_POOL_SIZE;
    var DEFAULT = 0;
    var DEFLATING = 1;
    var GET_BLOB_DATA = 2;
    var Sender2 = class _Sender {
      /**
       * Creates a Sender instance.
       *
       * @param {Duplex} socket The connection socket
       * @param {Object} [extensions] An object containing the negotiated extensions
       * @param {Function} [generateMask] The function used to generate the masking
       *     key
       */
      constructor(socket, extensions, generateMask) {
        this._extensions = extensions || {};
        if (generateMask) {
          this._generateMask = generateMask;
          this._maskBuffer = Buffer.alloc(4);
        }
        this._socket = socket;
        this._firstFragment = true;
        this._compress = false;
        this._bufferedBytes = 0;
        this._queue = [];
        this._state = DEFAULT;
        this.onerror = NOOP;
        this[kWebSocket] = void 0;
      }
      /**
       * Frames a piece of data according to the HyBi WebSocket protocol.
       *
       * @param {(Buffer|String)} data The data to frame
       * @param {Object} options Options object
       * @param {Boolean} [options.fin=false] Specifies whether or not to set the
       *     FIN bit
       * @param {Function} [options.generateMask] The function used to generate the
       *     masking key
       * @param {Boolean} [options.mask=false] Specifies whether or not to mask
       *     `data`
       * @param {Buffer} [options.maskBuffer] The buffer used to store the masking
       *     key
       * @param {Number} options.opcode The opcode
       * @param {Boolean} [options.readOnly=false] Specifies whether `data` can be
       *     modified
       * @param {Boolean} [options.rsv1=false] Specifies whether or not to set the
       *     RSV1 bit
       * @return {(Buffer|String)[]} The framed data
       * @public
       */
      static frame(data, options) {
        let mask;
        let merge = false;
        let offset = 2;
        let skipMasking = false;
        if (options.mask) {
          mask = options.maskBuffer || maskBuffer;
          if (options.generateMask) {
            options.generateMask(mask);
          } else {
            if (randomPoolPointer === RANDOM_POOL_SIZE) {
              if (randomPool === void 0) {
                randomPool = Buffer.alloc(RANDOM_POOL_SIZE);
              }
              randomFillSync(randomPool, 0, RANDOM_POOL_SIZE);
              randomPoolPointer = 0;
            }
            mask[0] = randomPool[randomPoolPointer++];
            mask[1] = randomPool[randomPoolPointer++];
            mask[2] = randomPool[randomPoolPointer++];
            mask[3] = randomPool[randomPoolPointer++];
          }
          skipMasking = (mask[0] | mask[1] | mask[2] | mask[3]) === 0;
          offset = 6;
        }
        let dataLength;
        if (typeof data === "string") {
          if ((!options.mask || skipMasking) && options[kByteLength] !== void 0) {
            dataLength = options[kByteLength];
          } else {
            data = Buffer.from(data);
            dataLength = data.length;
          }
        } else {
          dataLength = data.length;
          merge = options.mask && options.readOnly && !skipMasking;
        }
        let payloadLength = dataLength;
        if (dataLength >= 65536) {
          offset += 8;
          payloadLength = 127;
        } else if (dataLength > 125) {
          offset += 2;
          payloadLength = 126;
        }
        const target = Buffer.allocUnsafe(merge ? dataLength + offset : offset);
        target[0] = options.fin ? options.opcode | 128 : options.opcode;
        if (options.rsv1) target[0] |= 64;
        target[1] = payloadLength;
        if (payloadLength === 126) {
          target.writeUInt16BE(dataLength, 2);
        } else if (payloadLength === 127) {
          target[2] = target[3] = 0;
          target.writeUIntBE(dataLength, 4, 6);
        }
        if (!options.mask) return [target, data];
        target[1] |= 128;
        target[offset - 4] = mask[0];
        target[offset - 3] = mask[1];
        target[offset - 2] = mask[2];
        target[offset - 1] = mask[3];
        if (skipMasking) return [target, data];
        if (merge) {
          applyMask(data, mask, target, offset, dataLength);
          return [target];
        }
        applyMask(data, mask, data, 0, dataLength);
        return [target, data];
      }
      /**
       * Sends a close message to the other peer.
       *
       * @param {Number} [code] The status code component of the body
       * @param {(String|Buffer)} [data] The message component of the body
       * @param {Boolean} [mask=false] Specifies whether or not to mask the message
       * @param {Function} [cb] Callback
       * @public
       */
      close(code, data, mask, cb) {
        let buf;
        if (code === void 0) {
          buf = EMPTY_BUFFER;
        } else if (typeof code !== "number" || !isValidStatusCode(code)) {
          throw new TypeError("First argument must be a valid error code number");
        } else if (data === void 0 || !data.length) {
          buf = Buffer.allocUnsafe(2);
          buf.writeUInt16BE(code, 0);
        } else {
          const length = Buffer.byteLength(data);
          if (length > 123) {
            throw new RangeError("The message must not be greater than 123 bytes");
          }
          buf = Buffer.allocUnsafe(2 + length);
          buf.writeUInt16BE(code, 0);
          if (typeof data === "string") {
            buf.write(data, 2);
          } else if (isUint8Array(data)) {
            buf.set(data, 2);
          } else {
            throw new TypeError("Second argument must be a string or a Uint8Array");
          }
        }
        const options = {
          [kByteLength]: buf.length,
          fin: true,
          generateMask: this._generateMask,
          mask,
          maskBuffer: this._maskBuffer,
          opcode: 8,
          readOnly: false,
          rsv1: false
        };
        if (this._state !== DEFAULT) {
          this.enqueue([this.dispatch, buf, false, options, cb]);
        } else {
          this.sendFrame(_Sender.frame(buf, options), cb);
        }
      }
      /**
       * Sends a ping message to the other peer.
       *
       * @param {*} data The message to send
       * @param {Boolean} [mask=false] Specifies whether or not to mask `data`
       * @param {Function} [cb] Callback
       * @public
       */
      ping(data, mask, cb) {
        let byteLength;
        let readOnly;
        if (typeof data === "string") {
          byteLength = Buffer.byteLength(data);
          readOnly = false;
        } else if (isBlob(data)) {
          byteLength = data.size;
          readOnly = false;
        } else {
          data = toBuffer(data);
          byteLength = data.length;
          readOnly = toBuffer.readOnly;
        }
        if (byteLength > 125) {
          throw new RangeError("The data size must not be greater than 125 bytes");
        }
        const options = {
          [kByteLength]: byteLength,
          fin: true,
          generateMask: this._generateMask,
          mask,
          maskBuffer: this._maskBuffer,
          opcode: 9,
          readOnly,
          rsv1: false
        };
        if (isBlob(data)) {
          if (this._state !== DEFAULT) {
            this.enqueue([this.getBlobData, data, false, options, cb]);
          } else {
            this.getBlobData(data, false, options, cb);
          }
        } else if (this._state !== DEFAULT) {
          this.enqueue([this.dispatch, data, false, options, cb]);
        } else {
          this.sendFrame(_Sender.frame(data, options), cb);
        }
      }
      /**
       * Sends a pong message to the other peer.
       *
       * @param {*} data The message to send
       * @param {Boolean} [mask=false] Specifies whether or not to mask `data`
       * @param {Function} [cb] Callback
       * @public
       */
      pong(data, mask, cb) {
        let byteLength;
        let readOnly;
        if (typeof data === "string") {
          byteLength = Buffer.byteLength(data);
          readOnly = false;
        } else if (isBlob(data)) {
          byteLength = data.size;
          readOnly = false;
        } else {
          data = toBuffer(data);
          byteLength = data.length;
          readOnly = toBuffer.readOnly;
        }
        if (byteLength > 125) {
          throw new RangeError("The data size must not be greater than 125 bytes");
        }
        const options = {
          [kByteLength]: byteLength,
          fin: true,
          generateMask: this._generateMask,
          mask,
          maskBuffer: this._maskBuffer,
          opcode: 10,
          readOnly,
          rsv1: false
        };
        if (isBlob(data)) {
          if (this._state !== DEFAULT) {
            this.enqueue([this.getBlobData, data, false, options, cb]);
          } else {
            this.getBlobData(data, false, options, cb);
          }
        } else if (this._state !== DEFAULT) {
          this.enqueue([this.dispatch, data, false, options, cb]);
        } else {
          this.sendFrame(_Sender.frame(data, options), cb);
        }
      }
      /**
       * Sends a data message to the other peer.
       *
       * @param {*} data The message to send
       * @param {Object} options Options object
       * @param {Boolean} [options.binary=false] Specifies whether `data` is binary
       *     or text
       * @param {Boolean} [options.compress=false] Specifies whether or not to
       *     compress `data`
       * @param {Boolean} [options.fin=false] Specifies whether the fragment is the
       *     last one
       * @param {Boolean} [options.mask=false] Specifies whether or not to mask
       *     `data`
       * @param {Function} [cb] Callback
       * @public
       */
      send(data, options, cb) {
        const perMessageDeflate = this._extensions[PerMessageDeflate2.extensionName];
        let opcode = options.binary ? 2 : 1;
        let rsv1 = options.compress;
        let byteLength;
        let readOnly;
        if (typeof data === "string") {
          byteLength = Buffer.byteLength(data);
          readOnly = false;
        } else if (isBlob(data)) {
          byteLength = data.size;
          readOnly = false;
        } else {
          data = toBuffer(data);
          byteLength = data.length;
          readOnly = toBuffer.readOnly;
        }
        if (this._firstFragment) {
          this._firstFragment = false;
          if (rsv1 && perMessageDeflate && perMessageDeflate.params[perMessageDeflate._isServer ? "server_no_context_takeover" : "client_no_context_takeover"]) {
            rsv1 = byteLength >= perMessageDeflate._threshold;
          }
          this._compress = rsv1;
        } else {
          rsv1 = false;
          opcode = 0;
        }
        if (options.fin) this._firstFragment = true;
        const opts = {
          [kByteLength]: byteLength,
          fin: options.fin,
          generateMask: this._generateMask,
          mask: options.mask,
          maskBuffer: this._maskBuffer,
          opcode,
          readOnly,
          rsv1
        };
        if (isBlob(data)) {
          if (this._state !== DEFAULT) {
            this.enqueue([this.getBlobData, data, this._compress, opts, cb]);
          } else {
            this.getBlobData(data, this._compress, opts, cb);
          }
        } else if (this._state !== DEFAULT) {
          this.enqueue([this.dispatch, data, this._compress, opts, cb]);
        } else {
          this.dispatch(data, this._compress, opts, cb);
        }
      }
      /**
       * Gets the contents of a blob as binary data.
       *
       * @param {Blob} blob The blob
       * @param {Boolean} [compress=false] Specifies whether or not to compress
       *     the data
       * @param {Object} options Options object
       * @param {Boolean} [options.fin=false] Specifies whether or not to set the
       *     FIN bit
       * @param {Function} [options.generateMask] The function used to generate the
       *     masking key
       * @param {Boolean} [options.mask=false] Specifies whether or not to mask
       *     `data`
       * @param {Buffer} [options.maskBuffer] The buffer used to store the masking
       *     key
       * @param {Number} options.opcode The opcode
       * @param {Boolean} [options.readOnly=false] Specifies whether `data` can be
       *     modified
       * @param {Boolean} [options.rsv1=false] Specifies whether or not to set the
       *     RSV1 bit
       * @param {Function} [cb] Callback
       * @private
       */
      getBlobData(blob, compress, options, cb) {
        this._bufferedBytes += options[kByteLength];
        this._state = GET_BLOB_DATA;
        blob.arrayBuffer().then((arrayBuffer) => {
          if (this._socket.destroyed) {
            const err = new Error(
              "The socket was closed while the blob was being read"
            );
            process.nextTick(callCallbacks, this, err, cb);
            return;
          }
          this._bufferedBytes -= options[kByteLength];
          const data = toBuffer(arrayBuffer);
          if (!compress) {
            this._state = DEFAULT;
            this.sendFrame(_Sender.frame(data, options), cb);
            this.dequeue();
          } else {
            this.dispatch(data, compress, options, cb);
          }
        }).catch((err) => {
          process.nextTick(onError, this, err, cb);
        });
      }
      /**
       * Dispatches a message.
       *
       * @param {(Buffer|String)} data The message to send
       * @param {Boolean} [compress=false] Specifies whether or not to compress
       *     `data`
       * @param {Object} options Options object
       * @param {Boolean} [options.fin=false] Specifies whether or not to set the
       *     FIN bit
       * @param {Function} [options.generateMask] The function used to generate the
       *     masking key
       * @param {Boolean} [options.mask=false] Specifies whether or not to mask
       *     `data`
       * @param {Buffer} [options.maskBuffer] The buffer used to store the masking
       *     key
       * @param {Number} options.opcode The opcode
       * @param {Boolean} [options.readOnly=false] Specifies whether `data` can be
       *     modified
       * @param {Boolean} [options.rsv1=false] Specifies whether or not to set the
       *     RSV1 bit
       * @param {Function} [cb] Callback
       * @private
       */
      dispatch(data, compress, options, cb) {
        if (!compress) {
          this.sendFrame(_Sender.frame(data, options), cb);
          return;
        }
        const perMessageDeflate = this._extensions[PerMessageDeflate2.extensionName];
        this._bufferedBytes += options[kByteLength];
        this._state = DEFLATING;
        perMessageDeflate.compress(data, options.fin, (_, buf) => {
          if (this._socket.destroyed) {
            const err = new Error(
              "The socket was closed while data was being compressed"
            );
            callCallbacks(this, err, cb);
            return;
          }
          this._bufferedBytes -= options[kByteLength];
          this._state = DEFAULT;
          options.readOnly = false;
          this.sendFrame(_Sender.frame(buf, options), cb);
          this.dequeue();
        });
      }
      /**
       * Executes queued send operations.
       *
       * @private
       */
      dequeue() {
        while (this._state === DEFAULT && this._queue.length) {
          const params = this._queue.shift();
          this._bufferedBytes -= params[3][kByteLength];
          Reflect.apply(params[0], this, params.slice(1));
        }
      }
      /**
       * Enqueues a send operation.
       *
       * @param {Array} params Send operation parameters.
       * @private
       */
      enqueue(params) {
        this._bufferedBytes += params[3][kByteLength];
        this._queue.push(params);
      }
      /**
       * Sends a frame.
       *
       * @param {(Buffer | String)[]} list The frame to send
       * @param {Function} [cb] Callback
       * @private
       */
      sendFrame(list, cb) {
        if (list.length === 2) {
          this._socket.cork();
          this._socket.write(list[0]);
          this._socket.write(list[1], cb);
          this._socket.uncork();
        } else {
          this._socket.write(list[0], cb);
        }
      }
    };
    module.exports = Sender2;
    function callCallbacks(sender, err, cb) {
      if (typeof cb === "function") cb(err);
      for (let i = 0; i < sender._queue.length; i++) {
        const params = sender._queue[i];
        const callback = params[params.length - 1];
        if (typeof callback === "function") callback(err);
      }
    }
    function onError(sender, err, cb) {
      callCallbacks(sender, err, cb);
      sender.onerror(err);
    }
  }
});

// node_modules/ws/lib/event-target.js
var require_event_target = __commonJS({
  "node_modules/ws/lib/event-target.js"(exports, module) {
    "use strict";
    var { kForOnEventAttribute, kListener } = require_constants();
    var kCode = /* @__PURE__ */ Symbol("kCode");
    var kData = /* @__PURE__ */ Symbol("kData");
    var kError = /* @__PURE__ */ Symbol("kError");
    var kMessage = /* @__PURE__ */ Symbol("kMessage");
    var kReason = /* @__PURE__ */ Symbol("kReason");
    var kTarget = /* @__PURE__ */ Symbol("kTarget");
    var kType = /* @__PURE__ */ Symbol("kType");
    var kWasClean = /* @__PURE__ */ Symbol("kWasClean");
    var Event = class {
      /**
       * Create a new `Event`.
       *
       * @param {String} type The name of the event
       * @throws {TypeError} If the `type` argument is not specified
       */
      constructor(type) {
        this[kTarget] = null;
        this[kType] = type;
      }
      /**
       * @type {*}
       */
      get target() {
        return this[kTarget];
      }
      /**
       * @type {String}
       */
      get type() {
        return this[kType];
      }
    };
    Object.defineProperty(Event.prototype, "target", { enumerable: true });
    Object.defineProperty(Event.prototype, "type", { enumerable: true });
    var CloseEvent = class extends Event {
      /**
       * Create a new `CloseEvent`.
       *
       * @param {String} type The name of the event
       * @param {Object} [options] A dictionary object that allows for setting
       *     attributes via object members of the same name
       * @param {Number} [options.code=0] The status code explaining why the
       *     connection was closed
       * @param {String} [options.reason=''] A human-readable string explaining why
       *     the connection was closed
       * @param {Boolean} [options.wasClean=false] Indicates whether or not the
       *     connection was cleanly closed
       */
      constructor(type, options = {}) {
        super(type);
        this[kCode] = options.code === void 0 ? 0 : options.code;
        this[kReason] = options.reason === void 0 ? "" : options.reason;
        this[kWasClean] = options.wasClean === void 0 ? false : options.wasClean;
      }
      /**
       * @type {Number}
       */
      get code() {
        return this[kCode];
      }
      /**
       * @type {String}
       */
      get reason() {
        return this[kReason];
      }
      /**
       * @type {Boolean}
       */
      get wasClean() {
        return this[kWasClean];
      }
    };
    Object.defineProperty(CloseEvent.prototype, "code", { enumerable: true });
    Object.defineProperty(CloseEvent.prototype, "reason", { enumerable: true });
    Object.defineProperty(CloseEvent.prototype, "wasClean", { enumerable: true });
    var ErrorEvent = class extends Event {
      /**
       * Create a new `ErrorEvent`.
       *
       * @param {String} type The name of the event
       * @param {Object} [options] A dictionary object that allows for setting
       *     attributes via object members of the same name
       * @param {*} [options.error=null] The error that generated this event
       * @param {String} [options.message=''] The error message
       */
      constructor(type, options = {}) {
        super(type);
        this[kError] = options.error === void 0 ? null : options.error;
        this[kMessage] = options.message === void 0 ? "" : options.message;
      }
      /**
       * @type {*}
       */
      get error() {
        return this[kError];
      }
      /**
       * @type {String}
       */
      get message() {
        return this[kMessage];
      }
    };
    Object.defineProperty(ErrorEvent.prototype, "error", { enumerable: true });
    Object.defineProperty(ErrorEvent.prototype, "message", { enumerable: true });
    var MessageEvent = class extends Event {
      /**
       * Create a new `MessageEvent`.
       *
       * @param {String} type The name of the event
       * @param {Object} [options] A dictionary object that allows for setting
       *     attributes via object members of the same name
       * @param {*} [options.data=null] The message content
       */
      constructor(type, options = {}) {
        super(type);
        this[kData] = options.data === void 0 ? null : options.data;
      }
      /**
       * @type {*}
       */
      get data() {
        return this[kData];
      }
    };
    Object.defineProperty(MessageEvent.prototype, "data", { enumerable: true });
    var EventTarget = {
      /**
       * Register an event listener.
       *
       * @param {String} type A string representing the event type to listen for
       * @param {(Function|Object)} handler The listener to add
       * @param {Object} [options] An options object specifies characteristics about
       *     the event listener
       * @param {Boolean} [options.once=false] A `Boolean` indicating that the
       *     listener should be invoked at most once after being added. If `true`,
       *     the listener would be automatically removed when invoked.
       * @public
       */
      addEventListener(type, handler, options = {}) {
        for (const listener of this.listeners(type)) {
          if (!options[kForOnEventAttribute] && listener[kListener] === handler && !listener[kForOnEventAttribute]) {
            return;
          }
        }
        let wrapper;
        if (type === "message") {
          wrapper = function onMessage(data, isBinary) {
            const event = new MessageEvent("message", {
              data: isBinary ? data : data.toString()
            });
            event[kTarget] = this;
            callListener(handler, this, event);
          };
        } else if (type === "close") {
          wrapper = function onClose(code, message) {
            const event = new CloseEvent("close", {
              code,
              reason: message.toString(),
              wasClean: this._closeFrameReceived && this._closeFrameSent
            });
            event[kTarget] = this;
            callListener(handler, this, event);
          };
        } else if (type === "error") {
          wrapper = function onError(error) {
            const event = new ErrorEvent("error", {
              error,
              message: error.message
            });
            event[kTarget] = this;
            callListener(handler, this, event);
          };
        } else if (type === "open") {
          wrapper = function onOpen() {
            const event = new Event("open");
            event[kTarget] = this;
            callListener(handler, this, event);
          };
        } else {
          return;
        }
        wrapper[kForOnEventAttribute] = !!options[kForOnEventAttribute];
        wrapper[kListener] = handler;
        if (options.once) {
          this.once(type, wrapper);
        } else {
          this.on(type, wrapper);
        }
      },
      /**
       * Remove an event listener.
       *
       * @param {String} type A string representing the event type to remove
       * @param {(Function|Object)} handler The listener to remove
       * @public
       */
      removeEventListener(type, handler) {
        for (const listener of this.listeners(type)) {
          if (listener[kListener] === handler && !listener[kForOnEventAttribute]) {
            this.removeListener(type, listener);
            break;
          }
        }
      }
    };
    module.exports = {
      CloseEvent,
      ErrorEvent,
      Event,
      EventTarget,
      MessageEvent
    };
    function callListener(listener, thisArg, event) {
      if (typeof listener === "object" && listener.handleEvent) {
        listener.handleEvent.call(listener, event);
      } else {
        listener.call(thisArg, event);
      }
    }
  }
});

// node_modules/ws/lib/extension.js
var require_extension = __commonJS({
  "node_modules/ws/lib/extension.js"(exports, module) {
    "use strict";
    var { tokenChars } = require_validation();
    function push(dest, name, elem) {
      if (dest[name] === void 0) dest[name] = [elem];
      else dest[name].push(elem);
    }
    function parse(header) {
      const offers = /* @__PURE__ */ Object.create(null);
      let params = /* @__PURE__ */ Object.create(null);
      let mustUnescape = false;
      let isEscaping = false;
      let inQuotes = false;
      let extensionName;
      let paramName;
      let start = -1;
      let code = -1;
      let end = -1;
      let i = 0;
      for (; i < header.length; i++) {
        code = header.charCodeAt(i);
        if (extensionName === void 0) {
          if (end === -1 && tokenChars[code] === 1) {
            if (start === -1) start = i;
          } else if (i !== 0 && (code === 32 || code === 9)) {
            if (end === -1 && start !== -1) end = i;
          } else if (code === 59 || code === 44) {
            if (start === -1) {
              throw new SyntaxError(`Unexpected character at index ${i}`);
            }
            if (end === -1) end = i;
            const name = header.slice(start, end);
            if (code === 44) {
              push(offers, name, params);
              params = /* @__PURE__ */ Object.create(null);
            } else {
              extensionName = name;
            }
            start = end = -1;
          } else {
            throw new SyntaxError(`Unexpected character at index ${i}`);
          }
        } else if (paramName === void 0) {
          if (end === -1 && tokenChars[code] === 1) {
            if (start === -1) start = i;
          } else if (code === 32 || code === 9) {
            if (end === -1 && start !== -1) end = i;
          } else if (code === 59 || code === 44) {
            if (start === -1) {
              throw new SyntaxError(`Unexpected character at index ${i}`);
            }
            if (end === -1) end = i;
            push(params, header.slice(start, end), true);
            if (code === 44) {
              push(offers, extensionName, params);
              params = /* @__PURE__ */ Object.create(null);
              extensionName = void 0;
            }
            start = end = -1;
          } else if (code === 61 && start !== -1 && end === -1) {
            paramName = header.slice(start, i);
            start = end = -1;
          } else {
            throw new SyntaxError(`Unexpected character at index ${i}`);
          }
        } else {
          if (isEscaping) {
            if (tokenChars[code] !== 1) {
              throw new SyntaxError(`Unexpected character at index ${i}`);
            }
            if (start === -1) start = i;
            else if (!mustUnescape) mustUnescape = true;
            isEscaping = false;
          } else if (inQuotes) {
            if (tokenChars[code] === 1) {
              if (start === -1) start = i;
            } else if (code === 34 && start !== -1) {
              inQuotes = false;
              end = i;
            } else if (code === 92) {
              isEscaping = true;
            } else {
              throw new SyntaxError(`Unexpected character at index ${i}`);
            }
          } else if (code === 34 && header.charCodeAt(i - 1) === 61) {
            inQuotes = true;
          } else if (end === -1 && tokenChars[code] === 1) {
            if (start === -1) start = i;
          } else if (start !== -1 && (code === 32 || code === 9)) {
            if (end === -1) end = i;
          } else if (code === 59 || code === 44) {
            if (start === -1) {
              throw new SyntaxError(`Unexpected character at index ${i}`);
            }
            if (end === -1) end = i;
            let value = header.slice(start, end);
            if (mustUnescape) {
              value = value.replace(/\\/g, "");
              mustUnescape = false;
            }
            push(params, paramName, value);
            if (code === 44) {
              push(offers, extensionName, params);
              params = /* @__PURE__ */ Object.create(null);
              extensionName = void 0;
            }
            paramName = void 0;
            start = end = -1;
          } else {
            throw new SyntaxError(`Unexpected character at index ${i}`);
          }
        }
      }
      if (start === -1 || inQuotes || code === 32 || code === 9) {
        throw new SyntaxError("Unexpected end of input");
      }
      if (end === -1) end = i;
      const token = header.slice(start, end);
      if (extensionName === void 0) {
        push(offers, token, params);
      } else {
        if (paramName === void 0) {
          push(params, token, true);
        } else if (mustUnescape) {
          push(params, paramName, token.replace(/\\/g, ""));
        } else {
          push(params, paramName, token);
        }
        push(offers, extensionName, params);
      }
      return offers;
    }
    function format(extensions) {
      return Object.keys(extensions).map((extension2) => {
        let configurations = extensions[extension2];
        if (!Array.isArray(configurations)) configurations = [configurations];
        return configurations.map((params) => {
          return [extension2].concat(
            Object.keys(params).map((k) => {
              let values = params[k];
              if (!Array.isArray(values)) values = [values];
              return values.map((v) => v === true ? k : `${k}=${v}`).join("; ");
            })
          ).join("; ");
        }).join(", ");
      }).join(", ");
    }
    module.exports = { format, parse };
  }
});

// node_modules/ws/lib/websocket.js
var require_websocket = __commonJS({
  "node_modules/ws/lib/websocket.js"(exports, module) {
    "use strict";
    var EventEmitter = __require("events");
    var https = __require("https");
    var http = __require("http");
    var net = __require("net");
    var tls = __require("tls");
    var { randomBytes, createHash } = __require("crypto");
    var { Duplex, Readable } = __require("stream");
    var { URL: URL2 } = __require("url");
    var PerMessageDeflate2 = require_permessage_deflate();
    var Receiver2 = require_receiver();
    var Sender2 = require_sender();
    var { isBlob } = require_validation();
    var {
      BINARY_TYPES,
      CLOSE_TIMEOUT,
      EMPTY_BUFFER,
      GUID,
      kForOnEventAttribute,
      kListener,
      kStatusCode,
      kWebSocket,
      NOOP
    } = require_constants();
    var {
      EventTarget: { addEventListener, removeEventListener }
    } = require_event_target();
    var { format, parse } = require_extension();
    var { toBuffer } = require_buffer_util();
    var kAborted = /* @__PURE__ */ Symbol("kAborted");
    var protocolVersions = [8, 13];
    var readyStates = ["CONNECTING", "OPEN", "CLOSING", "CLOSED"];
    var subprotocolRegex = /^[!#$%&'*+\-.0-9A-Z^_`|a-z~]+$/;
    var WebSocket2 = class _WebSocket extends EventEmitter {
      /**
       * Create a new `WebSocket`.
       *
       * @param {(String|URL)} address The URL to which to connect
       * @param {(String|String[])} [protocols] The subprotocols
       * @param {Object} [options] Connection options
       */
      constructor(address, protocols, options) {
        super();
        this._binaryType = BINARY_TYPES[0];
        this._closeCode = 1006;
        this._closeFrameReceived = false;
        this._closeFrameSent = false;
        this._closeMessage = EMPTY_BUFFER;
        this._closeTimer = null;
        this._errorEmitted = false;
        this._extensions = {};
        this._paused = false;
        this._protocol = "";
        this._readyState = _WebSocket.CONNECTING;
        this._receiver = null;
        this._sender = null;
        this._socket = null;
        if (address !== null) {
          this._bufferedAmount = 0;
          this._isServer = false;
          this._redirects = 0;
          if (protocols === void 0) {
            protocols = [];
          } else if (!Array.isArray(protocols)) {
            if (typeof protocols === "object" && protocols !== null) {
              options = protocols;
              protocols = [];
            } else {
              protocols = [protocols];
            }
          }
          initAsClient(this, address, protocols, options);
        } else {
          this._autoPong = options.autoPong;
          this._closeTimeout = options.closeTimeout;
          this._isServer = true;
        }
      }
      /**
       * For historical reasons, the custom "nodebuffer" type is used by the default
       * instead of "blob".
       *
       * @type {String}
       */
      get binaryType() {
        return this._binaryType;
      }
      set binaryType(type) {
        if (!BINARY_TYPES.includes(type)) return;
        this._binaryType = type;
        if (this._receiver) this._receiver._binaryType = type;
      }
      /**
       * @type {Number}
       */
      get bufferedAmount() {
        if (!this._socket) return this._bufferedAmount;
        return this._socket._writableState.length + this._sender._bufferedBytes;
      }
      /**
       * @type {String}
       */
      get extensions() {
        return Object.keys(this._extensions).join();
      }
      /**
       * @type {Boolean}
       */
      get isPaused() {
        return this._paused;
      }
      /**
       * @type {Function}
       */
      /* istanbul ignore next */
      get onclose() {
        return null;
      }
      /**
       * @type {Function}
       */
      /* istanbul ignore next */
      get onerror() {
        return null;
      }
      /**
       * @type {Function}
       */
      /* istanbul ignore next */
      get onopen() {
        return null;
      }
      /**
       * @type {Function}
       */
      /* istanbul ignore next */
      get onmessage() {
        return null;
      }
      /**
       * @type {String}
       */
      get protocol() {
        return this._protocol;
      }
      /**
       * @type {Number}
       */
      get readyState() {
        return this._readyState;
      }
      /**
       * @type {String}
       */
      get url() {
        return this._url;
      }
      /**
       * Set up the socket and the internal resources.
       *
       * @param {Duplex} socket The network socket between the server and client
       * @param {Buffer} head The first packet of the upgraded stream
       * @param {Object} options Options object
       * @param {Boolean} [options.allowSynchronousEvents=false] Specifies whether
       *     any of the `'message'`, `'ping'`, and `'pong'` events can be emitted
       *     multiple times in the same tick
       * @param {Function} [options.generateMask] The function used to generate the
       *     masking key
       * @param {Number} [options.maxBufferedChunks=0] The maximum number of
       *     buffered data chunks
       * @param {Number} [options.maxFragments=0] The maximum number of message
       *     fragments
       * @param {Number} [options.maxPayload=0] The maximum allowed message size
       * @param {Boolean} [options.skipUTF8Validation=false] Specifies whether or
       *     not to skip UTF-8 validation for text and close messages
       * @private
       */
      setSocket(socket, head, options) {
        const receiver = new Receiver2({
          allowSynchronousEvents: options.allowSynchronousEvents,
          binaryType: this.binaryType,
          extensions: this._extensions,
          isServer: this._isServer,
          maxBufferedChunks: options.maxBufferedChunks,
          maxFragments: options.maxFragments,
          maxPayload: options.maxPayload,
          skipUTF8Validation: options.skipUTF8Validation
        });
        const sender = new Sender2(socket, this._extensions, options.generateMask);
        this._receiver = receiver;
        this._sender = sender;
        this._socket = socket;
        receiver[kWebSocket] = this;
        sender[kWebSocket] = this;
        socket[kWebSocket] = this;
        receiver.on("conclude", receiverOnConclude);
        receiver.on("drain", receiverOnDrain);
        receiver.on("error", receiverOnError);
        receiver.on("message", receiverOnMessage);
        receiver.on("ping", receiverOnPing);
        receiver.on("pong", receiverOnPong);
        sender.onerror = senderOnError;
        if (socket.setTimeout) socket.setTimeout(0);
        if (socket.setNoDelay) socket.setNoDelay();
        if (head.length > 0) socket.unshift(head);
        socket.on("close", socketOnClose);
        socket.on("data", socketOnData);
        socket.on("end", socketOnEnd);
        socket.on("error", socketOnError);
        this._readyState = _WebSocket.OPEN;
        this.emit("open");
      }
      /**
       * Emit the `'close'` event.
       *
       * @private
       */
      emitClose() {
        if (!this._socket) {
          this._readyState = _WebSocket.CLOSED;
          this.emit("close", this._closeCode, this._closeMessage);
          return;
        }
        if (this._extensions[PerMessageDeflate2.extensionName]) {
          this._extensions[PerMessageDeflate2.extensionName].cleanup();
        }
        this._receiver.removeAllListeners();
        this._readyState = _WebSocket.CLOSED;
        this.emit("close", this._closeCode, this._closeMessage);
      }
      /**
       * Start a closing handshake.
       *
       *          +----------+   +-----------+   +----------+
       *     - - -|ws.close()|-->|close frame|-->|ws.close()|- - -
       *    |     +----------+   +-----------+   +----------+     |
       *          +----------+   +-----------+         |
       * CLOSING  |ws.close()|<--|close frame|<--+-----+       CLOSING
       *          +----------+   +-----------+   |
       *    |           |                        |   +---+        |
       *                +------------------------+-->|fin| - - - -
       *    |         +---+                      |   +---+
       *     - - - - -|fin|<---------------------+
       *              +---+
       *
       * @param {Number} [code] Status code explaining why the connection is closing
       * @param {(String|Buffer)} [data] The reason why the connection is
       *     closing
       * @public
       */
      close(code, data) {
        if (this.readyState === _WebSocket.CLOSED) return;
        if (this.readyState === _WebSocket.CONNECTING) {
          const msg = "WebSocket was closed before the connection was established";
          abortHandshake(this, this._req, msg);
          return;
        }
        if (this.readyState === _WebSocket.CLOSING) {
          if (this._closeFrameSent && (this._closeFrameReceived || this._receiver._writableState.errorEmitted)) {
            this._socket.end();
          }
          return;
        }
        this._readyState = _WebSocket.CLOSING;
        this._sender.close(code, data, !this._isServer, (err) => {
          if (err) return;
          this._closeFrameSent = true;
          if (this._closeFrameReceived || this._receiver._writableState.errorEmitted) {
            this._socket.end();
          }
        });
        setCloseTimer(this);
      }
      /**
       * Pause the socket.
       *
       * @public
       */
      pause() {
        if (this.readyState === _WebSocket.CONNECTING || this.readyState === _WebSocket.CLOSED) {
          return;
        }
        this._paused = true;
        this._socket.pause();
      }
      /**
       * Send a ping.
       *
       * @param {*} [data] The data to send
       * @param {Boolean} [mask] Indicates whether or not to mask `data`
       * @param {Function} [cb] Callback which is executed when the ping is sent
       * @public
       */
      ping(data, mask, cb) {
        if (this.readyState === _WebSocket.CONNECTING) {
          throw new Error("WebSocket is not open: readyState 0 (CONNECTING)");
        }
        if (typeof data === "function") {
          cb = data;
          data = mask = void 0;
        } else if (typeof mask === "function") {
          cb = mask;
          mask = void 0;
        }
        if (typeof data === "number") data = data.toString();
        if (this.readyState !== _WebSocket.OPEN) {
          sendAfterClose(this, data, cb);
          return;
        }
        if (mask === void 0) mask = !this._isServer;
        this._sender.ping(data || EMPTY_BUFFER, mask, cb);
      }
      /**
       * Send a pong.
       *
       * @param {*} [data] The data to send
       * @param {Boolean} [mask] Indicates whether or not to mask `data`
       * @param {Function} [cb] Callback which is executed when the pong is sent
       * @public
       */
      pong(data, mask, cb) {
        if (this.readyState === _WebSocket.CONNECTING) {
          throw new Error("WebSocket is not open: readyState 0 (CONNECTING)");
        }
        if (typeof data === "function") {
          cb = data;
          data = mask = void 0;
        } else if (typeof mask === "function") {
          cb = mask;
          mask = void 0;
        }
        if (typeof data === "number") data = data.toString();
        if (this.readyState !== _WebSocket.OPEN) {
          sendAfterClose(this, data, cb);
          return;
        }
        if (mask === void 0) mask = !this._isServer;
        this._sender.pong(data || EMPTY_BUFFER, mask, cb);
      }
      /**
       * Resume the socket.
       *
       * @public
       */
      resume() {
        if (this.readyState === _WebSocket.CONNECTING || this.readyState === _WebSocket.CLOSED) {
          return;
        }
        this._paused = false;
        if (!this._receiver._writableState.needDrain) this._socket.resume();
      }
      /**
       * Send a data message.
       *
       * @param {*} data The message to send
       * @param {Object} [options] Options object
       * @param {Boolean} [options.binary] Specifies whether `data` is binary or
       *     text
       * @param {Boolean} [options.compress] Specifies whether or not to compress
       *     `data`
       * @param {Boolean} [options.fin=true] Specifies whether the fragment is the
       *     last one
       * @param {Boolean} [options.mask] Specifies whether or not to mask `data`
       * @param {Function} [cb] Callback which is executed when data is written out
       * @public
       */
      send(data, options, cb) {
        if (this.readyState === _WebSocket.CONNECTING) {
          throw new Error("WebSocket is not open: readyState 0 (CONNECTING)");
        }
        if (typeof options === "function") {
          cb = options;
          options = {};
        }
        if (typeof data === "number") data = data.toString();
        if (this.readyState !== _WebSocket.OPEN) {
          sendAfterClose(this, data, cb);
          return;
        }
        const opts = {
          binary: typeof data !== "string",
          mask: !this._isServer,
          compress: true,
          fin: true,
          ...options
        };
        if (!this._extensions[PerMessageDeflate2.extensionName]) {
          opts.compress = false;
        }
        this._sender.send(data || EMPTY_BUFFER, opts, cb);
      }
      /**
       * Forcibly close the connection.
       *
       * @public
       */
      terminate() {
        if (this.readyState === _WebSocket.CLOSED) return;
        if (this.readyState === _WebSocket.CONNECTING) {
          const msg = "WebSocket was closed before the connection was established";
          abortHandshake(this, this._req, msg);
          return;
        }
        if (this._socket) {
          this._readyState = _WebSocket.CLOSING;
          this._socket.destroy();
        }
      }
    };
    Object.defineProperty(WebSocket2, "CONNECTING", {
      enumerable: true,
      value: readyStates.indexOf("CONNECTING")
    });
    Object.defineProperty(WebSocket2.prototype, "CONNECTING", {
      enumerable: true,
      value: readyStates.indexOf("CONNECTING")
    });
    Object.defineProperty(WebSocket2, "OPEN", {
      enumerable: true,
      value: readyStates.indexOf("OPEN")
    });
    Object.defineProperty(WebSocket2.prototype, "OPEN", {
      enumerable: true,
      value: readyStates.indexOf("OPEN")
    });
    Object.defineProperty(WebSocket2, "CLOSING", {
      enumerable: true,
      value: readyStates.indexOf("CLOSING")
    });
    Object.defineProperty(WebSocket2.prototype, "CLOSING", {
      enumerable: true,
      value: readyStates.indexOf("CLOSING")
    });
    Object.defineProperty(WebSocket2, "CLOSED", {
      enumerable: true,
      value: readyStates.indexOf("CLOSED")
    });
    Object.defineProperty(WebSocket2.prototype, "CLOSED", {
      enumerable: true,
      value: readyStates.indexOf("CLOSED")
    });
    [
      "binaryType",
      "bufferedAmount",
      "extensions",
      "isPaused",
      "protocol",
      "readyState",
      "url"
    ].forEach((property) => {
      Object.defineProperty(WebSocket2.prototype, property, { enumerable: true });
    });
    ["open", "error", "close", "message"].forEach((method) => {
      Object.defineProperty(WebSocket2.prototype, `on${method}`, {
        enumerable: true,
        get() {
          for (const listener of this.listeners(method)) {
            if (listener[kForOnEventAttribute]) return listener[kListener];
          }
          return null;
        },
        set(handler) {
          for (const listener of this.listeners(method)) {
            if (listener[kForOnEventAttribute]) {
              this.removeListener(method, listener);
              break;
            }
          }
          if (typeof handler !== "function") return;
          this.addEventListener(method, handler, {
            [kForOnEventAttribute]: true
          });
        }
      });
    });
    WebSocket2.prototype.addEventListener = addEventListener;
    WebSocket2.prototype.removeEventListener = removeEventListener;
    module.exports = WebSocket2;
    function initAsClient(websocket, address, protocols, options) {
      const opts = {
        allowSynchronousEvents: true,
        autoPong: true,
        closeTimeout: CLOSE_TIMEOUT,
        protocolVersion: protocolVersions[1],
        maxBufferedChunks: 1024 * 1024,
        maxFragments: 128 * 1024,
        maxPayload: 100 * 1024 * 1024,
        skipUTF8Validation: false,
        perMessageDeflate: true,
        followRedirects: false,
        maxRedirects: 10,
        ...options,
        socketPath: void 0,
        hostname: void 0,
        protocol: void 0,
        timeout: void 0,
        method: "GET",
        host: void 0,
        path: void 0,
        port: void 0
      };
      websocket._autoPong = opts.autoPong;
      websocket._closeTimeout = opts.closeTimeout;
      if (!protocolVersions.includes(opts.protocolVersion)) {
        throw new RangeError(
          `Unsupported protocol version: ${opts.protocolVersion} (supported versions: ${protocolVersions.join(", ")})`
        );
      }
      let parsedUrl;
      if (address instanceof URL2) {
        parsedUrl = address;
      } else {
        try {
          parsedUrl = new URL2(address);
        } catch {
          throw new SyntaxError(`Invalid URL: ${address}`);
        }
      }
      if (parsedUrl.protocol === "http:") {
        parsedUrl.protocol = "ws:";
      } else if (parsedUrl.protocol === "https:") {
        parsedUrl.protocol = "wss:";
      }
      websocket._url = parsedUrl.href;
      const isSecure = parsedUrl.protocol === "wss:";
      const isIpcUrl = parsedUrl.protocol === "ws+unix:";
      let invalidUrlMessage;
      if (parsedUrl.protocol !== "ws:" && !isSecure && !isIpcUrl) {
        invalidUrlMessage = `The URL's protocol must be one of "ws:", "wss:", "http:", "https:", or "ws+unix:"`;
      } else if (isIpcUrl && !parsedUrl.pathname) {
        invalidUrlMessage = "The URL's pathname is empty";
      } else if (parsedUrl.hash) {
        invalidUrlMessage = "The URL contains a fragment identifier";
      }
      if (invalidUrlMessage) {
        const err = new SyntaxError(invalidUrlMessage);
        if (websocket._redirects === 0) {
          throw err;
        } else {
          emitErrorAndClose(websocket, err);
          return;
        }
      }
      const defaultPort = isSecure ? 443 : 80;
      const key = randomBytes(16).toString("base64");
      const request = isSecure ? https.request : http.request;
      const protocolSet = /* @__PURE__ */ new Set();
      let perMessageDeflate;
      opts.createConnection = opts.createConnection || (isSecure ? tlsConnect : netConnect);
      opts.defaultPort = opts.defaultPort || defaultPort;
      opts.port = parsedUrl.port || defaultPort;
      opts.host = parsedUrl.hostname.startsWith("[") ? parsedUrl.hostname.slice(1, -1) : parsedUrl.hostname;
      opts.headers = {
        ...opts.headers,
        "Sec-WebSocket-Version": opts.protocolVersion,
        "Sec-WebSocket-Key": key,
        Connection: "Upgrade",
        Upgrade: "websocket"
      };
      opts.path = parsedUrl.pathname + parsedUrl.search;
      opts.timeout = opts.handshakeTimeout;
      if (opts.perMessageDeflate) {
        perMessageDeflate = new PerMessageDeflate2({
          ...opts.perMessageDeflate,
          isServer: false,
          maxPayload: opts.maxPayload
        });
        opts.headers["Sec-WebSocket-Extensions"] = format({
          [PerMessageDeflate2.extensionName]: perMessageDeflate.offer()
        });
      }
      if (protocols.length) {
        for (const protocol of protocols) {
          if (typeof protocol !== "string" || !subprotocolRegex.test(protocol) || protocolSet.has(protocol)) {
            throw new SyntaxError(
              "An invalid or duplicated subprotocol was specified"
            );
          }
          protocolSet.add(protocol);
        }
        opts.headers["Sec-WebSocket-Protocol"] = protocols.join(",");
      }
      if (opts.origin) {
        if (opts.protocolVersion < 13) {
          opts.headers["Sec-WebSocket-Origin"] = opts.origin;
        } else {
          opts.headers.Origin = opts.origin;
        }
      }
      if (parsedUrl.username || parsedUrl.password) {
        opts.auth = `${parsedUrl.username}:${parsedUrl.password}`;
      }
      if (isIpcUrl) {
        const parts = opts.path.split(":");
        opts.socketPath = parts[0];
        opts.path = parts[1];
      }
      let req;
      if (opts.followRedirects) {
        if (websocket._redirects === 0) {
          websocket._originalIpc = isIpcUrl;
          websocket._originalSecure = isSecure;
          websocket._originalHostOrSocketPath = isIpcUrl ? opts.socketPath : parsedUrl.host;
          const headers = options && options.headers;
          options = { ...options, headers: {} };
          if (headers) {
            for (const [key2, value] of Object.entries(headers)) {
              options.headers[key2.toLowerCase()] = value;
            }
          }
        } else if (websocket.listenerCount("redirect") === 0) {
          const isSameHost = isIpcUrl ? websocket._originalIpc ? opts.socketPath === websocket._originalHostOrSocketPath : false : websocket._originalIpc ? false : parsedUrl.host === websocket._originalHostOrSocketPath;
          if (!isSameHost || websocket._originalSecure && !isSecure) {
            delete opts.headers.authorization;
            delete opts.headers.cookie;
            if (!isSameHost) delete opts.headers.host;
            opts.auth = void 0;
          }
        }
        if (opts.auth && !options.headers.authorization) {
          options.headers.authorization = "Basic " + Buffer.from(opts.auth).toString("base64");
        }
        req = websocket._req = request(opts);
        if (websocket._redirects) {
          websocket.emit("redirect", websocket.url, req);
        }
      } else {
        req = websocket._req = request(opts);
      }
      if (opts.timeout) {
        req.on("timeout", () => {
          abortHandshake(websocket, req, "Opening handshake has timed out");
        });
      }
      req.on("error", (err) => {
        if (req === null || req[kAborted]) return;
        req = websocket._req = null;
        emitErrorAndClose(websocket, err);
      });
      req.on("response", (res) => {
        const location = res.headers.location;
        const statusCode = res.statusCode;
        if (location && opts.followRedirects && statusCode >= 300 && statusCode < 400) {
          if (++websocket._redirects > opts.maxRedirects) {
            abortHandshake(websocket, req, "Maximum redirects exceeded");
            return;
          }
          req.abort();
          let addr;
          try {
            addr = new URL2(location, address);
          } catch (e) {
            const err = new SyntaxError(`Invalid URL: ${location}`);
            emitErrorAndClose(websocket, err);
            return;
          }
          initAsClient(websocket, addr, protocols, options);
        } else if (!websocket.emit("unexpected-response", req, res)) {
          abortHandshake(
            websocket,
            req,
            `Unexpected server response: ${res.statusCode}`
          );
        }
      });
      req.on("upgrade", (res, socket, head) => {
        websocket.emit("upgrade", res);
        if (websocket.readyState !== WebSocket2.CONNECTING) return;
        req = websocket._req = null;
        const upgrade = res.headers.upgrade;
        if (upgrade === void 0 || upgrade.toLowerCase() !== "websocket") {
          abortHandshake(websocket, socket, "Invalid Upgrade header");
          return;
        }
        const digest = createHash("sha1").update(key + GUID).digest("base64");
        if (res.headers["sec-websocket-accept"] !== digest) {
          abortHandshake(websocket, socket, "Invalid Sec-WebSocket-Accept header");
          return;
        }
        const serverProt = res.headers["sec-websocket-protocol"];
        let protError;
        if (serverProt !== void 0) {
          if (!protocolSet.size) {
            protError = "Server sent a subprotocol but none was requested";
          } else if (!protocolSet.has(serverProt)) {
            protError = "Server sent an invalid subprotocol";
          }
        } else if (protocolSet.size) {
          protError = "Server sent no subprotocol";
        }
        if (protError) {
          abortHandshake(websocket, socket, protError);
          return;
        }
        if (serverProt) websocket._protocol = serverProt;
        const secWebSocketExtensions = res.headers["sec-websocket-extensions"];
        if (secWebSocketExtensions !== void 0) {
          if (!perMessageDeflate) {
            const message = "Server sent a Sec-WebSocket-Extensions header but no extension was requested";
            abortHandshake(websocket, socket, message);
            return;
          }
          let extensions;
          try {
            extensions = parse(secWebSocketExtensions);
          } catch (err) {
            const message = "Invalid Sec-WebSocket-Extensions header";
            abortHandshake(websocket, socket, message);
            return;
          }
          const extensionNames = Object.keys(extensions);
          if (extensionNames.length !== 1 || extensionNames[0] !== PerMessageDeflate2.extensionName) {
            const message = "Server indicated an extension that was not requested";
            abortHandshake(websocket, socket, message);
            return;
          }
          try {
            perMessageDeflate.accept(extensions[PerMessageDeflate2.extensionName]);
          } catch (err) {
            const message = "Invalid Sec-WebSocket-Extensions header";
            abortHandshake(websocket, socket, message);
            return;
          }
          websocket._extensions[PerMessageDeflate2.extensionName] = perMessageDeflate;
        }
        websocket.setSocket(socket, head, {
          allowSynchronousEvents: opts.allowSynchronousEvents,
          generateMask: opts.generateMask,
          maxBufferedChunks: opts.maxBufferedChunks,
          maxFragments: opts.maxFragments,
          maxPayload: opts.maxPayload,
          skipUTF8Validation: opts.skipUTF8Validation
        });
      });
      if (opts.finishRequest) {
        opts.finishRequest(req, websocket);
      } else {
        req.end();
      }
    }
    function emitErrorAndClose(websocket, err) {
      websocket._readyState = WebSocket2.CLOSING;
      websocket._errorEmitted = true;
      websocket.emit("error", err);
      websocket.emitClose();
    }
    function netConnect(options) {
      options.path = options.socketPath;
      return net.connect(options);
    }
    function tlsConnect(options) {
      options.path = void 0;
      if (!options.servername && options.servername !== "") {
        options.servername = net.isIP(options.host) ? "" : options.host;
      }
      return tls.connect(options);
    }
    function abortHandshake(websocket, stream, message) {
      websocket._readyState = WebSocket2.CLOSING;
      const err = new Error(message);
      Error.captureStackTrace(err, abortHandshake);
      if (stream.setHeader) {
        stream[kAborted] = true;
        stream.abort();
        if (stream.socket && !stream.socket.destroyed) {
          stream.socket.destroy();
        }
        process.nextTick(emitErrorAndClose, websocket, err);
      } else {
        stream.destroy(err);
        stream.once("error", websocket.emit.bind(websocket, "error"));
        stream.once("close", websocket.emitClose.bind(websocket));
      }
    }
    function sendAfterClose(websocket, data, cb) {
      if (data) {
        const length = isBlob(data) ? data.size : toBuffer(data).length;
        if (websocket._socket) websocket._sender._bufferedBytes += length;
        else websocket._bufferedAmount += length;
      }
      if (cb) {
        const err = new Error(
          `WebSocket is not open: readyState ${websocket.readyState} (${readyStates[websocket.readyState]})`
        );
        process.nextTick(cb, err);
      }
    }
    function receiverOnConclude(code, reason) {
      const websocket = this[kWebSocket];
      websocket._closeFrameReceived = true;
      websocket._closeMessage = reason;
      websocket._closeCode = code;
      if (websocket._socket[kWebSocket] === void 0) return;
      websocket._socket.removeListener("data", socketOnData);
      process.nextTick(resume, websocket._socket);
      if (code === 1005) websocket.close();
      else websocket.close(code, reason);
    }
    function receiverOnDrain() {
      const websocket = this[kWebSocket];
      if (!websocket.isPaused) websocket._socket.resume();
    }
    function receiverOnError(err) {
      const websocket = this[kWebSocket];
      if (websocket._socket[kWebSocket] !== void 0) {
        websocket._socket.removeListener("data", socketOnData);
        process.nextTick(resume, websocket._socket);
        websocket.close(err[kStatusCode]);
      }
      if (!websocket._errorEmitted) {
        websocket._errorEmitted = true;
        websocket.emit("error", err);
      }
    }
    function receiverOnFinish() {
      this[kWebSocket].emitClose();
    }
    function receiverOnMessage(data, isBinary) {
      this[kWebSocket].emit("message", data, isBinary);
    }
    function receiverOnPing(data) {
      const websocket = this[kWebSocket];
      if (websocket._autoPong) websocket.pong(data, !this._isServer, NOOP);
      websocket.emit("ping", data);
    }
    function receiverOnPong(data) {
      this[kWebSocket].emit("pong", data);
    }
    function resume(stream) {
      stream.resume();
    }
    function senderOnError(err) {
      const websocket = this[kWebSocket];
      if (websocket.readyState === WebSocket2.CLOSED) return;
      if (websocket.readyState === WebSocket2.OPEN) {
        websocket._readyState = WebSocket2.CLOSING;
        setCloseTimer(websocket);
      }
      this._socket.end();
      if (!websocket._errorEmitted) {
        websocket._errorEmitted = true;
        websocket.emit("error", err);
      }
    }
    function setCloseTimer(websocket) {
      websocket._closeTimer = setTimeout(
        websocket._socket.destroy.bind(websocket._socket),
        websocket._closeTimeout
      );
    }
    function socketOnClose() {
      const websocket = this[kWebSocket];
      this.removeListener("close", socketOnClose);
      this.removeListener("data", socketOnData);
      this.removeListener("end", socketOnEnd);
      websocket._readyState = WebSocket2.CLOSING;
      if (!this._readableState.endEmitted && !websocket._closeFrameReceived && !websocket._receiver._writableState.errorEmitted && this._readableState.length !== 0) {
        const chunk = this.read(this._readableState.length);
        websocket._receiver.write(chunk);
      }
      websocket._receiver.end();
      this[kWebSocket] = void 0;
      clearTimeout(websocket._closeTimer);
      if (websocket._receiver._writableState.finished || websocket._receiver._writableState.errorEmitted) {
        websocket.emitClose();
      } else {
        websocket._receiver.on("error", receiverOnFinish);
        websocket._receiver.on("finish", receiverOnFinish);
      }
    }
    function socketOnData(chunk) {
      if (!this[kWebSocket]._receiver.write(chunk)) {
        this.pause();
      }
    }
    function socketOnEnd() {
      const websocket = this[kWebSocket];
      websocket._readyState = WebSocket2.CLOSING;
      websocket._receiver.end();
      this.end();
    }
    function socketOnError() {
      const websocket = this[kWebSocket];
      this.removeListener("error", socketOnError);
      this.on("error", NOOP);
      if (websocket) {
        websocket._readyState = WebSocket2.CLOSING;
        this.destroy();
      }
    }
  }
});

// node_modules/ws/lib/stream.js
var require_stream = __commonJS({
  "node_modules/ws/lib/stream.js"(exports, module) {
    "use strict";
    var WebSocket2 = require_websocket();
    var { Duplex } = __require("stream");
    function emitClose(stream) {
      stream.emit("close");
    }
    function duplexOnEnd() {
      if (!this.destroyed && this._writableState.finished) {
        this.destroy();
      }
    }
    function duplexOnError(err) {
      this.removeListener("error", duplexOnError);
      this.destroy();
      if (this.listenerCount("error") === 0) {
        this.emit("error", err);
      }
    }
    function createWebSocketStream2(ws, options) {
      let terminateOnDestroy = true;
      const duplex = new Duplex({
        ...options,
        autoDestroy: false,
        emitClose: false,
        objectMode: false,
        writableObjectMode: false
      });
      ws.on("message", function message(msg, isBinary) {
        const data = !isBinary && duplex._readableState.objectMode ? msg.toString() : msg;
        if (!duplex.push(data)) ws.pause();
      });
      ws.once("error", function error(err) {
        if (duplex.destroyed) return;
        terminateOnDestroy = false;
        duplex.destroy(err);
      });
      ws.once("close", function close() {
        if (duplex.destroyed) return;
        duplex.push(null);
      });
      duplex._destroy = function(err, callback) {
        if (ws.readyState === ws.CLOSED) {
          callback(err);
          process.nextTick(emitClose, duplex);
          return;
        }
        let called = false;
        ws.once("error", function error(err2) {
          called = true;
          callback(err2);
        });
        ws.once("close", function close() {
          if (!called) callback(err);
          process.nextTick(emitClose, duplex);
        });
        if (terminateOnDestroy) ws.terminate();
      };
      duplex._final = function(callback) {
        if (ws.readyState === ws.CONNECTING) {
          ws.once("open", function open() {
            duplex._final(callback);
          });
          return;
        }
        if (ws._socket === null) return;
        if (ws._socket._writableState.finished) {
          callback();
          if (duplex._readableState.endEmitted) duplex.destroy();
        } else {
          ws._socket.once("finish", function finish() {
            callback();
          });
          ws.close();
        }
      };
      duplex._read = function() {
        if (ws.isPaused) ws.resume();
      };
      duplex._write = function(chunk, encoding, callback) {
        if (ws.readyState === ws.CONNECTING) {
          ws.once("open", function open() {
            duplex._write(chunk, encoding, callback);
          });
          return;
        }
        ws.send(chunk, callback);
      };
      duplex.on("end", duplexOnEnd);
      duplex.on("error", duplexOnError);
      return duplex;
    }
    module.exports = createWebSocketStream2;
  }
});

// node_modules/ws/lib/subprotocol.js
var require_subprotocol = __commonJS({
  "node_modules/ws/lib/subprotocol.js"(exports, module) {
    "use strict";
    var { tokenChars } = require_validation();
    function parse(header) {
      const protocols = /* @__PURE__ */ new Set();
      let start = -1;
      let end = -1;
      let i = 0;
      for (i; i < header.length; i++) {
        const code = header.charCodeAt(i);
        if (end === -1 && tokenChars[code] === 1) {
          if (start === -1) start = i;
        } else if (i !== 0 && (code === 32 || code === 9)) {
          if (end === -1 && start !== -1) end = i;
        } else if (code === 44) {
          if (start === -1) {
            throw new SyntaxError(`Unexpected character at index ${i}`);
          }
          if (end === -1) end = i;
          const protocol2 = header.slice(start, end);
          if (protocols.has(protocol2)) {
            throw new SyntaxError(`The "${protocol2}" subprotocol is duplicated`);
          }
          protocols.add(protocol2);
          start = end = -1;
        } else {
          throw new SyntaxError(`Unexpected character at index ${i}`);
        }
      }
      if (start === -1 || end !== -1) {
        throw new SyntaxError("Unexpected end of input");
      }
      const protocol = header.slice(start, i);
      if (protocols.has(protocol)) {
        throw new SyntaxError(`The "${protocol}" subprotocol is duplicated`);
      }
      protocols.add(protocol);
      return protocols;
    }
    module.exports = { parse };
  }
});

// node_modules/ws/lib/websocket-server.js
var require_websocket_server = __commonJS({
  "node_modules/ws/lib/websocket-server.js"(exports, module) {
    "use strict";
    var EventEmitter = __require("events");
    var http = __require("http");
    var { Duplex } = __require("stream");
    var { createHash } = __require("crypto");
    var extension2 = require_extension();
    var PerMessageDeflate2 = require_permessage_deflate();
    var subprotocol2 = require_subprotocol();
    var WebSocket2 = require_websocket();
    var { CLOSE_TIMEOUT, GUID, kWebSocket } = require_constants();
    var keyRegex = /^[+/0-9A-Za-z]{22}==$/;
    var RUNNING = 0;
    var CLOSING = 1;
    var CLOSED = 2;
    var WebSocketServer2 = class extends EventEmitter {
      /**
       * Create a `WebSocketServer` instance.
       *
       * @param {Object} options Configuration options
       * @param {Boolean} [options.allowSynchronousEvents=true] Specifies whether
       *     any of the `'message'`, `'ping'`, and `'pong'` events can be emitted
       *     multiple times in the same tick
       * @param {Boolean} [options.autoPong=true] Specifies whether or not to
       *     automatically send a pong in response to a ping
       * @param {Number} [options.backlog=511] The maximum length of the queue of
       *     pending connections
       * @param {Boolean} [options.clientTracking=true] Specifies whether or not to
       *     track clients
       * @param {Number} [options.closeTimeout=30000] Duration in milliseconds to
       *     wait for the closing handshake to finish after `websocket.close()` is
       *     called
       * @param {Function} [options.handleProtocols] A hook to handle protocols
       * @param {String} [options.host] The hostname where to bind the server
       * @param {Number} [options.maxBufferedChunks=1048576] The maximum number of
       *     buffered data chunks
       * @param {Number} [options.maxFragments=131072] The maximum number of message
       *     fragments
       * @param {Number} [options.maxPayload=104857600] The maximum allowed message
       *     size
       * @param {Boolean} [options.noServer=false] Enable no server mode
       * @param {String} [options.path] Accept only connections matching this path
       * @param {(Boolean|Object)} [options.perMessageDeflate=false] Enable/disable
       *     permessage-deflate
       * @param {Number} [options.port] The port where to bind the server
       * @param {(http.Server|https.Server)} [options.server] A pre-created HTTP/S
       *     server to use
       * @param {Boolean} [options.skipUTF8Validation=false] Specifies whether or
       *     not to skip UTF-8 validation for text and close messages
       * @param {Function} [options.verifyClient] A hook to reject connections
       * @param {Function} [options.WebSocket=WebSocket] Specifies the `WebSocket`
       *     class to use. It must be the `WebSocket` class or class that extends it
       * @param {Function} [callback] A listener for the `listening` event
       */
      constructor(options, callback) {
        super();
        options = {
          allowSynchronousEvents: true,
          autoPong: true,
          maxBufferedChunks: 1024 * 1024,
          maxFragments: 128 * 1024,
          maxPayload: 100 * 1024 * 1024,
          skipUTF8Validation: false,
          perMessageDeflate: false,
          handleProtocols: null,
          clientTracking: true,
          closeTimeout: CLOSE_TIMEOUT,
          verifyClient: null,
          noServer: false,
          backlog: null,
          // use default (511 as implemented in net.js)
          server: null,
          host: null,
          path: null,
          port: null,
          WebSocket: WebSocket2,
          ...options
        };
        if (options.port == null && !options.server && !options.noServer || options.port != null && (options.server || options.noServer) || options.server && options.noServer) {
          throw new TypeError(
            'One and only one of the "port", "server", or "noServer" options must be specified'
          );
        }
        if (options.port != null) {
          this._server = http.createServer((req, res) => {
            const body = http.STATUS_CODES[426];
            res.writeHead(426, {
              "Content-Length": body.length,
              "Content-Type": "text/plain"
            });
            res.end(body);
          });
          this._server.listen(
            options.port,
            options.host,
            options.backlog,
            callback
          );
        } else if (options.server) {
          this._server = options.server;
        }
        if (this._server) {
          const emitConnection = this.emit.bind(this, "connection");
          this._removeListeners = addListeners(this._server, {
            listening: this.emit.bind(this, "listening"),
            error: this.emit.bind(this, "error"),
            upgrade: (req, socket, head) => {
              this.handleUpgrade(req, socket, head, emitConnection);
            }
          });
        }
        if (options.perMessageDeflate === true) options.perMessageDeflate = {};
        if (options.clientTracking) {
          this.clients = /* @__PURE__ */ new Set();
          this._shouldEmitClose = false;
        }
        this.options = options;
        this._state = RUNNING;
      }
      /**
       * Returns the bound address, the address family name, and port of the server
       * as reported by the operating system if listening on an IP socket.
       * If the server is listening on a pipe or UNIX domain socket, the name is
       * returned as a string.
       *
       * @return {(Object|String|null)} The address of the server
       * @public
       */
      address() {
        if (this.options.noServer) {
          throw new Error('The server is operating in "noServer" mode');
        }
        if (!this._server) return null;
        return this._server.address();
      }
      /**
       * Stop the server from accepting new connections and emit the `'close'` event
       * when all existing connections are closed.
       *
       * @param {Function} [cb] A one-time listener for the `'close'` event
       * @public
       */
      close(cb) {
        if (this._state === CLOSED) {
          if (cb) {
            this.once("close", () => {
              cb(new Error("The server is not running"));
            });
          }
          process.nextTick(emitClose, this);
          return;
        }
        if (cb) this.once("close", cb);
        if (this._state === CLOSING) return;
        this._state = CLOSING;
        if (this.options.noServer || this.options.server) {
          if (this._server) {
            this._removeListeners();
            this._removeListeners = this._server = null;
          }
          if (this.clients) {
            if (!this.clients.size) {
              process.nextTick(emitClose, this);
            } else {
              this._shouldEmitClose = true;
            }
          } else {
            process.nextTick(emitClose, this);
          }
        } else {
          const server = this._server;
          this._removeListeners();
          this._removeListeners = this._server = null;
          server.close(() => {
            emitClose(this);
          });
        }
      }
      /**
       * See if a given request should be handled by this server instance.
       *
       * @param {http.IncomingMessage} req Request object to inspect
       * @return {Boolean} `true` if the request is valid, else `false`
       * @public
       */
      shouldHandle(req) {
        if (this.options.path) {
          const index = req.url.indexOf("?");
          const pathname = index !== -1 ? req.url.slice(0, index) : req.url;
          if (pathname !== this.options.path) return false;
        }
        return true;
      }
      /**
       * Handle a HTTP Upgrade request.
       *
       * @param {http.IncomingMessage} req The request object
       * @param {Duplex} socket The network socket between the server and client
       * @param {Buffer} head The first packet of the upgraded stream
       * @param {Function} cb Callback
       * @public
       */
      handleUpgrade(req, socket, head, cb) {
        socket.on("error", socketOnError);
        const key = req.headers["sec-websocket-key"];
        const upgrade = req.headers.upgrade;
        const version = +req.headers["sec-websocket-version"];
        if (req.method !== "GET") {
          const message = "Invalid HTTP method";
          abortHandshakeOrEmitwsClientError(this, req, socket, 405, message);
          return;
        }
        if (upgrade === void 0 || upgrade.toLowerCase() !== "websocket") {
          const message = "Invalid Upgrade header";
          abortHandshakeOrEmitwsClientError(this, req, socket, 400, message);
          return;
        }
        if (key === void 0 || !keyRegex.test(key)) {
          const message = "Missing or invalid Sec-WebSocket-Key header";
          abortHandshakeOrEmitwsClientError(this, req, socket, 400, message);
          return;
        }
        if (version !== 13 && version !== 8) {
          const message = "Missing or invalid Sec-WebSocket-Version header";
          abortHandshakeOrEmitwsClientError(this, req, socket, 400, message, {
            "Sec-WebSocket-Version": "13, 8"
          });
          return;
        }
        if (!this.shouldHandle(req)) {
          abortHandshake(socket, 400);
          return;
        }
        const secWebSocketProtocol = req.headers["sec-websocket-protocol"];
        let protocols = /* @__PURE__ */ new Set();
        if (secWebSocketProtocol !== void 0) {
          try {
            protocols = subprotocol2.parse(secWebSocketProtocol);
          } catch (err) {
            const message = "Invalid Sec-WebSocket-Protocol header";
            abortHandshakeOrEmitwsClientError(this, req, socket, 400, message);
            return;
          }
        }
        const secWebSocketExtensions = req.headers["sec-websocket-extensions"];
        const extensions = {};
        if (this.options.perMessageDeflate && secWebSocketExtensions !== void 0) {
          const perMessageDeflate = new PerMessageDeflate2({
            ...this.options.perMessageDeflate,
            isServer: true,
            maxPayload: this.options.maxPayload
          });
          try {
            const offers = extension2.parse(secWebSocketExtensions);
            if (offers[PerMessageDeflate2.extensionName]) {
              perMessageDeflate.accept(offers[PerMessageDeflate2.extensionName]);
              extensions[PerMessageDeflate2.extensionName] = perMessageDeflate;
            }
          } catch (err) {
            const message = "Invalid or unacceptable Sec-WebSocket-Extensions header";
            abortHandshakeOrEmitwsClientError(this, req, socket, 400, message);
            return;
          }
        }
        if (this.options.verifyClient) {
          const info = {
            origin: req.headers[`${version === 8 ? "sec-websocket-origin" : "origin"}`],
            secure: !!(req.socket.authorized || req.socket.encrypted),
            req
          };
          if (this.options.verifyClient.length === 2) {
            this.options.verifyClient(info, (verified, code, message, headers) => {
              if (!verified) {
                return abortHandshake(socket, code || 401, message, headers);
              }
              this.completeUpgrade(
                extensions,
                key,
                protocols,
                req,
                socket,
                head,
                cb
              );
            });
            return;
          }
          if (!this.options.verifyClient(info)) return abortHandshake(socket, 401);
        }
        this.completeUpgrade(extensions, key, protocols, req, socket, head, cb);
      }
      /**
       * Upgrade the connection to WebSocket.
       *
       * @param {Object} extensions The accepted extensions
       * @param {String} key The value of the `Sec-WebSocket-Key` header
       * @param {Set} protocols The subprotocols
       * @param {http.IncomingMessage} req The request object
       * @param {Duplex} socket The network socket between the server and client
       * @param {Buffer} head The first packet of the upgraded stream
       * @param {Function} cb Callback
       * @throws {Error} If called more than once with the same socket
       * @private
       */
      completeUpgrade(extensions, key, protocols, req, socket, head, cb) {
        if (!socket.readable || !socket.writable) return socket.destroy();
        if (socket[kWebSocket]) {
          throw new Error(
            "server.handleUpgrade() was called more than once with the same socket, possibly due to a misconfiguration"
          );
        }
        if (this._state > RUNNING) return abortHandshake(socket, 503);
        const digest = createHash("sha1").update(key + GUID).digest("base64");
        const headers = [
          "HTTP/1.1 101 Switching Protocols",
          "Upgrade: websocket",
          "Connection: Upgrade",
          `Sec-WebSocket-Accept: ${digest}`
        ];
        const ws = new this.options.WebSocket(null, void 0, this.options);
        if (protocols.size) {
          const protocol = this.options.handleProtocols ? this.options.handleProtocols(protocols, req) : protocols.values().next().value;
          if (protocol) {
            headers.push(`Sec-WebSocket-Protocol: ${protocol}`);
            ws._protocol = protocol;
          }
        }
        if (extensions[PerMessageDeflate2.extensionName]) {
          const params = extensions[PerMessageDeflate2.extensionName].params;
          const value = extension2.format({
            [PerMessageDeflate2.extensionName]: [params]
          });
          headers.push(`Sec-WebSocket-Extensions: ${value}`);
          ws._extensions = extensions;
        }
        this.emit("headers", headers, req);
        socket.write(headers.concat("\r\n").join("\r\n"));
        socket.removeListener("error", socketOnError);
        ws.setSocket(socket, head, {
          allowSynchronousEvents: this.options.allowSynchronousEvents,
          maxBufferedChunks: this.options.maxBufferedChunks,
          maxFragments: this.options.maxFragments,
          maxPayload: this.options.maxPayload,
          skipUTF8Validation: this.options.skipUTF8Validation
        });
        if (this.clients) {
          this.clients.add(ws);
          ws.on("close", () => {
            this.clients.delete(ws);
            if (this._shouldEmitClose && !this.clients.size) {
              process.nextTick(emitClose, this);
            }
          });
        }
        cb(ws, req);
      }
    };
    module.exports = WebSocketServer2;
    function addListeners(server, map) {
      for (const event of Object.keys(map)) server.on(event, map[event]);
      return function removeListeners() {
        for (const event of Object.keys(map)) {
          server.removeListener(event, map[event]);
        }
      };
    }
    function emitClose(server) {
      server._state = CLOSED;
      server.emit("close");
    }
    function socketOnError() {
      this.destroy();
    }
    function abortHandshake(socket, code, message, headers) {
      message = message || http.STATUS_CODES[code];
      headers = {
        Connection: "close",
        "Content-Type": "text/html",
        "Content-Length": Buffer.byteLength(message),
        ...headers
      };
      socket.once("finish", socket.destroy);
      socket.end(
        `HTTP/1.1 ${code} ${http.STATUS_CODES[code]}\r
` + Object.keys(headers).map((h) => `${h}: ${headers[h]}`).join("\r\n") + "\r\n\r\n" + message
      );
    }
    function abortHandshakeOrEmitwsClientError(server, req, socket, code, message, headers) {
      if (server.listenerCount("wsClientError")) {
        const err = new Error(message);
        Error.captureStackTrace(err, abortHandshakeOrEmitwsClientError);
        server.emit("wsClientError", err, socket, req);
      } else {
        abortHandshake(socket, code, message, headers);
      }
    }
  }
});

// node_modules/ws/wrapper.mjs
var wrapper_exports = {};
__export(wrapper_exports, {
  PerMessageDeflate: () => import_permessage_deflate.default,
  Receiver: () => import_receiver.default,
  Sender: () => import_sender.default,
  WebSocket: () => import_websocket.default,
  WebSocketServer: () => import_websocket_server.default,
  createWebSocketStream: () => import_stream.default,
  default: () => wrapper_default,
  extension: () => import_extension.default,
  subprotocol: () => import_subprotocol.default
});
var import_stream, import_extension, import_permessage_deflate, import_receiver, import_sender, import_subprotocol, import_websocket, import_websocket_server, wrapper_default;
var init_wrapper = __esm({
  "node_modules/ws/wrapper.mjs"() {
    import_stream = __toESM(require_stream(), 1);
    import_extension = __toESM(require_extension(), 1);
    import_permessage_deflate = __toESM(require_permessage_deflate(), 1);
    import_receiver = __toESM(require_receiver(), 1);
    import_sender = __toESM(require_sender(), 1);
    import_subprotocol = __toESM(require_subprotocol(), 1);
    import_websocket = __toESM(require_websocket(), 1);
    import_websocket_server = __toESM(require_websocket_server(), 1);
    wrapper_default = import_websocket.default;
  }
});

// index.ts
import { defineChannelPluginEntry } from "openclaw/plugin-sdk/core";

// src/channel.ts
import { describeWebhookAccountSnapshot } from "openclaw/plugin-sdk/account-helpers";
import { formatAllowFromLowercase } from "openclaw/plugin-sdk/allow-from";
import {
  adaptScopedAccountAccessor,
  createScopedChannelConfigAdapter,
  createScopedDmSecurityResolver
} from "openclaw/plugin-sdk/channel-config-helpers";
import { createAccountStatusSink } from "openclaw/plugin-sdk/channel-lifecycle";
import {
  createLoggedPairingApprovalNotifier,
  createPairingPrefixStripper
} from "openclaw/plugin-sdk/channel-pairing";
import { createAllowlistProviderRouteAllowlistWarningCollector } from "openclaw/plugin-sdk/channel-policy";
import { createChatChannelPlugin } from "openclaw/plugin-sdk/core";
import { runStoppablePassiveMonitor } from "openclaw/plugin-sdk/extension-shared";
import {
  buildWebhookChannelStatusSummary,
  createComputedAccountStatusAdapter,
  createDefaultChannelRuntimeState
} from "openclaw/plugin-sdk/status-helpers";

// runtime-api.ts
import {
  DEFAULT_ACCOUNT_ID,
  applyAccountNameToChannelSection,
  buildChannelConfigSchema,
  clearAccountEntryFields,
  normalizeAccountId
} from "openclaw/plugin-sdk/core";
import {
  GROUP_POLICY_BLOCKED_LABEL,
  resolveAllowlistProviderRuntimeGroupPolicy,
  resolveDefaultGroupPolicy,
  warnMissingProviderGroupPolicyFallbackOnce
} from "openclaw/plugin-sdk/config-runtime";
import { patchScopedAccountConfig } from "openclaw/plugin-sdk/setup";
import { deliverFormattedTextWithAttachments } from "openclaw/plugin-sdk/reply-payload";
import {
  WEBHOOK_RATE_LIMIT_DEFAULTS,
  createAuthRateLimiter
} from "openclaw/plugin-sdk/webhook-ingress";
import {
  buildChannelKeyCandidates,
  normalizeChannelSlug,
  resolveChannelEntryMatchWithFallback,
  resolveNestedAllowlistDecision
} from "openclaw/plugin-sdk/channel-targets";
import { createAccountListHelpers } from "openclaw/plugin-sdk/account-helpers";
import { createChannelPairingController } from "openclaw/plugin-sdk/channel-pairing";
import { dispatchInboundReplyWithBase } from "openclaw/plugin-sdk/inbound-reply-dispatch";
import { evaluateMatchedGroupAccessForPolicy } from "openclaw/plugin-sdk/group-access";
import { logInboundDrop } from "openclaw/plugin-sdk/channel-inbound";
import {
  readStoreAllowFromForDmPolicy,
  resolveDmGroupAccessWithCommandGate
} from "openclaw/plugin-sdk/security-runtime";
import { resolveAccountWithDefaultFallback } from "openclaw/plugin-sdk/account-core";

// src/accounts.ts
import crypto from "node:crypto";
import { resolveMergedAccountConfig } from "openclaw/plugin-sdk/account-resolution";
import { tryReadSecretFileSync } from "openclaw/plugin-sdk/core";

// src/secret-input.ts
import {
  buildSecretInputSchema,
  hasConfiguredSecretInput,
  normalizeResolvedSecretInputString,
  normalizeSecretInputString
} from "openclaw/plugin-sdk/secret-input";

// src/types.ts
var DEFAULT_LOCAL_PORT = 9750;
var DEFAULT_LOCAL_HOST = "0.0.0.0";
var DEFAULT_CLAWTILE_HTTP_URL = "https://voinko.com";
var DEFAULT_RELAY_WS_URL = "wss://voinko.com/ws/plugin";
var DEFAULT_RELAY_HTTP_URL = DEFAULT_CLAWTILE_HTTP_URL;

// src/accounts.ts
function isTruthyEnvValue(value) {
  const normalized = (value ?? "").trim().toLowerCase();
  return normalized === "true" || normalized === "1" || normalized === "yes" || normalized === "on";
}
var debugAccounts = (...args) => {
  if (isTruthyEnvValue(process.env.OPENCLAW_DEBUG_GOCHAT_ACCOUNTS)) {
    console.warn("[gochat:accounts]", ...args);
  }
};
var autoGeneratedSecret = null;
function getOrCreateAutoSecret() {
  if (autoGeneratedSecret) return autoGeneratedSecret;
  autoGeneratedSecret = crypto.randomUUID().replace(/-/g, "") + crypto.randomUUID().replace(/-/g, "").slice(0, 16);
  return autoGeneratedSecret;
}
var {
  listAccountIds: listGoChatAccountIdsInternal,
  resolveDefaultAccountId: resolveDefaultGoChatAccountId
} = createAccountListHelpers("gochat", {
  normalizeAccountId
});
function listGoChatAccountIds(cfg) {
  const ids = listGoChatAccountIdsInternal(cfg);
  debugAccounts("listGoChatAccountIds", ids);
  return ids;
}
function normalizeGoChatMode(raw) {
  if (!raw) return "relay";
  const lower = raw.toLowerCase().trim();
  if (lower === "local" || lower === "direct") return "local";
  if (lower === "relay" || lower === "relay-ws") return "relay";
  if (lower === "agent" || lower === "clawtile-agent") return "agent";
  return "relay";
}
function mergeGoChatAccountConfig(cfg, accountId) {
  const merged = resolveMergedAccountConfig({
    channelConfig: cfg.channels?.gochat,
    accounts: cfg.channels?.gochat?.accounts,
    accountId,
    omitKeys: ["defaultAccount"],
    normalizeAccountId
  });
  if (typeof merged.blockStreaming !== "boolean") {
    merged.blockStreaming = true;
  }
  return merged;
}
function resolveGoChatSecret(cfg, opts) {
  const merged = mergeGoChatAccountConfig(cfg, opts.accountId ?? DEFAULT_ACCOUNT_ID);
  if (opts.mode !== "agent") {
    const envSecret = process.env.GOCHAT_WEBHOOK_SECRET?.trim();
    if (envSecret && (!opts.accountId || opts.accountId === DEFAULT_ACCOUNT_ID)) {
      return { secret: envSecret, source: "env" };
    }
    if (merged.webhookSecretFile) {
      const fileSecret = tryReadSecretFileSync(
        merged.webhookSecretFile,
        "GoChat webhook secret file",
        { rejectSymlink: true }
      );
      if (fileSecret) {
        return { secret: fileSecret, source: "secretFile" };
      }
    }
    const inlineSecret = normalizeResolvedSecretInputString({
      value: merged.webhookSecret,
      path: `channels.gochat.accounts.${opts.accountId ?? DEFAULT_ACCOUNT_ID}.webhookSecret`
    });
    if (inlineSecret) {
      return { secret: inlineSecret, source: "config" };
    }
  }
  if (opts.mode === "agent") {
    const envAgentToken = process.env.GOCHAT_AGENT_TOKEN?.trim();
    if (envAgentToken && (!opts.accountId || opts.accountId === DEFAULT_ACCOUNT_ID)) {
      return { secret: envAgentToken, source: "env" };
    }
    if (merged.agentTokenFile) {
      const fileToken = tryReadSecretFileSync(
        merged.agentTokenFile,
        "GoChat agent token file",
        { rejectSymlink: true }
      );
      if (fileToken) {
        return { secret: fileToken, source: "secretFile" };
      }
    }
    const inlineToken = normalizeResolvedSecretInputString({
      value: merged.agentToken,
      path: `channels.gochat.accounts.${opts.accountId ?? DEFAULT_ACCOUNT_ID}.agentToken`
    });
    if (inlineToken) {
      return { secret: inlineToken, source: "config" };
    }
  }
  if (opts.mode === "local") {
    return { secret: getOrCreateAutoSecret(), source: "auto" };
  }
  return { secret: "", source: "none" };
}
function resolveGoChatAccount(params) {
  const baseEnabled = params.cfg.channels?.gochat?.enabled !== false;
  const resolve3 = (accountId) => {
    const merged = mergeGoChatAccountConfig(params.cfg, accountId);
    const accountEnabled = merged.enabled !== false;
    const enabled = baseEnabled && accountEnabled;
    const mode = normalizeGoChatMode(merged.mode);
    const secretResolution = resolveGoChatSecret(params.cfg, { accountId, mode });
    const directPort = merged.directPort ?? DEFAULT_LOCAL_PORT;
    const directHost = merged.directHost ?? DEFAULT_LOCAL_HOST;
    const relayPlatformUrl = merged.relayPlatformUrl?.trim()?.replace(/\/+$/, "") || DEFAULT_RELAY_WS_URL;
    const channelId = merged.channelId?.trim() ?? "";
    const agentServerUrl = merged.agentServerUrl?.trim()?.replace(/\/+$/, "") || DEFAULT_CLAWTILE_HTTP_URL;
    debugAccounts("resolve", {
      accountId,
      enabled,
      mode,
      secretSource: secretResolution.source
    });
    const resolved = {
      accountId,
      enabled,
      name: merged.name?.trim() || void 0,
      mode,
      secret: secretResolution.secret,
      secretSource: secretResolution.source,
      directPort,
      directHost,
      relayPlatformUrl,
      channelId,
      agentServerUrl,
      config: merged
    };
    console.log(
      `[gochat:config] accountId=${accountId} mode=${mode} enabled=${enabled} secretSource=${secretResolution.source}` + (mode === "local" ? ` port=${directPort} host=${directHost}` : "") + (mode === "relay" ? ` relayUrl=${relayPlatformUrl} channelId=${channelId || "(pending)"}` : "") + (mode === "agent" ? ` agentServer=${agentServerUrl}` : "") + ` dmPolicy=${merged.dmPolicy ?? "open"} blockStreaming=${merged.blockStreaming !== false}`
    );
    return resolved;
  };
  return resolveAccountWithDefaultFallback({
    accountId: params.accountId,
    normalizeAccountId,
    resolvePrimary: resolve3,
    hasCredential: (account) => account.secretSource !== "none",
    resolveDefaultAccountId: () => resolveDefaultGoChatAccountId(params.cfg)
  });
}

// src/config-schema.ts
import {
  DmPolicySchema,
  GroupPolicySchema,
  MarkdownConfigSchema,
  ReplyRuntimeConfigSchemaShape,
  ToolPolicySchema,
  requireOpenAllowFrom
} from "openclaw/plugin-sdk/channel-config-schema";
import { requireChannelOpenAllowFrom } from "openclaw/plugin-sdk/extension-shared";
import { z } from "openclaw/plugin-sdk/zod";
var GoChatConversationSchema = z.object({
  requireMention: z.boolean().optional(),
  tools: ToolPolicySchema,
  skills: z.array(z.string()).optional(),
  enabled: z.boolean().optional(),
  allowFrom: z.array(z.string()).optional(),
  systemPrompt: z.string().optional()
}).strict();
var GoChatAttachmentSchema = z.object({
  url: z.string().url(),
  type: z.enum(["image", "audio", "video", "file"]),
  name: z.string().optional(),
  mimeType: z.string().optional(),
  size: z.number().int().positive().optional()
});
var GoChatLocalAudioTranscriptionSchema = z.object({
  enabled: z.boolean().optional(),
  engine: z.enum(["auto", "whisper", "faster-whisper", "mlx-whisper", "whisper-cpp"]).optional(),
  model: z.string().optional(),
  language: z.string().optional(),
  task: z.enum(["transcribe", "translate"]).optional(),
  device: z.string().optional(),
  computeType: z.string().optional(),
  beamSize: z.number().int().positive().optional(),
  wordTimestamps: z.boolean().optional(),
  maxTranscriptChars: z.number().int().positive().optional()
}).strict().optional();
var GoChatModeSwitchAuthorizationSchema = z.object({
  targetMode: z.enum(["local", "relay", "agent"]).optional(),
  issuedAt: z.string().optional(),
  expiresAt: z.string().optional()
}).strict().optional();
var GoChatWebhookPayloadSchema = z.object({
  messageId: z.string().min(1),
  conversationId: z.string().min(1),
  conversationName: z.string(),
  senderId: z.string().min(1),
  senderName: z.string(),
  text: z.string(),
  attachments: z.array(GoChatAttachmentSchema).optional().default([]),
  replyTo: z.string().optional(),
  timestamp: z.number(),
  isGroupChat: z.boolean()
});
var GoChatAccountSchemaBase = z.object({
  name: z.string().optional(),
  enabled: z.boolean().optional(),
  mode: z.enum(["local", "relay", "agent"]).optional().default("relay"),
  markdown: MarkdownConfigSchema,
  webhookSecret: buildSecretInputSchema().optional(),
  webhookSecretFile: z.string().optional(),
  dmPolicy: DmPolicySchema.optional().default("open"),
  allowFrom: z.array(z.string()).optional(),
  groupAllowFrom: z.array(z.string()).optional(),
  groupPolicy: GroupPolicySchema.optional().default("allowlist"),
  conversations: z.record(z.string(), GoChatConversationSchema.optional()).optional(),
  allowPrivateNetwork: z.boolean().optional(),
  trustedAttachmentHosts: z.array(z.string()).optional(),
  localAudioTranscription: GoChatLocalAudioTranscriptionSchema,
  modeSwitchAuthorization: GoChatModeSwitchAuthorizationSchema,
  directPort: z.number().int().positive().optional(),
  directHost: z.string().optional(),
  relayPlatformUrl: z.string().optional(),
  channelId: z.string().optional(),
  agentServerUrl: z.string().optional(),
  agentToken: buildSecretInputSchema().optional(),
  agentTokenFile: z.string().optional(),
  ...ReplyRuntimeConfigSchemaShape
}).strict();
var GoChatAccountSchema = GoChatAccountSchemaBase.superRefine((value, ctx) => {
  requireChannelOpenAllowFrom({
    channel: "gochat",
    policy: value.dmPolicy,
    allowFrom: value.allowFrom,
    ctx,
    requireOpenAllowFrom
  });
});
var GoChatConfigSchema = GoChatAccountSchemaBase.extend({
  accounts: z.record(z.string(), GoChatAccountSchema.optional()).optional(),
  defaultAccount: z.string().optional()
}).superRefine((value, ctx) => {
  requireChannelOpenAllowFrom({
    channel: "gochat",
    policy: value.dmPolicy,
    allowFrom: value.allowFrom,
    ctx,
    requireOpenAllowFrom
  });
});

// src/gochat/agent-monitor.ts
import {
  resolveLoggerBackedRuntime
} from "openclaw/plugin-sdk/extension-shared";

// src/inbound.ts
import { buildAgentMediaPayload } from "openclaw/plugin-sdk/media-runtime";
import { execFile as execFile2 } from "node:child_process";
import { existsSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { promisify as promisify2 } from "node:util";

// src/policy.ts
function normalizeAllowEntry(raw) {
  return raw.trim().toLowerCase().replace(/^gochat:/i, "");
}
function resolveGoChatAllowlistMatch(params) {
  if (params.allowFrom.length === 0) {
    return { allowed: false };
  }
  if (params.allowFrom.includes("*")) {
    return { allowed: true, matchKey: "*", matchSource: "wildcard" };
  }
  const senderId = normalizeAllowEntry(params.senderId);
  if (params.allowFrom.includes(senderId)) {
    return { allowed: true, matchKey: senderId, matchSource: "id" };
  }
  return { allowed: false };
}
function resolveGoChatConversationMatch(params) {
  const conversations = params.conversations ?? {};
  const allowlistConfigured = Object.keys(conversations).length > 0;
  const convCandidates = buildChannelKeyCandidates(params.conversationId);
  const match = resolveChannelEntryMatchWithFallback({
    entries: conversations,
    keys: convCandidates,
    wildcardKey: "*",
    normalizeKey: normalizeChannelSlug
  });
  const conversationConfig = match.entry;
  const allowed = resolveNestedAllowlistDecision({
    outerConfigured: allowlistConfigured,
    outerMatched: Boolean(conversationConfig),
    innerConfigured: false,
    innerMatched: false
  });
  return {
    conversationConfig,
    wildcardConfig: match.wildcardEntry,
    conversationKey: match.matchKey ?? match.key,
    matchSource: match.matchSource,
    allowed,
    allowlistConfigured
  };
}
function resolveGoChatGroupToolPolicy(params) {
  const cfg = params.cfg;
  const conversationId = params.groupId?.trim();
  if (!conversationId) {
    return void 0;
  }
  const match = resolveGoChatConversationMatch({
    conversations: cfg.channels?.gochat?.conversations,
    conversationId
  });
  return match.conversationConfig?.tools ?? match.wildcardConfig?.tools;
}

// src/runtime.ts
import { createPluginRuntimeStore } from "openclaw/plugin-sdk/runtime-store";
var { setRuntime: _setGoChatRuntime, getRuntime: getGoChatRuntime } = createPluginRuntimeStore("GoChat runtime not initialized");
function setGoChatRuntime(runtime) {
  _setGoChatRuntime(runtime);
}

// src/send.ts
import { resolveMarkdownTableMode } from "openclaw/plugin-sdk/config-runtime";
import { convertMarkdownTables } from "openclaw/plugin-sdk/text-runtime";

// src/gochat/agent-client.ts
function trimBaseUrl(serverUrl) {
  return serverUrl.trim().replace(/\/+$/, "");
}
function agentRestBase(serverUrl) {
  return `${trimBaseUrl(serverUrl)}/api/agent`;
}
async function readErrorText(resp) {
  const text = await resp.text().catch(() => "");
  return text.trim() || `HTTP ${resp.status}`;
}
async function exchangeAgentPairCode(params) {
  const base = agentRestBase(params.serverUrl);
  const resp = await fetch(`${base}/pair/exchange`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      code: params.code.trim(),
      display_name: params.displayName?.trim() || "OpenClaw",
      agent_hint: "openclaw",
      client_info: {
        platform: "openclaw-gochat",
        version: params.version || "unknown"
      }
    }),
    signal: AbortSignal.timeout(15e3)
  });
  if (!resp.ok) {
    throw new Error(`agent pairing failed: ${await readErrorText(resp)}`);
  }
  const data = await resp.json();
  if (!data.token) {
    throw new Error("agent pairing response missing token");
  }
  return data;
}
async function agentFetchJson(account, path2, init = {}) {
  const resp = await fetch(`${agentRestBase(account.agentServerUrl)}${path2}`, {
    ...init,
    headers: {
      ...init.headers ?? {},
      Authorization: `Bearer ${account.secret}`
    }
  });
  if (!resp.ok) {
    throw new Error(`agent request failed ${resp.status}: ${await readErrorText(resp)}`);
  }
  return await resp.json();
}
async function getAgentTranscript(account, recordingId) {
  return await agentFetchJson(
    account,
    `/recordings/${encodeURIComponent(recordingId)}/transcript`
  );
}
async function markAgentRecordingState(account, recordingId, state) {
  await agentFetchJson(account, `/recordings/${encodeURIComponent(recordingId)}/state`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ state })
  });
}
async function postTurnProgress(account, turnId, body) {
  await agentFetchJson(account, `/turns/${encodeURIComponent(turnId)}/progress`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });
}
async function writeAgentSummary(params) {
  await agentFetchJson(params.account, `/recordings/${encodeURIComponent(params.recordingId)}/summary`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      summary: params.summary,
      source_label: params.sourceLabel || "openclaw",
      model: params.model || void 0,
      metadata: {
        plugin: "gochat",
        mode: "agent"
      }
    })
  });
}

// src/gochat/device-chat.ts
var DEVICE_CONV_PREFIX = "agent-device:";
var turnBySession = /* @__PURE__ */ new Map();
function deviceConversationId(sessionId) {
  return `${DEVICE_CONV_PREFIX}${sessionId || "device"}`;
}
function isDeviceConversation(conversationId) {
  return conversationId.startsWith(DEVICE_CONV_PREFIX);
}
function deviceSessionOf(conversationId) {
  return conversationId.slice(DEVICE_CONV_PREFIX.length);
}
function recordDeviceTurn(sessionId, turnId) {
  turnBySession.set(sessionId || "device", turnId);
}
function clearDeviceTurn(sessionId, turnId) {
  const key = sessionId || "device";
  if (!turnId || turnBySession.get(key) === turnId) {
    turnBySession.delete(key);
  }
}
async function sendDeviceTurnReply(conversationId, text, account) {
  const sessionId = deviceSessionOf(conversationId);
  const turnId = turnBySession.get(sessionId || "device");
  if (turnId) {
    await postTurnProgress(account, turnId, { state: "final", text });
    clearDeviceTurn(sessionId, turnId);
  }
  return { messageId: turnId || sessionId, conversationId };
}
async function failDeviceTurn(account, sessionId, turnId, message) {
  await postTurnProgress(account, turnId, {
    state: "error",
    error: message || "\u6267\u884C\u5931\u8D25"
  }).catch(() => void 0);
  clearDeviceTurn(sessionId, turnId);
}

// src/normalize.ts
function stripGoChatTargetPrefix(raw) {
  const trimmed = raw.trim();
  if (!trimmed) {
    return void 0;
  }
  let normalized = trimmed;
  if (normalized.startsWith("gochat:")) {
    normalized = normalized.slice("gochat:".length).trim();
  }
  if (normalized.startsWith("conv:")) {
    normalized = normalized.slice("conv:".length).trim();
  }
  if (!normalized) {
    return void 0;
  }
  return normalized;
}
function normalizeGoChatMessagingTarget(raw) {
  const normalized = stripGoChatTargetPrefix(raw);
  return normalized ? `gochat:${normalized}`.toLowerCase() : void 0;
}
function looksLikeGoChatTargetId(raw) {
  const trimmed = raw.trim();
  if (!trimmed) {
    return false;
  }
  if (/^gochat:/i.test(trimmed)) {
    return true;
  }
  return /^[a-z0-9_-]{4,}$/i.test(trimmed);
}

// src/send.ts
var directStorage = null;
var relayWsSender = null;
var relayStatusReporter = null;
function setDirectStorage(storage) {
  directStorage = storage;
}
function setRelayWsSender(sender) {
  relayWsSender = sender;
}
function setRelayStatusReporter(reporter) {
  relayStatusReporter = reporter;
}
function normalizeConversationId(to) {
  const normalized = stripGoChatTargetPrefix(to);
  if (!normalized) {
    throw new Error("Conversation ID is required for GoChat sends");
  }
  return normalized;
}
function recordGoChatOutboundActivity(accountId) {
  try {
    getGoChatRuntime().channel.activity.record({
      channel: "gochat",
      accountId,
      direction: "outbound"
    });
  } catch (error) {
    if (!(error instanceof Error) || error.message !== "GoChat runtime not initialized") {
      throw error;
    }
  }
}
async function sendDirect(conversationId, text, opts, accountId) {
  if (!directStorage) {
    throw new Error("GoChat local storage not initialized");
  }
  const stored = await directStorage.appendMessage(conversationId, {
    direction: "outbound",
    text,
    attachments: opts.mediaUrl ? [{ url: opts.mediaUrl, type: "file" }] : [],
    replyTo: opts.replyTo
  });
  recordGoChatOutboundActivity(accountId);
  console.log(`[gochat:local] Sent message ${stored.id} to conversation ${conversationId}`);
  return {
    messageId: stored.id,
    conversationId,
    timestamp: stored.timestamp
  };
}
async function uploadToGoChatServer(mediaUrl, relayPlatformUrl) {
  try {
    const response = await fetch(mediaUrl);
    if (!response.ok) {
      console.warn(`[gochat:relay] failed to fetch media from ${mediaUrl}: ${response.status}`);
      return mediaUrl;
    }
    const blob = await response.blob();
    const contentType = response.headers.get("Content-Type") || "application/octet-stream";
    const filename = mediaUrl.split("/").pop() || "attachment";
    const baseUrl = relayPlatformUrl.replace("wss://", "https://").replace("ws://", "http://").replace("/ws/plugin", "");
    const presignRes = await fetch(`${baseUrl}/api/upload/presign`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ filename, contentType })
    });
    if (!presignRes.ok) {
      console.warn(`[gochat:relay] presign failed: ${presignRes.status}`);
      return mediaUrl;
    }
    const presign = await presignRes.json();
    const uploadRes = await fetch(presign.uploadUrl, {
      method: "PUT",
      headers: { "Content-Type": contentType },
      body: blob
    });
    if (!uploadRes.ok) {
      console.warn(`[gochat:relay] upload failed: ${uploadRes.status}`);
      return mediaUrl;
    }
    const confirmRes = await fetch(`${baseUrl}/api/upload/confirm`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fileKey: presign.fileKey })
    });
    if (!confirmRes.ok) {
      console.warn(`[gochat:relay] confirm failed: ${confirmRes.status}`);
      return mediaUrl;
    }
    const confirm = await confirmRes.json();
    console.log(`[gochat:relay] reuploaded media: ${mediaUrl} -> ${confirm.url}`);
    return confirm.url;
  } catch (err) {
    console.warn(`[gochat:relay] upload to gochat-server failed: ${err instanceof Error ? err.message : String(err)}`);
    return mediaUrl;
  }
}
async function sendRelay(conversationId, text, opts, accountId, relayPlatformUrl) {
  relayStatusReporter?.("syncing");
  if (!relayWsSender) {
    console.error(`[gochat:relay] Cannot send reply \u2014 relayWsSender is null (relay not connected)`);
    relayStatusReporter?.("error");
    throw new Error("GoChat relay not connected");
  }
  let finalMediaUrl = opts.mediaUrl;
  if (opts.mediaUrl) {
    finalMediaUrl = await uploadToGoChatServer(opts.mediaUrl, relayPlatformUrl);
  }
  const payload = {
    type: "reply",
    conversationId,
    text,
    timestamp: Date.now()
  };
  if (opts.replyTo) {
    payload.replyTo = opts.replyTo;
  }
  if (finalMediaUrl) {
    payload.mediaUrl = finalMediaUrl;
  }
  const mediaLabel = finalMediaUrl ? ` mediaUrl="${finalMediaUrl.substring(0, 120)}..."` : "";
  console.log(`[gochat:relay] Sending reply to conv=${conversationId} text="${text.substring(0, 80)}..."${mediaLabel}`);
  try {
    relayWsSender(payload);
  } catch (error) {
    relayStatusReporter?.("error");
    throw error;
  }
  const messageId = `ws-${Date.now()}`;
  recordGoChatOutboundActivity(accountId);
  console.log(`[gochat:relay] Sent message ${messageId} to conversation ${conversationId}`);
  return { messageId, conversationId };
}
function extractAgentRecordingId(conversationId) {
  const normalized = conversationId.trim();
  const prefixes = ["agent-recording:", "recording:", "rec:"];
  for (const prefix of prefixes) {
    if (normalized.startsWith(prefix)) {
      const id = normalized.slice(prefix.length).trim();
      if (id) {
        return id;
      }
    }
  }
  if (/^rec_[A-Za-z0-9_-]+$/.test(normalized)) {
    return normalized;
  }
  throw new Error(`Unsupported GoChat agent conversation id: ${conversationId}`);
}
async function sendAgentSummary(conversationId, text, account) {
  relayStatusReporter?.("syncing");
  const recordingId = extractAgentRecordingId(conversationId);
  try {
    await writeAgentSummary({
      account,
      recordingId,
      summary: text,
      sourceLabel: "openclaw"
    });
  } catch (error) {
    relayStatusReporter?.("error");
    throw error;
  }
  recordGoChatOutboundActivity(account.accountId);
  relayStatusReporter?.("idle");
  return {
    messageId: `agent-summary-${Date.now()}`,
    conversationId,
    timestamp: Date.now()
  };
}
async function sendMessageGoChat(to, text, opts = {}) {
  const cfg = opts.cfg ?? getGoChatRuntime().config.loadConfig();
  const account = resolveGoChatAccount({
    cfg,
    accountId: opts.accountId
  });
  const conversationId = normalizeConversationId(to);
  if (!text?.trim() && !opts.mediaUrl) {
    throw new Error("Message must be non-empty for GoChat sends");
  }
  const tableMode = resolveMarkdownTableMode({
    cfg,
    channel: "gochat",
    accountId: account.accountId
  });
  const message = convertMarkdownTables(text?.trim() ?? "", tableMode);
  if (account.mode === "local") {
    return await sendDirect(conversationId, message, opts, account.accountId);
  }
  if (account.mode === "agent") {
    if (isDeviceConversation(conversationId)) {
      return await sendDeviceTurnReply(conversationId, message, account);
    }
    return await sendAgentSummary(conversationId, message, account);
  }
  return await sendRelay(conversationId, message, opts, account.accountId, account.relayPlatformUrl);
}

// src/subagent-permission-status.ts
import { execFile } from "node:child_process";
import { promisify } from "node:util";
var execFileAsync = promisify(execFile);
var CACHE_TTL_MS = 3e3;
var cachedStatus = null;
function extractJsonPayload(raw) {
  const text = raw.trim();
  if (!text) {
    throw new Error("empty command output");
  }
  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    if (char !== "{" && char !== "[") {
      continue;
    }
    const candidate = text.slice(index).trim();
    try {
      return JSON.parse(candidate);
    } catch {
    }
  }
  throw new Error("json payload not found in command output");
}
function normalizeScopes(scopes) {
  if (!Array.isArray(scopes)) {
    return [];
  }
  return scopes.map((entry) => String(entry ?? "").trim()).filter(Boolean).sort();
}
function looksLikeCliDevice(entry) {
  const clientId = String(entry.clientId ?? "").trim().toLowerCase();
  const clientMode = String(entry.clientMode ?? "").trim().toLowerCase();
  if (!clientId && !clientMode) {
    return true;
  }
  return clientId === "cli" || clientMode === "cli";
}
function selectRelevantPendingRequest(pending) {
  const filtered = pending.filter((entry) => {
    const role = String(entry.role ?? "").trim().toLowerCase();
    if (role && role !== "operator") {
      return false;
    }
    if (!looksLikeCliDevice(entry)) {
      return false;
    }
    const scopes = normalizeScopes(entry.scopes);
    return scopes.length === 0 || scopes.includes("operator.admin");
  });
  const ordered = [...filtered].sort((a, b) => (b.createdAtMs ?? 0) - (a.createdAtMs ?? 0));
  return ordered[0] ?? null;
}
function selectRelevantPairedDevice(paired) {
  return paired.find((entry) => {
    const role = String(entry.role ?? "").trim().toLowerCase();
    if (role && role !== "operator") {
      return false;
    }
    return looksLikeCliDevice(entry);
  }) ?? null;
}
async function loadDeviceList() {
  const openclawBin = process.env.GOCHAT_OPENCLAW_BIN?.trim() || "openclaw";
  const { stdout, stderr } = await execFileAsync(openclawBin, ["devices", "list", "--json", "--timeout", "5000"], {
    timeout: 1e4,
    maxBuffer: 2 * 1024 * 1024
  });
  return extractJsonPayload([stdout, stderr].filter(Boolean).join("\n"));
}
function buildApprovalCommand(request) {
  return "openclaw gochat approve-local-repair";
}
function buildDirectApprovalFallbackCommand(request) {
  if (request?.requestId?.trim()) {
    return `openclaw devices approve ${request.requestId.trim()}`;
  }
  return "openclaw devices approve --latest";
}
function inspectFromDeviceList(deviceList) {
  const pending = selectRelevantPendingRequest(deviceList.pending ?? []);
  if (pending) {
    const approvalCommand = buildApprovalCommand(pending);
    return {
      state: "pending_approval",
      summary: "Subagent permission needs approval.",
      detailSignature: `pending:${pending.requestId ?? "latest"}:${pending.deviceId ?? ""}`,
      approvalState: "pending",
      approvalLabel: "pending request",
      approvalCommand,
      requestId: pending.requestId?.trim() || void 0,
      deviceId: pending.deviceId?.trim() || void 0
    };
  }
  const paired = selectRelevantPairedDevice(deviceList.paired ?? []);
  if (!paired) {
    return {
      state: "unknown",
      summary: "Subagent permission status is unavailable.",
      detailSignature: "unknown:no-cli-device",
      approvalState: "unknown",
      approvalLabel: "unknown"
    };
  }
  const scopes = normalizeScopes(paired.scopes);
  if (scopes.includes("operator.admin")) {
    return {
      state: "ready",
      summary: "Subagent permission is ready.",
      detailSignature: `ready:${paired.deviceId ?? ""}:${scopes.join(",")}`,
      approvalState: "approved",
      approvalLabel: "approved",
      scopes,
      deviceId: paired.deviceId?.trim() || void 0
    };
  }
  return {
    state: "degraded",
    summary: "Subagent permission is limited.",
    detailSignature: `degraded:${paired.deviceId ?? ""}:${scopes.join(",")}`,
    approvalState: "limited",
    approvalLabel: "paired without operator.admin",
    scopes,
    deviceId: paired.deviceId?.trim() || void 0
  };
}
async function inspectSubagentPermissionStatus(params) {
  const now = Date.now();
  if (!params?.forceRefresh && cachedStatus && now - cachedStatus.at < CACHE_TTL_MS) {
    return cachedStatus.value;
  }
  let value;
  try {
    value = inspectFromDeviceList(await loadDeviceList());
  } catch (error) {
    value = {
      state: "unknown",
      summary: "Subagent permission status is unavailable.",
      detailSignature: `unknown:${error instanceof Error ? error.message : String(error)}`,
      approvalState: "unknown",
      approvalLabel: "unknown"
    };
  }
  cachedStatus = {
    at: now,
    value
  };
  return value;
}
function buildSubagentPermissionStatusMessage(status) {
  if (status.state === "ready") {
    return [
      "Subagent permission: ready",
      "",
      `Device approval: ${status.approvalLabel}`,
      "",
      `Scopes: ${status.scopes.join(", ") || "(none)"}`,
      "",
      "Current local gateway device already includes `operator.admin`."
    ].join("\n");
  }
  if (status.state === "pending_approval") {
    const fallbackCommand = buildDirectApprovalFallbackCommand({
      requestId: status.requestId,
      deviceId: status.deviceId
    });
    return [
      "Subagent permission: action required",
      "",
      `Device approval: ${status.approvalLabel}`,
      "",
      "A local gateway repair request is waiting for `operator.admin` approval.",
      "",
      "```bash",
      status.approvalCommand,
      "```",
      "",
      "Fallback direct command:",
      "",
      "```bash",
      fallbackCommand,
      "```",
      "",
      "Run the command, then resend your last message."
    ].join("\n");
  }
  if (status.state === "degraded") {
    return [
      "Subagent permission: limited",
      "",
      `Device approval: ${status.approvalLabel}`,
      "",
      `Current local gateway device scopes: ${status.scopes.join(", ") || "(none)"}`,
      "",
      "Trigger the subagent action again if needed, then recover with:",
      "",
      "```bash",
      "openclaw gochat approve-local-repair",
      "```"
    ].join("\n");
  }
  return [
    "Subagent permission: unknown",
    "",
    `Device approval: ${status.approvalLabel}`,
    "",
    "The plugin could not inspect local gateway pairing status right now."
  ].join("\n");
}
function buildSubagentPermissionMetadata(status) {
  const metadata = {
    subagentPermissionState: status.state,
    subagentPermissionSummary: status.summary,
    subagentDeviceApprovalState: status.approvalState,
    subagentDeviceApprovalLabel: status.approvalLabel
  };
  if ("deviceId" in status && status.deviceId) {
    metadata.subagentDeviceId = status.deviceId;
  }
  if ("requestId" in status && status.requestId) {
    metadata.subagentRepairRequestId = status.requestId;
  }
  if ("approvalCommand" in status && status.approvalCommand) {
    metadata.subagentApprovalCommand = status.approvalCommand;
  }
  if ("scopes" in status && status.scopes?.length) {
    metadata.subagentScopes = status.scopes.join(", ");
  }
  return metadata;
}

// src/inbound.ts
var CHANNEL_ID = "gochat";
var execFileAsync2 = promisify2(execFile2);
var LOCAL_AUDIO_SKILL_NAME = "gochat-local-audio-notes";
var DEFAULT_MAX_TRANSCRIPT_CHARS = 12e3;
var conversationPermissionAnnouncements = /* @__PURE__ */ new Map();
function normalizeHost(value) {
  const host = String(value ?? "").trim().toLowerCase();
  return host ? host : null;
}
function tryParseUrl(value) {
  try {
    return new URL(value);
  } catch {
    return null;
  }
}
function resolveTrustedAttachmentHosts(account) {
  const hosts = /* @__PURE__ */ new Set();
  const relayUrl = tryParseUrl(account.relayPlatformUrl);
  const relayHost = normalizeHost(relayUrl?.hostname);
  if (relayHost) {
    hosts.add(relayHost);
  }
  for (const host of account.config.trustedAttachmentHosts ?? []) {
    const normalized = normalizeHost(host);
    if (normalized) {
      hosts.add(normalized);
    }
  }
  return hosts;
}
function resolveLocalAudioScriptCandidates() {
  const currentDir = dirname(fileURLToPath(import.meta.url));
  const repoBundled = resolve(
    currentDir,
    "../skills/gochat-local-audio-notes/scripts/transcribe_audio.py"
  );
  const homeBundled = resolve(
    process.env.OPENCLAW_STATE_DIR || resolve(process.env.HOME || "~", ".openclaw"),
    "skills/gochat-local-audio-notes/scripts/transcribe_audio.py"
  );
  return [homeBundled, repoBundled];
}
function clipTranscript(text, maxChars) {
  if (text.length <= maxChars) {
    return text;
  }
  return `${text.slice(0, Math.max(0, maxChars)).trim()}
...[transcript truncated]`;
}
function isGatewayPairingRequiredError(error) {
  const message = error instanceof Error ? error.message : String(error ?? "");
  return /pairing required/i.test(message) || /GatewayClientRequestError/i.test(message);
}
async function maybePushSubagentPermissionStatus(params) {
  const status = await inspectSubagentPermissionStatus();
  const conversationKey = `${params.accountId}:${params.conversationId}`;
  const previousSignature = conversationPermissionAnnouncements.get(conversationKey);
  if (previousSignature === status.detailSignature) {
    return status;
  }
  conversationPermissionAnnouncements.set(conversationKey, status.detailSignature);
  if (status.state === "unknown") {
    return status;
  }
  try {
    await sendMessageGoChat(params.conversationId, buildSubagentPermissionStatusMessage(status), {
      accountId: params.accountId
    });
    params.statusSink?.({ lastOutboundAt: Date.now() });
  } catch {
    params.runtime.error?.("gochat: failed to push subagent permission status");
  }
  return status;
}
function buildAudioTranscriptContext(transcripts) {
  if (!transcripts.length) {
    return "";
  }
  return transcripts.map((entry, index) => {
    const label = entry.attachmentName || `audio-${index + 1}`;
    const meta2 = [
      `engine=${entry.engine}`,
      `model=${entry.model}`,
      entry.language ? `language=${entry.language}` : ""
    ].filter(Boolean).join(" ");
    return [
      `Local audio transcript for ${label}${meta2 ? ` (${meta2})` : ""}:`,
      entry.text
    ].filter(Boolean).join("\n");
  }).join("\n\n");
}
async function resolveLocalAudioTranscripts(params) {
  const { mediaList, account, logger } = params;
  const settings = account.config.localAudioTranscription;
  if (settings?.enabled === false) {
    return [];
  }
  const audioMedia = mediaList.filter((item) => item.kind === "audio");
  if (!audioMedia.length) {
    return [];
  }
  const finalScriptPath = resolveLocalAudioScriptCandidates().find((candidate) => existsSync(candidate)) ?? null;
  if (!finalScriptPath) {
    logger.warn("[gochat] local audio transcription script not found");
    return [];
  }
  const maxChars = settings?.maxTranscriptChars ?? DEFAULT_MAX_TRANSCRIPT_CHARS;
  const results = [];
  for (const media of audioMedia) {
    const args = [
      finalScriptPath,
      media.path,
      "--engine",
      settings?.engine ?? "auto",
      "--model",
      settings?.model ?? process.env.GOCHAT_AUDIO_MODEL ?? "base",
      "--task",
      settings?.task ?? "transcribe",
      "--device",
      settings?.device ?? process.env.GOCHAT_AUDIO_DEVICE ?? "auto",
      "--compute-type",
      settings?.computeType ?? process.env.GOCHAT_AUDIO_COMPUTE_TYPE ?? "auto",
      "--beam-size",
      String(settings?.beamSize ?? Number(process.env.GOCHAT_AUDIO_BEAM_SIZE || 5)),
      "--output-format",
      "json"
    ];
    if (settings?.language) {
      args.push("--language", settings.language);
    }
    if (settings?.wordTimestamps) {
      args.push("--word-timestamps");
    }
    try {
      const { stdout } = await execFileAsync2("python3", args, {
        timeout: 15 * 60 * 1e3,
        maxBuffer: 20 * 1024 * 1024
      });
      const parsed = JSON.parse(stdout);
      const transcriptText = clipTranscript(String(parsed.text ?? "").trim(), maxChars);
      if (!transcriptText) {
        continue;
      }
      results.push({
        attachmentName: media.name,
        path: media.path,
        engine: String(parsed.engine ?? settings?.engine ?? "auto"),
        model: String(parsed.model ?? settings?.model ?? "base"),
        language: parsed.language ? String(parsed.language) : void 0,
        text: transcriptText
      });
    } catch (err) {
      logger.warn(
        `[gochat] local audio transcription failed for ${media.path}: ${err instanceof Error ? err.message : String(err)}`
      );
    }
  }
  return results;
}
function shouldBypassRemoteMediaSsrf(params) {
  const parsed = tryParseUrl(params.url);
  if (!parsed) {
    return false;
  }
  if (parsed.protocol !== "https:" && parsed.protocol !== "http:") {
    return false;
  }
  return params.trustedHosts.has(parsed.hostname.trim().toLowerCase());
}
async function fetchTrustedRemoteMedia(params) {
  const redirectCount = params.redirectCount ?? 0;
  if (redirectCount > 5) {
    throw new Error("too many redirects");
  }
  const parsed = tryParseUrl(params.url);
  if (!parsed) {
    throw new Error("invalid attachment URL");
  }
  if (!params.trustedHosts.has(parsed.hostname.trim().toLowerCase())) {
    throw new Error(`attachment host is not trusted: ${parsed.hostname}`);
  }
  const response = await fetch(parsed, {
    redirect: "manual",
    signal: AbortSignal.timeout(15e3)
  });
  if (response.status >= 300 && response.status < 400) {
    const location = response.headers.get("location");
    if (!location) {
      throw new Error(`redirect (${response.status}) without location`);
    }
    const nextUrl = new URL(location, parsed).toString();
    return await fetchTrustedRemoteMedia({
      ...params,
      url: nextUrl,
      redirectCount: redirectCount + 1
    });
  }
  if (!response.ok) {
    throw new Error(`download failed (${response.status})`);
  }
  const arrayBuffer = await response.arrayBuffer();
  return {
    buffer: Buffer.from(arrayBuffer),
    contentType: response.headers.get("content-type") ?? void 0
  };
}
async function resolveGoChatMedia(attachments, account) {
  const core = getGoChatRuntime();
  const results = [];
  const logger = core.logging.getChildLogger({ channel: "gochat" });
  const trustedHosts = resolveTrustedAttachmentHosts(account);
  for (const attachment of attachments) {
    if (!attachment.url) {
      continue;
    }
    try {
      const fetchResult = shouldBypassRemoteMediaSsrf({
        url: attachment.url,
        trustedHosts
      }) ? await fetchTrustedRemoteMedia({
        url: attachment.url,
        trustedHosts,
        logger
      }) : await core.channel.media.fetchRemoteMedia({
        url: attachment.url,
        ssrfPolicy: account.config.allowPrivateNetwork ? { allowPrivateNetwork: true } : void 0
      });
      if (!fetchResult || !fetchResult.buffer) {
        continue;
      }
      const saved = await core.channel.media.saveMediaBuffer(
        fetchResult.buffer,
        fetchResult.contentType ?? attachment.mimeType ?? "application/octet-stream",
        "inbound"
      );
      if (saved) {
        const contentType = fetchResult.contentType ?? attachment.mimeType ?? "application/octet-stream";
        const kind = classifyMediaKind(contentType);
        results.push({
          path: saved.path,
          contentType,
          kind,
          name: attachment.name
        });
      }
    } catch (err) {
      logger.warn(
        `[gochat] failed to fetch media ${attachment.url}: ${err instanceof Error ? err.message : String(err)}`
      );
    }
  }
  return results;
}
function classifyMediaKind(mimeType) {
  const lower = mimeType.toLowerCase();
  if (lower.startsWith("image/")) {
    return "image";
  }
  if (lower.startsWith("audio/")) {
    return "audio";
  }
  if (lower.startsWith("video/")) {
    return "video";
  }
  return "document";
}
function buildMediaPlaceholder(mediaList) {
  if (mediaList.length === 0) {
    return "";
  }
  const counts = {};
  for (const m of mediaList) {
    const label = m.kind === "unknown" ? "file" : m.kind;
    counts[label] = (counts[label] ?? 0) + 1;
  }
  const parts = Object.entries(counts).map(
    ([kind, count]) => count === 1 ? `<media:${kind}>` : `<media:${kind}> (${count} files)`
  );
  return parts.join(" ");
}
async function deliverGoChatReply(params) {
  const { payload, conversationId, accountId, statusSink } = params;
  await deliverFormattedTextWithAttachments({
    payload,
    send: async ({ text, replyToId }) => {
      await sendMessageGoChat(conversationId, text, {
        accountId,
        replyTo: replyToId
      });
      statusSink?.({ lastOutboundAt: Date.now() });
    }
  });
}
async function handleGoChatInbound(params) {
  const { message, account, config, runtime, statusSink } = params;
  const core = getGoChatRuntime();
  const pairing = createChannelPairingController({
    core,
    channel: CHANNEL_ID,
    accountId: account.accountId
  });
  const rawBody = message.text?.trim() ?? "";
  const attachments = message.attachments ?? [];
  const hasAttachments = attachments.length > 0;
  if (!rawBody && !hasAttachments) {
    return;
  }
  const senderId = message.senderId;
  const senderName = message.senderName;
  const conversationId = message.conversationId;
  const conversationName = message.conversationName;
  const isGroup = message.isGroupChat;
  statusSink?.({ lastInboundAt: message.timestamp });
  const dmPolicy = account.config.dmPolicy ?? "pairing";
  const defaultGroupPolicy = resolveDefaultGroupPolicy(config);
  const { groupPolicy, providerMissingFallbackApplied } = resolveAllowlistProviderRuntimeGroupPolicy({
    providerConfigPresent: (config.channels?.gochat ?? void 0) !== void 0,
    groupPolicy: account.config.groupPolicy,
    defaultGroupPolicy
  });
  warnMissingProviderGroupPolicyFallbackOnce({
    providerMissingFallbackApplied,
    providerKey: "gochat",
    accountId: account.accountId,
    blockedLabel: GROUP_POLICY_BLOCKED_LABEL.room,
    log: (msg) => runtime.log?.(msg)
  });
  const configAllowFrom = (account.config.allowFrom ?? []).map(
    (v) => String(v).trim().toLowerCase()
  );
  const configGroupAllowFrom = (account.config.groupAllowFrom ?? []).map(
    (v) => String(v).trim().toLowerCase()
  );
  const storeAllowFrom = await readStoreAllowFromForDmPolicy({
    provider: CHANNEL_ID,
    accountId: account.accountId,
    dmPolicy,
    readStore: pairing.readStoreForDmPolicy
  });
  const storeAllowList = (storeAllowFrom ?? []).map((v) => String(v).trim().toLowerCase());
  const convMatch = resolveGoChatConversationMatch({
    conversations: account.config.conversations,
    conversationId
  });
  const convConfig = convMatch.conversationConfig;
  if (isGroup && !convMatch.allowed) {
    runtime.log?.(`gochat: drop conversation ${conversationId} (not allowlisted)`);
    return;
  }
  if (convConfig?.enabled === false) {
    runtime.log?.(`gochat: drop conversation ${conversationId} (disabled)`);
    return;
  }
  const convAllowFrom = (convConfig?.allowFrom ?? []).map(
    (v) => String(v).trim().toLowerCase()
  );
  const allowTextCommands = core.channel.commands.shouldHandleTextCommands({
    cfg: config,
    surface: CHANNEL_ID
  });
  const useAccessGroups = config.commands?.useAccessGroups !== false;
  const hasControlCommand = core.channel.text.hasControlCommand(rawBody, config);
  const normalizeSenderId = (id) => id.trim().toLowerCase().replace(/^gochat:/i, "");
  const access = resolveDmGroupAccessWithCommandGate({
    isGroup,
    dmPolicy,
    groupPolicy,
    allowFrom: configAllowFrom,
    groupAllowFrom: configGroupAllowFrom,
    storeAllowFrom: storeAllowList,
    isSenderAllowed: (allowFrom) => resolveGoChatAllowlistMatch({ allowFrom, senderId }).allowed,
    command: {
      useAccessGroups,
      allowTextCommands,
      hasControlCommand
    }
  });
  const agentModeTrusted = account.mode === "agent";
  const commandAuthorized = agentModeTrusted ? true : access.commandAuthorized;
  const effectiveGroupAllowFrom = access.effectiveGroupAllowFrom;
  if (isGroup) {
    if (!agentModeTrusted && access.decision !== "allow") {
      runtime.log?.(`gochat: drop group sender ${senderId} (reason=${access.reason})`);
      return;
    }
  } else {
    if (!agentModeTrusted && access.decision !== "allow") {
      if (access.decision === "pairing") {
        await pairing.issueChallenge({
          senderId,
          senderIdLine: `Your user id: ${senderId}`,
          meta: { name: senderName || void 0 },
          sendPairingReply: async (text) => {
            await sendMessageGoChat(conversationId, text, { accountId: account.accountId });
            statusSink?.({ lastOutboundAt: Date.now() });
          },
          onReplyError: (err) => {
            runtime.error?.(`gochat: pairing reply failed for ${senderId}: ${String(err)}`);
          }
        });
      }
      runtime.log?.(`gochat: drop DM sender ${senderId} (reason=${access.reason})`);
      return;
    }
  }
  if (!agentModeTrusted && access.shouldBlockControlCommand) {
    logInboundDrop({
      log: (msg) => runtime.log?.(msg),
      channel: CHANNEL_ID,
      reason: "control command (unauthorized)",
      target: senderId
    });
    return;
  }
  const mentionRegexes = core.channel.mentions.buildMentionRegexes(config);
  const wasMentioned = mentionRegexes.length ? core.channel.mentions.matchesMentionPatterns(rawBody, mentionRegexes) : false;
  const shouldRequireMention = isGroup ? convConfig?.requireMention ?? true : false;
  if (isGroup && shouldRequireMention && !wasMentioned && !hasControlCommand) {
    runtime.log?.(`gochat: drop conversation ${conversationId} (no mention)`);
    return;
  }
  const route = core.channel.routing.resolveAgentRoute({
    cfg: config,
    channel: CHANNEL_ID,
    accountId: account.accountId,
    peer: {
      kind: isGroup ? "group" : "direct",
      id: isGroup ? conversationId : senderId
    }
  });
  const fromLabel = isGroup ? `conv:${conversationName || conversationId}` : senderName || `user:${senderId}`;
  const storePath = core.channel.session.resolveStorePath(
    config.session?.store,
    {
      agentId: route.agentId
    }
  );
  const envelopeOptions = core.channel.reply.resolveEnvelopeFormatOptions(config);
  const previousTimestamp = core.channel.session.readSessionUpdatedAt({
    storePath,
    sessionKey: route.sessionKey
  });
  const mediaList = hasAttachments ? await resolveGoChatMedia(message.attachments, account) : [];
  const logger = core.logging.getChildLogger({ channel: "gochat", accountId: account.accountId });
  const audioTranscripts = mediaList.length ? await resolveLocalAudioTranscripts({
    mediaList,
    account,
    logger
  }) : [];
  const mediaPlaceholder = buildMediaPlaceholder(mediaList);
  const audioTranscriptContext = buildAudioTranscriptContext(audioTranscripts);
  const bodyText = [rawBody, mediaPlaceholder, audioTranscriptContext].filter(Boolean).join("\n\n").trim();
  const currentPermissionStatus = account.mode === "agent" ? {
    state: "unknown",
    summary: "Subagent permission status is not used for ClawTile agent mode.",
    detailSignature: "agent-mode",
    approvalState: "unknown",
    approvalLabel: "agent-mode"
  } : await maybePushSubagentPermissionStatus({
    conversationId,
    accountId: account.accountId,
    statusSink,
    runtime
  });
  const body = core.channel.reply.formatAgentEnvelope({
    channel: "GoChat",
    from: fromLabel,
    timestamp: message.timestamp,
    previousTimestamp,
    envelope: envelopeOptions,
    body: bodyText
  });
  const convSystemPrompt = convConfig?.systemPrompt?.trim() || void 0;
  const mediaPayload = buildAgentMediaPayload(mediaList);
  const ctxPayload = core.channel.reply.finalizeInboundContext({
    Body: body,
    BodyForAgent: bodyText,
    RawBody: rawBody,
    CommandBody: rawBody,
    From: isGroup ? `gochat:conv:${conversationId}` : `gochat:${senderId}`,
    To: `gochat:${conversationId}`,
    SessionKey: route.sessionKey,
    AccountId: route.accountId,
    ChatType: isGroup ? "group" : "direct",
    ConversationLabel: fromLabel,
    SenderName: senderName || void 0,
    SenderId: senderId,
    GroupSubject: isGroup ? conversationName || conversationId : void 0,
    GroupSystemPrompt: isGroup ? convSystemPrompt : void 0,
    Provider: CHANNEL_ID,
    Surface: CHANNEL_ID,
    WasMentioned: isGroup ? wasMentioned : void 0,
    MessageSid: message.messageId,
    Timestamp: message.timestamp,
    OriginatingChannel: CHANNEL_ID,
    OriginatingTo: `gochat:${conversationId}`,
    CommandAuthorized: commandAuthorized,
    ...mediaPayload
  });
  console.log(`[gochat:inbound] Received message ${message.messageId} from ${senderId} in conversation ${conversationId}`);
  try {
    await dispatchInboundReplyWithBase({
      cfg: config,
      channel: CHANNEL_ID,
      accountId: account.accountId,
      route,
      storePath,
      ctxPayload,
      core,
      deliver: async (payload) => {
        await deliverGoChatReply({
          payload,
          conversationId,
          accountId: account.accountId,
          statusSink
        });
      },
      onRecordError: (err) => {
        runtime.error?.(`gochat: failed updating session meta: ${String(err)}`);
      },
      onDispatchError: (err, info) => {
        runtime.error?.(`gochat ${info.kind} reply failed: ${String(err)}`);
      },
      replyOptions: {
        skillFilter: mediaList.some((item) => item.kind === "audio") ? Array.from(/* @__PURE__ */ new Set([...convConfig?.skills ?? [], LOCAL_AUDIO_SKILL_NAME])) : convConfig?.skills,
        disableBlockStreaming: typeof account.config.blockStreaming === "boolean" ? !account.config.blockStreaming : void 0
      }
    });
  } catch (error) {
    if (!isGatewayPairingRequiredError(error)) {
      throw error;
    }
    runtime.error?.(`gochat: gateway pairing required: ${error instanceof Error ? error.message : String(error)}`);
    try {
      const latestPermissionStatus = currentPermissionStatus.state === "pending_approval" ? currentPermissionStatus : await inspectSubagentPermissionStatus({ forceRefresh: true });
      if (currentPermissionStatus.state === "pending_approval" && latestPermissionStatus.state === "pending_approval" && currentPermissionStatus.detailSignature === latestPermissionStatus.detailSignature) {
        return;
      }
      await sendMessageGoChat(conversationId, buildSubagentPermissionStatusMessage(latestPermissionStatus), {
        accountId: account.accountId
      });
      statusSink?.({ lastOutboundAt: Date.now() });
      return;
    } catch (replyError) {
      runtime.error?.(`gochat: failed to send pairing-required reply: ${String(replyError)}`);
      throw error;
    }
  }
}

// src/gochat/agent-monitor.ts
var INITIAL_BACKOFF_MS = 1e3;
var MAX_BACKOFF_MS = 3e4;
function sleep(ms, signal) {
  return new Promise((resolve3, reject) => {
    if (signal?.aborted) {
      reject(new Error("aborted"));
      return;
    }
    const timer = setTimeout(resolve3, ms);
    signal?.addEventListener(
      "abort",
      () => {
        clearTimeout(timer);
        reject(new Error("aborted"));
      },
      { once: true }
    );
  });
}
function parseSseChunk(buffer) {
  const events = [];
  const parts = buffer.split(/\r?\n\r?\n/);
  const rest = parts.pop() ?? "";
  for (const part of parts) {
    const lines = part.split(/\r?\n/);
    let event = "message";
    let id = "";
    const dataLines = [];
    for (const line of lines) {
      if (!line || line.startsWith(":")) {
        continue;
      }
      if (line.startsWith("event:")) {
        event = line.slice("event:".length).trim();
      } else if (line.startsWith("id:")) {
        id = line.slice("id:".length).trim();
      } else if (line.startsWith("data:")) {
        dataLines.push(line.slice("data:".length).trimStart());
      }
    }
    const rawData = dataLines.join("\n").trim();
    let data;
    if (rawData) {
      try {
        data = JSON.parse(rawData);
      } catch {
        data = { raw: rawData };
      }
    }
    events.push({ event, id: id || void 0, data });
  }
  return { events, rest };
}
function firstString(...values) {
  for (const value of values) {
    const text = String(value ?? "").trim();
    if (text) {
      return text;
    }
  }
  return "";
}
function buildRecordingPrompt(params) {
  return [
    `\u8BF7\u4E3A ClawTile \u5F55\u97F3\u751F\u6210\u4E00\u4EFD\u4E2D\u6587\u7EAA\u8981\u3002`,
    ``,
    `\u5F55\u97F3 ID: ${params.recordingId}`,
    `\u6807\u9898: ${params.title || "\u672A\u547D\u540D\u5F55\u97F3"}`,
    ``,
    `\u8981\u6C42\uFF1A`,
    `- \u8F93\u51FA\u53EF\u4EE5\u76F4\u63A5\u4F5C\u4E3A\u4F1A\u8BAE/\u5F55\u97F3\u7EAA\u8981\u4FDD\u5B58\uFF0C\u4E0D\u8981\u89E3\u91CA\u4F60\u7684\u5DE5\u4F5C\u8FC7\u7A0B\u3002`,
    `- \u4F18\u5148\u5305\u542B\uFF1A\u6838\u5FC3\u7ED3\u8BBA\u3001\u5173\u952E\u8BA8\u8BBA\u3001\u5F85\u529E\u4E8B\u9879\u3002`,
    `- \u5982\u679C\u5185\u5BB9\u4E0D\u662F\u4F1A\u8BAE\uFF0C\u4E5F\u6309\u5185\u5BB9\u6574\u7406\u6210\u6E05\u6670\u6458\u8981\u3002`,
    ``,
    `\u8F6C\u5199\u6B63\u6587\uFF1A`,
    params.transcriptText || "(\u65E0\u8F6C\u5199\u6B63\u6587)"
  ].join("\n");
}
async function monitorGoChatAgentProvider(opts = {}) {
  const core = getGoChatRuntime();
  let cfg = opts.config ?? core.config.loadConfig();
  let account = resolveGoChatAccount({ cfg, accountId: opts.accountId });
  const runtime = resolveLoggerBackedRuntime(
    opts.runtime,
    core.logging.getChildLogger()
  );
  const logger = core.logging.getChildLogger({
    channel: "gochat",
    accountId: account.accountId,
    mode: "agent"
  });
  const controller = new AbortController();
  const externalSignal = opts.abortSignal;
  const stop = () => {
    controller.abort();
    setRelayStatusReporter(null);
  };
  externalSignal?.addEventListener("abort", stop, { once: true });
  if (!account.secret) {
    throw new Error(`GoChat agent token not configured for account "${account.accountId}"`);
  }
  setRelayStatusReporter((status) => {
    if (status === "error") {
      logger.warn(`[gochat:${account.accountId}] agent status=error`);
    }
  });
  const handleDeviceMessage = async (ev) => {
    const data = ev.data ?? {};
    const turnId = firstString(data.turn_id, ev.id);
    const text = firstString(data.text);
    const sessionId = firstString(data.session_id) || firstString(data.device_id) || "device";
    if (!turnId || !text) {
      return;
    }
    opts.statusSink?.({ lastInboundAt: Date.now() });
    recordDeviceTurn(sessionId, turnId);
    logger.info(`[gochat:${account.accountId}] device.message turn=${turnId} session=${sessionId}`);
    const message = {
      messageId: `device.message:${turnId}`,
      conversationId: deviceConversationId(sessionId),
      conversationName: "ClawTile \u5BF9\u8BDD",
      senderId: "clawtile-device",
      senderName: "ClawTile",
      text,
      attachments: [],
      timestamp: Date.now(),
      isGroupChat: false
    };
    try {
      await handleGoChatInbound({ message, account, config: cfg, runtime, statusSink: opts.statusSink });
    } catch (error) {
      logger.warn(
        `[gochat:${account.accountId}] device.message failed turn=${turnId}: ${error instanceof Error ? error.message : String(error)}`
      );
      await failDeviceTurn(account, sessionId, turnId, error instanceof Error ? error.message : String(error));
    }
  };
  const handleEvent = async (ev) => {
    if (ev.event === "connection.ack" || ev.event === "message") {
      return;
    }
    if (ev.event === "device.message") {
      await handleDeviceMessage(ev);
      return;
    }
    if (ev.event === "device.stop") {
      const data = ev.data ?? {};
      const sessionId = firstString(data.session_id) || firstString(data.device_id);
      const turnId = firstString(data.turn_id);
      if (sessionId) {
        clearDeviceTurn(sessionId, turnId);
      }
      return;
    }
    if (ev.event !== "recording.transcribed" && ev.event !== "recording.summary_requested") {
      return;
    }
    const recordingId = firstString(ev.data?.recording_id, ev.id);
    if (!recordingId) {
      return;
    }
    opts.statusSink?.({ lastInboundAt: Date.now() });
    logger.info(`[gochat:${account.accountId}] agent event ${ev.event}: recording=${recordingId}`);
    try {
      await markAgentRecordingState(account, recordingId, "dispatched").catch(() => void 0);
      const transcript = await getAgentTranscript(account, recordingId);
      const title = firstString(ev.data?.title, recordingId);
      const prompt = buildRecordingPrompt({
        recordingId,
        title,
        transcriptText: firstString(transcript.text)
      });
      const message = {
        messageId: `${ev.event}:${recordingId}:${Date.now()}`,
        conversationId: `agent-recording:${recordingId}`,
        conversationName: title || recordingId,
        senderId: "clawtile-agent",
        senderName: "ClawTile",
        text: prompt,
        attachments: [],
        timestamp: Date.now(),
        isGroupChat: false
      };
      await handleGoChatInbound({
        message,
        account,
        config: cfg,
        runtime,
        statusSink: opts.statusSink
      });
    } catch (error) {
      await markAgentRecordingState(account, recordingId, "failed").catch(() => void 0);
      logger.warn(
        `[gochat:${account.accountId}] agent event failed recording=${recordingId}: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  };
  const reconcilePendingRecordings = async () => {
    const data = await agentFetchJson(
      account,
      "/recordings?summary_state=none&status=completed&limit=20"
    );
    for (const rec of data.recordings ?? []) {
      if (!rec.id) {
        continue;
      }
      void handleEvent({
        event: "recording.transcribed",
        id: rec.id,
        data: {
          recording_id: rec.id,
          title: rec.title
        }
      });
    }
  };
  void (async () => {
    let backoff = INITIAL_BACKOFF_MS;
    while (!controller.signal.aborted && !externalSignal?.aborted) {
      try {
        cfg = opts.config ?? core.config.loadConfig();
        account = resolveGoChatAccount({ cfg, accountId: opts.accountId });
        if (!account.secret) {
          throw new Error(`GoChat agent token not configured for account "${account.accountId}"`);
        }
        await agentFetchJson(account, "/me");
        await reconcilePendingRecordings().catch((error) => {
          logger.warn(
            `[gochat:${account.accountId}] agent pending recording reconciliation failed: ${error instanceof Error ? error.message : String(error)}`
          );
        });
        const resp = await fetch(`${agentRestBase(account.agentServerUrl)}/events`, {
          headers: { Authorization: `Bearer ${account.secret}` },
          signal: controller.signal
        });
        if (!resp.ok || !resp.body) {
          throw new Error(`SSE connect failed: HTTP ${resp.status}`);
        }
        logger.info(`[gochat:${account.accountId}] agent SSE connected to ${account.agentServerUrl}`);
        backoff = INITIAL_BACKOFF_MS;
        const reader = resp.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";
        for (; ; ) {
          const { value, done } = await reader.read();
          if (done || controller.signal.aborted || externalSignal?.aborted) {
            break;
          }
          buffer += decoder.decode(value, { stream: true });
          const parsed = parseSseChunk(buffer);
          buffer = parsed.rest;
          for (const ev of parsed.events) {
            void handleEvent(ev);
          }
        }
        if (!controller.signal.aborted && !externalSignal?.aborted) {
          throw new Error("SSE connection closed");
        }
      } catch (error) {
        if (controller.signal.aborted || externalSignal?.aborted) {
          return;
        }
        logger.warn(
          `[gochat:${account.accountId}] agent SSE error: ${error instanceof Error ? error.message : String(error)}; retrying in ${backoff}ms`
        );
        await sleep(backoff, controller.signal).catch(() => void 0);
        backoff = Math.min(backoff * 2, MAX_BACKOFF_MS);
      }
    }
  })();
  return { stop };
}

// src/gochat/monitor.ts
import {
  resolveLoggerBackedRuntime as resolveLoggerBackedRuntime2
} from "openclaw/plugin-sdk/extension-shared";

// src/openclaw-runtime-snapshot.ts
import { execFile as execFile3 } from "node:child_process";
import { homedir } from "node:os";
import { join } from "node:path";
import { promisify as promisify3 } from "node:util";
var execFileAsync3 = promisify3(execFile3);
var CACHE_TTL_MS2 = 1e4;
var DEFAULT_ACTIVE_MINUTES = 120;
var DEFAULT_LIMIT = 120;
var OPENCLAW_COMMAND_TIMEOUT_MS = 6e4;
var cachedSnapshot = null;
var runtimeLogger = null;
function emitRuntimeLog(level, message) {
  runtimeLogger?.(level, message);
}
function formatCommand(args) {
  return [resolveOpenClawBin(), ...args].join(" ");
}
function setOpenClawRuntimeSnapshotLogger(logger) {
  runtimeLogger = logger;
}
function extractJsonPayload2(raw) {
  const text = raw.trim();
  if (!text) {
    throw new Error("empty command output");
  }
  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    if (char !== "{" && char !== "[") {
      continue;
    }
    const candidate = text.slice(index).trim();
    try {
      return JSON.parse(candidate);
    } catch {
    }
  }
  throw new Error("json payload not found in command output");
}
function deriveAgentIdFromSessionKey(key) {
  const text = String(key ?? "").trim();
  if (!text) {
    return "";
  }
  const parts = text.split(":");
  if (parts.length >= 2 && parts[0] === "agent") {
    return parts[1] ?? "";
  }
  return "";
}
function resolveOpenClawBin() {
  return process.env.GOCHAT_OPENCLAW_BIN?.trim() || "openclaw";
}
function resolveStateDir() {
  const explicit = process.env.OPENCLAW_STATE_DIR?.trim();
  if (explicit) {
    return explicit;
  }
  return join(homedir(), ".openclaw");
}
async function runOpenClawJson(args) {
  const command = formatCommand(args);
  const startedAt = Date.now();
  emitRuntimeLog("info", `[gochat:runtime] openclaw exec start: ${command}`);
  try {
    const { stdout, stderr } = await execFileAsync3(resolveOpenClawBin(), args, {
      timeout: OPENCLAW_COMMAND_TIMEOUT_MS,
      maxBuffer: 4 * 1024 * 1024
    });
    emitRuntimeLog(
      "info",
      `[gochat:runtime] openclaw exec ok: ${command} durationMs=${Date.now() - startedAt}`
    );
    return extractJsonPayload2([stdout, stderr].filter(Boolean).join("\n"));
  } catch (error) {
    const formatted = formatExecError(error);
    emitRuntimeLog(
      "warn",
      `[gochat:runtime] openclaw exec failed: ${command} durationMs=${Date.now() - startedAt} error=${formatted.message}`
    );
    throw formatted;
  }
}
function formatExecError(error) {
  if (!(error instanceof Error)) {
    return new Error(String(error));
  }
  const details = [];
  const stderr = String(error.stderr ?? "").trim();
  const stdout = String(error.stdout ?? "").trim();
  const code = error.code;
  const signal = error.signal;
  if (code !== void 0 && code !== null && String(code).trim()) {
    details.push(`code=${String(code).trim()}`);
  }
  if (signal !== void 0 && signal !== null && String(signal).trim()) {
    details.push(`signal=${String(signal).trim()}`);
  }
  if (stderr) {
    details.push(`stderr=${stderr}`);
  } else if (stdout) {
    details.push(`stdout=${stdout}`);
  }
  const suffix = details.length ? ` (${details.join("; ")})` : "";
  return new Error(`${error.message}${suffix}`);
}
function normalizeSessionSnapshot(list, defaultAgentId) {
  const now = typeof list.ts === "number" ? list.ts : Date.now();
  const sessions = Array.isArray(list.sessions) ? list.sessions : [];
  return {
    sourceMethod: "plugin.gateway.call sessions.list",
    stateDir: resolveStateDir(),
    path: String(list.path ?? "(multiple)").trim() || "(multiple)",
    defaultAgentId: defaultAgentId || void 0,
    defaultModelProvider: String(list.defaults?.modelProvider ?? "").trim() || void 0,
    defaultModel: String(list.defaults?.model ?? "").trim() || void 0,
    defaultContextTokens: Number.isFinite(list.defaults?.contextTokens) ? Number(list.defaults?.contextTokens) : void 0,
    count: Number.isFinite(list.count) ? Number(list.count) : sessions.length,
    sessions: sessions.map((session) => {
      const updatedAt = Number.isFinite(session.updatedAt) ? Number(session.updatedAt) : 0;
      const ageMs = updatedAt > 0 ? Math.max(0, now - updatedAt) : 0;
      return {
        key: String(session.key ?? "").trim(),
        agentId: deriveAgentIdFromSessionKey(session.key),
        sessionId: String(session.sessionId ?? "").trim(),
        kind: String(session.kind ?? "").trim(),
        displayName: String(session.displayName ?? "").trim(),
        status: String(session.status ?? "").trim(),
        model: String(session.model ?? "").trim(),
        modelProvider: String(session.modelProvider ?? "").trim(),
        chatType: String(session.chatType ?? "").trim(),
        updatedAt,
        startedAt: Number.isFinite(session.startedAt) ? Number(session.startedAt) : 0,
        endedAt: Number.isFinite(session.endedAt) ? Number(session.endedAt) : 0,
        runtimeMs: Number.isFinite(session.runtimeMs) ? Number(session.runtimeMs) : 0,
        ageMs,
        systemSent: session.systemSent === true,
        abortedLastRun: session.abortedLastRun === true,
        inputTokens: Number.isFinite(session.inputTokens) ? Number(session.inputTokens) : 0,
        outputTokens: Number.isFinite(session.outputTokens) ? Number(session.outputTokens) : 0,
        totalTokens: Number.isFinite(session.totalTokens) ? Number(session.totalTokens) : 0
      };
    })
  };
}
async function loadDefaultAgentId() {
  try {
    const payload = await runOpenClawJson(["gateway", "call", "health", "--json"]);
    const health = payload;
    return String(health.defaultAgentId ?? "").trim();
  } catch {
    return "";
  }
}
async function buildOpenClawRuntimeMetadata() {
  const metadata = {};
  try {
    const payload = await runOpenClawJson([
      "gateway",
      "call",
      "sessions.list",
      "--json",
      "--params",
      JSON.stringify({
        activeMinutes: DEFAULT_ACTIVE_MINUTES,
        limit: DEFAULT_LIMIT,
        includeGlobal: true,
        includeUnknown: true
      })
    ]);
    const list = payload;
    const defaultAgentId = await loadDefaultAgentId();
    const snapshot = normalizeSessionSnapshot(list, defaultAgentId);
    metadata.openclawSessionsSource = snapshot.sourceMethod;
    metadata.openclawSessionsCount = String(snapshot.count);
    metadata.openclawSessionsJson = JSON.stringify(snapshot);
  } catch (error) {
    metadata.openclawSessionsSource = "plugin.gateway.call sessions.list";
    metadata.openclawSessionsError = error instanceof Error ? error.message : String(error);
  }
  try {
    const modelsSnapshot = await loadOpenClawModelsSnapshot();
    metadata.openclawModelsJson = JSON.stringify(modelsSnapshot);
    metadata.openclawModelsCount = String(modelsSnapshot.models.length);
  } catch (error) {
    metadata.openclawModelsError = error instanceof Error ? error.message : String(error);
  }
  return metadata;
}
async function loadOpenClawModelsSnapshot() {
  const [statusPayload, listPayload] = await Promise.all([
    runOpenClawJson(["models", "status", "--json"]),
    // Use the default list so GoChat only shows models the remote OpenClaw
    // installation currently exposes for user selection, not every possible
    // provider model visible via --all.
    runOpenClawJson(["models", "list", "--json"])
  ]);
  const status = statusPayload;
  const list = listPayload;
  const currentModel = String(status.resolvedDefault ?? status.defaultModel ?? "").trim();
  const models = (Array.isArray(list.models) ? list.models : []).filter((model) => model?.available !== false && model?.missing !== true).map((model) => {
    const key = String(model?.key ?? "").trim();
    return {
      key,
      name: String(model?.name ?? "").trim() || void 0,
      input: String(model?.input ?? "").trim() || void 0,
      contextWindow: Number.isFinite(model?.contextWindow) ? Number(model?.contextWindow) : void 0,
      available: true,
      tags: Array.isArray(model?.tags) ? model.tags.map((tag) => String(tag ?? "").trim()).filter(Boolean) : void 0,
      current: !!key && key === currentModel
    };
  }).filter((model) => !!model.key).sort((a, b) => {
    if (!!a.current !== !!b.current) {
      return a.current ? -1 : 1;
    }
    return a.key.localeCompare(b.key);
  });
  if (currentModel && !models.some((model) => model.key === currentModel)) {
    models.unshift({
      key: currentModel,
      name: currentModel,
      available: true,
      tags: ["current"],
      current: true
    });
  }
  return {
    currentModel: currentModel || void 0,
    modelSource: "plugin",
    models
  };
}
async function setOpenClawCurrentModel(model) {
  const nextModel = String(model ?? "").trim();
  if (!nextModel) {
    throw new Error("model is required");
  }
  const command = formatCommand(["models", "set", nextModel]);
  const startedAt = Date.now();
  emitRuntimeLog("info", `[gochat:runtime] model set start: ${command}`);
  try {
    await execFileAsync3(resolveOpenClawBin(), ["models", "set", nextModel], {
      timeout: OPENCLAW_COMMAND_TIMEOUT_MS,
      maxBuffer: 2 * 1024 * 1024
    });
    emitRuntimeLog(
      "info",
      `[gochat:runtime] model set ok: ${command} durationMs=${Date.now() - startedAt}`
    );
  } catch (error) {
    const formatted = formatExecError(error);
    emitRuntimeLog(
      "warn",
      `[gochat:runtime] model set failed: ${command} durationMs=${Date.now() - startedAt} error=${formatted.message}`
    );
    throw formatted;
  }
  cachedSnapshot = null;
}
async function loadOpenClawRuntimeSnapshotMetadata(params) {
  const now = Date.now();
  if (!params?.forceRefresh && cachedSnapshot && now - cachedSnapshot.at < CACHE_TTL_MS2) {
    return cachedSnapshot.metadata;
  }
  const metadata = await buildOpenClawRuntimeMetadata();
  cachedSnapshot = {
    at: now,
    metadata
  };
  return metadata;
}

// src/gochat/relay-ws.ts
import crypto2 from "node:crypto";
var MAX_BACKOFF_MS2 = 3e4;
var INITIAL_BACKOFF_MS2 = 1e3;
var PING_INTERVAL_MS = 3e4;
function computeHmacSignature(secret, channelId, ts) {
  const payload = `${ts}.${channelId}`;
  return crypto2.createHmac("sha256", secret).update(payload).digest("hex");
}
function createRelayWSConnection(opts) {
  const { platformUrl, channelId, secret, onMessage, onControlMessage, onError, abortSignal, statusProvider } = opts;
  let ws = null;
  let stopped = false;
  let backoffMs = INITIAL_BACKOFF_MS2;
  let reconnectTimer = null;
  let pingTimer = null;
  function log(level, msg) {
    const prefix = `[gochat:relay:${channelId}]`;
    if (level === "error") {
      console.error(prefix, msg);
    } else if (level === "warn") {
      console.warn(prefix, msg);
    } else {
      console.log(prefix, msg);
    }
  }
  function cleanup() {
    if (pingTimer) {
      clearInterval(pingTimer);
      pingTimer = null;
    }
    if (reconnectTimer) {
      clearTimeout(reconnectTimer);
      reconnectTimer = null;
    }
  }
  function stop() {
    if (stopped) return;
    stopped = true;
    cleanup();
    if (ws) {
      try {
        ws.close(1e3, "shutdown");
      } catch {
      }
      ws = null;
    }
  }
  function send(data) {
    if (!ws || ws.readyState !== ws.OPEN) {
      log("warn", `send called but WebSocket not open (readyState=${ws?.readyState}), dropping: type=${typeof data === "object" ? data?.type : "unknown"}`);
      return;
    }
    try {
      const payload = typeof data === "string" ? data : JSON.stringify(data);
      ws.send(payload);
      const dataType = typeof data === "object" ? data?.type : "unknown";
      log("info", `sent to server: type=${dataType} conv=${typeof data === "object" ? data?.conversationId : "?"} text="${(typeof data === "object" ? data?.text : "").substring(0, 80)}"`);
    } catch (err) {
      log("error", `send failed: ${err instanceof Error ? err.message : String(err)}`);
    }
  }
  function sendStatusNow() {
    if (!ws || ws.readyState !== ws.OPEN || !statusProvider) {
      return;
    }
    try {
      const sp = statusProvider();
      if (!sp) {
        return;
      }
      ws.send(JSON.stringify({
        type: "status",
        clientType: sp.type,
        version: sp.version,
        agentCount: sp.agentCount,
        status: sp.status,
        uptime: sp.uptime,
        metadata: sp.metadata
      }));
      log("info", `status pushed: state=${sp.status} agents=${sp.agentCount}`);
    } catch (err) {
      log("warn", `status push failed: ${err instanceof Error ? err.message : String(err)}`);
    }
  }
  async function doConnect() {
    const WebSocket2 = (await Promise.resolve().then(() => (init_wrapper(), wrapper_exports))).default;
    const ts = Math.floor(Date.now() / 1e3);
    const sig = computeHmacSignature(secret, channelId, ts);
    const separator = platformUrl.includes("?") ? "&" : "?";
    const url = `${platformUrl}${separator}channelId=${encodeURIComponent(channelId)}&ts=${ts}&sig=${sig}`;
    return new Promise((resolve3, reject) => {
      if (stopped || abortSignal?.aborted) {
        resolve3();
        return;
      }
      const socket = new WebSocket2(url);
      ws = socket;
      socket.on("open", () => {
        backoffMs = INITIAL_BACKOFF_MS2;
        log("info", `connected to ${platformUrl}`);
        sendStatusNow();
        resolve3();
      });
      socket.on("message", async (raw, isBinary) => {
        try {
          const text = typeof raw === "string" ? raw : Buffer.isBuffer(raw) ? raw.toString("utf-8") : Array.isArray(raw) ? Buffer.concat(raw).toString("utf-8") : new TextDecoder().decode(raw);
          const parsed = JSON.parse(text);
          if (parsed.type === "message") {
            log("info", `recv message: conv=${parsed.conversationId || "default"} text="${(parsed.text || "").substring(0, 60)}..."`);
            void Promise.resolve().then(() => onMessage(parsed)).catch((err) => {
              onError?.(err instanceof Error ? err : new Error(String(err)));
            });
          } else if (parsed.type === "runtime.refresh") {
            log("info", `recv runtime refresh request: reason=${parsed.reason || "manual"}`);
            if (onControlMessage) {
              try {
                await Promise.resolve(onControlMessage(parsed));
              } catch (err) {
                onError?.(err instanceof Error ? err : new Error(String(err)));
              }
            }
            sendStatusNow();
          } else if (parsed.type === "reply") {
            log("info", `recv reply: conv=${parsed.conversationId || "default"} text="${(parsed.text || "").substring(0, 60)}..."`);
          } else if (parsed.type === "pong") {
          } else if (parsed.type === "error") {
            log("error", `server error: ${parsed.text || parsed.error || JSON.stringify(parsed)}`);
          }
        } catch (err) {
          log("warn", `failed to parse incoming message: ${err instanceof Error ? err.message : String(err)}`);
        }
      });
      socket.on("error", (err) => {
        onError?.(err);
        log("error", `WebSocket error: ${err.message}`);
      });
      socket.on("close", (code, reason) => {
        ws = null;
        cleanup();
        if (stopped || abortSignal?.aborted) return;
        log("warn", `WebSocket closed (code=${code}), reconnecting in ${backoffMs}ms`);
        reconnectTimer = setTimeout(() => {
          if (stopped || abortSignal?.aborted) return;
          void doConnect().catch((err) => {
            log("error", `reconnect failed: ${err instanceof Error ? err.message : String(err)}`);
          });
        }, backoffMs);
        backoffMs = Math.min(backoffMs * 2, MAX_BACKOFF_MS2);
      });
    });
  }
  async function start() {
    if (abortSignal) {
      if (abortSignal.aborted) {
        stop();
        return;
      }
      abortSignal.addEventListener("abort", stop, { once: true });
    }
    if (!platformUrl) {
      throw new Error("relayPlatformUrl is required for relay mode");
    }
    if (!channelId) {
      throw new Error("channelId is required for relay mode");
    }
    if (!secret) {
      throw new Error("secret is required for relay mode");
    }
    await doConnect();
    pingTimer = setInterval(() => {
      if (stopped || abortSignal?.aborted) {
        clearInterval(pingTimer);
        pingTimer = null;
        return;
      }
      if (!ws || ws.readyState !== ws.OPEN) {
        log("warn", "ping skipped \u2014 WebSocket not open");
        return;
      }
      try {
        ws.send(JSON.stringify({ type: "ping" }));
        sendStatusNow();
      } catch (err) {
        log("warn", `ping failed: ${err instanceof Error ? err.message : String(err)}`);
      }
    }, PING_INTERVAL_MS);
  }
  return { start, send, sendStatusNow, stop };
}

// src/gochat/monitor.ts
import { readFileSync } from "node:fs";
import { resolve as resolve2, dirname as dirname2 } from "node:path";
import { fileURLToPath as fileURLToPath2 } from "node:url";
var _pluginVersion = null;
var ACTIVE_STATUS_REFRESH_MS = 1e4;
var OPENCLAW_RUNTIME_REFRESH_MS = 2e4;
function getPluginVersion() {
  if (_pluginVersion) return _pluginVersion;
  try {
    const manifestPath = resolve2(dirname2(fileURLToPath2(import.meta.url)), "../../package.json");
    const raw = readFileSync(manifestPath, "utf-8");
    _pluginVersion = JSON.parse(raw).version ?? "unknown";
  } catch {
    _pluginVersion = "unknown";
  }
  return _pluginVersion;
}
function getRuntimePlatform() {
  try {
    const unameOut = process.platform;
    switch (unameOut) {
      case "darwin":
        return "macos";
      case "linux": {
        try {
          const versionFile = readFileSync("/proc/version", "utf-8");
          if (versionFile.toLowerCase().includes("microsoft")) return "linux-wsl";
        } catch {
        }
        return "linux";
      }
      case "win32":
        return "windows";
      default:
        return unameOut;
    }
  } catch {
    return "unknown";
  }
}
function getRuntimeArch() {
  return process.arch;
}
function getNodeVersion() {
  return process.version;
}
function resolvePrimaryModelFromConfig(cfg) {
  const model = cfg.agents?.defaults?.model;
  if (typeof model === "string") {
    return model.trim();
  }
  if (model && typeof model === "object") {
    const primary = model.primary;
    if (typeof primary === "string") {
      return primary.trim();
    }
  }
  return "";
}
function normalizeProcessCommandArgs(argv) {
  const args = [...argv];
  if (!args.length) {
    return [];
  }
  const first = args[0] ?? "";
  if (/[/\\]node(?:\.exe)?$/i.test(first)) {
    args.shift();
  }
  const next = args[0] ?? "";
  if (next.endsWith("/openclaw.mjs") || next.endsWith("\\openclaw.mjs") || /[/\\]openclaw(?:\.cmd|\.ps1|\.exe)?$/i.test(next)) {
    args.shift();
  }
  return args.map((entry) => String(entry).trim()).filter(Boolean);
}
function findCliFlagValue(args, flag) {
  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];
    if (arg === flag) {
      return String(args[index + 1] ?? "").trim();
    }
    if (arg.startsWith(`${flag}=`)) {
      return arg.slice(flag.length + 1).trim();
    }
  }
  return "";
}
function resolveRuntimeCommandSnapshot() {
  const normalizedArgs = normalizeProcessCommandArgs(process.argv);
  if (!normalizedArgs.length) {
    return {
      command: "openclaw",
      commandArgs: ""
    };
  }
  const [command, ...rest] = normalizedArgs;
  return {
    command,
    commandArgs: rest.join(" ")
  };
}
function resolveRuntimeModel(cfg) {
  const normalizedArgs = normalizeProcessCommandArgs(process.argv);
  const cliModel = findCliFlagValue(normalizedArgs, "--model");
  if (cliModel) {
    return {
      currentModel: cliModel,
      modelSource: "cli"
    };
  }
  const configuredModel = resolvePrimaryModelFromConfig(cfg);
  if (configuredModel) {
    return {
      currentModel: configuredModel,
      modelSource: "config"
    };
  }
  return {
    currentModel: "unknown",
    modelSource: "unknown"
  };
}
function buildRuntimeWorkUnitMetadata(activeJobs, status) {
  const count = Math.max(0, Math.floor(activeJobs));
  const normalizedStatus = String(status || "idle").trim() || "idle";
  const items = Array.from({ length: count }, (_, index) => ({
    id: `job-${index + 1}`,
    label: `\u8FD0\u884C\u4EFB\u52A1 ${index + 1}`,
    status: normalizedStatus,
    source: "gochat-active-jobs"
  }));
  return {
    runtimeWorkUnitLabel: "\u8FD0\u884C\u4EFB\u52A1",
    runtimeWorkUnitSource: "gochat-active-jobs",
    runtimeWorkUnitCount: String(count),
    runtimeWorkUnitsJson: JSON.stringify(items)
  };
}
async function monitorGoChatProvider(opts = {}) {
  const core = getGoChatRuntime();
  const cfg = opts.config ?? core.config.loadConfig();
  const account = resolveGoChatAccount({
    cfg,
    accountId: opts.accountId
  });
  const runtime = resolveLoggerBackedRuntime2(
    opts.runtime,
    core.logging.getChildLogger()
  );
  if (!account.secret) {
    throw new Error(`GoChat secret not configured for relay account "${account.accountId}"`);
  }
  const logger = core.logging.getChildLogger({
    channel: "gochat",
    accountId: account.accountId
  });
  setOpenClawRuntimeSnapshotLogger((level, message) => {
    if (level === "warn") {
      logger.warn(message);
      return;
    }
    logger.info(message);
  });
  const runtimeCommand = resolveRuntimeCommandSnapshot();
  const resolveLiveConfig = () => {
    try {
      return core.config.loadConfig() ?? cfg;
    } catch {
      return cfg;
    }
  };
  const startedAt = Date.now();
  let activeJobs = 0;
  let transientStatus = null;
  let transientUntil = 0;
  let transientTimer = null;
  let activeStatusTimer = null;
  let permissionPollTimer = null;
  let openclawRuntimePollTimer = null;
  let subagentPermissionRefreshInFlight = null;
  let openclawRuntimeRefreshInFlight = null;
  let modelSwitchMetadata = {};
  let subagentPermissionStatus = {
    state: "unknown",
    summary: "Subagent permission status is unavailable.",
    detailSignature: "unknown:initial",
    approvalState: "unknown",
    approvalLabel: "unknown"
  };
  let openclawRuntimeMetadata = {};
  const clearTransientTimer = () => {
    if (transientTimer) {
      clearTimeout(transientTimer);
      transientTimer = null;
    }
  };
  const stopActiveStatusPulse = () => {
    if (activeStatusTimer) {
      clearInterval(activeStatusTimer);
      activeStatusTimer = null;
    }
  };
  const resolveStatus = () => {
    const now = Date.now();
    if (transientStatus && transientUntil > now) {
      return transientStatus;
    }
    if (activeJobs > 0) {
      return "executing";
    }
    return "idle";
  };
  let lastReportedStatus = resolveStatus();
  let pushRelayStatusNow = () => {
  };
  const ensureActiveStatusPulse = () => {
    if (activeJobs <= 0 || activeStatusTimer) {
      return;
    }
    activeStatusTimer = setInterval(() => {
      if (activeJobs <= 0) {
        stopActiveStatusPulse();
        return;
      }
      pushRelayStatusNow();
    }, ACTIVE_STATUS_REFRESH_MS);
  };
  const scheduleStatusReset = () => {
    clearTransientTimer();
    if (!transientStatus) {
      return;
    }
    const delay = Math.max(0, transientUntil - Date.now());
    transientTimer = setTimeout(() => {
      transientStatus = null;
      transientUntil = 0;
      publishStatus();
    }, delay);
  };
  const publishStatus = () => {
    const nextStatus = resolveStatus();
    if (nextStatus === lastReportedStatus) {
      return;
    }
    lastReportedStatus = nextStatus;
    pushRelayStatusNow();
  };
  const setTransientStatus = (status, ttlMs) => {
    transientStatus = status;
    transientUntil = Date.now() + ttlMs;
    scheduleStatusReset();
    publishStatus();
  };
  const beginJob = () => {
    activeJobs += 1;
    ensureActiveStatusPulse();
    publishStatus();
  };
  const finishJob = () => {
    activeJobs = Math.max(0, activeJobs - 1);
    if (activeJobs === 0) {
      stopActiveStatusPulse();
    }
    publishStatus();
  };
  const refreshSubagentPermissionStatus = async (forceRefresh = false) => {
    if (subagentPermissionRefreshInFlight) {
      return subagentPermissionRefreshInFlight;
    }
    subagentPermissionRefreshInFlight = (async () => {
      try {
        const nextStatus = await inspectSubagentPermissionStatus({ forceRefresh });
        if (nextStatus.detailSignature === subagentPermissionStatus.detailSignature) {
          return;
        }
        subagentPermissionStatus = nextStatus;
        pushRelayStatusNow();
      } catch {
      } finally {
        subagentPermissionRefreshInFlight = null;
      }
    })();
    return subagentPermissionRefreshInFlight;
  };
  const refreshOpenClawRuntimeMetadata = async (forceRefresh = false) => {
    if (openclawRuntimeRefreshInFlight) {
      return openclawRuntimeRefreshInFlight;
    }
    openclawRuntimeRefreshInFlight = (async () => {
      try {
        const nextMetadata = await loadOpenClawRuntimeSnapshotMetadata({ forceRefresh });
        const currentSignature = JSON.stringify(openclawRuntimeMetadata);
        const nextSignature = JSON.stringify(nextMetadata);
        const modelsCount = String(nextMetadata.openclawModelsCount ?? "").trim();
        const sessionsCount = String(nextMetadata.openclawSessionsCount ?? "").trim();
        const modelsError = String(nextMetadata.openclawModelsError ?? "").trim();
        const sessionsError = String(nextMetadata.openclawSessionsError ?? "").trim();
        if (modelsError || sessionsError) {
          logger.warn(
            `[gochat:${account.accountId}] openclaw runtime refresh: sessions=${sessionsCount || "n/a"} models=${modelsCount || "n/a"} sessionsError=${sessionsError || "-"} modelsError=${modelsError || "-"}`
          );
        } else {
          logger.info(
            `[gochat:${account.accountId}] openclaw runtime refresh: sessions=${sessionsCount || "0"} models=${modelsCount || "0"}`
          );
        }
        if (currentSignature === nextSignature) {
          return;
        }
        openclawRuntimeMetadata = nextMetadata;
        pushRelayStatusNow();
      } catch (error) {
        logger.warn(
          `[gochat:${account.accountId}] openclaw runtime refresh failed: ${error instanceof Error ? error.message : String(error)}`
        );
      } finally {
        openclawRuntimeRefreshInFlight = null;
      }
    })();
    return openclawRuntimeRefreshInFlight;
  };
  const { start: startRelay, stop: stopRelay, send: sendRelay2, sendStatusNow } = createRelayWSConnection({
    platformUrl: account.relayPlatformUrl,
    channelId: account.channelId,
    secret: account.secret,
    onMessage: async (message) => {
      core.channel.activity.record({
        channel: "gochat",
        accountId: account.accountId,
        direction: "inbound",
        at: message.timestamp ?? Date.now()
      });
      if (opts.onMessage) {
        await opts.onMessage(message);
        return;
      }
      beginJob();
      try {
        await handleGoChatInbound({
          message,
          account,
          config: cfg,
          runtime,
          statusSink: opts.statusSink
        });
      } finally {
        finishJob();
      }
    },
    onError: (error) => {
      setTransientStatus("error", 8e3);
      logger.error(`[gochat:${account.accountId}] relay error: ${error.message}`);
    },
    onControlMessage: async (message) => {
      if (message?.type === "runtime.refresh") {
        await refreshSubagentPermissionStatus(true);
        await refreshOpenClawRuntimeMetadata(true);
        return;
      }
      if (message?.type === "openclaw.model.set") {
        const nextModel = String(message.model ?? "").trim();
        if (!nextModel) {
          return;
        }
        logger.info(`[gochat:${account.accountId}] recv model switch request: model=${nextModel}`);
        modelSwitchMetadata = {
          openclawModelSetTarget: nextModel,
          openclawModelSetStatus: "pending",
          openclawModelSetError: ""
        };
        pushRelayStatusNow();
        try {
          await setOpenClawCurrentModel(nextModel);
          await refreshOpenClawRuntimeMetadata(true);
          logger.info(`[gochat:${account.accountId}] openclaw model switch success: model=${nextModel}`);
          modelSwitchMetadata = {
            openclawModelSetTarget: nextModel,
            openclawModelSetStatus: "success",
            openclawModelSetError: ""
          };
        } catch (error) {
          const messageText = error instanceof Error ? error.message : String(error);
          logger.warn(`[gochat:${account.accountId}] openclaw model set failed: model=${nextModel} error=${messageText}`);
          modelSwitchMetadata = {
            openclawModelSetTarget: nextModel,
            openclawModelSetStatus: "failed",
            openclawModelSetError: messageText
          };
        }
        pushRelayStatusNow();
      }
    },
    abortSignal: opts.abortSignal,
    statusProvider: () => {
      const liveConfig = resolveLiveConfig();
      const liveAccount = resolveGoChatAccount({
        cfg: liveConfig,
        accountId: opts.accountId
      });
      const runtimeModel = resolveRuntimeModel(liveConfig);
      const resolvedStatus = resolveStatus();
      return {
        type: "plugin",
        version: getPluginVersion(),
        agentCount: activeJobs,
        status: resolvedStatus,
        uptime: Math.floor((Date.now() - startedAt) / 1e3),
        metadata: {
          runtimeSchemaVersion: "1",
          openclawVersion: core.version,
          pluginVersion: getPluginVersion(),
          accountId: liveAccount?.accountId || account?.accountId || "default",
          platform: `${getRuntimePlatform()} (${getRuntimeArch()})`,
          nodeVersion: getNodeVersion(),
          command: runtimeCommand.command,
          commandArgs: runtimeCommand.commandArgs,
          currentModel: runtimeModel.currentModel,
          modelSource: runtimeModel.modelSource,
          ...buildRuntimeWorkUnitMetadata(activeJobs, resolvedStatus),
          ...buildSubagentPermissionMetadata(subagentPermissionStatus),
          ...openclawRuntimeMetadata,
          ...modelSwitchMetadata
        }
      };
    }
  });
  if (opts.abortSignal?.aborted) {
    return { stop: stopRelay };
  }
  pushRelayStatusNow = sendStatusNow;
  setRelayStatusReporter((status) => {
    if (status === "error") {
      setTransientStatus("error", 8e3);
      return;
    }
    if (status === "syncing") {
      setTransientStatus("syncing", 3e3);
      return;
    }
    transientStatus = null;
    transientUntil = 0;
    clearTransientTimer();
    publishStatus();
  });
  setRelayWsSender(sendRelay2);
  await startRelay();
  void refreshSubagentPermissionStatus(true);
  void refreshOpenClawRuntimeMetadata(true);
  permissionPollTimer = setInterval(() => {
    void refreshSubagentPermissionStatus(true);
  }, 1e4);
  openclawRuntimePollTimer = setInterval(() => {
    void refreshOpenClawRuntimeMetadata(true);
  }, OPENCLAW_RUNTIME_REFRESH_MS);
  logger.info(
    `[gochat:${account.accountId}] relay connected to ${account.relayPlatformUrl}`
  );
  return {
    stop: () => {
      if (permissionPollTimer) {
        clearInterval(permissionPollTimer);
        permissionPollTimer = null;
      }
      if (openclawRuntimePollTimer) {
        clearInterval(openclawRuntimePollTimer);
        openclawRuntimePollTimer = null;
      }
      clearTransientTimer();
      stopActiveStatusPulse();
      setOpenClawRuntimeSnapshotLogger(null);
      setRelayStatusReporter(null);
      setRelayWsSender(null);
      stopRelay();
    }
  };
}

// src/session-route.ts
import {
  buildChannelOutboundSessionRoute
} from "openclaw/plugin-sdk/core";
function resolveGoChatOutboundSessionRoute(params) {
  const conversationId = stripGoChatTargetPrefix(params.target);
  if (!conversationId) {
    return null;
  }
  return buildChannelOutboundSessionRoute({
    cfg: params.cfg,
    agentId: params.agentId,
    channel: "gochat",
    accountId: params.accountId,
    peer: {
      kind: "direct",
      id: conversationId
    },
    chatType: "direct",
    from: `gochat:conv:${conversationId}`,
    to: `gochat:${conversationId}`
  });
}

// src/setup-core.ts
import { DEFAULT_ACCOUNT_ID as DEFAULT_ACCOUNT_ID2, normalizeAccountId as normalizeAccountId2 } from "openclaw/plugin-sdk/routing";
import {
  createSetupInputPresenceValidator,
  mergeAllowFromEntries,
  createTopLevelChannelDmPolicy,
  promptParsedAllowFromForAccount,
  resolveSetupAccountId
} from "openclaw/plugin-sdk/setup-runtime";
import { formatDocsLink } from "openclaw/plugin-sdk/setup-tools";
var channel = "gochat";
function setGoChatAccountConfig(cfg, accountId, updates) {
  return patchScopedAccountConfig({
    cfg,
    channelKey: channel,
    accountId,
    patch: updates
  });
}
async function promptGoChatAllowFrom(params) {
  return await promptParsedAllowFromForAccount({
    cfg: params.cfg,
    accountId: params.accountId,
    defaultAccountId: params.accountId,
    prompter: params.prompter,
    noteTitle: "GoChat user id",
    noteLines: [
      "1) Check your Go backend for user IDs",
      "2) User IDs are defined by your Go backend",
      `Docs: ${formatDocsLink("/channels/gochat", "gochat")}`
    ],
    message: "GoChat allowFrom (user id)",
    placeholder: "user-id",
    parseEntries: (raw) => ({
      entries: String(raw).split(/[\n,;]+/g).map((value) => value.trim().toLowerCase()).filter(Boolean)
    }),
    getExistingAllowFrom: ({ cfg, accountId }) => resolveGoChatAccount({ cfg, accountId }).config.allowFrom ?? [],
    mergeEntries: ({ existing, parsed }) => mergeAllowFromEntries(
      existing.map((value) => String(value).trim().toLowerCase()),
      parsed
    ),
    applyAllowFrom: ({ cfg, accountId, allowFrom }) => setGoChatAccountConfig(cfg, accountId, {
      dmPolicy: "allowlist",
      allowFrom
    })
  });
}
async function promptGoChatAllowFromForAccount(params) {
  const accountId = resolveSetupAccountId({
    accountId: params.accountId,
    defaultAccountId: resolveDefaultGoChatAccountId(params.cfg)
  });
  return await promptGoChatAllowFrom({
    cfg: params.cfg,
    prompter: params.prompter,
    accountId
  });
}
var gochatDmPolicy = createTopLevelChannelDmPolicy({
  label: "GoChat",
  channel,
  policyKey: "channels.gochat.dmPolicy",
  allowFromKey: "channels.gochat.allowFrom",
  getCurrent: (cfg) => cfg.channels?.gochat?.dmPolicy ?? "open",
  promptAllowFrom: promptGoChatAllowFromForAccount
});
async function autoRegisterRelay(cfg, accountId) {
  console.log(`[gochat:setup] auto-registering relay for accountId=${accountId}...`);
  try {
    const registerUrl = DEFAULT_RELAY_HTTP_URL + "/api/plugin/register";
    const deviceName = resolveGoChatAccount({ cfg, accountId }).name || `OpenClaw`;
    const resp = await fetch(registerUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: deviceName }),
      signal: AbortSignal.timeout(1e4)
    });
    if (!resp.ok) {
      const errText = await resp.text().catch(() => "");
      throw new Error(`Registration failed (${resp.status}): ${errText}`);
    }
    const data = await resp.json();
    if (data.channelId && data.secret) {
      let nextCfg = setGoChatAccountConfig(cfg, accountId, {
        relayPlatformUrl: DEFAULT_RELAY_WS_URL,
        channelId: data.channelId,
        webhookSecret: data.secret,
        enabled: true,
        blockStreaming: true
      });
      console.log(`[gochat:setup] relay registered OK: channelId=${data.channelId} relayUrl=${DEFAULT_RELAY_WS_URL}`);
      return nextCfg;
    }
  } catch (err) {
    console.warn(
      `[gochat:setup] relay auto-registration failed: ${err instanceof Error ? err.message : String(err)}`
    );
  }
  return setGoChatAccountConfig(cfg, accountId, {
    relayPlatformUrl: DEFAULT_RELAY_WS_URL,
    enabled: true,
    blockStreaming: true
  });
}
var gochatSetupAdapter = {
  resolveAccountId: ({ accountId }) => normalizeAccountId2(accountId),
  applyAccountName: ({ cfg, accountId, name }) => applyAccountNameToChannelSection({
    cfg,
    channelKey: channel,
    accountId,
    name
  }),
  validateInput: createSetupInputPresenceValidator({
    defaultAccountOnlyEnvError: "GOCHAT_WEBHOOK_SECRET can only be used for the default account.",
    validate: () => null
  }),
  applyAccountConfig: async ({ cfg, accountId, input }) => {
    const setupInput = input;
    const namedConfig = applyAccountNameToChannelSection({
      cfg,
      channelKey: channel,
      accountId,
      name: setupInput.name
    });
    let nextCfg = namedConfig;
    const patch = {
      enabled: true,
      dmPolicy: "open",
      blockStreaming: true
    };
    if (setupInput.relayPlatformUrl) {
      patch.relayPlatformUrl = setupInput.relayPlatformUrl.trim().replace(/\/+$/, "");
      patch.mode = "relay";
      nextCfg = setGoChatAccountConfig(nextCfg, accountId, patch);
      nextCfg = await autoRegisterRelay(nextCfg, accountId);
      return nextCfg;
    }
    if (setupInput.agentServerUrl || setupInput.agentToken || setupInput.agentTokenFile) {
      patch.mode = "agent";
      patch.agentServerUrl = (setupInput.agentServerUrl || DEFAULT_RELAY_HTTP_URL).trim().replace(/\/+$/, "");
      if (setupInput.agentTokenFile) {
        patch.agentTokenFile = setupInput.agentTokenFile;
      } else if (setupInput.agentToken) {
        patch.agentToken = setupInput.agentToken;
      }
      return setGoChatAccountConfig(nextCfg, accountId, patch);
    }
    if (!setupInput.useEnv) {
      if (setupInput.secretFile) {
        patch.webhookSecretFile = setupInput.secretFile;
      } else if (setupInput.secret) {
        patch.webhookSecret = setupInput.secret;
      }
    }
    return setGoChatAccountConfig(nextCfg, accountId, patch);
  }
};

// src/setup-surface.ts
import {
  createStandardChannelSetupStatus,
  formatDocsLink as formatDocsLink2,
  setSetupChannelEnabled as setSetupChannelEnabled2
} from "openclaw/plugin-sdk/setup";

// src/mode-switch-authorization.ts
import { DEFAULT_ACCOUNT_ID as DEFAULT_ACCOUNT_ID3 } from "openclaw/plugin-sdk/routing";
var DEFAULT_MODE_SWITCH_AUTH_TTL_MINUTES = 10;
function readAuthorization(cfg, accountId) {
  const section = cfg.channels?.gochat;
  if (!section) {
    return void 0;
  }
  if (accountId === DEFAULT_ACCOUNT_ID3) {
    return section.modeSwitchAuthorization;
  }
  return section.accounts?.[accountId]?.modeSwitchAuthorization;
}
function clearAuthorizationFromConfig(cfg, accountId) {
  const section = cfg.channels?.gochat;
  if (!section) {
    return cfg;
  }
  if (accountId === DEFAULT_ACCOUNT_ID3) {
    if (!section.modeSwitchAuthorization) {
      return cfg;
    }
    const nextSection = { ...section };
    delete nextSection.modeSwitchAuthorization;
    return {
      ...cfg,
      channels: {
        ...cfg.channels ?? {},
        gochat: nextSection
      }
    };
  }
  const currentAccount = section.accounts?.[accountId];
  if (!currentAccount?.modeSwitchAuthorization) {
    return cfg;
  }
  const nextAccount = { ...currentAccount };
  delete nextAccount.modeSwitchAuthorization;
  return {
    ...cfg,
    channels: {
      ...cfg.channels ?? {},
      gochat: {
        ...section,
        accounts: {
          ...section.accounts ?? {},
          [accountId]: nextAccount
        }
      }
    }
  };
}
function modeSwitchRequiresAuthorization(currentMode, nextMode) {
  return Boolean(currentMode) && currentMode !== nextMode;
}
function grantGoChatModeSwitchAuthorization(params) {
  const ttlMinutes = Math.max(1, Math.floor(params.ttlMinutes ?? DEFAULT_MODE_SWITCH_AUTH_TTL_MINUTES));
  const issuedAt = params.now ?? /* @__PURE__ */ new Date();
  const expiresAt = new Date(issuedAt.getTime() + ttlMinutes * 6e4);
  return patchScopedAccountConfig({
    cfg: params.cfg,
    channelKey: "gochat",
    accountId: params.accountId,
    patch: {
      modeSwitchAuthorization: {
        targetMode: params.targetMode,
        issuedAt: issuedAt.toISOString(),
        expiresAt: expiresAt.toISOString()
      }
    }
  });
}
function getGoChatModeSwitchAuthorizationStatus(params) {
  if (!modeSwitchRequiresAuthorization(params.currentMode, params.nextMode)) {
    return {
      allowed: true,
      requiresAuthorization: false
    };
  }
  const auth = readAuthorization(params.cfg, params.accountId);
  if (!auth?.targetMode) {
    return {
      allowed: false,
      requiresAuthorization: true,
      reason: `Mode switch from ${params.currentMode} to ${params.nextMode} requires authorization.`
    };
  }
  if (auth.targetMode !== params.nextMode) {
    return {
      allowed: false,
      requiresAuthorization: true,
      reason: `Mode switch authorization currently targets ${auth.targetMode}, not ${params.nextMode}.`,
      expiresAt: auth.expiresAt
    };
  }
  if (auth.expiresAt) {
    const expiresAt = new Date(auth.expiresAt);
    if (!Number.isNaN(expiresAt.getTime()) && expiresAt.getTime() <= (params.now ?? /* @__PURE__ */ new Date()).getTime()) {
      return {
        allowed: false,
        requiresAuthorization: true,
        reason: `Mode switch authorization for ${params.nextMode} expired at ${auth.expiresAt}.`,
        expiresAt: auth.expiresAt
      };
    }
  }
  return {
    allowed: true,
    requiresAuthorization: true,
    expiresAt: auth.expiresAt
  };
}
function consumeGoChatModeSwitchAuthorization(params) {
  if (!modeSwitchRequiresAuthorization(params.currentMode, params.nextMode)) {
    return params.cfg;
  }
  return clearAuthorizationFromConfig(params.cfg, params.accountId);
}

// src/setup-surface.ts
var channel2 = "gochat";
var gochatSetupWizard = {
  channel: channel2,
  stepOrder: "text-first",
  status: createStandardChannelSetupStatus({
    channelLabel: "GoChat",
    configuredLabel: "configured",
    unconfiguredLabel: "needs setup",
    configuredHint: "configured",
    unconfiguredHint: "custom chat backend",
    configuredScore: 1,
    unconfiguredScore: 5,
    resolveConfigured: ({ cfg }) => listGoChatAccountIds(cfg).some((accountId) => {
      const account = resolveGoChatAccount({ cfg, accountId });
      return account.enabled;
    })
  }),
  introNote: {
    title: "GoChat setup",
    lines: [
      "Choose mode: local (built-in server) or relay (connect to GoChat platform).",
      "Use agent mode after running: openclaw gochat bind-agent --code 123456",
      "Fresh setup is automatic. Switching an existing account between local and relay requires a one-time CLI authorization.",
      `Docs: ${formatDocsLink2("/channels/gochat", "channels/gochat")}`
    ],
    shouldShow: ({ cfg, accountId }) => {
      const account = resolveGoChatAccount({ cfg, accountId });
      return !account.enabled;
    }
  },
  credentials: [],
  textInputs: [
    {
      inputKey: "mode",
      message: "Choose mode [local/relay/agent] (default: relay)",
      currentValue: ({ cfg, accountId }) => resolveGoChatAccount({ cfg, accountId }).mode ?? "relay",
      shouldPrompt: () => true,
      validate: ({ value }) => value === "local" || value === "relay" || value === "agent" ? void 0 : "Mode must be 'local', 'relay', or 'agent'",
      normalizeValue: ({ value }) => value?.trim().toLowerCase() || "relay",
      applySet: async (params) => {
        const mode = params.value?.trim().toLowerCase() || "relay";
        const currentAccount = resolveGoChatAccount({
          cfg: params.cfg,
          accountId: params.accountId
        });
        const authStatus = getGoChatModeSwitchAuthorizationStatus({
          cfg: params.cfg,
          accountId: params.accountId,
          currentMode: currentAccount.enabled ? currentAccount.mode : "",
          nextMode: mode
        });
        if (!authStatus.allowed) {
          throw new Error(
            `${authStatus.reason} Run: openclaw gochat authorize-mode-switch --mode ${mode}`
          );
        }
        let nextCfg = setGoChatAccountConfig(params.cfg, params.accountId, {
          mode,
          dmPolicy: "open",
          enabled: true
        });
        console.log(`[gochat:setup] mode=${mode} accountId=${params.accountId}`);
        if (mode === "relay") {
          try {
            const registerUrl = DEFAULT_RELAY_HTTP_URL + "/api/plugin/register";
            const deviceName = resolveGoChatAccount({
              cfg: params.cfg,
              accountId: params.accountId
            }).name || `OpenClaw`;
            const resp = await fetch(registerUrl, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ name: deviceName }),
              signal: AbortSignal.timeout(1e4)
            });
            if (!resp.ok) {
              const errText = await resp.text().catch(() => "");
              throw new Error(`Registration failed (${resp.status}): ${errText}`);
            }
            const data = await resp.json();
            if (data.channelId && data.secret) {
              nextCfg = setGoChatAccountConfig(nextCfg, params.accountId, {
                relayPlatformUrl: DEFAULT_RELAY_WS_URL,
                channelId: data.channelId,
                webhookSecret: data.secret
              });
              console.log(`[gochat:setup] relay registered channelId=${data.channelId} relayUrl=${DEFAULT_RELAY_WS_URL}`);
            }
          } catch (err) {
            console.warn(
              `[gochat:setup] relay auto-registration failed (will retry on startup): ${err instanceof Error ? err.message : String(err)}`
            );
            nextCfg = setGoChatAccountConfig(nextCfg, params.accountId, {
              relayPlatformUrl: DEFAULT_RELAY_WS_URL
            });
          }
        } else if (mode === "agent") {
          nextCfg = setGoChatAccountConfig(nextCfg, params.accountId, {
            agentServerUrl: DEFAULT_CLAWTILE_HTTP_URL
          });
          console.log(`[gochat:setup] agent mode configured - bind with: openclaw gochat bind-agent --code 123456`);
        } else {
          console.log(`[gochat:setup] local mode configured - built-in server will start on port 9750`);
        }
        nextCfg = consumeGoChatModeSwitchAuthorization({
          cfg: nextCfg,
          accountId: params.accountId,
          currentMode: currentAccount.enabled ? currentAccount.mode : "",
          nextMode: mode
        });
        const finalAccount = resolveGoChatAccount({ cfg: nextCfg, accountId: params.accountId });
        console.log(`[gochat:setup] \u2500\u2500\u2500\u2500 Final Config \u2500\u2500\u2500\u2500`);
        console.log(`[gochat:setup]   mode:         ${finalAccount.mode}`);
        console.log(`[gochat:setup]   enabled:      ${finalAccount.enabled}`);
        console.log(`[gochat:setup]   secretSource: ${finalAccount.secretSource}`);
        if (finalAccount.mode === "relay") {
          console.log(`[gochat:setup]   relayUrl:     ${finalAccount.relayPlatformUrl}`);
          console.log(`[gochat:setup]   channelId:    ${finalAccount.channelId || "(pending)"}`);
        } else if (finalAccount.mode === "agent") {
          console.log(`[gochat:setup]   agentServer:  ${finalAccount.agentServerUrl}`);
        } else {
          console.log(`[gochat:setup]   port:         ${finalAccount.directPort}`);
        }
        console.log(`[gochat:setup]   dmPolicy:     ${finalAccount.config.dmPolicy ?? "open"}`);
        console.log(`[gochat:setup] \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500`);
        return nextCfg;
      }
    }
  ],
  dmPolicy: gochatDmPolicy,
  disable: (cfg) => setSetupChannelEnabled2(cfg, channel2, false)
};

// src/direct/storage.ts
import crypto3 from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
var DEFAULT_MESSAGES_PER_CONV = 1e3;
var FILE_ENCODING = "utf-8";
var GoChatDirectStorage = class {
  basePath;
  conversationsPath;
  messagesDir;
  uploadsDir;
  lockMap = /* @__PURE__ */ new Map();
  conversationsCache = null;
  constructor(stateDir) {
    this.basePath = path.join(stateDir, "gochat");
    this.conversationsPath = path.join(this.basePath, "conversations.json");
    this.messagesDir = path.join(this.basePath, "messages");
    this.uploadsDir = path.join(this.basePath, "uploads");
  }
  async init() {
    await fs.mkdir(this.messagesDir, { recursive: true });
    await fs.mkdir(this.uploadsDir, { recursive: true });
    try {
      await fs.access(this.conversationsPath);
    } catch {
      await fs.writeFile(this.conversationsPath, "{}", FILE_ENCODING);
    }
  }
  async withLock(key, fn) {
    const existing = this.lockMap.get(key);
    if (existing) {
      await existing.promise;
    }
    let resolve3;
    const promise = new Promise((r) => {
      resolve3 = r;
    });
    this.lockMap.set(key, { promise, resolve: resolve3 });
    try {
      return await fn();
    } finally {
      this.lockMap.delete(key);
      resolve3();
    }
  }
  async readConversations() {
    if (this.conversationsCache) {
      return this.conversationsCache;
    }
    const raw = await fs.readFile(this.conversationsPath, FILE_ENCODING);
    const parsed = JSON.parse(raw);
    this.conversationsCache = new Map(Object.entries(parsed));
    return this.conversationsCache;
  }
  async writeConversations(convs) {
    this.conversationsCache = convs;
    const obj = {};
    for (const [k, v] of convs) {
      obj[k] = v;
    }
    await fs.writeFile(this.conversationsPath, JSON.stringify(obj, null, 2), FILE_ENCODING);
  }
  async upsertConversation(id, name) {
    return this.withLock("conversations", async () => {
      const convs = await this.readConversations();
      const existing = convs.get(id);
      const now = (/* @__PURE__ */ new Date()).toISOString();
      if (existing) {
        existing.lastActive = now;
        if (name) {
          existing.name = name;
        }
        await this.writeConversations(convs);
        return existing;
      }
      const conv = {
        id,
        name: name ?? id,
        createdAt: now,
        lastActive: now,
        messageCount: 0
      };
      convs.set(id, conv);
      await this.writeConversations(convs);
      return conv;
    });
  }
  async listConversations() {
    const convs = await this.readConversations();
    return [...convs.values()].sort(
      (a, b) => new Date(b.lastActive).getTime() - new Date(a.lastActive).getTime()
    );
  }
  async getConversation(id) {
    const convs = await this.readConversations();
    return convs.get(id);
  }
  messageFilePath(conversationId) {
    const safeId = conversationId.replace(/[^a-zA-Z0-9._-]/g, "_");
    return path.join(this.messagesDir, `${safeId}.json`);
  }
  async appendMessage(conversationId, msg) {
    return this.withLock(`msg:${conversationId}`, async () => {
      const filePath = this.messageFilePath(conversationId);
      let messages = [];
      try {
        const raw = await fs.readFile(filePath, FILE_ENCODING);
        messages = JSON.parse(raw);
      } catch {
      }
      const stored = {
        id: crypto3.randomUUID(),
        conversationId,
        direction: msg.direction,
        senderId: msg.senderId ?? "",
        senderName: msg.senderName ?? "",
        text: msg.text,
        attachments: msg.attachments ?? [],
        replyTo: msg.replyTo,
        timestamp: Date.now()
      };
      messages.push(stored);
      if (messages.length > DEFAULT_MESSAGES_PER_CONV) {
        messages = messages.slice(-DEFAULT_MESSAGES_PER_CONV);
      }
      await fs.writeFile(filePath, JSON.stringify(messages, null, 2), FILE_ENCODING);
      await this.withLock("conversations", async () => {
        const convs = await this.readConversations();
        const conv = convs.get(conversationId);
        if (conv) {
          conv.messageCount = messages.length;
          conv.lastActive = (/* @__PURE__ */ new Date()).toISOString();
          await this.writeConversations(convs);
        }
      });
      return stored;
    });
  }
  async getMessages(conversationId, limit) {
    const filePath = this.messageFilePath(conversationId);
    try {
      const raw = await fs.readFile(filePath, FILE_ENCODING);
      const messages = JSON.parse(raw);
      if (limit && limit > 0) {
        return messages.slice(-limit);
      }
      return messages;
    } catch {
      return [];
    }
  }
  async saveUpload(filename, buffer) {
    const safeName = path.basename(filename).replace(/[^a-zA-Z0-9._-]/g, "_");
    const uniqueName = `${Date.now()}-${safeName}`;
    const filePath = path.join(this.uploadsDir, uniqueName);
    await fs.writeFile(filePath, buffer);
    return uniqueName;
  }
  getUploadPath(filename) {
    return path.join(this.uploadsDir, path.basename(filename));
  }
  invalidateCache() {
    this.conversationsCache = null;
  }
};

// src/direct/server.ts
import crypto4 from "node:crypto";
import { createServer } from "node:http";
import { pipeline } from "node:stream/promises";

// src/direct/routes.ts
import { basename } from "node:path";
function classifyAttachment(mimeType, filename) {
  const mime = (mimeType ?? "").toLowerCase();
  if (mime.startsWith("image/")) return "image";
  if (mime.startsWith("audio/")) return "audio";
  if (mime.startsWith("video/")) return "video";
  const ext = (filename ?? "").toLowerCase();
  if (/\.(jpe?g|png|gif|webp)$/.test(ext)) return "image";
  if (/\.(mp3|wav|ogg|m4a)$/.test(ext)) return "audio";
  if (/\.(mp4|webm|mov)$/.test(ext)) return "video";
  return "file";
}
async function handleSend(storage, body, onInbound) {
  let parsed;
  try {
    parsed = JSON.parse(body);
  } catch {
    return { error: "invalid request: malformed JSON" };
  }
  if (!parsed.conversationId?.trim()) {
    return { error: "invalid request: conversationId required" };
  }
  if (!parsed.text?.trim() && (!parsed.attachments || parsed.attachments.length === 0)) {
    return { error: "invalid request: message must have text or attachments" };
  }
  const conversationId = parsed.conversationId.trim();
  const now = Date.now();
  await storage.upsertConversation(conversationId, parsed.conversationName);
  const stored = await storage.appendMessage(conversationId, {
    direction: "inbound",
    senderId: parsed.senderId ?? "web-user",
    senderName: parsed.senderName ?? "",
    text: parsed.text ?? "",
    attachments: (parsed.attachments ?? []).map((a) => ({
      url: a.url,
      type: a.type,
      name: a.name,
      mimeType: a.mimeType,
      size: a.size
    })),
    replyTo: parsed.replyTo
  });
  const inboundMessage = {
    messageId: stored.id,
    conversationId,
    conversationName: parsed.conversationName ?? "",
    senderId: parsed.senderId ?? "web-user",
    senderName: parsed.senderName ?? "",
    text: parsed.text ?? "",
    attachments: (parsed.attachments ?? []).map((a) => ({
      url: a.url,
      type: a.type,
      name: a.name,
      mimeType: a.mimeType,
      size: a.size
    })),
    replyTo: parsed.replyTo,
    timestamp: now,
    isGroupChat: parsed.isGroupChat ?? false
  };
  try {
    await onInbound(inboundMessage);
  } catch {
  }
  return { messageId: stored.id, timestamp: now, ok: true };
}
async function handleListConversations(storage) {
  return await storage.listConversations();
}
async function handleGetMessages(storage, conversationId, limit) {
  if (!conversationId?.trim()) {
    return { error: "conversationId required" };
  }
  return await storage.getMessages(conversationId.trim(), limit ?? 100);
}
async function handleUpload(storage, fileBuffer, originalFilename, mimeType, baseUrl) {
  const savedName = await storage.saveUpload(originalFilename, fileBuffer);
  const type = classifyAttachment(mimeType, originalFilename);
  return {
    url: `${baseUrl}/files/${savedName}`,
    type,
    name: basename(originalFilename),
    mimeType: mimeType || "application/octet-stream",
    size: fileBuffer.length
  };
}

// src/direct/server.ts
var DEFAULT_DIRECT_PORT = 9750;
var DEFAULT_DIRECT_HOST = "0.0.0.0";
var DEFAULT_MAX_BODY_BYTES = 10 * 1024 * 1024;
var UPLOAD_MAX_BODY_BYTES = 50 * 1024 * 1024;
var HEALTH_PATH = "/healthz";
var RATE_LIMIT_SCOPE = "gochat-direct-auth";
function writeJson(res, status, body) {
  const data = body !== void 0 ? JSON.stringify(body) : void 0;
  res.writeHead(status, data ? { "Content-Type": "application/json" } : void 0);
  res.end(data);
}
function readBody(req, maxBytes) {
  return new Promise((resolve3, reject) => {
    const chunks = [];
    let received = 0;
    req.on("data", (chunk) => {
      received += chunk.length;
      if (received > maxBytes) {
        reject(new Error("PAYLOAD_TOO_LARGE"));
        req.destroy();
        return;
      }
      chunks.push(chunk);
    });
    req.on("end", () => {
      resolve3(Buffer.concat(chunks).toString("utf-8"));
    });
    req.on("error", reject);
  });
}
function readBinaryBody(req, maxBytes) {
  return new Promise((resolve3, reject) => {
    const chunks = [];
    let received = 0;
    req.on("data", (chunk) => {
      received += chunk.length;
      if (received > maxBytes) {
        reject(new Error("PAYLOAD_TOO_LARGE"));
        req.destroy();
        return;
      }
      chunks.push(chunk);
    });
    req.on("end", () => {
      resolve3(Buffer.concat(chunks));
    });
    req.on("error", reject);
  });
}
function verifySignature(signature, timestamp, body, secret) {
  const ts = parseInt(timestamp, 10);
  if (!Number.isFinite(ts)) return false;
  const now = Math.floor(Date.now() / 1e3);
  if (Math.abs(now - ts) > 300) return false;
  const payload = `${ts}.${body}`;
  const expected = crypto4.createHmac("sha256", secret).update(payload).digest("hex");
  return crypto4.timingSafeEqual(
    Buffer.from(signature, "hex"),
    Buffer.from(expected, "hex")
  );
}
function parseUrlPath(url) {
  const idx = url.indexOf("?");
  return idx >= 0 ? url.slice(0, idx) : url;
}
function parseQueryString(url) {
  const idx = url.indexOf("?");
  if (idx < 0) return {};
  const qs = url.slice(idx + 1);
  const params = {};
  for (const part of qs.split("&")) {
    const eqIdx = part.indexOf("=");
    if (eqIdx >= 0) {
      params[decodeURIComponent(part.slice(0, eqIdx))] = decodeURIComponent(part.slice(eqIdx + 1));
    }
  }
  return params;
}
function createGoChatDirectServer(opts) {
  const port = opts.port ?? DEFAULT_DIRECT_PORT;
  const host = opts.host ?? DEFAULT_DIRECT_HOST;
  const rateLimiter = createAuthRateLimiter({
    maxAttempts: WEBHOOK_RATE_LIMIT_DEFAULTS.maxRequests,
    windowMs: WEBHOOK_RATE_LIMIT_DEFAULTS.windowMs,
    lockoutMs: WEBHOOK_RATE_LIMIT_DEFAULTS.windowMs,
    exemptLoopback: false,
    pruneIntervalMs: WEBHOOK_RATE_LIMIT_DEFAULTS.windowMs
  });
  const server = createServer(async (req, res) => {
    const reqPath = parseUrlPath(req.url ?? "/");
    const method = req.method ?? "GET";
    try {
      if (reqPath === HEALTH_PATH) {
        writeJson(res, 200, { status: "ok", mode: "local" });
        return;
      }
      if (reqPath === "/api/gochat/send" && method === "POST") {
        const clientIp = req.socket.remoteAddress ?? "unknown";
        if (!rateLimiter.check(clientIp, RATE_LIMIT_SCOPE).allowed) {
          writeJson(res, 429, { error: "Too Many Requests" });
          return;
        }
        const signature = req.headers["x-gochat-signature"];
        const timestamp = req.headers["x-gochat-timestamp"];
        if (typeof signature !== "string" || !signature.trim()) {
          rateLimiter.recordFailure(clientIp, RATE_LIMIT_SCOPE);
          writeJson(res, 400, { error: "Missing X-GoChat-Signature header" });
          return;
        }
        if (typeof timestamp !== "string" || !timestamp.trim()) {
          writeJson(res, 400, { error: "Missing X-GoChat-Timestamp header" });
          return;
        }
        const body = await readBody(req, DEFAULT_MAX_BODY_BYTES);
        if (!verifySignature(signature, timestamp, body, opts.secret)) {
          rateLimiter.recordFailure(clientIp, RATE_LIMIT_SCOPE);
          writeJson(res, 401, { error: "Invalid signature" });
          return;
        }
        rateLimiter.reset(clientIp, RATE_LIMIT_SCOPE);
        const result = await handleSend(opts.storage, body, opts.onInbound);
        if ("error" in result) {
          writeJson(res, 400, result);
        } else {
          writeJson(res, 200, result);
        }
        return;
      }
      if (reqPath === "/api/gochat/conversations" && method === "GET") {
        const conversations = await handleListConversations(opts.storage);
        writeJson(res, 200, conversations);
        return;
      }
      const messagesMatch = reqPath.match(
        /^\/api\/gochat\/conversations\/([^/]+)\/messages$/
      );
      if (messagesMatch && method === "GET") {
        const conversationId = decodeURIComponent(messagesMatch[1]);
        const qs = parseQueryString(req.url ?? "");
        const limit = qs["limit"] ? parseInt(qs["limit"], 10) : void 0;
        const result = await handleGetMessages(opts.storage, conversationId, limit);
        if ("error" in result) {
          writeJson(res, 400, result);
        } else {
          writeJson(res, 200, result);
        }
        return;
      }
      if (reqPath === "/api/gochat/upload" && method === "POST") {
        const contentType = req.headers["content-type"] ?? "";
        if (!contentType.includes("multipart/form-data")) {
          writeJson(res, 400, { error: "Content-Type must be multipart/form-data" });
          return;
        }
        const boundary = contentType.split("boundary=")[1]?.trim();
        if (!boundary) {
          writeJson(res, 400, { error: "Missing multipart boundary" });
          return;
        }
        const buffer = await readBinaryBody(req, UPLOAD_MAX_BODY_BYTES);
        const fileResult = parseMultipartFile(buffer, boundary);
        if (!fileResult) {
          writeJson(res, 400, { error: "No file found in upload" });
          return;
        }
        const baseUrl = getBaseUrl();
        const result = await handleUpload(
          opts.storage,
          fileResult.data,
          fileResult.filename ?? "upload",
          fileResult.contentType ?? "application/octet-stream",
          baseUrl
        );
        writeJson(res, 200, result);
        return;
      }
      if (reqPath.startsWith("/files/")) {
        const filename = reqPath.slice("/files/".length);
        const filePath = opts.storage.getUploadPath(filename);
        try {
          const stat = await import("node:fs").then(
            (fs2) => fs2.promises.stat(filePath)
          );
          res.writeHead(200, {
            "Content-Length": stat.size,
            "Cache-Control": "public, max-age=86400"
          });
          const { createReadStream } = await import("node:fs");
          const stream = createReadStream(filePath);
          await pipeline(stream, res);
        } catch {
          writeJson(res, 404, { error: "File not found" });
        }
        return;
      }
      res.writeHead(404);
      res.end();
    } catch (err) {
      if (err instanceof Error && err.message === "PAYLOAD_TOO_LARGE") {
        writeJson(res, 413, { error: "Payload too large" });
        return;
      }
      const error = err instanceof Error ? err : new Error(String(err));
      opts.onError?.(error);
      writeJson(res, 500, { error: "Internal server error" });
    }
  });
  let stopped = false;
  const start = () => {
    return new Promise((resolve3, reject) => {
      server.once("error", (err) => {
        if (!stopped) {
          reject(err);
        }
      });
      server.listen(port, host, () => {
        server.removeListener("error", reject);
        resolve3();
      });
    });
  };
  const stop = () => {
    if (stopped) return;
    stopped = true;
    try {
      server.close();
    } catch {
    }
  };
  if (opts.abortSignal) {
    if (opts.abortSignal.aborted) {
      stop();
    } else {
      opts.abortSignal.addEventListener("abort", stop, { once: true });
    }
  }
  const getBaseUrl = () => {
    const displayHost = host === "0.0.0.0" ? "localhost" : host;
    return `http://${displayHost}:${port}`;
  };
  return { server, start, stop, getBaseUrl };
}
function parseMultipartFile(buffer, boundary) {
  const boundaryBytes = Buffer.from(`--${boundary}`);
  const parts = [];
  let start = 0;
  while (start < buffer.length) {
    const idx = buffer.indexOf(boundaryBytes, start);
    if (idx < 0) break;
    if (start > 0) {
      parts.push(buffer.slice(start, idx));
    }
    start = idx + boundaryBytes.length;
  }
  for (const part of parts) {
    const headerEnd = part.indexOf("\r\n\r\n");
    if (headerEnd < 0) continue;
    const headerStr = part.slice(0, headerEnd).toString("utf-8");
    const dataStart = headerEnd + 4;
    let dataEnd = part.length;
    if (part.slice(dataEnd - 2).equals(Buffer.from("\r\n"))) {
      dataEnd -= 2;
    }
    const nameMatch = headerStr.match(/name="([^"]+)"/);
    const filenameMatch = headerStr.match(/filename="([^"]+)"/);
    const ctMatch = headerStr.match(/Content-Type:\s*([^\r\n]+)/i);
    if (!filenameMatch || !nameMatch) continue;
    return {
      data: part.slice(dataStart, dataEnd),
      filename: filenameMatch[1],
      contentType: ctMatch?.[1]?.trim()
    };
  }
  return null;
}

// src/channel.ts
var meta = {
  id: "gochat",
  label: "GoChat",
  selectionLabel: "GoChat (custom)",
  docsPath: "/channels/gochat",
  docsLabel: "gochat",
  blurb: "Custom chat backend. Local, relay, or ClawTile account-level agent mode. Supports text, images, audio, and file attachments.",
  order: 90,
  quickstartAllowFrom: true
};
var gochatConfigAdapter = createScopedChannelConfigAdapter({
  sectionKey: "gochat",
  listAccountIds: listGoChatAccountIds,
  resolveAccount: adaptScopedAccountAccessor(resolveGoChatAccount),
  defaultAccountId: resolveDefaultGoChatAccountId,
  clearBaseFields: ["webhookSecret", "webhookSecretFile", "agentToken", "agentTokenFile", "name"],
  resolveAllowFrom: (account) => account.config.allowFrom,
  formatAllowFrom: (allowFrom) => formatAllowFromLowercase({
    allowFrom,
    stripPrefixRe: /^gochat:/i
  })
});
var resolveGoChatDmPolicy = createScopedDmSecurityResolver({
  channelKey: "gochat",
  resolvePolicy: (account) => account.config.dmPolicy,
  resolveAllowFrom: (account) => account.config.allowFrom,
  policyPathSuffix: "dmPolicy",
  normalizeEntry: (raw) => raw.trim().replace(/^gochat:/i, "").trim().toLowerCase()
});
var collectGoChatSecurityWarnings = createAllowlistProviderRouteAllowlistWarningCollector({
  providerConfigPresent: (cfg) => cfg.channels?.gochat !== void 0,
  resolveGroupPolicy: (account) => account.config.groupPolicy,
  resolveRouteAllowlistConfigured: (account) => Boolean(account.config.conversations) && Object.keys(account.config.conversations ?? {}).length > 0,
  restrictSenders: {
    surface: "GoChat conversations",
    openScope: "any member in allowed conversations",
    groupPolicyPath: "channels.gochat.groupPolicy",
    groupAllowFromPath: "channels.gochat.groupAllowFrom"
  },
  noRouteAllowlist: {
    surface: "GoChat conversations",
    routeAllowlistPath: "channels.gochat.conversations",
    routeScope: "conversation",
    groupPolicyPath: "channels.gochat.groupPolicy",
    groupAllowFromPath: "channels.gochat.groupAllowFrom"
  }
});
function chunkTextForOutbound(text, limit) {
  if (!text || text.length <= limit) {
    return [text];
  }
  const chunks = [];
  let remaining = text;
  while (remaining.length > 0) {
    if (remaining.length <= limit) {
      chunks.push(remaining);
      break;
    }
    let splitAt = remaining.lastIndexOf("\n", limit);
    if (splitAt <= 0) {
      splitAt = remaining.lastIndexOf(" ", limit);
    }
    if (splitAt <= 0) {
      splitAt = limit;
    }
    chunks.push(remaining.slice(0, splitAt));
    remaining = remaining.slice(splitAt).replace(/^\n+/, "");
  }
  return chunks;
}
var gochatPlugin = createChatChannelPlugin({
  base: {
    id: "gochat",
    meta,
    setupWizard: gochatSetupWizard,
    capabilities: {
      chatTypes: ["direct", "channel", "group"],
      reactions: false,
      threads: false,
      media: true,
      nativeCommands: false
    },
    reload: { configPrefixes: ["channels.gochat"] },
    configSchema: buildChannelConfigSchema(GoChatConfigSchema),
    config: {
      ...gochatConfigAdapter,
      isConfigured: (account) => account.secretSource !== "none",
      describeAccount: (account) => describeWebhookAccountSnapshot({
        account,
        configured: account.secretSource !== "none",
        extra: {
          secretSource: account.secretSource,
          mode: account.mode
        }
      })
    },
    groups: {
      resolveRequireMention: ({ cfg, accountId, groupId }) => {
        const account = resolveGoChatAccount({ cfg, accountId });
        const conversations = account.config.conversations;
        if (!conversations || !groupId) {
          return true;
        }
        const convConfig = conversations[groupId];
        if (convConfig?.requireMention !== void 0) {
          return convConfig.requireMention;
        }
        const wildcardConfig = conversations["*"];
        if (wildcardConfig?.requireMention !== void 0) {
          return wildcardConfig.requireMention;
        }
        return true;
      },
      resolveToolPolicy: resolveGoChatGroupToolPolicy
    },
    messaging: {
      normalizeTarget: normalizeGoChatMessagingTarget,
      resolveOutboundSessionRoute: (params) => resolveGoChatOutboundSessionRoute(params),
      targetResolver: {
        looksLikeId: looksLikeGoChatTargetId,
        hint: "<conversationId>"
      }
    },
    setup: gochatSetupAdapter,
    status: createComputedAccountStatusAdapter({
      defaultRuntime: createDefaultChannelRuntimeState(DEFAULT_ACCOUNT_ID),
      buildChannelSummary: ({ snapshot }) => buildWebhookChannelStatusSummary(snapshot, {
        secretSource: snapshot.secretSource ?? "none"
      }),
      resolveAccountSnapshot: ({ account }) => ({
        accountId: account.accountId,
        name: account.name,
        enabled: account.enabled,
        configured: account.secretSource !== "none",
        extra: {
          secretSource: account.secretSource,
          mode: account.mode
        }
      })
    }),
    gateway: {
      startAccount: async (ctx) => {
        const account = ctx.account;
        console.log(`[gochat] \u2500\u2500\u2500\u2500 GoChat Account Configuration \u2500\u2500\u2500\u2500`);
        console.log(`[gochat]   accountId:     ${account.accountId}`);
        console.log(`[gochat]   mode:          ${account.mode}`);
        console.log(`[gochat]   enabled:       ${account.enabled}`);
        console.log(`[gochat]   secretSource:  ${account.secretSource}`);
        if (account.name) {
          console.log(`[gochat]   name:          ${account.name}`);
        }
        if (account.mode === "local") {
          console.log(`[gochat]   host:          ${account.directHost}`);
          console.log(`[gochat]   port:          ${account.directPort}`);
        }
        if (account.mode === "relay") {
          console.log(`[gochat]   relayUrl:      ${account.relayPlatformUrl}`);
          console.log(`[gochat]   channelId:     ${account.channelId || "(pending auto-register)"}`);
        }
        if (account.mode === "agent") {
          console.log(`[gochat]   agentServer:   ${account.agentServerUrl}`);
          console.log(`[gochat]   agentToken:    ${account.secret ? "configured" : "(not set)"}`);
        }
        console.log(`[gochat]   dmPolicy:      ${account.config.dmPolicy ?? "open"}`);
        console.log(`[gochat]   groupPolicy:   ${account.config.groupPolicy ?? "allowlist"}`);
        if (account.config.allowFrom?.length) {
          console.log(`[gochat]   allowFrom:     ${account.config.allowFrom.join(", ")}`);
        }
        console.log(`[gochat] \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500`);
        const statusSink = createAccountStatusSink({
          accountId: ctx.accountId,
          setStatus: ctx.setStatus
        });
        if (account.mode === "local") {
          ctx.log?.info(`[${account.accountId}] starting GoChat local server on :${account.directPort}`);
          const core = getGoChatRuntime();
          const stateDir = process.env.OPENCLAW_STATE_DIR || "";
          const storage = new GoChatDirectStorage(stateDir || "~/.openclaw");
          await storage.init();
          setDirectStorage(storage);
          const { start, stop, getBaseUrl } = createGoChatDirectServer({
            port: account.directPort,
            host: account.directHost,
            secret: account.secret,
            storage,
            onInbound: async (message) => {
              core.channel.activity.record({
                channel: "gochat",
                accountId: account.accountId,
                direction: "inbound",
                at: message.timestamp
              });
              await handleGoChatInbound({
                message,
                account,
                config: ctx.cfg,
                runtime: ctx.runtime,
                statusSink
              });
            },
            onError: (error) => {
              ctx.log?.error(`[gochat:${account.accountId}] local server error: ${error.message}`);
            },
            abortSignal: ctx.abortSignal,
            allowPrivateNetwork: account.config.allowPrivateNetwork
          });
          if (ctx.abortSignal?.aborted) {
            return;
          }
          await start();
          if (ctx.abortSignal?.aborted) {
            stop();
            return;
          }
          const baseUrl = getBaseUrl();
          ctx.log?.info(`[gochat:${account.accountId}] local server listening on ${baseUrl}`);
          return;
        }
        if (account.mode === "agent") {
          ctx.log?.info(`[${account.accountId}] starting GoChat agent connection to ${account.agentServerUrl}`);
          await runStoppablePassiveMonitor({
            abortSignal: ctx.abortSignal,
            start: async () => await monitorGoChatAgentProvider({
              accountId: account.accountId,
              config: ctx.cfg,
              runtime: ctx.runtime,
              abortSignal: ctx.abortSignal,
              statusSink
            })
          });
          return;
        }
        if (!account.channelId) {
          console.log(`[gochat] channelId missing \u2014 auto-registering with ${DEFAULT_RELAY_HTTP_URL}/api/plugin/register`);
          try {
            const registerUrl = DEFAULT_RELAY_HTTP_URL + "/api/plugin/register";
            const deviceName = account.name || "OpenClaw Plugin";
            const resp = await fetch(registerUrl, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ name: deviceName }),
              signal: AbortSignal.timeout(1e4)
            });
            if (!resp.ok) {
              const errText = await resp.text().catch(() => "");
              throw new Error(`Registration failed (${resp.status}): ${errText}`);
            }
            const data = await resp.json();
            if (!data.channelId || !data.secret) {
              throw new Error("Registration response missing channelId or secret");
            }
            const core = getGoChatRuntime();
            const cfg = core.config.loadConfig();
            const updatedCfg = setGoChatAccountConfig(cfg, account.accountId, {
              channelId: data.channelId,
              webhookSecret: data.secret,
              relayPlatformUrl: DEFAULT_RELAY_WS_URL
            });
            await core.config.writeConfigFile(updatedCfg);
            console.log(`[gochat] auto-registered OK \u2014 channelId=${data.channelId} saved to config`);
            account.channelId = data.channelId;
            account.secret = data.secret;
          } catch (err) {
            console.warn(`[gochat] auto-registration failed: ${err instanceof Error ? err.message : String(err)}`);
            console.warn(`[gochat] relay will fail without channelId. Run: openclaw gochat setup`);
          }
        }
        ctx.log?.info(`[${account.accountId}] starting GoChat relay connection to ${account.relayPlatformUrl}`);
        await runStoppablePassiveMonitor({
          abortSignal: ctx.abortSignal,
          start: async () => await monitorGoChatProvider({
            accountId: account.accountId,
            config: ctx.cfg,
            runtime: ctx.runtime,
            abortSignal: ctx.abortSignal,
            statusSink
          })
        });
      },
      logoutAccount: async ({ accountId, cfg }) => {
        const nextCfg = { ...cfg };
        const nextSection = cfg.channels?.gochat ? { ...cfg.channels.gochat } : void 0;
        let cleared = false;
        let changed = false;
        if (nextSection) {
          if (accountId === DEFAULT_ACCOUNT_ID && nextSection.webhookSecret) {
            delete nextSection.webhookSecret;
            cleared = true;
            changed = true;
          }
          if (accountId === DEFAULT_ACCOUNT_ID && nextSection.agentToken) {
            delete nextSection.agentToken;
            cleared = true;
            changed = true;
          }
          if (accountId === DEFAULT_ACCOUNT_ID && nextSection.agentTokenFile) {
            delete nextSection.agentTokenFile;
            cleared = true;
            changed = true;
          }
          const accountCleanup = clearAccountEntryFields({
            accounts: nextSection.accounts,
            accountId,
            fields: ["webhookSecret", "agentToken", "agentTokenFile"]
          });
          if (accountCleanup.changed) {
            changed = true;
            if (accountCleanup.cleared) {
              cleared = true;
            }
            if (accountCleanup.nextAccounts) {
              nextSection.accounts = accountCleanup.nextAccounts;
            } else {
              delete nextSection.accounts;
            }
          }
        }
        if (changed) {
          if (nextSection && Object.keys(nextSection).length > 0) {
            nextCfg.channels = { ...nextCfg.channels, gochat: nextSection };
          } else {
            const nextChannels = { ...nextCfg.channels };
            delete nextChannels.gochat;
            if (Object.keys(nextChannels).length > 0) {
              nextCfg.channels = nextChannels;
            } else {
              delete nextCfg.channels;
            }
          }
        }
        const resolved = resolveGoChatAccount({
          cfg: changed ? nextCfg : cfg,
          accountId
        });
        const loggedOut = resolved.secretSource === "none";
        if (changed) {
          await getGoChatRuntime().config.writeConfigFile(nextCfg);
        }
        return {
          cleared,
          envSecret: Boolean(process.env.GOCHAT_WEBHOOK_SECRET?.trim()),
          loggedOut
        };
      }
    }
  },
  pairing: {
    text: {
      idLabel: "gochatUserId",
      message: "OpenClaw: your access has been approved.",
      normalizeAllowEntry: createPairingPrefixStripper(
        /^gochat:/i,
        (entry) => entry.toLowerCase()
      ),
      notify: createLoggedPairingApprovalNotifier(
        ({ id }) => `[gochat] User ${id} approved for pairing`
      )
    }
  },
  security: {
    resolveDmPolicy: resolveGoChatDmPolicy,
    collectWarnings: collectGoChatSecurityWarnings
  },
  outbound: {
    base: {
      deliveryMode: "direct",
      chunker: chunkTextForOutbound,
      chunkerMode: "markdown",
      textChunkLimit: 4e3
    },
    attachedResults: {
      channel: "gochat",
      sendText: async ({ cfg, to, text, accountId, replyToId }) => await sendMessageGoChat(to, text, {
        accountId: accountId ?? void 0,
        replyTo: replyToId ?? void 0,
        cfg
      }),
      sendMedia: async ({ cfg, to, text, mediaUrl, accountId, replyToId }) => await sendMessageGoChat(to, text ?? "", {
        accountId: accountId ?? void 0,
        replyTo: replyToId ?? void 0,
        mediaUrl,
        cfg
      })
    }
  }
});

// src/task-tools.ts
import crypto5 from "node:crypto";
function resolveGoBackendBaseUrl(cfg) {
  const account = resolveGoChatAccount({ cfg });
  if (account.mode === "relay") {
    return account.relayPlatformUrl.replace(/^wss?/, "https").replace(/\/ws\/plugin$/, "");
  }
  return `http://localhost:${account.directPort}`;
}
function signGoChatRequest(secret, body) {
  const ts = Math.floor(Date.now() / 1e3);
  const payload = `${ts}.${body}`;
  const signature = crypto5.createHmac("sha256", secret).update(payload).digest("hex");
  return { signature, timestamp: String(ts) };
}
async function goBackendFetch(baseUrl, secret, path2, init) {
  const body = init?.body;
  const headers = {
    "Content-Type": "application/json",
    ...init?.headers
  };
  if (body) {
    const { signature, timestamp } = signGoChatRequest(secret, body);
    headers["X-GoChat-Signature"] = signature;
    headers["X-GoChat-Timestamp"] = timestamp;
  }
  const url = `${baseUrl}${path2}`;
  const response = await fetch(url, { ...init, headers, body });
  if (!response.ok) {
    const errorBody = await response.text().catch(() => "");
    throw new Error(`GoChat task API error (${response.status}): ${errorBody}`);
  }
  return response;
}
function textSuccess(text) {
  return { content: [{ type: "text", text }], details: {} };
}
function textError(text) {
  return { content: [{ type: "text", text }], details: { error: true } };
}
function createGoChatTaskTool() {
  return {
    name: "gochat_tasks",
    label: "GoChat Tasks",
    description: "Manage task lists in GoChat conversations. Use this to create, list, toggle (complete/uncomplete), and delete tasks. Tasks are scoped to a specific conversation. Examples: create a task 'Buy groceries' in conversation 'default', list all tasks, mark a task as done.",
    parameters: {
      type: "object",
      properties: {
        action: {
          type: "string",
          description: "The task action to perform: 'create', 'list', 'toggle', or 'delete'."
        },
        conversationId: {
          type: "string",
          description: "The conversation ID to scope the task operation to."
        },
        title: {
          type: "string",
          description: "Task title (required for 'create' action)."
        },
        taskId: {
          type: "string",
          description: "Task ID (required for 'toggle' and 'delete' actions)."
        }
      },
      required: ["action", "conversationId"]
    },
    async execute(_id, params) {
      try {
        const cfg = getGoChatRuntime().config.loadConfig();
        const account = resolveGoChatAccount({ cfg });
        const baseUrl = resolveGoBackendBaseUrl(cfg);
        const secret = account.secret?.trim() || "";
        switch (params.action) {
          case "create": {
            if (!params.title?.trim()) {
              return textError("'title' is required for the 'create' action.");
            }
            const body = JSON.stringify({ title: params.title });
            const res = await goBackendFetch(
              baseUrl,
              secret,
              `/api/conversations/${encodeURIComponent(params.conversationId)}/tasks`,
              { method: "POST", body }
            );
            const task = await res.json();
            return textSuccess(
              `Task created: "${task.title}" (id: ${task.id}) in conversation "${params.conversationId}"`
            );
          }
          case "list": {
            const res = await goBackendFetch(
              baseUrl,
              secret,
              `/api/conversations/${encodeURIComponent(params.conversationId)}/tasks`
            );
            const data = await res.json();
            if (data.tasks.length === 0) {
              return textSuccess(`No tasks in conversation "${params.conversationId}".`);
            }
            const lines = data.tasks.map(
              (t) => `${t.done ? "\u2705" : "\u2B1C"} ${t.title} (id: ${t.id})`
            );
            return textSuccess(
              `Tasks in "${params.conversationId}":
${lines.join("\n")}`
            );
          }
          case "toggle": {
            if (!params.taskId) {
              return textError("'taskId' is required for the 'toggle' action.");
            }
            const res = await goBackendFetch(
              baseUrl,
              secret,
              `/api/conversations/${encodeURIComponent(params.conversationId)}/tasks/${encodeURIComponent(params.taskId)}/toggle`,
              { method: "POST" }
            );
            const task = await res.json();
            return textSuccess(
              `Task "${task.title}" ${task.done ? "completed \u2705" : "reopened \u2B1C"} (id: ${task.id})`
            );
          }
          case "delete": {
            if (!params.taskId) {
              return textError("'taskId' is required for the 'delete' action.");
            }
            await goBackendFetch(
              baseUrl,
              secret,
              `/api/conversations/${encodeURIComponent(params.conversationId)}/tasks/${encodeURIComponent(params.taskId)}`,
              { method: "DELETE" }
            );
            return textSuccess(`Task deleted (id: ${params.taskId})`);
          }
          default:
            return textError(
              `Unknown action '${params.action}'. Use: create, list, toggle, delete.`
            );
        }
      } catch (error) {
        const msg = error instanceof Error ? error.message : String(error);
        return textError(`GoChat task error: ${msg}`);
      }
    }
  };
}

// src/gateway-access.ts
import { execFile as execFile4 } from "node:child_process";
import { promisify as promisify4 } from "node:util";
import { loadConfig, writeConfigFile } from "openclaw/plugin-sdk/config-runtime";
var execFileAsync4 = promisify4(execFile4);
var REQUIRED_OPERATOR_SCOPES = [
  "operator.admin",
  "operator.approvals",
  "operator.pairing",
  "operator.read",
  "operator.talk.secrets",
  "operator.write"
];
var LOOPBACK_ALIASES = /* @__PURE__ */ new Set(["localhost", "openclaw.local"]);
function logInfo(logger, message) {
  logger?.info?.(`[gochat] ${message}`);
}
function logWarn(logger, message) {
  logger?.warn?.(`[gochat] ${message}`);
}
function extractJsonPayload3(raw) {
  const text = raw.trim();
  if (!text) {
    throw new Error("empty command output");
  }
  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    if (char !== "{" && char !== "[") {
      continue;
    }
    const candidate = text.slice(index).trim();
    try {
      return JSON.parse(candidate);
    } catch {
    }
  }
  throw new Error("json payload not found in command output");
}
function normalizeLoopbackGatewayRemoteUrl(rawUrl) {
  const trimmed = rawUrl.trim();
  if (!trimmed) {
    return null;
  }
  let parsed;
  try {
    parsed = new URL(trimmed);
  } catch {
    return null;
  }
  const host = parsed.hostname.trim().toLowerCase();
  if (!LOOPBACK_ALIASES.has(host)) {
    return null;
  }
  parsed.hostname = "127.0.0.1";
  return parsed.toString();
}
function readGoChatGatewayAccessConfig(cfg) {
  const record = cfg ?? {};
  return record.channels?.gochat?.gatewayAccess ?? {};
}
function patchConfigValue(cfg, path2, value) {
  const root = cfg && typeof cfg === "object" && !Array.isArray(cfg) ? { ...cfg } : {};
  let cursor = root;
  for (let index = 0; index < path2.length - 1; index += 1) {
    const key = path2[index];
    const current = cursor[key];
    const next = current && typeof current === "object" && !Array.isArray(current) ? { ...current } : {};
    cursor[key] = next;
    cursor = next;
  }
  cursor[path2[path2.length - 1]] = value;
  return root;
}
function normalizeScopes2(scopes) {
  if (!Array.isArray(scopes)) {
    return [];
  }
  return scopes.map((entry) => String(entry ?? "").trim()).filter(Boolean).sort();
}
function isEligibleCliRepairRequest(req) {
  const role = String(req.role ?? "").trim().toLowerCase();
  if (role !== "operator" || req.isRepair !== true) {
    return false;
  }
  const clientId = String(req.clientId ?? "").trim().toLowerCase();
  const clientMode = String(req.clientMode ?? "").trim().toLowerCase();
  if (clientId !== "cli" && clientMode !== "cli") {
    return false;
  }
  const requested = normalizeScopes2(req.scopes);
  const required = [...REQUIRED_OPERATOR_SCOPES].sort();
  if (requested.length !== required.length) {
    return false;
  }
  return required.every((scope, index) => scope === requested[index]);
}
async function runOpenClawJson2(args) {
  const openclawBin = process.env.GOCHAT_OPENCLAW_BIN?.trim() || "openclaw";
  const { stdout, stderr } = await execFileAsync4(openclawBin, args, {
    timeout: 1e4,
    maxBuffer: 2 * 1024 * 1024
  });
  return extractJsonPayload3([stdout, stderr].filter(Boolean).join("\n"));
}
function stringifyError(error) {
  return error instanceof Error ? error.message : String(error);
}
async function maybePersistNormalizedGatewayUrl(params) {
  const cfg = params.readConfig();
  const gateway = cfg ?? {};
  const currentUrl = String(gateway.gateway?.remote?.url ?? "").trim();
  const normalizedUrl = normalizeLoopbackGatewayRemoteUrl(currentUrl);
  if (!normalizedUrl || normalizedUrl === currentUrl) {
    return {};
  }
  const nextCfg = patchConfigValue(cfg, ["gateway", "remote", "url"], normalizedUrl);
  await params.writeConfig(nextCfg);
  logInfo(params.logger, `normalized gateway.remote.url to ${normalizedUrl}`);
  return {
    normalizedGatewayRemoteUrlFrom: currentUrl,
    normalizedGatewayRemoteUrlTo: normalizedUrl
  };
}
async function maybeApproveLocalRepair(params) {
  let deviceList;
  try {
    deviceList = await runOpenClawJson2(["devices", "list", "--json", "--timeout", "5000"]);
  } catch (error) {
    return {
      skippedReason: `devices list unavailable: ${stringifyError(error)}`
    };
  }
  const matching = (deviceList.pending ?? []).filter(isEligibleCliRepairRequest);
  if (matching.length === 0) {
    return {
      skippedReason: "no eligible local CLI repair request"
    };
  }
  if (matching.length > 1) {
    return {
      skippedReason: "multiple eligible local CLI repair requests are pending"
    };
  }
  const request = matching[0];
  if (!request.requestId?.trim()) {
    return {
      skippedReason: "eligible repair request is missing requestId"
    };
  }
  try {
    await runOpenClawJson2([
      "devices",
      "approve",
      request.requestId,
      "--json",
      "--timeout",
      "5000"
    ]);
    logInfo(params.logger, `approved local CLI repair request ${request.requestId}`);
    return {
      approvedRequestId: request.requestId,
      approvedDeviceId: request.deviceId?.trim() || void 0
    };
  } catch (error) {
    return {
      skippedReason: `approve failed: ${stringifyError(error)}`
    };
  }
}
async function approveGoChatLocalRepair(params) {
  return await maybeApproveLocalRepair({
    logger: params?.logger
  });
}
async function ensureGoChatGatewayAccess(params) {
  const readConfig = params?.readConfig ?? (() => loadConfig());
  const writeConfig = params?.writeConfig ?? (async (cfg) => {
    await writeConfigFile(cfg);
  });
  const logger = params?.logger;
  const access = readGoChatGatewayAccessConfig(readConfig());
  const normalizeLoopbackRemoteUrl = access.normalizeLoopbackRemoteUrl !== false;
  const autoApproveLocalRepair = access.autoApproveLocalRepair !== false;
  const result = {};
  if (normalizeLoopbackRemoteUrl) {
    try {
      Object.assign(result, await maybePersistNormalizedGatewayUrl({
        readConfig,
        writeConfig,
        logger
      }));
    } catch (error) {
      logWarn(logger, `failed to normalize gateway.remote.url: ${stringifyError(error)}`);
    }
  }
  if (autoApproveLocalRepair) {
    Object.assign(result, await maybeApproveLocalRepair({ logger }));
  }
  return result;
}

// src/cli.ts
import { loadConfig as loadConfig2, writeConfigFile as writeConfigFile2 } from "openclaw/plugin-sdk/config-runtime";
function registerGochatCli(program) {
  const gochatCmd = program.command("gochat").description("GoChat custom backend management");
  gochatCmd.command("show-credentials").description("Display connection ID and secret key for GoChat").option("-a, --account <accountId>", "Account ID (default: default account)").action(async (options) => {
    const accountId = options.account || void 0;
    try {
      const cfg = loadConfig2();
      const account = resolveGoChatAccount({ cfg, accountId });
      console.log("\n\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501");
      console.log("  GoChat Connection Credentials");
      console.log("\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\n");
      console.log(`  Account ID:      ${account.accountId}`);
      console.log(`  Mode:            ${account.mode}`);
      console.log(`  Status:          ${account.enabled ? "\u2713 Enabled" : "\u2717 Disabled"}`);
      console.log(`  Secret Source:   ${account.secretSource}`);
      console.log("");
      if (account.mode === "relay") {
        console.log("  Relay Configuration:");
        console.log(`    Channel ID:    ${account.channelId || "(not set)"}`);
        console.log(`    Relay URL:     ${account.relayPlatformUrl}`);
        console.log(`    Secret Key:    ${account.secret || "(not set)"}`);
      } else if (account.mode === "agent") {
        console.log("  Agent Configuration:");
        console.log(`    Server URL:    ${account.agentServerUrl}`);
        console.log(`    Token Source:  ${account.secretSource}`);
        console.log(`    Token Prefix:  ${account.secret ? account.secret.slice(0, 13) : "(not set)"}`);
      } else {
        console.log("  Local Configuration:");
        console.log(`    Host:          ${account.directHost}`);
        console.log(`    Port:          ${account.directPort}`);
        console.log(`    Secret Key:    ${account.secret || "(auto-generated)"}`);
      }
      console.log("\n\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\n");
    } catch (error) {
      console.error("\n\u2717 Error retrieving credentials:");
      console.error(`  ${error instanceof Error ? error.message : String(error)}`);
      console.error("");
      process.exit(1);
    }
  });
  gochatCmd.command("bind-agent").description("Bind this OpenClaw plugin to a ClawTile account using the 6-digit mini-program pairing code").requiredOption("--code <code>", "6-digit pairing code from the ClawTile mini-program").option("--server <url>", "ClawTile server URL", DEFAULT_CLAWTILE_HTTP_URL).option("-a, --account <accountId>", "Account ID (default: default account)").option("--name <name>", "Display name shown in ClawTile", "OpenClaw").option("--json", "Output JSON result").action(async (options) => {
    const code = String(options.code ?? "").trim();
    const serverUrl = String(options.server ?? DEFAULT_CLAWTILE_HTTP_URL).trim().replace(/\/+$/, "");
    if (!/^\d{6}$/.test(code)) {
      console.error("\n\u2717 Invalid pairing code. Use the 6-digit code from the mini-program.\n");
      process.exit(1);
    }
    try {
      const accountId = options.account || void 0;
      const currentCfg = loadConfig2();
      const result = await exchangeAgentPairCode({
        serverUrl,
        code,
        displayName: String(options.name ?? "OpenClaw"),
        version: "gochat-plugin"
      });
      const nextCfg = setGoChatAccountConfig(currentCfg, accountId ?? "default", {
        enabled: true,
        mode: "agent",
        agentServerUrl: serverUrl,
        agentToken: result.token,
        dmPolicy: "open",
        blockStreaming: true
      });
      await writeConfigFile2(nextCfg);
      const payload = {
        accountId: accountId ?? "default",
        mode: "agent",
        serverUrl,
        tokenPrefix: result.agent?.tokenPrefix || result.token.slice(0, 13),
        endpoints: result.endpoints,
        user: result.user
      };
      if (options.json) {
        console.log(JSON.stringify(payload, null, 2));
        return;
      }
      console.log("\n\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501");
      console.log("  ClawTile Agent Bound");
      console.log("\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\n");
      console.log(`  Account ID:      ${payload.accountId}`);
      console.log(`  Server URL:      ${serverUrl}`);
      console.log(`  Token Prefix:    ${payload.tokenPrefix}`);
      if (result.endpoints?.sse) {
        console.log(`  Events:          ${result.endpoints.sse}`);
      }
      console.log("\nStart or restart OpenClaw gateway to use the new agent binding.");
      console.log("\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\n");
    } catch (error) {
      console.error("\n\u2717 Failed to bind ClawTile agent:");
      console.error(`  ${error instanceof Error ? error.message : String(error)}`);
      console.error("");
      process.exit(1);
    }
  });
  gochatCmd.command("authorize-mode-switch").description("Authorize the next explicit mode switch for a GoChat account").requiredOption("--mode <mode>", "Target mode: local, relay, or agent").option("-a, --account <accountId>", "Account ID (default: default account)").option("--ttl-minutes <minutes>", "Authorization lifetime in minutes", String(DEFAULT_MODE_SWITCH_AUTH_TTL_MINUTES)).option("--json", "Output JSON result").action(async (options) => {
    const rawMode = String(options.mode ?? "").trim().toLowerCase();
    if (rawMode !== "local" && rawMode !== "relay" && rawMode !== "agent") {
      console.error("\n\u2717 Invalid mode. Use --mode local, --mode relay, or --mode agent.\n");
      process.exit(1);
    }
    const ttlMinutes = Number.parseInt(String(options.ttlMinutes ?? DEFAULT_MODE_SWITCH_AUTH_TTL_MINUTES), 10);
    if (!Number.isFinite(ttlMinutes) || ttlMinutes <= 0) {
      console.error("\n\u2717 Invalid --ttl-minutes value.\n");
      process.exit(1);
    }
    try {
      const accountId = options.account || void 0;
      const currentCfg = loadConfig2();
      const nextCfg = grantGoChatModeSwitchAuthorization({
        cfg: currentCfg,
        accountId: accountId ?? "default",
        targetMode: rawMode,
        ttlMinutes
      });
      await writeConfigFile2(nextCfg);
      const expiresAt = new Date(Date.now() + ttlMinutes * 6e4).toISOString();
      if (options.json) {
        console.log(JSON.stringify({
          accountId: accountId ?? "default",
          targetMode: rawMode,
          ttlMinutes,
          expiresAt
        }, null, 2));
        return;
      }
      console.log(
        `Authorized next GoChat mode switch to ${rawMode} for account ${accountId ?? "default"} until ${expiresAt}.`
      );
    } catch (error) {
      console.error("\n\u2717 Failed to authorize mode switch:");
      console.error(`  ${error instanceof Error ? error.message : String(error)}`);
      console.error("");
      process.exit(1);
    }
  });
  gochatCmd.command("approve-local-repair").description("Approve the pending safe local CLI repair request used by GoChat subagent actions").option("--json", "Output JSON result").action(async (options) => {
    try {
      const result = await approveGoChatLocalRepair({
        logger: {
          info: (message) => console.error(message),
          warn: (message) => console.error(message),
          error: (message) => console.error(message)
        }
      });
      if (options.json) {
        console.log(JSON.stringify(result, null, 2));
        return;
      }
      if (result.approvedRequestId) {
        console.log(
          `Approved local repair request: ${result.approvedRequestId}${result.approvedDeviceId ? ` (device ${result.approvedDeviceId})` : ""}`
        );
        return;
      }
      console.log(result.skippedReason || "No eligible local repair request is pending.");
    } catch (error) {
      console.error("\n\u2717 Failed to approve local repair request:");
      console.error(`  ${error instanceof Error ? error.message : String(error)}`);
      console.error("");
      process.exit(1);
    }
  });
  gochatCmd.command("ensure-gateway-access").description("Manually normalize local gateway routing and approve safe local CLI repair requests").option("--json", "Output JSON result").action(async (options) => {
    try {
      const result = await ensureGoChatGatewayAccess({
        logger: {
          info: (message) => console.error(message),
          warn: (message) => console.error(message),
          error: (message) => console.error(message)
        }
      });
      if (options.json) {
        console.log(JSON.stringify(result, null, 2));
        return;
      }
      if (result.normalizedGatewayRemoteUrlTo) {
        console.log(
          `Normalized gateway.remote.url: ${result.normalizedGatewayRemoteUrlFrom} -> ${result.normalizedGatewayRemoteUrlTo}`
        );
      }
      if (result.approvedRequestId) {
        console.log(
          `Approved local CLI repair request: ${result.approvedRequestId}${result.approvedDeviceId ? ` (device ${result.approvedDeviceId})` : ""}`
        );
      }
      if (!result.normalizedGatewayRemoteUrlTo && !result.approvedRequestId) {
        console.log(result.skippedReason || "No gateway access changes were needed.");
      } else if (result.skippedReason) {
        console.log(`Skipped: ${result.skippedReason}`);
      }
    } catch (error) {
      console.error("\n\u2717 Failed to ensure gateway access:");
      console.error(`  ${error instanceof Error ? error.message : String(error)}`);
      console.error("");
      process.exit(1);
    }
  });
}

// src/cli-descriptors.ts
var GOCHAT_CLI_DESCRIPTORS = [
  {
    name: "gochat",
    description: "GoChat custom backend management",
    hasSubcommands: true
  },
  {
    name: "gochat show-credentials",
    description: "Display connection ID and secret key",
    hasSubcommands: false
  },
  {
    name: "gochat bind-agent",
    description: "Bind OpenClaw to ClawTile using a mini-program pairing code",
    hasSubcommands: false
  },
  {
    name: "gochat authorize-mode-switch",
    description: "Authorize the next GoChat mode switch",
    hasSubcommands: false
  },
  {
    name: "gochat approve-local-repair",
    description: "Approve the pending safe local CLI repair request used by GoChat subagent actions",
    hasSubcommands: false
  },
  {
    name: "gochat ensure-gateway-access",
    description: "Manually normalize loopback gateway routing and approve safe local CLI repair requests",
    hasSubcommands: false
  }
];

// index.ts
var index_default = defineChannelPluginEntry({
  id: "gochat",
  name: "GoChat",
  description: "Custom chat backend via HTTP webhook with Go server",
  plugin: gochatPlugin,
  setRuntime: setGoChatRuntime,
  // OpenClaw 6.x exposes plugin subcommands by loading THIS hook at the CLI
  // "cli-metadata" parse phase (not registerFull). It must build the FULL command
  // tree, or only `openclaw gochat` is recognized and `gochat bind-agent --code`
  // fails. registerFull() deliberately does NOT build the CLI: full mode runs
  // both hooks, so building it in both would double-register the `gochat` command.
  registerCliMetadata(api) {
    api.registerCli(
      ({ program }) => {
        registerGochatCli(program);
      },
      { descriptors: GOCHAT_CLI_DESCRIPTORS }
    );
  },
  registerFull(api) {
    api.registerTool(createGoChatTaskTool(), {
      name: "gochat_tasks"
    });
  }
});
export {
  index_default as default,
  gochatPlugin,
  setGoChatRuntime
};
