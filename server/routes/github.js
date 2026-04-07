const express = require("express");
const axios = require("axios");
const router = express.Router();

// ─── Auth middleware ──────────────────────────────────────────
function requireAuth(req, res, next) {
  if (!req.session.accessToken) {
    return res.status(401).json({ error: "Not authenticated" });
  }
  next();
}

// Helper: create github API client with user's token
function githubClient(token) {
  return axios.create({
    baseURL: "https://api.github.com",
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github+json",
    },
  });
}

// ─── GET /api/github/repos ────────────────────────────────────
// Fetch all repos for the logged-in user (own + member of)
router.get("/repos", requireAuth, async (req, res) => {
  try {
    const gh = githubClient(req.session.accessToken);
    const { page = 1, per_page = 30 } = req.query;

    const response = await gh.get("/user/repos", {
      params: {
        sort: "updated",
        direction: "desc",
        per_page,
        page,
        // include private repos if token has access
        visibility: "all",
        affiliation: "owner,collaborator,organization_member",
      },
    });

    const repos = response.data.map((r) => ({
      id: r.id,
      name: r.name,
      full_name: r.full_name,
      description: r.description,
      private: r.private,
      owner: {
        login: r.owner.login,
        avatar_url: r.owner.avatar_url,
      },
      default_branch: r.default_branch,
      stargazers_count: r.stargazers_count,
      updated_at: r.updated_at,
      html_url: r.html_url,
      language: r.language,
    }));

    res.json({ repos, page: Number(page) });
  } catch (err) {
    console.error("Repos fetch error:", err.message);
    res.status(500).json({ error: "Failed to fetch repositories" });
  }
});

// ─── GET /api/github/repos/:owner/:repo/branches ─────────────
// Fetch all branches + last commit info for a specific repo
router.get("/repos/:owner/:repo/branches", requireAuth, async (req, res) => {
  const { owner, repo } = req.params;

  try {
    const gh = githubClient(req.session.accessToken);

    // Fetch all branches (paginate to get all)
    let allBranches = [];
    let page = 1;
    while (true) {
      const response = await gh.get(`/repos/${owner}/${repo}/branches`, {
        params: { per_page: 100, page },
      });
      allBranches = allBranches.concat(response.data);
      if (response.data.length < 100) break;
      page++;
    }

    // Enrich each branch with last commit details
    const enriched = await Promise.all(
      allBranches.map(async (branch) => {
        const commitSha = branch.commit.sha;

        // Fetch commit detail for date + author
        const commitRes = await gh.get(
          `/repos/${owner}/${repo}/commits/${commitSha}`
        );
        const commit = commitRes.data;

        const lastCommitDate = commit.commit.author.date;
        const daysSinceCommit = Math.floor(
          (Date.now() - new Date(lastCommitDate)) / (1000 * 60 * 60 * 24)
        );

        return {
          name: branch.name,
          sha: commitSha,
          protected: branch.protected,
          last_commit: {
            sha: commitSha,
            message: commit.commit.message.split("\n")[0], // first line only
            author: commit.commit.author.name,
            date: lastCommitDate,
            days_ago: daysSinceCommit,
          },
          // Stale if no commits in 30 days
          is_stale: daysSinceCommit > 30,
          stale_level:
            daysSinceCommit > 90
              ? "very_stale"
              : daysSinceCommit > 60
              ? "stale"
              : daysSinceCommit > 30
              ? "aging"
              : "fresh",
        };
      })
    );

    // Sort: default branch first, then by last commit date
    const repoInfo = await gh.get(`/repos/${owner}/${repo}`);
    const defaultBranch = repoInfo.data.default_branch;

    enriched.sort((a, b) => {
      if (a.name === defaultBranch) return -1;
      if (b.name === defaultBranch) return 1;
      return new Date(b.last_commit.date) - new Date(a.last_commit.date);
    });

    res.json({
      repo: `${owner}/${repo}`,
      default_branch: defaultBranch,
      total: enriched.length,
      branches: enriched,
    });
  } catch (err) {
    console.error("Branches fetch error:", err.message);
    res.status(500).json({ error: "Failed to fetch branches" });
  }
});

module.exports = router;
