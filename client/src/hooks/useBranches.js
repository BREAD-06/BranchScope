import { useState, useEffect } from "react";
import axios from "axios";

export function useBranches(owner, repo) {
  const [data, setData] = useState(null); // { branches, default_branch, total }
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!owner || !repo) return;
    setLoading(true);
    setError(null);

    axios
      .get(`/api/github/repos/${owner}/${repo}/branches`, {
        withCredentials: true,
      })
      .then((res) => setData(res.data))
      .catch((err) => {
        setError(err.response?.data?.error || "Failed to load branches.");
      })
      .finally(() => setLoading(false));
  }, [owner, repo]);

  return { data, loading, error };
}
