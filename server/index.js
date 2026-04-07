require("dotenv").config();
const express = require("express");
const session = require("express-session");
const cors = require("cors");

const authRoutes = require("./routes/auth");
const githubRoutes = require("./routes/github");

const app = express();
const PORT = process.env.PORT || 5000;

// Required for secure cookies to work behind reverse proxies (like Render/Heroku)
app.set("trust proxy", 1);

app.use(express.json());
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true, // allow cookies/session across origins
  })
);
app.use(
  session({
    secret: process.env.SESSION_SECRET || "branchscope-secret",
    resave: false,
    saveUninitialized: false,
    cookie: {
      // In production, require HTTPS and allow cross-domain cookies (SameSite=None)
      // In local dev, use standard insecure cookies
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000, // 1 day
    },
  })
);

// ─── Routes ──────────────────────────────────────────────────
app.use("/auth", authRoutes);
app.use("/api/github", githubRoutes);

// Health check
app.get("/", (req, res) => res.json({ status: "BranchScope server running 🚀" }));

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
