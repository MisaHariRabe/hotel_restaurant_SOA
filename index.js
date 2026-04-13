const express = require("express");
const Database = require("better-sqlite3");
const app = express();

app.use(express.json());

// Connexion à la base de données locale
// better-sqlite3 is fully synchronous — no callbacks, no promises
const db = new Database("./hotel.db");
console.log("Connecté à la base de données SQLite (via better-sqlite3).");

db.exec(`
  CREATE TABLE IF NOT EXISTS reservations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    client_name TEXT,
    statut TEXT DEFAULT 'EN_ATTENTE',
    chambre_id TEXT,
    facture_total REAL DEFAULT 0
  );
  CREATE TABLE IF NOT EXISTS stocks (
    article TEXT PRIMARY KEY,
    quantite INTEGER
  );
  INSERT OR IGNORE INTO stocks (article, quantite) VALUES ('savon', 100);
`);

// --- ROUTES ---

/**
 * 1. POOL : RÉCEPTIONNISTE / CLIENT
 * Action : Réserver chambre + Vérifier dispo + Émettre facture
 */
app.post("/api/reservations", (req, res) => {
  const { client_name } = req.body;

  // Simulation du "Chambre disponible ?" (Gateway XOR)
  const disponible = Math.random() > 0.1;

  if (!disponible) {
    return res
      .status(403)
      .json({ error: "Fin - Réservation refusée (Pas de chambre)" });
  }
  const stmt = db.prepare(
    `INSERT INTO reservations (client_name, statut, facture_total) VALUES (?, 'PAYÉ', 150.00)`,
  );
  const result = stmt.run(client_name);
  res.json({
    id: result.lastInsertRowid,
    message: "Facture émise et payée. Réservation confirmée.",
  });
});

/**
 * 2. POOL : RÉCEPTIONNISTE
 * Action : Attribuer chambre
 */
app.patch("/api/reservations/:id/attribuer", (req, res) => {
  const chambre_num = "Room_" + Math.floor(Math.random() * 50);

  const stmt = db.prepare(
    `UPDATE reservations SET chambre_id = ?, statut = 'OCCUPÉ' WHERE id = ?`,
  );
  stmt.run(chambre_num, req.params.id);
  res.json({ message: `Chambre ${chambre_num} attribuée. Séjour commencé.` });
});

/**
 * 3. POOL : RESTAURANT
 * Action : Commander menu + Ajouter facture restaurant
 */
app.post("/api/reservations/:id/restaurant", (req, res) => {
  const { montant } = req.body;

  const stmt = db.prepare(
    `UPDATE reservations SET facture_total = facture_total + ? WHERE id = ?`,
  );
  stmt.run(montant, req.params.id);

  res.json({ message: "Repas ajouté à la facture finale." });
});

/**
 * 4. POOL : FEMME DE MÉNAGE
 * Action : Nettoyer + Remplacer articles (Vérifier stock) + Notifier
 */
app.post("/api/chambres/:id/nettoyer", (req, res) => {
  const stmt = db.prepare(
    `UPDATE stocks SET quantite = quantite - 1 WHERE article = 'savon'`,
  );
  stmt.run();

  res.json({
    message: "Chambre marquée PROPRE.",
    notification: "Réceptionniste notifié via système.",
  });
});

/**
 * 5. POOL : COMPTABLE
 * Action : Calculer facture jour + Générer dashboard
 *
 * stmt.get() returns a single row object directly — no rows array, no callback
 */
app.get("/api/comptabilite/dashboard", (req, res) => {
  const stmt = db.prepare(
    `SELECT SUM(facture_total) as total_jour, COUNT(*) as nb_reservations FROM reservations`,
  );
  const row = stmt.get();

  res.json({
    date: new Date().toISOString().split("T")[0],
    stats: row,
    message: "Fin - Réservation bouclée",
  });
});

app.listen(3000, () => {
  console.log("API Hôtel avec DB locale sur http://localhost:3000");
});
