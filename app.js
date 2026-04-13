import express, { json } from "express";
const app = express();

import routes from "./routes/reservation.routes.js";

app.use(json());
app.use("/api", routes);

app.listen(3000, () => {
  console.log("Serveur lancé sur http://localhost:3000");
});
