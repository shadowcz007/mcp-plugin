import { z as zod } from 'zod';
interface Server {
    tool: (name: string, description: string, schema: Record<string, any>, handler: (args: any) => Promise<any>) => void;
}
interface ResourceTemplate {
}
export declare function configureMcp(server: Server, ResourceTemplate?: ResourceTemplate, z?: typeof zod): void;
export {};
