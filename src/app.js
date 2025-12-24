import express from "express";
import dotev from "dotenv";
import routeAuth from "./routes/auth.route.js";
import routeProfile from "./routes/profile.route.js";
import routeUsers from "./routes/users.route.js";

dotev.config();
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.use("/health", (req, res) => {
  return res.status(200).send({ message: "API is healthy" });
});

app.use("/auth", routeAuth);

app.use("/profile", routeProfile);

app.use("/users", routeUsers);

app.use((req, res) => {
  return res.status(404).send({ error: "Route not found" });
});
const port = process.env.PORT || 3004;

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});

export default app;
