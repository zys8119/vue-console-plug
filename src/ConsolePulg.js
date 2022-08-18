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
Object.defineProperty(exports, "__esModule", { value: true });
exports.PluginObjectClass = void 0;
const axios_1 = require("axios");
const fingerprintjs_1 = require("@fingerprintjs/fingerprintjs");
const ConsolePulg = {
    install(app, options = {}) {
        // @ts-ignore
        window.$ConsolePluginObjectClass = new PluginObjectClass(options);
    }
};
exports.default = ConsolePulg;
class PluginObjectClass {
    constructor(options) {
        this.config = {};
        this.fp = {};
        (() => __awaiter(this, void 0, void 0, function* () {
            try {
                this.config = Object.assign({ 
                    // 默认不进行上报，需要配置上报服务器地址信息
                    AxiosConfig: {}, XHL_Success: true, XHL_Success_Error: true, XHL_Error: true, userAgentData: true, system: true, XMLHttpRequest: true, console: true, consoleMap: ['error'], eventMap: ['error', 'messageerror', 'unhandledrejection', 'rejectionhandled'], getCustomData() {
                        // @ts-ignore
                        return Promise.resolve();
                    },
                    consoleCallback(keyName, ...data) {
                        return Promise.resolve(data);
                    },
                    eventMapCallback(data) {
                        return Promise.resolve(data);
                    }, rules: null }, options);
                yield this.initErrorMonitor();
            }
            catch (e) {
                console.error('ConsolePulg', e);
            }
        }))();
    }
    /**
     * 初始化错误监听
     */
    initErrorMonitor() {
        return __awaiter(this, void 0, void 0, function* () {
            this.fp = (yield (yield fingerprintjs_1.default.load({
            // monitoring: false
            })).get({
                extendedResult: true
            }));
            try {
                const _this = this;
                this.onMessage(null, 'PV');
                /**
                 * console
                 */
                // @ts-ignore
                this.config.consoleMap.forEach(keyName => {
                    (function (keyName) {
                        const errorOldFun = window.console[keyName];
                        // @ts-ignore
                        window.console[keyName] = function (...args) {
                            _this.config.consoleCallback(keyName, ...args).then(args => {
                                _this.onMessage(args, `console.${keyName}`).then(() => {
                                    errorOldFun(...args);
                                });
                            });
                        };
                    })(keyName);
                });
                /**
                 * addEventListener
                 */
                // @ts-ignore
                this.config.eventMap.forEach((keyName) => {
                    (function (keyName) {
                        window.addEventListener(keyName, (event) => {
                            _this.config.eventMapCallback({
                                keyName,
                                event,
                                message: event === null || event === void 0 ? void 0 : event.message,
                                stack: event === null || event === void 0 ? void 0 : event.stack
                            }).then(data => {
                                _this.onMessage(data, !(event === null || event === void 0 ? void 0 : event.message) && keyName === 'error' ? `${keyName} Static Resource` : `${keyName} of type WindowEventMap`);
                            });
                        }, true);
                    })(keyName);
                });
                /**
                 * @请求错误(XMLHttpRequest)
                 */
                if (_this.config.XMLHttpRequest) {
                    const XMLHttpRequestOld = window.XMLHttpRequest;
                    /**
                     * @open
                     */
                    const XMLHttpRequestOld_open = XMLHttpRequestOld.prototype.open;
                    XMLHttpRequestOld.prototype.open = function (...args) {
                        this.openArgs = args;
                        this.requestStartTime = Date.now();
                        // @ts-ignore
                        XMLHttpRequestOld_open.call(this, ...args);
                    };
                    /**
                     * @send
                     */
                    const XMLHttpRequestOld_send = XMLHttpRequestOld.prototype.send;
                    XMLHttpRequestOld.prototype.send = function (e) {
                        this.bodyData = e;
                        // @ts-ignore
                        XMLHttpRequestOld_send.call(this, e);
                    };
                    /**
                     * @send
                     */
                    const XMLHttpRequestOld_setRequestHeader = XMLHttpRequestOld.prototype.setRequestHeader;
                    XMLHttpRequestOld.prototype.setRequestHeader = function (key, value, ...args) {
                        this.requestHeaders = this.requestHeaders || {};
                        this.requestHeaders[key] = value;
                        // @ts-ignore
                        XMLHttpRequestOld_setRequestHeader.call(this, key, value, ...args);
                    };
                    // @ts-ignore
                    window.XMLHttpRequest = function (...args) {
                        // @ts-ignore
                        const XHL = new XMLHttpRequestOld(...args);
                        try {
                            throw Error('Stack');
                        }
                        catch (e) {
                            XHL.stack = e.stack;
                        }
                        XHL.addEventListener('load', (res) => {
                            XHL.requestEndTime = Date.now();
                            XHL.requestTakeTime = XHL.requestEndTime - XHL.requestStartTime;
                            const XHL_Info = _this.getXHLMessageData(res, XHL);
                            if (res.target.status >= 200 && res.target.status < 300) {
                                // 正常响应
                                if (_this.config.XHL_Success) {
                                    _this.onMessage(XHL_Info, 'XHL_Success');
                                }
                            }
                            else {
                                // 非正常响应
                                if (_this.config.XHL_Success_Error) {
                                    _this.onMessage(XHL_Info, 'XHL_Success_Error');
                                }
                            }
                        });
                        XHL.addEventListener('error', (res) => {
                            XHL.requestEndTime = Date.now();
                            XHL.requestTakeTime = XHL.requestEndTime - XHL.requestStartTime;
                            if (_this.config.XHL_Error) {
                                _this.onMessage(_this.getXHLMessageData(res, XHL), 'XHL_Error');
                            }
                        });
                        return XHL;
                    };
                }
            }
            catch (e) {
                console.error('ConsolePulg', e);
            }
        });
    }
    /**
     * 获取请求信息
     */
    getXHLMessageData(res, XHL) {
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
                    type: res.type,
                },
                bodyData: XHL.bodyData,
                status: XHL.status,
                statusText: XHL.statusText,
                openArgs: XHL.openArgs,
                requestStartTime: XHL.requestStartTime,
                requestEndTime: XHL.requestEndTime,
                requestTakeTime: XHL.requestTakeTime,
                responseHeaders: XHL.getAllResponseHeaders(),
                requestHeaders: XHL.requestHeaders,
                stack: XHL.stack
            };
        }
        catch (e) {
            return {};
        }
    }
    /**
     * 错误消息拦截
     */
    onMessage(errorData, type) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // 对上报服务器校验，防止不必要的错误请求
                if (!this.config.AxiosConfig ||
                    !this.config.AxiosConfig.url ||
                    !this.config.AxiosConfig.method) {
                    // @ts-ignore
                    return Promise.resolve();
                }
                // @ts-ignore
                if (['XHL_Success', 'XHL', 'XHL_Error', 'XHL_Success_Error'].includes(type)) {
                    if (this.config.AxiosConfig.method.toLocaleLowerCase() === errorData.openArgs[0].toLocaleLowerCase() &&
                        errorData.openArgs[1].toLocaleLowerCase().indexOf(this.config.AxiosConfig.url.toLocaleLowerCase()) > -1) {
                        // @ts-ignore
                        return Promise.resolve();
                    }
                }
                const data = {
                    errorData,
                    type,
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
                    visitorId: this.fp.visitorId,
                    browser_resolution: `${screen.width}x${screen.height}`,
                };
                try {
                    data.system = {
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
                        performance: window.performance,
                    };
                    if (this.config.userAgentData) {
                        try {
                            // @ts-ignore
                            const userAgentData = window.navigator.userAgentData || {};
                            const brands = (userAgentData.brands || []).map((e) => ({
                                brand: e.brand,
                                version: e.version
                            }));
                            data.system.userAgentData = {
                                mobile: userAgentData.mobile,
                                // @ts-ignore
                                brands,
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
                        data.errorData = Object.assign(Object.assign({}, data.errorData), { timeStamp: data.errorData.timeStamp, type: data.errorData.type, path: data.errorData.path.map((el) => {
                                return `【tagName】${(el.tagName || '').toLocaleLowerCase()}->【class】${el.className}->【id】${el.id}`;
                            }), message: data.errorData.message, error: data.errorData.error, toStringType: '[object Event]' });
                        break;
                    case '[object Arguments]':
                        data.errorData = {};
                        ([...errorData]).forEach((it, k) => {
                            const dataObj = {
                                toStringType: '[object Arguments]',
                                error: null,
                            };
                            try {
                                dataObj.error = it.error || it.stack || it;
                            }
                            catch (e) {
                                dataObj.error = it;
                            }
                            data.errorData['error_' + k] = dataObj;
                        });
                        break;
                    case '[object Object]':
                        data.errorData = {
                            data: errorData,
                            toStringType: '[object Object]',
                        };
                        break;
                    case '[object PromiseRejectionEvent]':
                        data.errorData = {
                            data: errorData.reason,
                            toStringType: '[object PromiseRejectionEvent]',
                        };
                        break;
                    default:
                        try {
                            data.errorData = {
                                data: JSON.stringify(errorData),
                                toStringType: '[object default]',
                            };
                        }
                        catch (e) {
                            data.errorData = {
                                data: errorData,
                                toStringType: '[object default]',
                            };
                        }
                        break;
                }
                /**
                 * 拦截规则校验
                 */
                if (this.config.rules && this.config.rules.some(e => e.call(this, data))) {
                    // 符合条件中止
                    // @ts-ignore
                    return Promise.resolve();
                }
                // @ts-ignore
                return new Promise(resolve => {
                    var _a;
                    try {
                        throw Error('Stack');
                    }
                    catch (e) {
                        data.stack = e.stack;
                    }
                    (_a = this.config.getCustomData) === null || _a === void 0 ? void 0 : _a.call(this, data, this.fp).then(config => {
                        config = config || {};
                        (0, axios_1.default)(Object.assign(Object.assign(Object.assign({}, this.config.AxiosConfig), { data }), config)).then(res => {
                            resolve();
                        }).catch(() => {
                            resolve();
                        });
                    }).catch(() => {
                        resolve();
                    });
                });
            }
            catch (e) {
                // @ts-ignore
                return Promise.resolve();
            }
        });
    }
}
exports.PluginObjectClass = PluginObjectClass;
//# sourceMappingURL=ConsolePulg.js.map