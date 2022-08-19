# vue-console-plug

vue 日志监控插件

## [查看代码](./src/ConsolePlug.ts)

## 更多配置

```typescript
import axios, { AxiosRequestConfig } from "axios"

export interface ConsolePlugConfig <K extends keyof WindowEventMap>{
    [key:string]:any;
    AxiosConfig?:AxiosRequestConfig;
    getCustomData?(this:PluginObjectClass,data:MessageData, app:App):Promise<any>;// 获取自定义数据
    XHL_Success?:boolean;// 是否捕捉正常请求 默认开启
    XHL_Success_Error?:boolean;// 是否捕捉正常错误请求 默认开启
    XHL_Error?:boolean;// 是否捕捉错误请求 默认开启
    userAgentData?:boolean;// 是否捕捉userAgentData 默认开启
    system?:boolean;// 是否捕捉系统信息 默认开启
    XMLHttpRequest?:boolean;// 是否捕捉XMLHttpRequest 默认开启
    console?:boolean;// 是否捕捉console.error 默认开启
    // 是否捕捉console映射, 默认监听只error
    consoleMap?:Array<string | 'error' | 'assert' | 'clear' | 'count' | 'countReset' | 'debug' | 'dir' | 'dirxml' | 'exception' | 'group' | 'groupCollapsed' | 'groupEnd' | 'info' | 'log' | 'table' | 'time' | 'timeEnd' | 'timeLog' | 'timeStamp' | 'trace' | 'warn'>;
    eventMap?:Array<K>;// 是否捕捉addEventListener事件映射, 默认监听只error
    rules?:Array<(this:PluginObjectClass,data:MessageData)=>boolean>;// 返回true即上报，反之不上报
}
```


## 引用

main.ts

```typescript
import {createApp} from "vue"
import vueConsolePlug from "vue-console-plug"

const app = createApp(App)

import vueConsolePlugConfigs from "./config"
app.use(vueConsolePlug, vueConsolePlugConfigs)
```


config.ts

```typescript
import {ConsolePlugConfig } from 'vue-console-plug'

export default {
    consoleMap:['error'],
    eventMap: ['error', 'messageerror', 'unhandledrejection', 'rejectionhandled', 'click'],
    AxiosConfig:{
        url:'/log/up',
        method:'post',
    },
    eventMapCallback(data: any): Promise<any> {
        if (['click'].includes(data.keyName)) {
            data.selector = data.event.path.reverse().map((e:HTMLElement) => {
                const _id = e.id ? `#${e.id}` : ''
                const _className = e.className ? `${e.className.split(' ').filter(e => /\S/.test(e)).map(e => `.${e}`)}` : ''
                return `${e?.tagName?.toLocaleLowerCase() || ''}${_id}${_className}`
            }).filter((e:any) => /\S/.test(e)).join('>')
        }
        return Promise.resolve(data)
    },
    getCustomData(data, fp, app): Promise<any> {
        //todo 区分vue 版本
        const isVue3 = /^3\./.test(app.version)
        //todo 修改成你的日志上报服务器， 这里推荐环境变量方式， 根据vue版本动态选择上报地址
        const baseURL = isVue3 ? import.meta.env.VITE_LOG_API : process.env.VUE_APP_LOG_API
        const _this:any = this
        let main:any = window.store.main || {userinfo:{id:null, name:null}}
        if (!isVue3) {
            try {
                main = JSON.parse(localStorage.getItem('userInfo') as any)
            } catch (e) {/*err*/}
            try {
                main = JSON.parse(sessionStorage.getItem('userInfo')as any)
            } catch (e) {/*err*/}
        }
        const {userinfo:{id:user_id, name:user_tag} = {} as any} = main
        if (!baseURL || ['XHL_Success_Error', 'XHL_Error', 'XHL_Success'].includes(data.type) && /\/log\/(up|pv)$/.test(data.errorData.data.openArgs[1])) {
            return Promise.reject()
        }
        return Promise.resolve({
            baseURL,
            url:data.type === 'PV' ? '/log/pv' : _this.config.AxiosConfig?.url,
            data: {
                log:data,
                user_id:user_id || fp.visitorId,
                user_tag:user_tag || '未知',
                type:data.type,
                //todo 请修改你的应用id
                app_id:'<%= app_id %>',
                project_version:'v1.0.0',
            }
        })
    }
} as ConsolePlugConfig<keyof WindowEventMap>
```

推荐环境变量配置上报服务器地址 .env.development / .env.production

```
# Dev 环境，vue2.x.x
VUE_APP_LOG_API=您的日志上报服务器地址

# Dev 环境，vue3.x.x
VITE_LOG_API=您的日志上报服务器地址
```
