import {ConsolePulgConfig} from "../src/ConsolePulg"
export {
    ConsolePulgConfig,
    MessageData,
    MessageDataSystem,
    userAgentData,
    userAgentDataBrands,
} from "../src/ConsolePulg"

export const install:(vue:any, options?: ConsolePulgConfig<keyof WindowEventMap>) => any;
