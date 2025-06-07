import z from 'zod'

export const hello = {
  name: 'hello',
  description: 'hello world',
  schema: {
    message: z.string().describe('message')
  },
  handler: async (args: any, client: any, sendNotification: any) => {
    console.log(args)
    // client.createDatabase 
    // client.callTool 
    // client.listTools
    
    return {
      content: [{ type: 'text', text: `Echo: ${JSON.stringify(args)}` }]
    }
  }
}
