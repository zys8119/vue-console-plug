import axios, {AxiosRequestConfig} from 'axios'
import fp, {GetResult} from '@fingerprintjs/fingerprintjs'
import {App} from 'vue'
import {get, set, merge} from 'lodash'
import {UserConfig, MessageData, MessageDataSystem, UserAgentDataBrands} from "../types";
import defaultConfig from "./defaultConfig";

export class PluginObjectClass {
    config: UserConfig<any> = {}
    fp: GetResult = {} as GetResult
    urlMap = new Map()
    constructor(private app:App, private options: UserConfig<any>) {
        ;(async ()=>{
            await this.init()
            await this.config.install?.call?.(this, app)
        })()
    }

    private async init(){
        try {
            this.config = merge(defaultConfig, this.options, {
                consoleMap:null,
                eventMap:null
            },{
                consoleMap:this.options.consoleMap || defaultConfig.consoleMap,
                eventMap:this.options.eventMap || defaultConfig.eventMap
            })
            this.config = await this.config.load?.(this.app, this.config) ||  this.config
            this.fp = (await (await fp.load(this.config.fpConfig)).get({
                extendedResult: true
            } as any))
            await this.config.beforeAxios?.(axios)
            await this.initErrorMonitor()
        } catch (e) {
            console.error('ConsolePulg', e)
            this.config.errorHandler?.(e)
        }
    }

    private getXPath(element) {
        if (element && element.nodeType === Node.ELEMENT_NODE) {
            const xpath = [];
            while (element.parentNode) {
                let index = 1;
                let sibling = element.previousSibling;
                while (sibling) {
                    if (sibling.nodeType === Node.ELEMENT_NODE && sibling.nodeName === element.nodeName) {
                        index++;
                    }
                    sibling = sibling.previousSibling;
                }
                const tagName = element.nodeName.toLowerCase();
                const position = index > 1 ? `[${index}]` : '';
                xpath.unshift(`${tagName}${position}`);
                element = element.parentNode;
            }
            return `/${xpath.join('/')}`;
        }
        return null;
    }
    private getSelector(element) {
        if (!(element instanceof Element)) return;

        let selector = '';
        while (element) {
            let tagSelector = element.tagName.toLowerCase();
            let id = element.id ? `#${element.id}` : '';
            let classes = element.className ? `.${element.className.replace(/\s+/g, '.')}` : '';

            selector = `${tagSelector}${id}${classes}${selector}`;

            if (element === document.body) break;
            selector = ` > ${selector}`;
            element = element.parentElement;
        }

        return selector;
    }
    /**
     * 初始化错误监听
     */
    private async initErrorMonitor() {
        try {
            const _this:PluginObjectClass = this
            await this.onMessage(null, 'PV')
            /**
             * console
             */
            // @ts-ignore
            this.config.consoleMap.forEach(keyName => {
                (function(keyName:keyof typeof window.console) {
                    const errorOldFun = window.console[keyName]
                    // @ts-ignore
                    window.console[keyName] = function(...args) {
                        _this?.config.consoleCallback?.(keyName, ...args).then(args => {
                            _this.onMessage(args, `console.${keyName}`).then(() => {
                                (errorOldFun as Function)(...args)
                            })
                        }).catch(() => {
                            // err
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
                    window.addEventListener(keyName, (event: any) => {
                        const type = Object.prototype.toString.call(event.target)
                        _this.config.eventMapCallback?.({
                            target:{
                                type,
                                src:get(event, 'target.src') || get(event, 'target.href'),
                                tag:get(event, 'target.tagName'),
                                xPath:/\[object HTML\w+\]/.test(type) ? _this.getXPath(event.target) : null,
                                selector:/\[object HTML\w+\]/.test(type) ? _this.getSelector(event.target) : null
                            },
                            keyName,
                            event,
                            message: event?.message || get(event,'error.message'),
                            stack: event?.stack || get(event,'error.stack')
                        }).then(data => {
                            _this.onMessage(data, !event?.message && keyName === 'error' ? `${keyName} Static Resource` : `${keyName} of type WindowEventMap`)
                        }).catch((() => {
                            // err
                        }))
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
                        const XHL_Info = _this.getXHLMessageData(res, XHL, 'xhr')
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
                            _this.onMessage(_this.getXHLMessageData(res, XHL, 'xhr'), 'XHL_Error')
                        }
                    })
                    return XHL
                }
            }
            if (_this.config.fetch) {
                const _fetch = window.fetch
                // @ts-ignore
                window.fetch = async (input: RequestInfo, init?: RequestInit)=>{
                    let stack = null
                    try {
                        throw Error('Stack')
                    } catch (e:any) {
                        stack = e.stack
                    }
                    const isString = typeof input === "string"
                    const url =  isString ? input : input.url
                    const requestInit = merge({
                        url,
                        method:'get'
                    },isString ? {} : input as any)
                    const requestStartTime = Date.now()
                    return _fetch(url, requestInit).then(res=>{
                        const requestEndTime = Date.now()
                        const requestTakeTime = requestEndTime - requestStartTime
                        return new Promise(resolve => {
                            ;(async ()=>{
                                const responseText = await res.clone().text()
                                const XHL_Info = _this.getXHLMessageData({
                                    target: {
                                        readyState:4,
                                        response:responseText,
                                        responseText:responseText,
                                        responseType:res.headers.get('content-type'),
                                        responseURL:url,
                                        responseXML:null,
                                        withCredentials:requestInit.credentials,
                                        status:res.status,
                                        statusText:res.statusText,
                                        type:'load'
                                    },
                                }, {
                                    bodyData:responseText,
                                    status:res.status,
                                    statusText:res.statusText,
                                    openArgs:[requestInit.method,url, true],
                                    requestStartTime,
                                    requestTakeTime,
                                    requestEndTime,
                                    getAllResponseHeaders(){
                                        const results = {}
                                        for (let [key, value] of res.headers as any) {
                                            results[key] = value
                                        }
                                        return results
                                    },
                                    stack,
                                    requestHeaders:requestInit.headers || {},
                                },'fetch')
                                if (res.status >= 200 && res.status < 300) {
                                    // 正常响应
                                    if (_this.config.XHL_Success) {
                                        _this.onMessage(XHL_Info, 'XHL_Success')
                                    }
                                }else {
                                    // 非正常响应
                                    if (_this.config.XHL_Success_Error) {
                                        _this.onMessage(XHL_Info, 'XHL_Success_Error')
                                    }
                                }
                                resolve(res)
                            })()
                        })
                    }).catch(err=>{
                        const requestEndTime = Date.now()
                        const requestTakeTime = requestEndTime - requestStartTime

                        return new Promise((resolve, reject) => {
                            ;(async ()=>{
                                if (_this.config.XHL_Error) {
                                    _this.onMessage(_this.getXHLMessageData({
                                        target:{
                                            readyState:4,
                                            response:null,
                                            responseText:null,
                                            responseType:null,
                                            responseURL:url,
                                            responseXML:null,
                                            withCredentials:requestInit.credentials,
                                            status:'failed',
                                            statusText:'net::ERR_CONNECTION_REFUSED',
                                            type:'load'
                                        }
                                    }, {
                                        bodyData:err.message,
                                        status:'failed',
                                        statusText:'net::ERR_CONNECTION_REFUSED',
                                        openArgs:[requestInit.method,url, true],
                                        requestStartTime,
                                        requestTakeTime,
                                        requestEndTime,
                                        stack:err.stack,
                                        getAllResponseHeaders(){
                                            return {}
                                        },
                                        requestHeaders:requestInit.headers || {},
                                    }), 'XHL_Error')
                                }
                                resolve(err)
                            })()
                        })
                    })
                }
            }
        } catch (e) {
            console.error('ConsolePulg', e)
            this.config.errorHandler?.(e)
        }
    }

    /**
     * 获取请求信息
     */
    private getXHLMessageData(res:any, XHL:any, type:string = 'xhr') {
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
                stack: XHL.stack,
                type
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
                typeof this.config.AxiosConfig.baseURL !== 'string' ||
                typeof this.config.AxiosConfig.method !== 'string') {
                // @ts-ignore
                return Promise.resolve()
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
                isVue3:/^3\./.test(this.app.version)
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
                        const brands = (userAgentData.brands || []).map((e:any) => (<UserAgentDataBrands>{
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
                this.config.errorHandler?.(e)
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
            return new Promise<void>(async (resolve, reject )=> {
                try {
                    throw Error('Stack')
                } catch (e:any) {
                    set(data, 'stack',
                        get(data,'errorData.data.stack') ||
                        get(data,'errorDataOrigin.data.stack') ||
                        get(data,'errorDataOrigin.event.reason.stack') ||
                        get(data,'errorDataOrigin.data.event.reason.stack') ||
                        e.stack
                    )
                }
                try {
                    set(data, 'errorData.data.message',
                        get(data,'errorData.data.message') ||
                        get(data,'errorDataOrigin.data.message') ||
                        get(data,'errorDataOrigin.event.reason.message') ||
                        get(data,'errorDataOrigin.data.event.reason.message')
                    )
                    const config = (await this.config.getCustomData?.call(this, data, this.fp, this.app)) || {}
                    const axiosConfig = merge(this.config.AxiosConfig, {data:config.data || data}, config) as AxiosRequestConfig
                    const requestType = ['XHL_Success_Error', 'XHL_Error', 'XHL_Success']
                    const requestTypeReg = [...this.urlMap.keys()].map(k=>new RegExp(k))
                    const isUrlMap = requestTypeReg.find(e=> e.test(get(data, 'errorData.data.openArgs[1]')))
                    if((requestType as any).includes(data.type) && isUrlMap){
                        return reject()
                    }
                    this.urlMap.set(axiosConfig.url, true)
                    await axios(axiosConfig)
                    resolve()
                } catch (e:any) {
                    reject(e)
                }
            }).catch(()=>{
                // 无需处理错误
            })
        } catch (e) {
            // @ts-ignore
            return Promise.resolve()
        }
    }

    /**
     * 函数重载
     * @param object
     * @param path
     * @param fn
     */
    heavyLoadFn(object:any, path:string, fn:any){
        const oldFn = get(object, path)
        const fns = []
        let newFn = fn
        const callBack = async function (...args){
            const result = await fn.apply(this,args)
            for (let k = 0; k < fns.length; k++){
                await fns[k].apply(this, args)
            }
            return result
        }
        if(typeof oldFn === 'function'){
            newFn = async function (...args){
                await oldFn.apply(this, args)
                return await callBack.apply(this, args)
            }
            set(object, path, newFn)
        }else {
            newFn = callBack
        }
        Object.defineProperty(object, path, {
            get(){
                return newFn
            },
            set(v){
                if(typeof v === 'function'){
                    fns.push(v)
                }
            },
        })
    }
}
const ConsolePlug = {
    install(app:App, options = {}) {
        try {
            window.$vueConsolePlug = new PluginObjectClass(app, options)
            ;['errorHandler', 'warnHandler'].forEach(path=>{
                if(window.$vueConsolePlug.config.vue[path]){
                    window.$vueConsolePlug.heavyLoadFn(app.config, path, (err:Error | string, instance, trace)=>{
                        window.$vueConsolePlug.onMessage({
                            stack:typeof err === 'string' ? err : err.stack,
                            trace,
                            instance
                        },`vue-${path.replace(/Handler/,'')}`)
                    })
                }
            })
        }catch (e) {
            window.$vueConsolePlug.config.errorHandler?.(e)
        }
    }
}
export default ConsolePlug
