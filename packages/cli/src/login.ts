import crypto from 'node:crypto';
import http from 'node:http';
import { exec } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import os from 'node:os';
import { Command } from 'commander';

const CLIENT_ID = 'cli';
const TOKEN_DIR = join(os.homedir(), '.osc');

function getTokenPath(environment: string): string {
  const suffix =
    !environment || environment === 'prod' ? '' : `-${environment}`;
  return join(TOKEN_DIR, `token${suffix}`);
}

export function saveToken(token: string, environment: string = 'prod'): void {
  if (!existsSync(TOKEN_DIR)) {
    mkdirSync(TOKEN_DIR, { mode: 0o700 });
  }
  writeFileSync(getTokenPath(environment), token, { mode: 0o600 });
}

export function loadToken(environment: string = 'prod'): string | undefined {
  const tokenPath = getTokenPath(environment);
  if (existsSync(tokenPath)) {
    return readFileSync(tokenPath, 'utf-8').trim();
  }
  return undefined;
}

function getBaseUrl(environment: string): string {
  if (!environment || environment === 'prod') {
    return 'https://app.osaas.io';
  }
  return `https://app.${environment}.osaas.io`;
}

function generateCodeVerifier(): string {
  return crypto.randomBytes(32).toString('base64url');
}

function generateCodeChallenge(verifier: string): string {
  return crypto.createHash('sha256').update(verifier).digest('base64url');
}

function openBrowser(url: string): void {
  const command =
    process.platform === 'darwin'
      ? 'open'
      : process.platform === 'win32'
      ? 'start'
      : 'xdg-open';
  exec(`${command} "${url}"`);
}

export async function login(environment: string = 'prod'): Promise<string> {
  const baseUrl = getBaseUrl(environment);
  const authUrlBase = `${baseUrl}/api/connect/authorize`;
  const tokenUrl = `${baseUrl}/api/connect/token`;
  const codeVerifier = generateCodeVerifier();
  const codeChallenge = generateCodeChallenge(codeVerifier);

  return new Promise((resolve, reject) => {
    const server = http.createServer(async (req, res) => {
      try {
        const url = new URL(req.url || '', `http://localhost`);
        if (url.pathname !== '/callback') {
          res.writeHead(404);
          res.end('Not found');
          return;
        }

        const code = url.searchParams.get('code');
        const error = url.searchParams.get('error');

        if (error) {
          res.writeHead(400, { 'Content-Type': 'text/html' });
          res.end(
            '<html><body><h1>Login failed</h1><p>You can close this window.</p></body></html>'
          );
          server.close();
          reject(new Error(`Authorization failed: ${error}`));
          return;
        }

        if (!code) {
          res.writeHead(400, { 'Content-Type': 'text/html' });
          res.end(
            '<html><body><h1>Login failed</h1><p>No authorization code received.</p></body></html>'
          );
          server.close();
          reject(new Error('No authorization code received'));
          return;
        }

        const address = server.address();
        const port =
          address && typeof address === 'object' ? address.port : null;
        const redirectUri = `http://localhost:${port}/callback`;

        const tokenResponse = await fetch(tokenUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: new URLSearchParams({
            grant_type: 'authorization_code',
            client_id: CLIENT_ID,
            code,
            redirect_uri: redirectUri,
            code_verifier: codeVerifier
          }).toString()
        });

        if (!tokenResponse.ok) {
          const errorText = await tokenResponse.text();
          res.writeHead(400, { 'Content-Type': 'text/html' });
          res.end(
            '<html><body><h1>Login failed</h1><p>Token exchange failed. You can close this window.</p></body></html>'
          );
          server.close();
          reject(new Error(`Token exchange failed: ${errorText}`));
          return;
        }

        const tokenData = (await tokenResponse.json()) as {
          access_token: string;
        };
        const accessToken = tokenData.access_token;

        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(
          '<html><body><h1>Login successful!</h1><p>You can close this window and return to the terminal.</p></body></html>'
        );
        server.close();
        resolve(accessToken);
      } catch (err) {
        res.writeHead(500, { 'Content-Type': 'text/html' });
        res.end(
          '<html><body><h1>Login failed</h1><p>An unexpected error occurred.</p></body></html>'
        );
        server.close();
        reject(err);
      }
    });

    server.listen(0, () => {
      const address = server.address();
      const port = address && typeof address === 'object' ? address.port : null;
      if (!port) {
        server.close();
        reject(new Error('Failed to start local server'));
        return;
      }

      const redirectUri = `http://localhost:${port}/callback`;
      const authUrl = new URL(authUrlBase);
      authUrl.searchParams.set('response_type', 'code');
      authUrl.searchParams.set('client_id', CLIENT_ID);
      authUrl.searchParams.set('redirect_uri', redirectUri);
      authUrl.searchParams.set('code_challenge', codeChallenge);
      authUrl.searchParams.set('code_challenge_method', 'S256');

      console.log('Opening browser for login...');
      console.log(`If the browser does not open, visit: ${authUrl.toString()}`);
      openBrowser(authUrl.toString());
    });
  });
}

export function cmdLogin() {
  const loginCmd = new Command('login');

  loginCmd
    .description('Login to Open Source Cloud using OAuth')
    .action(async (options, command) => {
      try {
        const globalOpts = command.optsWithGlobals();
        const environment = globalOpts?.env || 'prod';
        const token = await login(environment);
        saveToken(token, environment);
        process.env.OSC_ACCESS_TOKEN = token;
        console.log('Login successful! Token saved to ~/.osc');
      } catch (err) {
        console.log((err as Error).message);
        process.exit(1);
      }
    });
  return loginCmd;
}
