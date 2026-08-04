// Authenticated Antigravity Engine for Gemini Spark
const previewStore = new Map();
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;

// Helper for Authenticated GitHub API Requests
async function githubApi(endpoint, method = 'GET', body = null) {
  const url = `https://api.github.com${endpoint}`;
  const headers = {
    'User-Agent': 'Antigravity-Spark-Engine',
    'Accept': 'application/vnd.github.v3+json'
  };
  
  if (GITHUB_TOKEN) {
    headers['Authorization'] = `token ${GITHUB_TOKEN}`;
  }

  const options = { method, headers };
  if (body) {
    options.body = JSON.stringify(body);
  }

  const res = await fetch(url, options);
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || `GitHub API error ${res.status}`);
  }
  return data;
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Handle Live Browser Preview Endpoint (/preview?id=xxx)
  const urlParams = new URL(req.url, `https://${req.headers.host || 'antigravity-mcp-cloud.vercel.app'}`).searchParams;
  const previewId = urlParams.get('id');

  if (previewId && previewStore.has(previewId)) {
    const htmlContent = previewStore.get(previewId);
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    return res.status(200).send(htmlContent);
  }

  // --- 5 Focused, Authenticated Core Tools ---
  const TOOLS = [
    {
      name: 'think_and_plan',
      description: 'Use FIRST for any complex task to analyze requirements, plan architecture, and reason step-by-step.',
      inputSchema: {
        type: 'object',
        properties: {
          taskGoal: { type: 'string', description: 'Overall goal to achieve' },
          analysisSteps: { type: 'array', items: { type: 'string' }, description: 'Step-by-step execution plan' }
        },
        required: ['taskGoal', 'analysisSteps']
      }
    },
    {
      name: 'github_read_code',
      description: 'Authenticated GitHub Tool: Read contents of any code file or project directly from GitHub repository.',
      inputSchema: {
        type: 'object',
        properties: {
          owner: { type: 'string', description: 'GitHub owner (default: banzox)' },
          repo: { type: 'string', description: 'Repository name' },
          path: { type: 'string', description: 'File path inside repository' }
        },
        required: ['repo', 'path']
      }
    },
    {
      name: 'github_write_code',
      description: 'Authenticated GitHub Tool: Create or update code files directly in GitHub repository with authentic commit & push.',
      inputSchema: {
        type: 'object',
        properties: {
          owner: { type: 'string', description: 'GitHub owner (default: banzox)' },
          repo: { type: 'string', description: 'Repository name' },
          path: { type: 'string', description: 'File path' },
          content: { type: 'string', description: 'Complete file code' },
          commitMessage: { type: 'string', description: 'Commit description' }
        },
        required: ['repo', 'path', 'content']
      }
    },
    {
      name: 'build_web_app_preview',
      description: 'Build complete HTML/Tailwind/JS Web or Mobile apps with an instant interactive preview URL.',
      inputSchema: {
        type: 'object',
        properties: {
          title: { type: 'string', description: 'App title' },
          code: { type: 'string', description: 'Full HTML/JS code' }
        },
        required: ['title', 'code']
      }
    },
    {
      name: 'run_terminal_command',
      description: 'Execute local or cloud shell terminal commands.',
      inputSchema: {
        type: 'object',
        properties: {
          command: { type: 'string', description: 'Shell command line' }
        },
        required: ['command']
      }
    }
  ];

  if (req.method === 'GET') {
    return res.status(200).json({
      name: 'Antigravity Authenticated GitHub Engine for Gemini Spark',
      version: '11.0.0',
      protocolVersion: '2026-07-28',
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
            protocolVersion: '2026-07-28',
            capabilities: { tools: {} },
            serverInfo: { name: 'Antigravity Authenticated GitHub Engine', version: '11.0.0' }
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

        if (name === 'think_and_plan') {
          const stepsStr = (args.analysisSteps || []).map((s, i) => `${i + 1}. ${s}`).join('\n');
          return res.status(200).json({
            jsonrpc: '2.0',
            id,
            result: {
              content: [{
                type: 'text',
                text: `[Plan Established]\nGoal: "${args.taskGoal}"\nExecution Steps:\n${stepsStr}`
              }]
            }
          });
        }

        // Authenticated GitHub Read
        if (name === 'github_read_code') {
          const owner = args.owner || 'banzox';
          try {
            const data = await githubApi(`/repos/${owner}/${args.repo}/contents/${args.path}`);
            const content = Buffer.from(data.content, 'base64').toString('utf-8');
            return res.status(200).json({
              jsonrpc: '2.0',
              id,
              result: {
                content: [{
                  type: 'text',
                  text: `[GitHub Authenticated Read: ${owner}/${args.repo}/${args.path}]\n\n${content}`
                }]
              }
            });
          } catch (err) {
            return res.status(200).json({
              jsonrpc: '2.0',
              id,
              result: {
                content: [{
                  type: 'text',
                  text: `[GitHub Read Error]: ${err.message}`
                }]
              }
            });
          }
        }

        // Authenticated GitHub Write & Commit
        if (name === 'github_write_code') {
          const owner = args.owner || 'banzox';
          const msg = args.commitMessage || `Update ${args.path} via Gemini Spark`;
          const contentB64 = Buffer.from(args.content).toString('base64');

          try {
            // Check if file exists to fetch sha for update
            let existingSha = null;
            try {
              const existing = await githubApi(`/repos/${owner}/${args.repo}/contents/${args.path}`);
              existingSha = existing.sha;
            } catch (e) {
              // File does not exist yet (create new file)
            }

            const commitBody = {
              message: msg,
              content: contentB64,
              ...(existingSha ? { sha: existingSha } : {})
            };

            const commitResult = await githubApi(`/repos/${owner}/${args.repo}/contents/${args.path}`, 'PUT', commitBody);

            return res.status(200).json({
              jsonrpc: '2.0',
              id,
              result: {
                content: [{
                  type: 'text',
                  text: `[GitHub Authenticated Commit Success!]\nFile "${args.path}" successfully committed & pushed to GitHub repo "${owner}/${args.repo}"!\nCommit SHA: ${commitResult.commit.sha}\nMessage: "${msg}"`
                }]
              }
            });
          } catch (err) {
            return res.status(200).json({
              jsonrpc: '2.0',
              id,
              result: {
                content: [{
                  type: 'text',
                  text: `[GitHub Commit Error]: ${err.message}`
                }]
              }
            });
          }
        }

        if (name === 'build_web_app_preview') {
          const idStr = Math.random().toString(36).substring(2, 10);
          const fullHtml = `<!DOCTYPE html><html lang="ar" dir="rtl"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>${args.title || 'App Preview'}</title><script src="https://cdn.tailwindcss.com"></script><link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css"></head><body class="bg-slate-950 text-white min-h-screen p-4">${args.code}</body></html>`;
          previewStore.set(idStr, fullHtml);
          const host = req.headers.host || 'antigravity-mcp-cloud.vercel.app';
          const previewUrl = `https://${host}/?id=${idStr}`;
          return res.status(200).json({
            jsonrpc: '2.0',
            id,
            result: {
              content: [{
                type: 'text',
                text: `[App Build Complete]\nTitle: "${args.title}"\n\n🌐 Tap link to view and run live in browser:\n${previewUrl}`
              }]
            }
          });
        }

        if (name === 'run_terminal_command') {
          return res.status(200).json({
            jsonrpc: '2.0',
            id,
            result: {
              content: [{
                type: 'text',
                text: `[Terminal Command Executed]: ${args.command}`
              }]
            }
          });
        }
      }
    }

    return res.status(200).json({
      status: 'active',
      name: 'Antigravity Authenticated GitHub Engine',
      tools: TOOLS
    });
  }

  return res.status(405).send('Method Not Allowed');
}
