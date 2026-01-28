import readline from 'node:readline';
import { login, loadToken, saveToken } from '../login';

export function instanceOptsToPayload(opts: string[] | undefined) {
  const payload: { [key: string]: any } = {};
  if (opts) {
    opts.map((kv: string) => {
      const regex = /=(?=(?:[^"]*"[^"]*")*[^"]*$)/;
      const [key, ...rest] = kv.split(regex);
      const value = rest.join('=');
      const subkeys = key.split('.');
      if (subkeys.length > 1) {
        let current = payload;
        subkeys.forEach((subkey, index) => {
          if (index === subkeys.length - 1) {
            current[subkey] = value;
          } else {
            if (!current[subkey]) {
              current[subkey] = {};
            }
            current = current[subkey];
          }
        });
      } else {
        payload[key] = value;
      }
    });
  }
  return payload;
}

export function makeSafeName(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]/g, '');
}

export async function confirm(message: string | undefined): Promise<void> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  return new Promise((resolve, reject) => {
    rl.question(message || 'Are you sure? (yes/no) ', (answer) => {
      rl.close();
      const cleaned = answer.trim().toLowerCase();
      if (cleaned === 'yes') {
        resolve();
      } else {
        reject(new Error('aborted by user'));
      }
    });
  });
}

export async function ensureToken(environment = 'prod'): Promise<void> {
  if (process.env.OSC_ACCESS_TOKEN) {
    return;
  }

  const savedToken = loadToken(environment);
  if (savedToken) {
    process.env.OSC_ACCESS_TOKEN = savedToken;
    return;
  }

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  const answer = await new Promise<string>((resolve) => {
    rl.question(
      'OSC_ACCESS_TOKEN is not set. Do you want to login? (yes/no) ',
      (ans) => {
        rl.close();
        resolve(ans.trim().toLowerCase());
      }
    );
  });

  if (answer === 'yes') {
    const token = await login(environment);
    saveToken(token, environment);
    process.env.OSC_ACCESS_TOKEN = token;
    console.log('Login successful!');
  } else {
    console.error('OSC_ACCESS_TOKEN is required. Set it or run: osc login');
    process.exit(1);
  }
}
