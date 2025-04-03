import { Context, Log, createFetch, getInstance } from '@osaas/client-core';

const SERVICE_ID = 'eyevinn-intercom-manager';

export interface IntercomProductionLineParticipant {
  name: string;
  sessionId: string;
  endpointId: string;
  isActive: boolean;
}

export interface IntercomProductionLine {
  name: string;
  id: string;
  smbConferenceId: string;
  participants: IntercomProductionLineParticipant[];
  programOutputLine: boolean;
}

export interface IntercomProduction {
  name: string;
  productionId: string;
  lines: IntercomProductionLine[];
}

export interface IntercomProductionList {
  productions: IntercomProduction[];
  offset: number;
  limit: number;
  totalItems: number;
}

export interface NewProduction {
  name: string;
  lines: {
    name: string;
    programOutputLine: boolean;
  }[];
}

export interface NewProductionLine {
  name: string;
  programOutputLine: boolean;
}

/**
 * @typedef {Object} IntercomProductionLine
 * @property {string} name - The name of the line
 * @property {string} id - The ID of the line
 * @property {string} smbConferenceId - The SMB conference ID
 * @property {IntercomProductionLineParticipant[]} participants - The list of participants in the line
 * @property {boolean} programOutputLine - Whether the line is a program output line
 */

/**
 * @typedef {Object} IntercomProduction
 * @property {string} name - The name of the production
 * @property {string} productionId - The ID of the production
 * @property {IntercomProductionLine[]} lines - The list of lines in the production
 */

/**
 * @typedef {Object} IntercomProductionList
 * @property {IntercomProduction[]} productions - The list of productions
 * @property {number} offset - The offset for pagination
 * @property {number} limit - The limit for pagination
 * @property {number} totalItems - The total number of items
 */

/**
 * @typedef {Object} NewProductionLine
 * @property {string} name - The name of the line
 * @property {boolean} programOutputLine - Whether the line is a program output line
 */

/**
 * @typedef {Object} NewProduction
 * @property {string} name - The name of the production
 * @property {NewProductionLine[]} lines - The new lines in the production
 * @property {string} lines.name - The name of the line
 * @property {boolean} lines.programOutputLine - Whether the line is a program output line
 */

/**
 * @memberof module:@osaas/client-intercom
 */
export class IntercomSystem {
  private context: Context;
  private name: string;
  private url?: string;
  private token?: string;

  /**
   * Constructor for IntercomSystem
   * @param {Context} context - Open Source Cloud configuration context
   * @param {string} name - The name of the Intercom system
   * @param {string} [customEndpoint] - Optional custom endpoint for the Intercom system (if running outside of Open Source Cloud)
   */
  constructor({
    context,
    name,
    customEndpoint
  }: {
    context: Context;
    name: string;
    customEndpoint?: string;
  }) {
    this.context = context;
    this.name = name;
    if (customEndpoint) {
      this.url = customEndpoint;
    }
  }

  /**
   * Initialize the Intercom system
   */
  public async init() {
    if (!this.url) {
      this.token = await this.context.getServiceAccessToken(SERVICE_ID);
      const instance = await getInstance(
        this.context,
        SERVICE_ID,
        this.name,
        this.token
      );
      if (!instance) {
        throw new Error(`No Intercom system found with name ${this.name}`);
      }
      this.url = instance.url;
      Log().debug(instance);
      Log().debug(`Intercom system ${this.name} found on ${this.url}`);
    }
  }

  /**
   * List all productions in the Intercom system
   * @returns {Promise<IntercomProduction[]>} - List of productions
   */
  public async listProductions() {
    if (!this.url) {
      throw new Error('Intercom system not initialized');
    }
    const url = new URL(this.url + '/api/v1/productionlist');
    url.searchParams.append('extended', 'true');
    url.searchParams.append('limit', '100');
    // TODO: handle pagination
    const productionList = await createFetch<IntercomProductionList>(url, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${this.token}`,
        'Content-Type': 'application/json'
      }
    });
    return productionList.productions;
  }

  /**
   * List all lines for a given production
   * @param {string} productionId - The production ID to list lines for
   * @returns {IntercomProductionLine[]} - List of lines for the production
   */
  public async listLinesForProduction(productionId: string) {
    if (!this.url) {
      throw new Error('Intercom system not initialized');
    }
    const url = new URL(this.url + `/api/v1/production/${productionId}/line`);
    const lines = await createFetch<IntercomProductionLine[]>(url, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${this.token}`,
        'Content-Type': 'application/json'
      }
    });
    return lines;
  }

  /**
   * Create a new production in the Intercom system
   * @param {string} name - The name of the production
   * @param {NewProductionLine} lines - The lines to create in the production
   * @returns {Promise<IntercomProduction>} - The created production
   * @example
   * const ctx = new Context();
   * const intercom = new IntercomSystem({ context: ctx, name: 'example' });
   * await intercom.init();
   * await intercom.createProduction('my-production', [
   *   { name: 'Line 1', programOutputLine: true },
   *   { name: 'Line 2', programOutputLine: false }
   * ]);
   */
  public async createProduction(
    name: string,
    lines: { name: string; programOutputLine: boolean }[]
  ) {
    if (!this.url) {
      throw new Error('Intercom system not initialized');
    }
    const url = new URL(this.url + '/api/v1/production');
    const production = await createFetch<IntercomProduction>(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name,
        lines: lines.map((line) => {
          return { name: line.name, programOutputLine: line.programOutputLine };
        })
      })
    });
    return production;
  }

  /**
   * Delete a production in the Intercom system
   * @param {string} productionId - The production ID to delete
   */
  public async deleteProduction(productionId: string) {
    if (!this.url) {
      throw new Error('Intercom system not initialized');
    }
    const url = new URL(this.url + `/api/v1/production/${productionId}`);
    const msg = await createFetch<string>(url, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${this.token}`
      }
    });
    Log().info(msg);
  }

  /**
   * Add a new line to a production
   * @param {string} productionId - The production ID to add the line to
   * @param {string} lineName - The name of the line to add
   * @param {boolean} programOutputLine - Whether the line is a program output line
   * @returns {Promise<IntercomProductionLine[]>} - The updated list of lines for the production
   */
  public async addLineToProduction(
    productionId: string,
    lineName: string,
    programOutputLine: boolean
  ) {
    if (!this.url) {
      throw new Error('Intercom system not initialized');
    }
    const url = new URL(this.url + `/api/v1/production/${productionId}/line`);
    const lines = await createFetch<IntercomProductionLine[]>(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: lineName,
        programOutputLine
      })
    });
    return lines;
  }

  /**
   * Modify a line in a production
   * @param {string} productionId - The production ID to modify the line in
   * @param {string} lineId - The line ID to modify
   * @param {string} name - The new name for the line
   * @param {boolean} programOutputLine - Whether the line is a program output line
   * @returns {Promise<IntercomProductionLine>} - The modified line
   */
  public async modifyLine(
    productionId: string,
    lineId: string,
    name: string,
    programOutputLine: boolean
  ) {
    if (!this.url) {
      throw new Error('Intercom system not initialized');
    }
    const url = new URL(
      this.url + `/api/v1/production/${productionId}/line/${lineId}`
    );
    const line = await createFetch<
      Omit<IntercomProductionLine, 'smbConferenceId' | 'participants'>
    >(url, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${this.token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name,
        programOutputLine
      })
    });
    return line;
  }

  /**
   * Get the list of participants for a given line in a production
   * @param {string} productionId - The production ID to get participants for
   * @param {string} lineId - The line ID to get participants for
   * @returns {Promise<IntercomProductionLineParticipant[]>} - The list of participants for the line
   */
  public async getParticipantsForLine(
    productionId: string,
    lineId: string
  ): Promise<IntercomProductionLineParticipant[]> {
    if (!this.url) {
      throw new Error('Intercom system not initialized');
    }
    const url = new URL(
      this.url + `/api/v1/production/${productionId}/line/${lineId}/participant`
    );
    const participants = await createFetch<IntercomProductionLineParticipant[]>(
      url,
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${this.token}`,
          'Content-Type': 'application/json'
        }
      }
    );
    return participants;
  }
}
