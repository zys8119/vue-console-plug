import {ConsolePlugConfig} from "../src/ConsolePlug"
export {
    ConsolePlugConfig,
    MessageData,
    MessageDataSystem,
    userAgentData,
    userAgentDataBrands,
} from "../src/ConsolePlug"

export const install:(vue:any, options?: ConsolePlugConfig<keyof WindowEventMap>) => any;
