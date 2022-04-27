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
var axios_1 = require("axios");
var ConsolePulg = {
    install: function (Vue, options) {
        if (options === void 0) { options = {}; }
        // @ts-ignore
        window.$ConsolePluginObjectClass = new PluginObjectClass(Vue, options);
    }
};
exports["default"] = ConsolePulg;
var PluginObjectClass = /** @class */ (function () {
    function PluginObjectClass(Vue, options) {
        this.config = {};
        try {
            this.config = __assign({ 
                // 默认不进行上报，需要配置上报服务器地址信息
                AxiosConfig: {}, XHL_Success: true, XHL_Success_Error: true, XHL_Error: true, userAgentData: true, system: true, XMLHttpRequest: true, console: true, consoleMap: ["error"], eventMap: ["error", "messageerror", "unhandledrejection", "rejectionhandled"], getCustomData: function () {
                    // @ts-ignore
                    return Promise.resolve();
                }, rules: null }, options);
            this.initErrorMonitor();
        }
        catch (e) {
            console.error("ConsolePulg", e);
        }
    }
    /**
     * 初始化错误监听
     */
    PluginObjectClass.prototype.initErrorMonitor = function () {
        try {
            var _this_1 = this;
            /**
             * console
             */
            // @ts-ignore
            this.config.consoleMap.forEach(function (keyName) {
                (function (keyName) {
                    var errorOldFun = window.console[keyName];
                    window.console[keyName] = function () {
                        var args = arguments;
                        _this_1.onMessage(args, "console.".concat(keyName)).then(function () {
                            errorOldFun.apply(null, args);
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
                    window.addEventListener(keyName, function (e) {
                        _this_1.onMessage(e, "".concat(keyName, " of type WindowEventMap"));
                    }, true);
                })(keyName);
            });
            /**
             * @请求错误(XMLHttpRequest)
             */
            if (_this_1.config.XMLHttpRequest) {
                var XMLHttpRequestOld_1 = window.XMLHttpRequest;
                /**
                 * @open
                 */
                var XMLHttpRequestOld_open_1 = XMLHttpRequestOld_1.prototype.open;
                XMLHttpRequestOld_1.prototype.open = function () {
                    this.openArgs = arguments;
                    // @ts-ignore
                    XMLHttpRequestOld_open_1.call.apply(XMLHttpRequestOld_open_1, __spreadArray([this], arguments, false));
                };
                /**
                 * @send
                 */
                var XMLHttpRequestOld_send_1 = XMLHttpRequestOld_1.prototype.send;
                XMLHttpRequestOld_1.prototype.send = function (e) {
                    this.bodyData = e;
                    // @ts-ignore
                    XMLHttpRequestOld_send_1.call(this, e);
                };
                /**
                 * @send
                 */
                var XMLHttpRequestOld_setRequestHeader_1 = XMLHttpRequestOld_1.prototype.setRequestHeader;
                XMLHttpRequestOld_1.prototype.setRequestHeader = function (key, value) {
                    this.requestHeaders = this.requestHeaders || {};
                    this.requestHeaders[key] = value;
                    // @ts-ignore
                    XMLHttpRequestOld_setRequestHeader_1.call.apply(XMLHttpRequestOld_setRequestHeader_1, __spreadArray([this], arguments, false));
                };
                // @ts-ignore
                window.XMLHttpRequest = function () {
                    // @ts-ignore
                    var XHL = new (XMLHttpRequestOld_1.bind.apply(XMLHttpRequestOld_1, __spreadArray([void 0], arguments, false)))();
                    XHL.addEventListener("load", function (res) {
                        var XHL_Info = _this_1.getXHLMessageData(res, XHL);
                        if (res.target.status >= 200 && res.target.status < 300) {
                            // 正常响应
                            if (_this_1.config.XHL_Success) {
                                _this_1.onMessage(XHL_Info, "XHL_Success");
                            }
                        }
                        else {
                            // 非正常响应
                            if (_this_1.config.XHL_Success_Error) {
                                _this_1.onMessage(XHL_Info, "XHL_Success_Error");
                            }
                        }
                    });
                    XHL.addEventListener("error", function (res) {
                        if (_this_1.config.XHL_Error) {
                            _this_1.onMessage(_this_1.getXHLMessageData(res, XHL), "XHL_Error");
                        }
                    });
                    return XHL;
                };
            }
        }
        catch (e) {
            console.error("ConsolePulg", e);
        }
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
                responseHeaders: XHL.getAllResponseHeaders(),
                requestHeaders: XHL.requestHeaders
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
        var _this_1 = this;
        try {
            // 对上报服务器校验，防止不必要的错误请求
            if (!this.config.AxiosConfig ||
                !this.config.AxiosConfig.url ||
                !this.config.AxiosConfig.method) {
                // @ts-ignore
                return Promise.resolve();
            }
            // @ts-ignore
            if (["XHL_Success", "XHL", "XHL_Error", "XHL_Success_Error"].includes(type)) {
                if (this.config.AxiosConfig.method.toLocaleLowerCase() === errorData.openArgs[0].toLocaleLowerCase() &&
                    errorData.openArgs[1].toLocaleLowerCase().indexOf(this.config.AxiosConfig.url.toLocaleLowerCase()) > -1) {
                    // @ts-ignore
                    return Promise.resolve();
                }
            }
            var data_1 = {
                errorData: errorData,
                type: type,
                pageUrl: location.href,
                pageTitle: document.title,
                sessionStorage: window.sessionStorage,
                localStorage: window.localStorage,
                cookie: window.document.cookie,
                errorDataOrigin: errorData
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
                    language: window.navigator.language
                };
                if (this.config.userAgentData) {
                    try {
                        // @ts-ignore
                        var userAgentData = window.navigator.userAgentData || {};
                        var brands = (userAgentData.brands || []).map(function (e) { return ({
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
                    }
                }
            }
            catch (e) {
                console.log("navigator 错误");
            }
            switch (Object.prototype.toString.call(errorData)) {
                case "[object Event]":
                    data_1.errorData = __assign(__assign({}, data_1.errorData), { timeStamp: data_1.errorData.timeStamp, type: data_1.errorData.type, path: data_1.errorData.path.map(function (el) {
                            return "\u3010tagName\u3011".concat((el.tagName || "").toLocaleLowerCase(), "->\u3010class\u3011").concat(el.className, "->\u3010id\u3011").concat(el.id);
                        }), message: data_1.errorData.message, error: data_1.errorData.error, toStringType: "[object Event]" });
                    break;
                case "[object Arguments]":
                    data_1.errorData = {};
                    (__spreadArray([], errorData, true)).forEach(function (it, k) {
                        var dataObj = {
                            toStringType: "[object Arguments]",
                            error: null
                        };
                        try {
                            dataObj.error = it.error || it.stack || it;
                        }
                        catch (e) {
                            dataObj.error = it;
                        }
                        data_1.errorData["error_" + k] = dataObj;
                    });
                    break;
                case "[object Object]":
                    data_1.errorData = {
                        data: errorData,
                        toStringType: "[object Object]"
                    };
                    break;
                case "[object PromiseRejectionEvent]":
                    data_1.errorData = {
                        data: errorData.reason,
                        toStringType: "[object PromiseRejectionEvent]"
                    };
                    break;
                default:
                    try {
                        data_1.errorData = {
                            data: JSON.stringify(errorData),
                            toStringType: "[object default]"
                        };
                    }
                    catch (e) {
                        data_1.errorData = {
                            data: errorData,
                            toStringType: "[object default]"
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
                return Promise.resolve();
            }
            // @ts-ignore
            return new Promise(function (resolve) {
                _this_1.config.getCustomData.call(_this_1, data_1).then(function (config) {
                    config = config || {};
                    (0, axios_1["default"])(__assign(__assign(__assign({}, _this_1.config.AxiosConfig), { data: data_1 }), config)).then(function (res) {
                        resolve();
                    })["catch"](function () {
                        resolve();
                    });
                })["catch"](function () {
                    resolve();
                });
            });
        }
        catch (e) {
            // @ts-ignore
            return Promise.resolve();
        }
    };
    return PluginObjectClass;
}());
