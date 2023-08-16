import json from '@rollup/plugin-json';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import typescript from '@rollup/plugin-typescript';
import {defineConfig} from 'rollup';

export default defineConfig({
    input: 'src/ConsolePlug.ts', // 替换为你的入口 TypeScript 文件路径
    output: {
        file: 'dist/index.js', // 输出文件路径
        format: 'es', // 输出格式，这里使用立即执行函数,
    },
    plugins: [
        typescript(),    // 编译 TypeScript 文件
        resolve({
            browser:true,
        }),
        json(),
        commonjs()
    ],
});
