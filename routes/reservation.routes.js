import { Router } from "express";
import reservationController from "../controllers/reservation.controller.js";

const router = Router();

router.post("/reservations", reservationController.create);
router.patch("/reservations/:id/attribuer", reservationController.attribuer);
router.post("/reservations/:id/restaurant", reservationController.restaurant);
router.post("/chambres/:id/nettoyer", reservationController.nettoyer);
router.get("/comptabilite/dashboard", reservationController.dashboard);

export default router;
