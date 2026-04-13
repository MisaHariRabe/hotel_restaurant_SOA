import reservationService from "../services/reservation.service.js";

class ReservationController {
  async create(req, res) {
    try {
      const result = await reservationService.createReservation(
        req.body.client_name,
      );
      res.json(result);
    } catch (err) {
      res.status(403).json({ error: err.message });
    }
  }

  async attribuer(req, res) {
    const result = await reservationService.attribuerChambre(req.params.id);
    res.json(result);
  }

  async restaurant(req, res) {
    const result = await reservationService.ajouterRestaurant(
      req.params.id,
      req.body.montant,
    );
    res.json(result);
  }

  async nettoyer(req, res) {
    const result = await reservationService.nettoyerChambre();
    res.json(result);
  }

  async dashboard(req, res) {
    const result = await reservationService.dashboard();
    res.json(result);
  }
}

export default new ReservationController();
