"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
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
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
exports.__esModule = true;
exports.PluginObjectClass = void 0;
var axios_1 = require("axios");
var fingerprintjs_1 = require("@fingerprintjs/fingerprintjs");
var ConsolePulg = {
    install: function (app, options) {
        if (options === void 0) { options = {}; }
        // @ts-ignore
        window.$ConsolePluginObjectClass = new PluginObjectClass(options);
    }
};
exports["default"] = ConsolePulg;
var PluginObjectClass = /** @class */ (function () {
    function PluginObjectClass(options) {
        var _this_1 = this;
        this.config = {};
        this.fp = {};
        (function () { return __awaiter(_this_1, void 0, void 0, function () {
            var e_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        this.config = __assign({ 
                            // 默认不进行上报，需要配置上报服务器地址信息
                            AxiosConfig: {}, XHL_Success: true, XHL_Success_Error: true, XHL_Error: true, userAgentData: true, system: true, XMLHttpRequest: true, console: true, consoleMap: ['error'], eventMap: ['error', 'messageerror', 'unhandledrejection', 'rejectionhandled'], getCustomData: function () {
                                // @ts-ignore
                                return Promise.resolve();
                            }, consoleCallback: function (keyName) {
                                var data = [];
                                for (var _i = 1; _i < arguments.length; _i++) {
                                    data[_i - 1] = arguments[_i];
                                }
                                return Promise.resolve(data);
                            }, eventMapCallback: function (data) {
                                return Promise.resolve(data);
                            }, rules: null }, options);
                        return [4 /*yield*/, this.initErrorMonitor()];
                    case 1:
                        _a.sent();
                        return [3 /*break*/, 3];
                    case 2:
                        e_1 = _a.sent();
                        console.error('ConsolePulg', e_1);
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        }); })();
    }
    /**
     * 初始化错误监听
     */
    PluginObjectClass.prototype.initErrorMonitor = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _a, _this_2, XMLHttpRequestOld_1, XMLHttpRequestOld_open_1, XMLHttpRequestOld_send_1, XMLHttpRequestOld_setRequestHeader_1;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _a = this;
                        return [4 /*yield*/, fingerprintjs_1["default"].load({
                            // monitoring: false
                            })];
                    case 1: return [4 /*yield*/, (_b.sent()).get({
                            extendedResult: true
                        })];
                    case 2:
                        _a.fp = (_b.sent());
                        try {
                            _this_2 = this;
                            this.onMessage(null, 'PV');
                            /**
                             * console
                             */
                            // @ts-ignore
                            this.config.consoleMap.forEach(function (keyName) {
                                (function (keyName) {
                                    var errorOldFun = window.console[keyName];
                                    // @ts-ignore
                                    window.console[keyName] = function () {
                                        var _a;
                                        var args = [];
                                        for (var _i = 0; _i < arguments.length; _i++) {
                                            args[_i] = arguments[_i];
                                        }
                                        (_a = _this_2.config).consoleCallback.apply(_a, __spreadArray([keyName], args, false)).then(function (args) {
                                            _this_2.onMessage(args, "console.".concat(keyName)).then(function () {
                                                errorOldFun.apply(void 0, args);
                                            });
                                        });
                                    };
                                })(keyName);
                            });
                            /**
                             * addEventListener
                             */
                            // @ts-ignore
                            this.config.eventMap.forEach(function (keyName) {
                                (function (keyName) {
                                    window.addEventListener(keyName, function (event) {
                                        _this_2.config.eventMapCallback({
                                            keyName: keyName,
                                            event: event,
                                            message: event === null || event === void 0 ? void 0 : event.message,
                                            stack: event === null || event === void 0 ? void 0 : event.stack
                                        }).then(function (data) {
                                            _this_2.onMessage(data, !(event === null || event === void 0 ? void 0 : event.message) && keyName === 'error' ? "".concat(keyName, " Static Resource") : "".concat(keyName, " of type WindowEventMap"));
                                        });
                                    }, true);
                                })(keyName);
                            });
                            /**
                             * @请求错误(XMLHttpRequest)
                             */
                            if (_this_2.config.XMLHttpRequest) {
                                XMLHttpRequestOld_1 = window.XMLHttpRequest;
                                XMLHttpRequestOld_open_1 = XMLHttpRequestOld_1.prototype.open;
                                XMLHttpRequestOld_1.prototype.open = function () {
                                    var args = [];
                                    for (var _i = 0; _i < arguments.length; _i++) {
                                        args[_i] = arguments[_i];
                                    }
                                    this.openArgs = args;
                                    this.requestStartTime = Date.now();
                                    // @ts-ignore
                                    XMLHttpRequestOld_open_1.call.apply(XMLHttpRequestOld_open_1, __spreadArray([this], args, false));
                                };
                                XMLHttpRequestOld_send_1 = XMLHttpRequestOld_1.prototype.send;
                                XMLHttpRequestOld_1.prototype.send = function (e) {
                                    this.bodyData = e;
                                    // @ts-ignore
                                    XMLHttpRequestOld_send_1.call(this, e);
                                };
                                XMLHttpRequestOld_setRequestHeader_1 = XMLHttpRequestOld_1.prototype.setRequestHeader;
                                XMLHttpRequestOld_1.prototype.setRequestHeader = function (key, value) {
                                    var args = [];
                                    for (var _i = 2; _i < arguments.length; _i++) {
                                        args[_i - 2] = arguments[_i];
                                    }
                                    this.requestHeaders = this.requestHeaders || {};
                                    this.requestHeaders[key] = value;
                                    // @ts-ignore
                                    XMLHttpRequestOld_setRequestHeader_1.call.apply(XMLHttpRequestOld_setRequestHeader_1, __spreadArray([this, key, value], args, false));
                                };
                                // @ts-ignore
                                window.XMLHttpRequest = function () {
                                    var _this_1 = this;
                                    var args = [];
                                    for (var _i = 0; _i < arguments.length; _i++) {
                                        args[_i] = arguments[_i];
                                    }
                                    // @ts-ignore
                                    var XHL = new (XMLHttpRequestOld_1.bind.apply(XMLHttpRequestOld_1, __spreadArray([void 0], args, false)))();
                                    try {
                                        throw Error('Stack');
                                    }
                                    catch (e) {
                                        XHL.stack = e.stack;
                                    }
                                    XHL.addEventListener('load', function (res) {
                                        _this_1.requestEndTime = Date.now();
                                        _this_1.requestTakeTime = _this_1.requestStartTime - _this_1.requestEndTime;
                                        var XHL_Info = _this_2.getXHLMessageData(res, XHL);
                                        if (res.target.status >= 200 && res.target.status < 300) {
                                            // 正常响应
                                            if (_this_2.config.XHL_Success) {
                                                _this_2.onMessage(XHL_Info, 'XHL_Success');
                                            }
                                        }
                                        else {
                                            // 非正常响应
                                            if (_this_2.config.XHL_Success_Error) {
                                                _this_2.onMessage(XHL_Info, 'XHL_Success_Error');
                                            }
                                        }
                                    });
                                    XHL.addEventListener('error', function (res) {
                                        _this_1.requestEndTime = Date.now();
                                        _this_1.requestTakeTime = _this_1.requestStartTime - _this_1.requestEndTime;
                                        if (_this_2.config.XHL_Error) {
                                            _this_2.onMessage(_this_2.getXHLMessageData(res, XHL), 'XHL_Error');
                                        }
                                    });
                                    return XHL;
                                };
                            }
                        }
                        catch (e) {
                            console.error('ConsolePulg', e);
                        }
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 获取请求信息
     */
    PluginObjectClass.prototype.getXHLMessageData = function (res, XHL) {
        try {
            return {
                response: {
                    readyState: res.target.readyState,
                    response: res.target.response,
                    responseText: res.target.responseText,
                    responseType: res.target.responseType,
                    responseURL: res.target.responseURL,
                    responseXML: res.target.responseXML,
                    withCredentials: res.target.withCredentials,
                    status: res.target.status,
                    statusText: res.target.statusText,
                    type: res.type
                },
                bodyData: XHL.bodyData,
                openArgs: XHL.openArgs,
                requestStartTime: 0,
                requestEndTime: 0,
                requestTakeTime: 0,
                responseHeaders: XHL.getAllResponseHeaders(),
                requestHeaders: XHL.requestHeaders,
                stack: XHL.stack
            };
        }
        catch (e) {
            return {};
        }
    };
    /**
     * 错误消息拦截
     */
    PluginObjectClass.prototype.onMessage = function (errorData, type) {
        return __awaiter(this, void 0, void 0, function () {
            var data_1, userAgentData, brands;
            var _this_1 = this;
            return __generator(this, function (_a) {
                try {
                    // 对上报服务器校验，防止不必要的错误请求
                    if (!this.config.AxiosConfig ||
                        !this.config.AxiosConfig.url ||
                        !this.config.AxiosConfig.method) {
                        // @ts-ignore
                        return [2 /*return*/, Promise.resolve()];
                    }
                    // @ts-ignore
                    if (['XHL_Success', 'XHL', 'XHL_Error', 'XHL_Success_Error'].includes(type)) {
                        if (this.config.AxiosConfig.method.toLocaleLowerCase() === errorData.openArgs[0].toLocaleLowerCase() &&
                            errorData.openArgs[1].toLocaleLowerCase().indexOf(this.config.AxiosConfig.url.toLocaleLowerCase()) > -1) {
                            // @ts-ignore
                            return [2 /*return*/, Promise.resolve()];
                        }
                    }
                    data_1 = {
                        errorData: errorData,
                        type: type,
                        hash: location.hash,
                        host: location.host,
                        hostname: location.hostname,
                        origin: location.origin,
                        href: location.href,
                        pathname: location.pathname,
                        port: location.port,
                        protocol: location.protocol,
                        pageUrl: location.href,
                        pageTitle: document.title,
                        sessionStorage: window.sessionStorage,
                        localStorage: window.localStorage,
                        cookie: window.document.cookie,
                        errorDataOrigin: errorData,
                        visitorId: this.fp.visitorId
                    };
                    try {
                        data_1.system = {
                            appVersion: window.navigator.appVersion,
                            appCodeName: window.navigator.appCodeName,
                            userAgent: window.navigator.userAgent,
                            appName: window.navigator.appName,
                            platform: window.navigator.platform,
                            product: window.navigator.product,
                            productSub: window.navigator.productSub,
                            vendor: window.navigator.vendor,
                            onLine: window.navigator.onLine,
                            language: window.navigator.language,
                            performance: window.performance
                        };
                        if (this.config.userAgentData) {
                            try {
                                userAgentData = window.navigator.userAgentData || {};
                                brands = (userAgentData.brands || []).map(function (e) { return ({
                                    brand: e.brand,
                                    version: e.version
                                }); });
                                data_1.system.userAgentData = {
                                    mobile: userAgentData.mobile,
                                    // @ts-ignore
                                    brands: brands
                                };
                            }
                            catch (e) {
                                // err
                            }
                        }
                    }
                    catch (e) {
                        console.log('navigator 错误');
                    }
                    switch (Object.prototype.toString.call(errorData)) {
                        case '[object Event]':
                            data_1.errorData = __assign(__assign({}, data_1.errorData), { timeStamp: data_1.errorData.timeStamp, type: data_1.errorData.type, path: data_1.errorData.path.map(function (el) {
                                    return "\u3010tagName\u3011".concat((el.tagName || '').toLocaleLowerCase(), "->\u3010class\u3011").concat(el.className, "->\u3010id\u3011").concat(el.id);
                                }), message: data_1.errorData.message, error: data_1.errorData.error, toStringType: '[object Event]' });
                            break;
                        case '[object Arguments]':
                            data_1.errorData = {};
                            (__spreadArray([], errorData, true)).forEach(function (it, k) {
                                var dataObj = {
                                    toStringType: '[object Arguments]',
                                    error: null
                                };
                                try {
                                    dataObj.error = it.error || it.stack || it;
                                }
                                catch (e) {
                                    dataObj.error = it;
                                }
                                data_1.errorData['error_' + k] = dataObj;
                            });
                            break;
                        case '[object Object]':
                            data_1.errorData = {
                                data: errorData,
                                toStringType: '[object Object]'
                            };
                            break;
                        case '[object PromiseRejectionEvent]':
                            data_1.errorData = {
                                data: errorData.reason,
                                toStringType: '[object PromiseRejectionEvent]'
                            };
                            break;
                        default:
                            try {
                                data_1.errorData = {
                                    data: JSON.stringify(errorData),
                                    toStringType: '[object default]'
                                };
                            }
                            catch (e) {
                                data_1.errorData = {
                                    data: errorData,
                                    toStringType: '[object default]'
                                };
                            }
                            break;
                    }
                    /**
                     * 拦截规则校验
                     */
                    if (this.config.rules && this.config.rules.some(function (e) { return e.call(_this_1, data_1); })) {
                        // 符合条件中止
                        // @ts-ignore
                        return [2 /*return*/, Promise.resolve()];
                    }
                    // @ts-ignore
                    return [2 /*return*/, new Promise(function (resolve) {
                            var _a;
                            try {
                                throw Error('Stack');
                            }
                            catch (e) {
                                data_1.stack = e.stack;
                            }
                            (_a = _this_1.config.getCustomData) === null || _a === void 0 ? void 0 : _a.call(_this_1, data_1, _this_1.fp).then(function (config) {
                                config = config || {};
                                (0, axios_1["default"])(__assign(__assign(__assign({}, _this_1.config.AxiosConfig), { data: data_1 }), config)).then(function (res) {
                                    resolve();
                                })["catch"](function () {
                                    resolve();
                                });
                            })["catch"](function () {
                                resolve();
                            });
                        })];
                }
                catch (e) {
                    // @ts-ignore
                    return [2 /*return*/, Promise.resolve()];
                }
                return [2 /*return*/];
            });
        });
    };
    return PluginObjectClass;
}());
exports.PluginObjectClass = PluginObjectClass;
