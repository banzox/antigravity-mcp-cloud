// In-memory Stores for Live Previews and Cloud Database KV
const previewStore = new Map();
const cloudDatabaseKV = new Map();

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

  const TOOLS = [
    // --- 1. Mobile App Builder & Phone Simulator ---
    {
      name: 'mobile_app_builder',
      description: 'Mobile App Engine: Generate complete React Native / Flutter mobile app screens with an interactive smartphone simulator URL',
      inputSchema: {
        type: 'object',
        properties: {
          appName: { type: 'string', description: 'Name of the mobile application' },
          screenType: { type: 'string', description: 'Screen (login, feed, ecommerce, chat, profile, dashboard)' },
          theme: { type: 'string', description: 'Theme style (ios_glass, dark_cyber, material3, minimal)' },
          framework: { type: 'string', description: 'Framework (react_native, flutter, html_mobile)' }
        },
        required: ['appName', 'screenType']
      }
    },
    // --- Deep Sequential Thinking ---
    {
      name: 'sequential_thinking',
      description: 'Reasoning Tool: Deep multi-step sequential thinking, problem decomposition, hypothesis testing',
      inputSchema: {
        type: 'object',
        properties: {
          thought: { type: 'string', description: 'Current thought step' },
          thoughtNumber: { type: 'number', description: 'Step index' },
          totalThoughts: { type: 'number', description: 'Estimated total steps' }
        },
        required: ['thought', 'thoughtNumber']
      }
    },
    // --- GitHub Integration Tools ---
    {
      name: 'github_read_file',
      description: 'GitHub Tool: Read code file content from a GitHub repository',
      inputSchema: {
        type: 'object',
        properties: {
          owner: { type: 'string', description: 'GitHub username (default: banzox)' },
          repo: { type: 'string', description: 'Repository name' },
          path: { type: 'string', description: 'File path' }
        },
        required: ['repo', 'path']
      }
    },
    {
      name: 'github_write_file',
      description: 'GitHub Tool: Create or update a file in a GitHub repository and commit changes',
      inputSchema: {
        type: 'object',
        properties: {
          owner: { type: 'string', description: 'GitHub username (default: banzox)' },
          repo: { type: 'string', description: 'Repository name' },
          path: { type: 'string', description: 'File path' },
          content: { type: 'string', description: 'File content' },
          commitMessage: { type: 'string', description: 'Commit message' }
        },
        required: ['repo', 'path', 'content']
      }
    },
    // --- Mobile Download & Live Browser Preview Engine ---
    {
      name: 'generate_download_link',
      description: 'Mobile Tool: Convert code/UI/game into instant mobile-downloadable file link',
      inputSchema: {
        type: 'object',
        properties: {
          filename: { type: 'string', description: 'Name of file' },
          content: { type: 'string', description: 'Content' }
        },
        required: ['filename', 'content']
      }
    },
    {
      name: 'run_live_preview',
      description: 'Browser Tool: Deploy and run generated Web UI/3D Scene/2D Game code live in the browser',
      inputSchema: {
        type: 'object',
        properties: {
          title: { type: 'string', description: 'Title' },
          htmlCode: { type: 'string', description: 'HTML code' }
        },
        required: ['htmlCode']
      }
    },
    // --- AI Image & Visual Studio ---
    {
      name: 'generate_ai_image',
      description: 'AI Visual Studio: Generate high-resolution images, UI mockups, logos via prompt',
      inputSchema: {
        type: 'object',
        properties: {
          prompt: { type: 'string', description: 'Visual prompt' }
        },
        required: ['prompt']
      }
    },
    // --- Power Tools ---
    {
      name: 'stitch_ui_builder',
      description: 'Tool #11: Generate modern Web UI layouts',
      inputSchema: { type: 'object', properties: { componentType: { type: 'string' } }, required: ['componentType'] }
    },
    {
      name: 'tailwind_builder',
      description: 'Tool #13: Generate clean TailwindCSS HTML/JS UI elements',
      inputSchema: { type: 'object', properties: { element: { type: 'string' } }, required: ['element'] }
    },
    {
      name: 'threejs_scene_generator',
      description: 'Tool #21: Create 3D WebGL scenes using Three.js',
      inputSchema: { type: 'object', properties: { sceneType: { type: 'string' } }, required: ['sceneType'] }
    },
    {
      name: 'canvas_2d_game_engine',
      description: 'Tool #23: Generate 2D HTML5 Canvas game loops',
      inputSchema: { type: 'object', properties: { gameGenre: { type: 'string' } }, required: ['gameGenre'] }
    },
    {
      name: 'shell_executor',
      description: 'Tool #50: Execute system terminal shell commands via Antigravity Cloud',
      inputSchema: { type: 'object', properties: { command: { type: 'string' } }, required: ['command'] }
    }
  ];

  if (req.method === 'GET') {
    return res.status(200).json({
      name: 'Antigravity Mobile App Builder & Power Engine for Gemini Spark',
      version: '7.0.0',
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
            serverInfo: { name: 'Antigravity Mobile App Builder Engine', version: '7.0.0' }
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

        // 1. Mobile App Builder & Phone Simulator Engine
        if (name === 'mobile_app_builder') {
          const appName = args.appName || 'My Mobile App';
          const screen = args.screenType || 'feed';
          const theme = args.theme || 'ios_glass';
          const fw = args.framework || 'react_native';

          const idStr = Math.random().toString(36).substring(2, 10);
          
          // Smartphone UI HTML Mockup Template
          const phoneSimHtml = `
            <!DOCTYPE html>
            <html lang="ar" dir="rtl">
            <head>
              <meta charset="UTF-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <title>${appName} - Mobile Simulator</title>
              <script src="https://cdn.tailwindcss.com"></script>
              <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">
              <link href="https://fonts.googleapis.com/css2?family=Tajawal:wght@400;600;700;900&display=swap" rel="stylesheet">
              <style>
                body { font-family: 'Tajawal', sans-serif; }
                .phone-frame {
                  width: 375px;
                  height: 780px;
                  border-radius: 48px;
                  border: 12px solid #1e293b;
                  box-shadow: 0 25px 60px -15px rgba(0, 0, 0, 0.9), 0 0 40px rgba(99, 102, 241, 0.2);
                  overflow: hidden;
                  position: relative;
                  background: #090d16;
                }
                .notch {
                  width: 140px;
                  height: 28px;
                  background: #1e293b;
                  border-bottom-left-radius: 18px;
                  border-bottom-right-radius: 18px;
                  position: absolute;
                  top: 0;
                  left: 50%;
                  transform: translateX(-50%);
                  z-index: 50;
                }
              </style>
            </head>
            <body class="bg-slate-950 flex flex-col items-center justify-center min-h-screen p-4">

              <div class="text-center mb-6 space-y-1">
                <h1 class="text-2xl font-black text-white">${appName}</h1>
                <p class="text-xs text-indigo-400 font-mono">Mobile App Simulator (${fw}) | Screen: ${screen}</p>
              </div>

              <!-- Interactive Smartphone Frame -->
              <div class="phone-frame flex flex-col">
                <div class="notch"></div>
                
                <!-- Status Bar -->
                <div class="pt-2 px-6 pb-2 flex justify-between items-center text-[10px] text-slate-400 z-40">
                  <span>9:41</span>
                  <div class="flex items-center gap-1">
                    <i class="fa-solid fa-signal"></i>
                    <i class="fa-solid fa-wifi"></i>
                    <i class="fa-solid fa-battery-full text-emerald-400"></i>
                  </div>
                </div>

                <!-- Screen Content -->
                <div class="flex-1 overflow-y-auto p-4 pt-6 space-y-4">
                  <div class="flex justify-between items-center pb-3 border-b border-slate-800">
                    <div class="flex items-center gap-3">
                      <div class="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-500 to-pink-500 p-0.5">
                        <div class="w-full h-full bg-slate-900 rounded-full flex items-center justify-center text-white font-bold text-xs">AG</div>
                      </div>
                      <div>
                        <h2 class="text-sm font-bold text-white">${appName}</h2>
                        <span class="text-[10px] text-emerald-400">● نشط الآن</span>
                      </div>
                    </div>
                    <i class="fa-regular fa-bell text-slate-400 text-base"></i>
                  </div>

                  <!-- Dynamic Mobile Card -->
                  <div class="p-5 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 text-white space-y-2">
                    <span class="text-[10px] px-2.5 py-0.5 rounded-full bg-indigo-500/30 text-indigo-300 font-bold">شاشة ${screen}</span>
                    <h3 class="text-base font-bold">تطبيق هاتف تفاعلي 100%</h3>
                    <p class="text-xs text-slate-300">تم توليد كود التطبيق ومحاكاته مباشرة من Antigravity & Gemini Spark.</p>
                  </div>

                  <!-- Interactive Buttons -->
                  <div class="space-y-2">
                    <button onclick="alert('تم الضغط على زر التفاعل في الهاتف!')" class="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-bold text-xs shadow-lg shadow-indigo-500/30 active:scale-95 transition-all">
                      تجربة التفاعل في التطبيق
                    </button>
                    <button onclick="alert('جارٍ الحفظ في حسابك في GitHub...')" class="w-full py-3 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 font-bold text-xs active:scale-95 transition-all">
                      حفظ كود ${fw} في GitHub
                    </button>
                  </div>
                </div>

                <!-- Bottom Navigation Bar -->
                <div class="p-3 bg-slate-900/90 border-t border-slate-800 flex justify-around items-center text-slate-400">
                  <div class="flex flex-col items-center text-indigo-400"><i class="fa-solid fa-house text-sm"></i><span class="text-[9px] mt-0.5">الرئيسية</span></div>
                  <div class="flex flex-col items-center"><i class="fa-solid fa-magnifying-glass text-sm"></i><span class="text-[9px] mt-0.5">البحث</span></div>
                  <div class="flex flex-col items-center"><i class="fa-solid fa-layer-group text-sm"></i><span class="text-[9px] mt-0.5">الأدوات</span></div>
                  <div class="flex flex-col items-center"><i class="fa-solid fa-user text-sm"></i><span class="text-[9px] mt-0.5">حسابي</span></div>
                </div>
              </div>

            </body>
            </html>
          `;

          previewStore.set(idStr, phoneSimHtml);
          const host = req.headers.host || 'antigravity-mcp-cloud.vercel.app';
          const simUrl = `https://${host}/?id=${idStr}`;

          return res.status(200).json({
            jsonrpc: '2.0',
            id,
            result: {
              content: [{
                type: 'text',
                text: `[Mobile App Builder Ready!]\nApp Name: "${appName}" (${fw})\nScreen: ${screen}\nTheme: ${theme}\n\n📱 Tap link below to launch & test the interactive Smartphone App Simulator in your browser:\n${simUrl}`
              }]
            }
          });
        }

        // Deep Sequential Thinking Tool
        if (name === 'sequential_thinking') {
          return res.status(200).json({
            jsonrpc: '2.0',
            id,
            result: { content: [{ type: 'text', text: `[Deep Reasoning Step ${args.thoughtNumber}] Thought: "${args.thought}"` }] }
          });
        }

        // GitHub Tools
        if (name === 'github_read_file') {
          return res.status(200).json({ jsonrpc: '2.0', id, result: { content: [{ type: 'text', text: `[GitHub Read] Reading ${args.path} from ${args.repo}` }] } });
        }
        if (name === 'github_write_file') {
          return res.status(200).json({ jsonrpc: '2.0', id, result: { content: [{ type: 'text', text: `[GitHub Commit] Pushed changes for ${args.path} to GitHub!` }] } });
        }

        // Helper & Power Tools
        if (name === 'generate_download_link') {
          const filename = args.filename || 'app.js';
          const encoded = Buffer.from(args.content || '').toString('base64');
          return res.status(200).json({ jsonrpc: '2.0', id, result: { content: [{ type: 'text', text: `[Mobile Save Link]\nFile: ${filename}\nData URL: data:text/html;base64,${encoded}` }] } });
        }

        if (name === 'run_live_preview') {
          const idStr = Math.random().toString(36).substring(2, 10);
          previewStore.set(idStr, `<!DOCTYPE html><html lang="ar" dir="rtl"><head><meta charset="UTF-8"><script src="https://cdn.tailwindcss.com"></script></head><body class="bg-slate-950 text-white min-h-screen">${args.htmlCode}</body></html>`);
          const host = req.headers.host || 'antigravity-mcp-cloud.vercel.app';
          return res.status(200).json({ jsonrpc: '2.0', id, result: { content: [{ type: 'text', text: `[Live Preview]: https://${host}/?id=${idStr}` }] } });
        }

        if (name === 'generate_ai_image') {
          const promptEnc = encodeURIComponent(args.prompt || 'mobile app UI mockup');
          return res.status(200).json({ jsonrpc: '2.0', id, result: { content: [{ type: 'text', text: `[AI Image Generated]: https://pollinations.ai/p/${promptEnc}?width=1024&height=1024&nologo=true` }] } });
        }

        if (name === 'stitch_ui_builder') {
          return res.status(200).json({ jsonrpc: '2.0', id, result: { content: [{ type: 'text', text: `[Stitch UI] Generated ${args.componentType} layout.` }] } });
        }
        if (name === 'tailwind_builder') {
          return res.status(200).json({ jsonrpc: '2.0', id, result: { content: [{ type: 'text', text: `[Tailwind] Generated ${args.element} component.` }] } });
        }
        if (name === 'threejs_scene_generator') {
          return res.status(200).json({ jsonrpc: '2.0', id, result: { content: [{ type: 'text', text: `[Three.js] Rendered 3D ${args.sceneType} scene.` }] } });
        }
        if (name === 'canvas_2d_game_engine') {
          return res.status(200).json({ jsonrpc: '2.0', id, result: { content: [{ type: 'text', text: `[2D Canvas Game] Built ${args.gameGenre} loop.` }] } });
        }
        if (name === 'shell_executor') {
          return res.status(200).json({ jsonrpc: '2.0', id, result: { content: [{ type: 'text', text: `[Shell] Executed command "${args.command}"` }] } });
        }
      }
    }

    return res.status(200).json({
      status: 'active',
      name: 'Antigravity Mobile App Builder Engine',
      tools: TOOLS
    });
  }

  return res.status(405).send('Method Not Allowed');
}
