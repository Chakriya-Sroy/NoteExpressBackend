import express from "express";
import dotev from "dotenv";
import routeAuth from "./routes/auth.route.js";
import routeProfile from "./routes/profile.route.js";
import routeUsers from "./routes/users.route.js";

dotev.config();
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.use("/api/health", (req, res) => {
  return res.status(200).send({ message: "API is healthy" });
});

app.use("/api/auth", routeAuth);

app.use("/api/profile", routeProfile);

app.use("/api/users", routeUsers);

app.use((req, res) => {
  return res.status(404).send({ error: "Route not found" });
});
const port = process.env.PORT || 3004;

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});

export default app;
