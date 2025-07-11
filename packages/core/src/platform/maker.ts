import { UnauthorizedError } from '../errors';
import { FetchError, createFetch } from '../fetch';
import { Log } from '../log';
import { Platform } from '../platform';

export interface Order {
  orderId: string;
  status: {
    phase: string;
  };
}

export interface OutputOrder {
  order: Order;
}

const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

export async function getOrderIdByName(platform: Platform, orderName: string) {
  try {
    const makerUrl = new URL(
      `https://maker.svc.${platform.getEnvironment()}.osaas.io/maker`
    );
    makerUrl.searchParams.append('name', orderName);
    const res = await createFetch<OutputOrder[]>(makerUrl, {
      headers: {
        Authorization: `Bearer ${platform.getApiKey()}`,
        'Content-Type': 'application/json'
      }
    });
    if (res[0]) {
      return res[0].order.orderId;
    }
    return undefined;
  } catch (err) {
    Log().debug(err);
    if (err instanceof FetchError && err.httpCode === 401) {
      throw new UnauthorizedError();
    } else if (err instanceof FetchError && err.httpCode === 404) {
      return undefined;
    }
  }
}

export async function waitForOrder(platform: Platform, orderId: string) {
  try {
    let running = true;
    while (running) {
      const makerUrl = new URL(
        `https://maker.svc.${platform.getEnvironment()}.osaas.io/maker/${orderId}`
      );
      const res = await createFetch<OutputOrder>(makerUrl, {
        headers: {
          Authorization: `Bearer ${platform.getApiKey()}`,
          'Content-Type': 'application/json'
        }
      });
      Log().debug(res.order.status.phase);
      if (
        res.order.status.phase === 'NEW' ||
        res.order.status.phase === 'RUNNING' ||
        res.order.status.phase === 'PENDING'
      ) {
        running = true;
      } else {
        running = false;
      }
      await delay(5000);
    }
  } catch (err) {
    Log().debug(err);
    if (err instanceof FetchError && err.httpCode === 401) {
      throw new UnauthorizedError();
    } else if (err instanceof FetchError && err.httpCode === 404) {
      return undefined;
    }
    throw err;
  }
}

export async function remakeOrder(platform: Platform, orderId: string) {
  try {
    const remakerUrl = new URL(
      `https://maker.svc.${platform.getEnvironment()}.osaas.io/remaker`
    );
    const res = await createFetch<{ orderId: string }>(remakerUrl, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${platform.getApiKey()}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ orderId })
    });
    Log().debug(res);
    return res.orderId;
  } catch (err) {
    Log().debug(err);
    if (err instanceof FetchError && err.httpCode === 401) {
      throw new UnauthorizedError();
    } else if (err instanceof FetchError && err.httpCode === 404) {
      return undefined;
    }
    throw err;
  }
}
