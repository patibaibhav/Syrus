import { useState, useCallback, useEffect } from 'react';
import { taskAPI } from '../services/api';

export function useTasks() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadTasks = useCallback(async () => {
    setLoading(true);
    try {
      const res = await taskAPI.list();
      if (res.data.success) {
        setTasks(res.data.data.tasks);
      }
      setError(null);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load tasks');
    } finally {
      setLoading(false);
    }
  }, []);

  const startTask = useCallback(async (id) => {
    const res = await taskAPI.start(id);
    if (res.data.success) {
      setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, status: 'in_progress', startedAt: new Date().toISOString() } : t)));
    }
    return res.data;
  }, []);

  const verifyTask = useCallback(async (id, evidence) => {
    const res = await taskAPI.verify(id, evidence);
    if (res.data.success) {
      const passed = res.data.data.verification.passed;
      setTasks((prev) =>
        prev.map((t) =>
          t.id === id
            ? {
                ...t,
                status: passed ? 'verified' : t.status,
                verificationResult: passed,
                attemptCount: (t.attemptCount || 0) + 1,
                completedAt: passed ? new Date().toISOString() : t.completedAt,
              }
            : t
        )
      );
    }
    return res.data;
  }, []);

  const completeTask = useCallback(async (id) => {
    const res = await taskAPI.complete(id);
    if (res.data.success) {
      setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, status: 'completed', completedAt: new Date().toISOString() } : t)));
    }
    return res.data;
  }, []);

  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  return { tasks, loading, error, loadTasks, startTask, verifyTask, completeTask };
}
