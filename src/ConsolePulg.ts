import axios, {AxiosRequestConfig} from 'axios'
import fp, {GetResult} from '@fingerprintjs/fingerprintjs'
import {App} from 'vue'

export interface ConsolePulgConfig<K extends keyof WindowEventMap> {
    [key: string]: any;

    AxiosConfig?: AxiosRequestConfig;

    getCustomData?(this: PluginObjectClass, data: MessageData, fp:GetResult): Promise<any>;// 获取自定义数据
    XHL_Success?: boolean;// 是否捕捉正常请求 默认开启
    XHL_Success_Error?: boolean;// 是否捕捉正常错误请求 默认开启
    XHL_Error?: boolean;// 是否捕捉错误请求 默认开启
    userAgentData?: boolean;// 是否捕捉userAgentData 默认开启
    system?: boolean;// 是否捕捉系统信息 默认开启
    XMLHttpRequest?: boolean;// 是否捕捉XMLHttpRequest 默认开启
    console?: boolean;// 是否捕捉console.error 默认开启
    // 是否捕捉console映射, 默认监听只error
    consoleMap?: Array<string | 'error' | 'assert' | 'clear' | 'count' | 'countReset' | 'debug' | 'dir' | 'dirxml' | 'exception' | 'group' | 'groupCollapsed' | 'groupEnd' | 'info' | 'log' | 'table' | 'time' | 'timeEnd' | 'timeLog' | 'timeStamp' | 'trace' | 'warn'>;
    eventMap?: Array<K>;// 是否捕捉addEventListener事件映射, 默认监听只error
    eventMapCallback?<T> (data:T): Promise<T>;// 事件回调
    consoleCallback?<T> (...data:T[]): Promise<T[]>;// console回调
    rules?: Array<(this: PluginObjectClass, data: MessageData) => boolean> | null;// 返回false即上报，反之不上报
}

export interface MessageData {
    [key: string]: any;
    errorData: any;// 错误数据
    type: string;// 错误类型
    hash: string;
    host: string;
    hostname: string;
    origin: string;
    href: string;
    pathname: string;
    port: string;
    protocol: string;
    pageUrl: string;// 页面路径
    pageTitle: string;// 页面标题
    sessionStorage: any;// 缓存数据
    localStorage: any;// 缓存数据
    cookie: string;// cookie数据
    errorDataOrigin: any;// 错误源数据
    visitorId: any;// 游客Id
    system?: MessageDataSystem;// 系统信息
    stack?: string;// 错误代码跟踪
}

export interface MessageDataSystem {
    appVersion: string;// 应用版本
    appCodeName: string;// 应用代码名称
    userAgent: string;// 用户UA
    appName: string;// 应用名称
    platform: string;// 客户端平台
    product: string;// 系统产品
    productSub: string;// 系统子产品
    vendor: string;// 小贩
    onLine: boolean;// 网络是否在线
    language: string;// 当前页面语言
    performance: any;// 客户端运行信息
    userAgentData: userAgentData;// 用户ua数据
}

export interface userAgentData {
    mobile: string;
    brands: userAgentDataBrands[]
}

export type userAgentDataBrands = {
    brand: string;
    version: string;
}

const ConsolePulg = {
    install(app:App, options = {}) {
        // @ts-ignore
        window.$ConsolePluginObjectClass = new PluginObjectClass(options)
    }
}
export default ConsolePulg

export class PluginObjectClass {
    config: ConsolePulgConfig<any> = {}
    fp: GetResult = {} as GetResult
    constructor(options: ConsolePulgConfig<any>) {
        (async ()=>{
            try {
                this.config = {
                    // 默认不进行上报，需要配置上报服务器地址信息
                    AxiosConfig: <AxiosRequestConfig>{},
                    XHL_Success: true,
                    XHL_Success_Error: true,
                    XHL_Error: true,
                    userAgentData: true,
                    system: true,
                    XMLHttpRequest: true,
                    console: true,
                    consoleMap: ['error'],
                    eventMap: ['error', 'messageerror', 'unhandledrejection', 'rejectionhandled'],
                    getCustomData() {
                        // @ts-ignore
                        return Promise.resolve()
                    },
                    consoleCallback(keyName, ...data ){
                        return  Promise.resolve(data)
                    },
                    eventMapCallback(data ){
                        return  Promise.resolve(data)
                    },
                    rules: null,
                    ...options,
                }
                await this.initErrorMonitor()
            } catch (e) {
                console.error('ConsolePulg', e)
            }
        })()
    }

    /**
     * 初始化错误监听
     */
    async initErrorMonitor() {
        this.fp = (await (await fp.load({
            // monitoring: false
        })).get({
            extendedResult: true
        } as any))
        try {
            const _this:PluginObjectClass = this
            this.onMessage(null, 'PV')
            /**
             * console
             */
            // @ts-ignore
            this.config.consoleMap.forEach(keyName => {
                (function(keyName:keyof typeof window.console) {
                    const errorOldFun = window.console[keyName]
                    // @ts-ignore
                    window.console[keyName] = function(...args) {
                        _this?.config.consoleCallback?.(keyName, ...args).then(args=>{
                            _this.onMessage(args, `console.${keyName}`).then(() => {
                                (errorOldFun as Function)(...args)
                            })
                        })

                    }
                })(keyName as keyof typeof window.console)
            })
            /**
             * addEventListener
             */
            // @ts-ignore
            this.config.eventMap.forEach((keyName: string) => {
                (function(keyName) {
                    window.addEventListener(keyName,  (event: any) => {
                        _this.config.eventMapCallback?.({
                            keyName,
                            event,
                            message: event?.message,
                            stack: event?.stack
                        }).then(data=>{
                            _this.onMessage(data, !event?.message && keyName === 'error' ?   `${keyName} Static Resource` : `${keyName} of type WindowEventMap`)
                        })
                    }, true)

                })(keyName)
            })
            /**
             * @请求错误(XMLHttpRequest)
             */
            if (_this.config.XMLHttpRequest) {
                const XMLHttpRequestOld:any = window.XMLHttpRequest
                /**
                 * @open
                 */
                const XMLHttpRequestOld_open = XMLHttpRequestOld.prototype.open
                XMLHttpRequestOld.prototype.open = function(...args:any[]) {
                    this.openArgs = args
                    this.requestStartTime = Date.now()
                    // @ts-ignore
                    XMLHttpRequestOld_open.call(this, ...args)
                }
                /**
                 * @send
                 */
                const XMLHttpRequestOld_send = XMLHttpRequestOld.prototype.send
                XMLHttpRequestOld.prototype.send = function(e:any) {
                    this.bodyData = e
                    // @ts-ignore
                    XMLHttpRequestOld_send.call(this, e)
                }
                /**
                 * @send
                 */
                const XMLHttpRequestOld_setRequestHeader = XMLHttpRequestOld.prototype.setRequestHeader
                XMLHttpRequestOld.prototype.setRequestHeader = function(key:string, value:any, ...args:any[]) {
                    this.requestHeaders = this.requestHeaders || {}
                    this.requestHeaders[key] = value
                    // @ts-ignore
                    XMLHttpRequestOld_setRequestHeader.call(this, key, value, ...args)
                }
                // @ts-ignore
                window.XMLHttpRequest = function(...args:any[]) {
                    // @ts-ignore
                    const XHL: any = new XMLHttpRequestOld(...args)
                    try {
                        throw Error('Stack')
                    } catch (e:any) {
                        XHL.stack = e.stack
                    }
                    XHL.addEventListener('load', (res: any) => {
                        XHL.requestEndTime = Date.now()
                        XHL.requestTakeTime = XHL.requestEndTime - XHL.requestStartTime
                        const XHL_Info = _this.getXHLMessageData(res, XHL)
                        if (res.target.status >= 200 && res.target.status < 300) {
                            // 正常响应
                            if (_this.config.XHL_Success) {
                                _this.onMessage(XHL_Info, 'XHL_Success')
                            }
                        } else {
                            // 非正常响应
                            if (_this.config.XHL_Success_Error) {
                                _this.onMessage(XHL_Info, 'XHL_Success_Error')
                            }
                        }
                    })
                    XHL.addEventListener('error', (res:any) => {
                        XHL.requestEndTime = Date.now()
                        XHL.requestTakeTime = XHL.requestEndTime - XHL.requestStartTime
                        if (_this.config.XHL_Error) {
                            _this.onMessage(_this.getXHLMessageData(res, XHL), 'XHL_Error')
                        }
                    })
                    return XHL
                }
            }
        } catch (e) {
            console.error('ConsolePulg', e)
        }
    }

    /**
     * 获取请求信息
     */
    getXHLMessageData(res:any, XHL:any) {
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
            }
        } catch (e) {
            return {}
        }
    }

    /**
     * 错误消息拦截
     */
    async onMessage(errorData:any, type: string) {
        try {
            // 对上报服务器校验，防止不必要的错误请求
            if (!this.config.AxiosConfig ||
                !this.config.AxiosConfig.url ||
                !this.config.AxiosConfig.method) {
                // @ts-ignore
                return Promise.resolve()
            }
            // @ts-ignore
            if (['XHL_Success', 'XHL', 'XHL_Error', 'XHL_Success_Error'].includes(type)) {
                if (
                    this.config.AxiosConfig.method.toLocaleLowerCase() === errorData.openArgs[0].toLocaleLowerCase() &&
                    errorData.openArgs[1].toLocaleLowerCase().indexOf(this.config.AxiosConfig.url.toLocaleLowerCase()) > -1
                ) {
                    // @ts-ignore
                    return Promise.resolve()
                }
            }
            const data: MessageData = {
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
                browser_resolution:`${screen.width}x${screen.height}`,
            }
            try {
                data.system = <MessageDataSystem>{
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
                }
                if (this.config.userAgentData) {
                    try {
                        // @ts-ignore
                        const userAgentData = window.navigator.userAgentData || {}
                        const brands = (userAgentData.brands || []).map((e:any) => (<userAgentDataBrands>{
                            brand: e.brand,
                            version: e.version
                        }))
                        data.system.userAgentData = {
                            mobile: userAgentData.mobile,
                            // @ts-ignore
                            brands,
                        }
                    } catch (e) {
                        // err
                    }
                }
            } catch (e) {
                console.log('navigator 错误')
            }
            switch (Object.prototype.toString.call(errorData)) {
                case '[object Event]':
                    data.errorData = {
                        ...data.errorData,
                        timeStamp: data.errorData.timeStamp,
                        type: data.errorData.type,
                        path: data.errorData.path.map((el: Element) => {
                            return `【tagName】${(el.tagName || '').toLocaleLowerCase()}->【class】${el.className}->【id】${el.id}`
                        }),
                        message: data.errorData.message,
                        error: data.errorData.error,
                        toStringType: '[object Event]',
                    }
                    break
                case '[object Arguments]':
                    data.errorData = {};
                    ([...errorData]).forEach((it, k) => {
                        const dataObj = {
                            toStringType: '[object Arguments]',
                            error: null,
                        }
                        try {
                            dataObj.error = it.error || it.stack || it
                        } catch (e) {
                            dataObj.error = it
                        }
                        data.errorData['error_' + k] = dataObj
                    })
                    break
                case '[object Object]':
                    data.errorData = {
                        data: errorData,
                        toStringType: '[object Object]',
                    }
                    break
                case '[object PromiseRejectionEvent]':
                    data.errorData = {
                        data: errorData.reason,
                        toStringType: '[object PromiseRejectionEvent]',
                    }
                    break
                default:
                    try {
                        data.errorData = {
                            data: JSON.stringify(errorData),
                            toStringType: '[object default]',
                        }
                    } catch (e) {
                        data.errorData = {
                            data: errorData,
                            toStringType: '[object default]',
                        }
                    }
                    break
            }

            /**
             * 拦截规则校验
             */
            if (this.config.rules && this.config.rules.some(e => e.call(this, data))) {
                // 符合条件中止
                // @ts-ignore
                return Promise.resolve()
            }
            // @ts-ignore
            return new Promise<void>(resolve => {
                try {
                    throw Error('Stack')
                } catch (e:any) {
                    data.stack = e.stack
                }
                this.config.getCustomData?.call(this, data, this.fp).then(config => {
                    config = config || {}
                    axios({
                        ...this.config.AxiosConfig,
                        data,
                        ...config,
                    }).then(res => {
                        resolve()
                    }).catch(() => {
                        resolve()
                    })
                }).catch(() => {
                    resolve()
                })
            })
        } catch (e) {
            // @ts-ignore
            return Promise.resolve()
        }
    }
}
