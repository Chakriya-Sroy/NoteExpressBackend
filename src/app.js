import express from "express";
import dotev from "dotenv";
import routeAuth from "./routes/auth.route.js";
import routeProfile from "./routes/profile.route.js";
import routeUsers from "./routes/users.route.js";
import routeActivityLog from "./routes/activity-log.route.js";
import { useResponse } from "./utils/response.js";
import routeRole from "./routes/role.route.js";
import cors from "cors";
dotev.config();

const allowedOrigins = [
  "http://localhost:3001",
  "https://qr-attendance-kwl6.vercel.app",
];

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({ origin: allowedOrigins, credentials: true }));
app.use("/api/health", (req, res) => {
  return useResponse(res, { message: "API is healthy" });
});

app.use("/api/auth", routeAuth);

app.use("/api/profile", routeProfile);

app.use("/api/users", routeUsers);

app.use("/api/activity-log",routeActivityLog);

app.use("/api/roles",routeRole);

app.use((req, res) => {
  return useResponse(res, { code: 404, message: "Route not found" });
});
const port = process.env.PORT || 3004;

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});

export default app;
