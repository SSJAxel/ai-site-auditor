import { Router } from "express";
import { crawlSite } from "../audit/crawler.js";
import { prioritizeAudit } from "../ai/prioritize.js";

const router = Router();

// POST /audit  { url: string }
// Crawls the site (homepage + up to 5 internal links), then asks Claude to
// turn the raw per-page issues into an executive summary + a prioritized,
// site-wide fix list (see docs/SPEC.md section 3).
router.post("/", async (req, res) => {
  const { url } = req.body;

  if (!url) {
    return res.status(400).json({ error: "Missing required field: url" });
  }

  try {
    const result = await crawlSite(url);
    const prioritization = await prioritizeAudit(result);
    res.json({ ...result, prioritization });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /audit/stream?url=...
// Same pipeline as POST /, but as Server-Sent Events so the frontend can show
// real progress (crawl -> per-page Lighthouse -> AI prioritization) instead
// of a static "please wait" message during the ~1-2min this takes locally.
router.get("/stream", async (req, res) => {
  const { url } = req.query;

  if (!url || typeof url !== "string") {
    res.status(400).json({ error: "Missing required query param: url" });
    return;
  }

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders();

  const send = (event, data) => {
    res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
  };

  try {
    const result = await crawlSite(url, {
      onProgress: (message) => send("progress", { message }),
    });
    send("progress", { message: "Generando priorizacion con IA local..." });
    const prioritization = await prioritizeAudit(result);
    send("done", { ...result, prioritization });
  } catch (err) {
    send("failed", { message: err.message });
  } finally {
    res.end();
  }
});

export default router;
