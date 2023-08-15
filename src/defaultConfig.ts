import {UserConfig} from "../types";

export default {
    // 默认不进行上报，需要配置上报服务器地址信息
    AxiosConfig:{},
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
    consoleCallback: (keyName, ...data )=>Promise.resolve(data),
    eventMapCallback: data=>Promise.resolve(data),
    rules: null,
    fpConfig: {},
    vue:{
        errorHandler:true,
        warnHandler:false
    }
} as UserConfig<keyof WindowEventMap>
