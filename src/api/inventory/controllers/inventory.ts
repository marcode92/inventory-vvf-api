/**
 * inventory controller
 */

import { factories } from '@strapi/strapi';

export default factories.createCoreController('api::inventory.inventory', ({ strapi }) => ({
  async find(ctx) {
    const result = await strapi.db.connection.raw('SELECT * FROM assignment');
    return result[0];
  },
  async create(ctx) {
    console.log("body", ctx.request)
    try {
      const {
        num_inv,
        cat_tipo,
        sec_pdci,
        denominazione,
        matricola,
        annotazioni,
        stanza,
        possessori,
        last_update,
        fuori_uso
      } = ctx.request.body;

      const [result] = await strapi.db.connection.raw(
        `INSERT INTO assignment 
        (num_inv, cat_tipo, sec_pdci, denominazione, matricola, annotazioni, stanza, possessori, last_update, fuori_uso)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [num_inv, cat_tipo, sec_pdci, denominazione, matricola, annotazioni, stanza, possessori, last_update, fuori_uso]
      );

      return {
        message: "inserito con successo",
        insertId: result.insertId,
      };
    } catch (err) {
      return ctx.badRequest("error", { error: err.message })
    }

  }
}));
