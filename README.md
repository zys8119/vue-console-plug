# vue-console-pulg

vue 日志监控插件

## [查看代码](./src/ConsolePulg.ts)

## 使用方式

```vue
import vue from "vue"

import ConsolePulg from "vue-console-pulg"

vue.use(ConsolePulg,{
    AxiosConfig:{
        // baseURL:"http://localhost:81/",
        // url:"/Dome/Index/console",
        // method:"post",
    },
    // ****更多配置
})
```

## 更多配置

```typescript
import axios, { AxiosRequestConfig } from "axios"

export interface ConsolePulgConfig <K extends keyof WindowEventMap>{
    [key:string]:any;
    AxiosConfig?:AxiosRequestConfig;
    getCustomData?(this:PluginObjectClass,data:MessageData):Promise<any>;// 获取自定义数据
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


## 推荐配置

```typescript
import {ConsolePulgConfig } from 'ConsolePulg'

export default {
    AxiosConfig:{
        baseURL:import.meta.env.VITE_Log_API,
        url:'/log/up',
        method:'post',
    },
    getCustomData(data, fp): Promise<any> {
        const _this:any = this
        const main:any = window.store.main
        const {userinfo:{id:user_id, name:user_tag} = {} as any} = main
        return Promise.resolve({
            url:data.type === 'PV' ? '/log/pv' : _this.config.AxiosConfig?.url,
            data: {
                log:data,
                user_id:user_id || fp.visitorId,
                user_tag:user_tag || '未知',
                type:data.type,
                app_id:'5fa1ca70-f5e4-11ec-becd-a99a91db4246',
                project_version:'v1.0.0',
            }
        })
    }
} as ConsolePulgConfig<keyof WindowEventMap>
```
