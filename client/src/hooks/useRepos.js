import { useState, useEffect } from "react";
import axios from "axios";

export function useRepos() {
  const [repos, setRepos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const fetchRepos = async (pageNum = 1) => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get(`/api/github/repos?page=${pageNum}&per_page=30`, {
        withCredentials: true,
      });
      const newRepos = res.data.repos;
      if (pageNum === 1) {
        setRepos(newRepos);
      } else {
        setRepos((prev) => [...prev, ...newRepos]);
      }
      setHasMore(newRepos.length === 30);
    } catch (err) {
      setError("Failed to load repositories.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRepos(1);
  }, []);

  const loadMore = () => {
    const next = page + 1;
    setPage(next);
    fetchRepos(next);
  };

  return { repos, loading, error, hasMore, loadMore };
}
