import { RemoteMCPClient } from '@remote-mcp/client/dist/client.js';

const OSC_ACCESS_TOKEN = process.env.OSC_ACCESS_TOKEN;
const MCP_ENDPOINT =
  process.env.MCP_ENDPOINT || 'https://mcp.svc.prod.osaas.io';

if (!OSC_ACCESS_TOKEN) {
  throw new Error('OSC_ACCESS_TOKEN is not set');
}

const client = new RemoteMCPClient({
  remoteUrl: MCP_ENDPOINT,
  headers: {
    Authorization: `Bearer ${OSC_ACCESS_TOKEN}`
  }
});
client.start();
