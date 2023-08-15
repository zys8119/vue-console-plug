# vue-console-plug

vue 日志监控插件

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
import {UserConfig } from 'vue-console-plug'
export default {
    consoleMap:['error'],
    eventMap: ['error', 'messageerror', 'unhandledrejection', 'rejectionhandled', 'click'],
    AxiosConfig:{
        // baseURL、method 必须设置string 才会上报
        baseURL:'',
        method:'post'
    },
    getCustomData(data, fp): Promise<any> {
        // todo 推荐以下配置，具体以实际项目为准
        return Promise.resolve({
            url:data.type === 'PV' ? '/log/pv' : '/log/up',
            data: {
                log:data, // 日志数据
                visitorId:fp.visitorId,// 客户端唯一id
                user_id:user_id, // 当前项目用户登录id，如果已登录
                user_tag:user_tag || '未知',// 用户标示，如果需要
                type:data.type,// 日志类型
                //todo 请修改你的应用id
                app_id:'<%= app_id %>',// 绑定的应用id
                project_version:'v1.0.0',// 绑定的当前项目版本
            }
        })
    },
    // 如果无法捕捉请使用手动初始化
    // install(app) {
    //     app.mount('#app')
    // }
} as UserConfig<keyof WindowEventMap>
```
