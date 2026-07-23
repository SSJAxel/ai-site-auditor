import express from "express";
import cors from "cors";
import auditRouter from "./routes/audit.js";

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.use("/audit", auditRouter);

app.listen(PORT, () => {
  console.log(`ai-site-auditor server listening on http://localhost:${PORT}`);
});
