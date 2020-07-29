"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
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
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SoftwareKeyProvider = void 0;
var base64url_1 = __importDefault(require("base64url"));
var SoftwareKeyProvider = /** @class */ (function () {
    /**
     * Initializes the vault with an already aes-256-gcm encrypted wallet
     * @param utils - crypto function implementations required to perform necessary wallet ops
     * @param encryptedWallet - the wallet ciphertext, aes-256-gcm
     * @param id - the id, linked to the ciphertext as its aad
     */
    function SoftwareKeyProvider(utils, encryptedWallet, id) {
        this._id = id;
        this._encryptedWallet = encryptedWallet;
        this._utils = utils;
    }
    /**
     * Initializes an empty vault
     * @param utils - crypto function implementations required to perform necessary wallet ops
     * @param id - the id, linked to the ciphertext as its aad
     * @param pass - the initial password to encrypt the wallet
     */
    SoftwareKeyProvider.newEmptyWallet = function (utils, id, pass) {
        return __awaiter(this, void 0, void 0, function () {
            var emptyWallet, _a, _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _b = (_a = Buffer).from;
                        return [4 /*yield*/, utils.newWallet(id, pass)];
                    case 1:
                        emptyWallet = _b.apply(_a, [_c.sent(), 'base64']);
                        return [2 /*return*/, new SoftwareKeyProvider(utils, emptyWallet, id)];
                }
            });
        });
    };
    Object.defineProperty(SoftwareKeyProvider.prototype, "encryptedWallet", {
        /**
         * Get the encrypted wallet base64 encoded
         */
        get: function () {
            // NOTE base64_URL_ encoding is used here, so  this uses an external lib for encoding 
            return base64url_1.default.encode(this._encryptedWallet);
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(SoftwareKeyProvider.prototype, "id", {
        /**
         * Get the wallet id
         */
        get: function () {
            return this._id;
        },
        enumerable: false,
        configurable: true
    });
    /**
     * Changes the password encrypting the wallet
     * @param pass - Old password for wallet decryption
     * @param newPass - New password for wallet decryption
     * @example `await vault.changePass(...) Promise<void> <...>`
     */
    SoftwareKeyProvider.prototype.changePass = function (pass, newPass) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, _b, _c;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        _a = this;
                        _c = (_b = Buffer).from;
                        return [4 /*yield*/, this._utils.changePass(this.encryptedWallet, this.id, pass, newPass)];
                    case 1:
                        _a._encryptedWallet = _c.apply(_b, [_d.sent(), 'base64']);
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Changes the id associated with the encrypted wallet
     * @param pass - Password for wallet decryption
     * @param newId - New password for wallet decryption
     * @example `await vault.changeId(...) Promise<void> <...>`
     */
    SoftwareKeyProvider.prototype.changeId = function (pass, newId) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, _b, _c;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        _a = this;
                        _c = (_b = Buffer).from;
                        return [4 /*yield*/, this._utils.changeId(this.encryptedWallet, this.id, newId, pass)];
                    case 1:
                        _a._encryptedWallet = _c.apply(_b, [_d.sent(), 'base64']);
                        this._id = newId;
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Adds a key pair of the given type to the encrypted wallet
     * @param pass - Password for wallet decryption
     * @param keyType - type of key pair to be added
     * @param controller - optional controller arguement to add to key info
     * @example `await vault.newKeyPair(pass, keyType, controller?) Promise<PublicKeyInfo> <...>`
     */
    SoftwareKeyProvider.prototype.newKeyPair = function (pass, keyType, controller) {
        return __awaiter(this, void 0, void 0, function () {
            var res_str, _a, res;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        if (!controller) return [3 /*break*/, 2];
                        return [4 /*yield*/, this._utils.newKey(this.encryptedWallet, this.id, pass, keyType, controller)];
                    case 1:
                        _a = _b.sent();
                        return [3 /*break*/, 4];
                    case 2: return [4 /*yield*/, this._utils.newKey(this.encryptedWallet, this.id, pass, keyType)];
                    case 3:
                        _a = _b.sent();
                        _b.label = 4;
                    case 4:
                        res_str = _a;
                        res = JSON.parse(res_str);
                        this._encryptedWallet = Buffer.from(res.newEncryptedState, 'base64');
                        return [2 /*return*/, res.newKey];
                }
            });
        });
    };
    /**
     * Returns public key from the wallet if present
     * @param refArgs - Password for wallet decryption and ref path
     * @example `await vault.getPubKey({keyRef: ..., encryptionPass: ...}) Promise<PublicKeyInfo> <...>`
     */
    SoftwareKeyProvider.prototype.getPubKey = function (_a) {
        var encryptionPass = _a.encryptionPass, keyRef = _a.keyRef;
        return __awaiter(this, void 0, void 0, function () {
            var _b, _c;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        _c = (_b = JSON).parse;
                        return [4 /*yield*/, this._utils.getKey(this.encryptedWallet, this.id, encryptionPass, keyRef)];
                    case 1: return [2 /*return*/, _c.apply(_b, [_d.sent()])];
                }
            });
        });
    };
    /**
     * Returns public key from the wallet if present
     * @param pass - Password for wallet decryption
     * @param controller - controller to search for in keyset
     * @example `await vault.getPubKeyByController(...) Promise<PublicKeyInfo> <...>`
     */
    SoftwareKeyProvider.prototype.getPubKeyByController = function (pass, controller) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _b = (_a = JSON).parse;
                        return [4 /*yield*/, this._utils.getKeyByController(this.encryptedWallet, this.id, pass, controller)];
                    case 1: return [2 /*return*/, _b.apply(_a, [_c.sent()])];
                }
            });
        });
    };
    /**
     * Returns all public keys from the wallet
     * @param pass - Password for wallet decryption
     * @example `await vault.getPubKeys(pass) // Promise<PublicKeyInfo[]> <...>`
     */
    SoftwareKeyProvider.prototype.getPubKeys = function (pass) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _b = (_a = JSON).parse;
                        return [4 /*yield*/, this._utils.getKeys(this.encryptedWallet, this.id, pass)];
                    case 1: return [2 /*return*/, _b.apply(_a, [_c.sent()])];
                }
            });
        });
    };
    /**
     * Computes signature given a data buffer
     * @param refArgs - Password for wallet decryption and ref path
     * @param data - The data to sign
     * @example `await vault.sign({keyRef: ..., decryptionPass: ...}, Buffer <...>) // Promise<Buffer> <...>`
     */
    SoftwareKeyProvider.prototype.sign = function (refArgs, data) {
        return __awaiter(this, void 0, void 0, function () {
            var encryptionPass, keyRef, _a, _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        encryptionPass = refArgs.encryptionPass, keyRef = refArgs.keyRef;
                        _b = (_a = Buffer).from;
                        return [4 /*yield*/, this._utils.sign(this.encryptedWallet, this.id, encryptionPass, base64url_1.default.encode(data), keyRef)];
                    case 1: return [2 /*return*/, _b.apply(_a, [_c.sent(), 'base64'])];
                }
            });
        });
    };
    /**
     * Decrypts given data using the ref args and optional additional authenticated data
     * @param refArgs - Password for wallet decryption and ref path
     * @param data - The data to decrypt. format depends on referenced key type
     * @example `await vault.decrypt({keyRef: ..., decryptionPass: ...}, Buffer <...>, Buffer <...>) // Promise<Buffer> <...>`
     */
    SoftwareKeyProvider.prototype.decrypt = function (refArgs, data, aad) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, _b, _c;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        _b = (_a = Buffer).from;
                        if (!aad) return [3 /*break*/, 2];
                        return [4 /*yield*/, this._utils.decrypt(this.encryptedWallet, this.id, refArgs.encryptionPass, data.toString('base64'), refArgs.keyRef, aad.toString('base64'))];
                    case 1:
                        _c = _d.sent();
                        return [3 /*break*/, 4];
                    case 2: return [4 /*yield*/, this._utils.decrypt(this.encryptedWallet, this.id, refArgs.encryptionPass, data.toString('base64'), refArgs.keyRef)];
                    case 3:
                        _c = _d.sent();
                        _d.label = 4;
                    case 4: return [2 /*return*/, _b.apply(_a, [_c, 'base64'])];
                }
            });
        });
    };
    return SoftwareKeyProvider;
}());
exports.SoftwareKeyProvider = SoftwareKeyProvider;
