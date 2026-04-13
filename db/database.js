import connect, { sql } from "@databases/sqlite";

const db = connect("./hotel.db");

await db.query(sql`
  CREATE TABLE IF NOT EXISTS reservations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    client_name TEXT,
    statut TEXT DEFAULT 'EN_ATTENTE',
    chambre_id TEXT,
    facture_total REAL DEFAULT 0
  )
`);

await db.query(sql`
  CREATE TABLE IF NOT EXISTS stocks (
    article TEXT PRIMARY KEY,
    quantite INTEGER
  )
`);

await db.query(sql`
  INSERT OR IGNORE INTO stocks (article, quantite) VALUES ('savon', 100);
`);

export { db, sql };
