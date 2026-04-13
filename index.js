const express = require("express");
const sqlite3 = require("better-sqlite3").verbose();
const app = express();

app.use(express.json());

// Connexion à la base de données locale
const db = new sqlite3.Database("./hotel.db", (err) => {
  if (err) console.error("Erreur d'ouverture de la DB", err);
  console.log("Connecté à la base de données SQLite.");
});

// Initialisation des tables
db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS reservations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        client_name TEXT,
        statut TEXT DEFAULT 'EN_ATTENTE',
        chambre_id TEXT,
        facture_total REAL DEFAULT 0
    )`);
  db.run(`CREATE TABLE IF NOT EXISTS stocks (
        article TEXT PRIMARY KEY,
        quantite INTEGER
    )`);
  // Initialisation du stock pour le test
  db.run(
    `INSERT OR IGNORE INTO stocks (article, quantite) VALUES ('savon', 100)`,
  );
});

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

  const sql = `INSERT INTO reservations (client_name, statut, facture_total) VALUES (?, 'PAYÉ', 150.00)`;
  db.run(sql, [client_name], function (err) {
    if (err) return res.status(500).json(err);
    res.json({
      id: this.lastID,
      message: "Facture émise et payée. Réservation confirmée.",
    });
  });
});

/**
 * 2. POOL : RÉCEPTIONNISTE
 * Action : Attribuer chambre
 */
app.patch("/api/reservations/:id/attribuer", (req, res) => {
  const chambre_num = "Room_" + Math.floor(Math.random() * 50);
  db.run(
    `UPDATE reservations SET chambre_id = ?, statut = 'OCCUPÉ' WHERE id = ?`,
    [chambre_num, req.params.id],
    (err) => {
      if (err) return res.status(500).send(err);
      res.json({
        message: `Chambre ${chambre_num} attribuée. Séjour commencé.`,
      });
    },
  );
});

/**
 * 3. POOL : RESTAURANT
 * Action : Commander menu + Ajouter facture restaurant
 */
app.post("/api/reservations/:id/restaurant", (req, res) => {
  const { montant } = req.body;
  db.run(
    `UPDATE reservations SET facture_total = facture_total + ? WHERE id = ?`,
    [montant, req.params.id],
    (err) => {
      if (err) return res.status(500).send(err);
      res.json({ message: "Repas ajouté à la facture finale." });
    },
  );
});

/**
 * 4. POOL : FEMME DE MÉNAGE
 * Action : Nettoyer + Remplacer articles (Vérifier stock) + Notifier
 */
app.post("/api/chambres/:id/nettoyer", (req, res) => {
  // On décrémente le stock localement
  db.run(
    `UPDATE stocks SET quantite = quantite - 1 WHERE article = 'savon'`,
    (err) => {
      if (err) return res.status(500).send(err);
      res.json({
        message: "Chambre marquée PROPRE.",
        notification: "Réceptionniste notifié via système.",
      });
    },
  );
});

/**
 * 5. POOL : COMPTABLE
 * Action : Calculer facture jour + Générer dashboard
 */
app.get("/api/comptabilite/dashboard", (req, res) => {
  db.all(
    `SELECT SUM(facture_total) as total_jour, COUNT(*) as nb_reservations FROM reservations`,
    [],
    (err, rows) => {
      if (err) return res.status(500).send(err);
      res.json({
        date: new Date().toISOString().split("T")[0],
        stats: rows[0],
        message: "Fin - Réservation bouclée",
      });
    },
  );
});

app.listen(3000, () => {
  console.log("API Hôtel avec DB locale sur http://localhost:3000");
});
