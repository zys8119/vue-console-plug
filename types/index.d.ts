import {ConsolePulgConfig} from "../src/ConsolePlug"
export {
    ConsolePulgConfig,
    MessageData,
    MessageDataSystem,
    userAgentData,
    userAgentDataBrands,
} from "../src/ConsolePlug"

export const install:(vue:any, options?: ConsolePulgConfig<keyof WindowEventMap>) => any;
