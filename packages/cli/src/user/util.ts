import readline from 'node:readline';

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
