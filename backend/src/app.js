import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";

import authRoutes from "./routes/authRoutes.js";
import gigRoutes from "./routes/gigRoutes.js";
import bidRoutes from "./routes/bidRoutes.js";

const app = express();



app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://freelancing-fkqz.vercel.app"
    ],
    credentials: true,
  })
);

app.use(express.json());
app.use(cookieParser());

app.use("/api/auth", authRoutes);
app.use("/api/gigs", gigRoutes);
app.use("/api/bids", bidRoutes);

app.get("/", (req, res) => {
  res.send("API is running...");
});

export default app;
