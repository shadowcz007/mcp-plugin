"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.configureMcp = configureMcp;
const zod_1 = require("zod");
function configureMcp(server, ResourceTemplate, z = zod_1.z) {
    console.log('🔧 [CONFIG] Starting tool configuration...');
    console.log(`🔧 [CONFIG] ResourceTemplate available: ${ResourceTemplate ? 'Yes' : 'No'}`);
    console.log(`🔧 [CONFIG] z (zod) available: ${z ? 'Yes' : 'No'}`);
    try {
        // 添加一个简单的测试工具
        console.log('🔧 [CONFIG] Registering test-echo tool...');
        server.tool('test-echo', 'Echo back the input message', {
            message: z.string().describe('Message to echo back')
        }, async (args) => {
            console.log(`📤 [TOOL] test-echo called with: ${args.message}`);
            return {
                content: [
                    {
                        type: 'text',
                        text: `Echo: ${args.message}`
                    }
                ]
            };
        });
        console.log('✅ [CONFIG] test-echo tool registered successfully');
        // 添加一个获取当前时间的工具
        console.log('🔧 [CONFIG] Registering get-current-time tool...');
        server.tool('get-current-time', 'Get the current date and time', {}, async () => {
            console.log('📤 [TOOL] get-current-time called');
            const now = new Date();
            return {
                content: [
                    {
                        type: 'text',
                        text: `Current time: ${now.toISOString()}`
                    }
                ]
            };
        });
        console.log('✅ [CONFIG] get-current-time tool registered successfully');
        // 添加一个数学计算工具
        console.log('🔧 [CONFIG] Registering math-add tool...');
        server.tool('math-add', 'Add two numbers together', {
            a: z.number().describe('First number'),
            b: z.number().describe('Second number')
        }, async (args) => {
            console.log(`📤 [TOOL] math-add called with: ${args.a} + ${args.b}`);
            const result = args.a + args.b;
            return {
                content: [
                    {
                        type: 'text',
                        text: `${args.a} + ${args.b} = ${result}`
                    }
                ]
            };
        });
        console.log('✅ [CONFIG] math-add tool registered successfully');
        console.log('🎉 [CONFIG] All tools configured successfully!');
    }
    catch (error) {
        if (error instanceof Error) {
            console.error(`❌ [CONFIG] Error during tool configuration: ${error.message}`);
        }
        else {
            console.error('❌ [CONFIG] An unknown error occurred during tool configuration');
        }
        throw error;
    }
}
