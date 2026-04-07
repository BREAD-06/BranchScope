const express = require("express");
const axios = require("axios");
const router = express.Router();

const CLIENT_ID = process.env.GITHUB_CLIENT_ID;
const CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET;
const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:5173";

// ─── Step 1: Redirect user to GitHub OAuth ───────────────────
// GET /auth/github
router.get("/github", (req, res) => {
  const githubAuthUrl =
    `https://github.com/login/oauth/authorize` +
    `?client_id=${CLIENT_ID}` +
    `&scope=repo,read:user` +
    `&prompt=consent` +
    `&redirect_uri=${encodeURIComponent(
      process.env.GITHUB_CALLBACK_URL || "http://localhost:5000/auth/github/callback"
    )}`;

  res.redirect(githubAuthUrl);
});

// ─── Step 2: GitHub redirects back with a code ───────────────
// GET /auth/github/callback
router.get("/github/callback", async (req, res) => {
  const { code } = req.query;

  if (!code) {
    return res.redirect(`${CLIENT_URL}?error=no_code`);
  }

  try {
    // Exchange code for access token
    const tokenResponse = await axios.post(
      "https://github.com/login/oauth/access_token",
      {
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        code,
      },
      { headers: { Accept: "application/json" } }
    );

    const { access_token, error } = tokenResponse.data;

    if (error || !access_token) {
      return res.redirect(`${CLIENT_URL}?error=token_exchange_failed`);
    }

    // Fetch authenticated user info
    const userResponse = await axios.get("https://api.github.com/user", {
      headers: {
        Authorization: `Bearer ${access_token}`,
        Accept: "application/vnd.github+json",
      },
    });

    // Store in session
    req.session.accessToken = access_token;
    req.session.user = {
      id: userResponse.data.id,
      login: userResponse.data.login,
      name: userResponse.data.name,
      avatar_url: userResponse.data.avatar_url,
    };

    res.redirect(`${CLIENT_URL}/dashboard`);
  } catch (err) {
    console.error("OAuth error:", err.message);
    res.redirect(`${CLIENT_URL}?error=oauth_failed`);
  }
});

// ─── Step 3: Return current session user ─────────────────────
// GET /auth/me
router.get("/me", (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({ error: "Not authenticated" });
  }
  res.json({ user: req.session.user });
});

// ─── Logout ──────────────────────────────────────────────────
// GET /auth/logout
router.get("/logout", (req, res) => {
  req.session.destroy(() => {
    res.json({ message: "Logged out successfully" });
  });
});

module.exports = router;
