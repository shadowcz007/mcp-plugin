import z from "zod";

export const hello={
    name: 'hello',
    description: 'hello world',
    schema: {
      message: z.string().describe('message'),
    },
    handler: async (args: any) => {
        console.log(args)
        return {
            content: [{ type: 'text', text: `Echo: ${JSON.stringify(args)}` }]
        }
    }
  }