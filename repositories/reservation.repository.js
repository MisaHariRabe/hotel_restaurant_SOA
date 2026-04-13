import { db, sql } from "../db/database.js";

class ReservationRepository {
  async create(clientName, factureTotal) {
    const result = await db.query(sql`
      INSERT INTO reservations (client_name, statut, facture_total)
      VALUES (${clientName}, 'PAYÉ', ${factureTotal})
    `);
    return result;
  }

  async updateChambre(id, chambreId) {
    await db.query(sql`
      UPDATE reservations 
      SET chambre_id = ${chambreId}, statut = 'OCCUPÉ'
      WHERE id = ${id}
    `);
  }

  async addFacture(id, montant) {
    await db.query(sql`
      UPDATE reservations 
      SET facture_total = facture_total + ${montant}
      WHERE id = ${id}
    `);
  }

  async getDashboard() {
    const rows = await db.query(sql`
      SELECT 
        SUM(facture_total) as total_jour, 
        COUNT(*) as nb_reservations 
      FROM reservations
    `);

    return rows[0];
  }
}

export default new ReservationRepository();
