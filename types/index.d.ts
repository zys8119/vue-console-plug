import { PluginObjectClass } from "../src/ConsolePlug"
import {AxiosRequestConfig} from "axios";
import {GetResult, LoadOptions} from "@fingerprintjs/fingerprintjs";
import {App} from "vue";
export interface UserConfig<K extends keyof WindowEventMap> {
    [key: string]: any;
    AxiosConfig?: AxiosRequestConfig;
    fpConfig?: LoadOptions;// 客户端唯一id获取配置
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
    rules?: Array<(this: PluginObjectClass, data: MessageData) => boolean> | null;// 返回false即上报，反之不上报
    getCustomData?(this: PluginObjectClass, data: MessageData, fp:GetResult, app:App): Promise<any>;// 获取自定义数据
    eventMapCallback?<T> (data:T): Promise<T>;// 事件回调
    consoleCallback?<T> (...data:T[]): Promise<T[]>;// console回调
    load?(app:App, config:UserConfig<K>): Promise<UserConfig<K>> | UserConfig<K> | void;// console回调
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
    userAgentData: UserAgentData;// 用户ua数据
}

export interface UserAgentData {
    mobile: string;
    brands: UserAgentDataBrands[]
}

export type UserAgentDataBrands = {
    brand: string;
    version: string;
}
export const install:(vue:any, options?: UserConfig<keyof WindowEventMap>) => any;

declare global{
    interface Window {
        $vueConsolePlug:PluginObjectClass
    }
}
