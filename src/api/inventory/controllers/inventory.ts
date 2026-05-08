/**
 * inventory controller
 */

import { factories } from '@strapi/strapi';

export default factories.createCoreController('api::inventory.inventory', ({ strapi }) => ({
  async find(ctx) {
    const result = await strapi.db.connection.raw('SELECT * FROM assignment');
    return result[0];
  },
  async findOne(ctx){
    console.log("sono qui e stampo debug",ctx.query)
    const {num_inv} = ctx.query;
    console.log("sono qui e stampo debug",num_inv)
    const result = await strapi.db.connection.raw('SELECT * FROM assignment where num_inv = ?',[num_inv]);
    return result[0];
  },
  async create(ctx) {
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
