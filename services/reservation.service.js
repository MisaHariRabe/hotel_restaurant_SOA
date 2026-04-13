import reservationRepository from "../repositories/reservation.repository.js";
import { db, sql } from "../db/database.js";

class ReservationService {
  async createReservation(clientName) {
    const disponible = Math.random() > 0.1;

    if (!disponible) {
      throw new Error("Pas de chambre disponible");
    }
    await reservationRepository.create(clientName, 150);
    return { message: "Réservation confirmée + facture payée" };
  }

  async attribuerChambre(id) {
    const chambre = "Room_" + Math.floor(Math.random() * 50);

    await reservationRepository.updateChambre(id, chambre);
    return { message: `Chambre ${chambre} attribuée` };
  }

  async ajouterRestaurant(id, montant) {
    await reservationRepository.addFacture(id, montant);
    return { message: "Repas ajouté à la facture" };
  }

  async nettoyerChambre() {
    await db.query(sql`
      UPDATE stocks SET quantite = quantite - 1 WHERE article = 'savon'
    `);
    return { message: "Chambre propre" };
  }

  async dashboard() {
    const stats = await reservationRepository.getDashboard();
    return { date: new Date().toISOString().split("T")[0], stats };
  }
}

export default new ReservationService();
