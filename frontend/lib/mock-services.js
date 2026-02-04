export const broadcastService = {
  async getAll() {
    return { data: { broadcasts: [] } };
  },
  async create(payload) {
    return { data: { success: true, broadcast: payload } };
  },
};

export const contactService = {
  async getAll() {
    return { data: { contacts: [] } };
  },
};

export const reportService = {
  async getOverview() {
    return {
      data: {
        messageStats: [],
        leadStats: [],
        agentPerformance: [],
      },
    };
  },
};

export const teamService = {
  async getAll() {
    return { data: { users: [] } };
  },
};

export const templateService = {
  async getAll() {
    return { data: { templates: [] } };
  },
  async create(payload) {
    return { data: { success: true, template: payload } };
  },
};
