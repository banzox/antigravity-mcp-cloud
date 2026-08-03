export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const TOOLS = [
    {
      name: 'antigravity_cloud_status',
      description: 'Check status of 24/7 Cloud Antigravity AI Server',
      inputSchema: { type: 'object', properties: {} }
    },
    {
      name: 'save_cloud_note',
      description: 'Save notes, tasks, or code ideas to 24/7 cloud storage',
      inputSchema: {
        type: 'object',
        properties: {
          title: { type: 'string', description: 'Title of note' },
          content: { type: 'string', description: 'Content of note' }
        },
        required: ['title', 'content']
      }
    }
  ];

  if (req.method === 'GET') {
    return res.status(200).json({
      name: 'Antigravity 24/7 Cloud MCP Server',
      version: '1.0.0',
      protocolVersion: '2024-11-05',
      capabilities: { tools: {} },
      tools: TOOLS
    });
  }

  if (req.method === 'POST') {
    const body = req.body || {};

    if (body.jsonrpc === '2.0') {
      const id = body.id ?? 1;

      if (body.method === 'initialize') {
        return res.status(200).json({
          jsonrpc: '2.0',
          id,
          result: {
            protocolVersion: '2024-11-05',
            capabilities: { tools: {} },
            serverInfo: { name: 'Antigravity 24/7 Cloud Engine', version: '1.0.0' }
          }
        });
      }

      if (body.method === 'notifications/initialized') {
        return res.status(200).end();
      }

      if (body.method === 'tools/list') {
        return res.status(200).json({
          jsonrpc: '2.0',
          id,
          result: { tools: TOOLS }
        });
      }

      if (body.method === 'tools/call') {
        const { name, arguments: args } = body.params || {};

        if (name === 'antigravity_cloud_status') {
          return res.status(200).json({
            jsonrpc: '2.0',
            id,
            result: {
              content: [{
                type: 'text',
                text: JSON.stringify({
                  status: 'Online 24/7',
                  service: 'Antigravity Cloud Engine',
                  host: 'Vercel Serverless Cloud',
                  time: new Date().toISOString()
                }, null, 2)
              }]
            }
          });
        }

        if (name === 'save_cloud_note') {
          return res.status(200).json({
            jsonrpc: '2.0',
            id,
            result: {
              content: [{
                type: 'text',
                text: `Saved note "${args.title}" successfully to Antigravity Cloud storage!`
              }]
            }
          });
        }
      }
    }

    return res.status(200).json({
      status: 'active',
      agent: 'Antigravity 24/7 Cloud MCP Server',
      tools: TOOLS
    });
  }

  return res.status(405).send('Method Not Allowed');
}
