const SCRIPT_URL = process.env.NEXT_PUBLIC_SHEETS_URL || '';

interface ApiResponse {
  success: boolean;
  error?: string;
  [key: string]: any;
}

export const SheetsClient = {
  async post(action: string, payload: Record<string, any> = {}): Promise<ApiResponse> {
    if (!SCRIPT_URL) return { success: false, error: 'SHEETS_URL not configured' };
    try {
      const res = await fetch(SCRIPT_URL, {
        method: 'POST',
        redirect: 'follow',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({ action, ...payload }),
      });
      return await res.json();
    } catch (err) {
      return { success: false, error: 'Network error', offline: true };
    }
  },

  async get(action: string, params: Record<string, string> = {}): Promise<ApiResponse> {
    if (!SCRIPT_URL) return { success: false, error: 'SHEETS_URL not configured' };
    try {
      const qs = new URLSearchParams({ action, ...params });
      const res = await fetch(`${SCRIPT_URL}?${qs}`, { redirect: 'follow' });
      return await res.json();
    } catch (err) {
      return { success: false, error: 'Network error', offline: true };
    }
  },

  createGuestSession() {
    return this.post('createGuestSession');
  },
  saveGuestProgress(sessionId: string, levelId: number, stars: number, blocksUsed: number, timeSeconds: number) {
    return this.post('saveGuestProgress', { session_id: sessionId, level_id: levelId, stars, blocks_used: blocksUsed, time_seconds: timeSeconds });
  },
  finishSession(sessionId: string, totalPoints: number) {
    return this.post('finishSession', { session_id: sessionId, total_points: totalPoints });
  },
  createStudent(name: string, avatar: string) {
    return this.post('createStudent', { name, avatar });
  },
  loginStudent(name: string, pin: string) {
    return this.post('loginStudent', { name, pin });
  },
  saveStudentProgress(studentId: string, levelId: number, stars: number, blocksUsed: number, timeSeconds: number) {
    return this.post('saveStudentProgress', { student_id: studentId, level_id: levelId, stars, blocks_used: blocksUsed, time_seconds: timeSeconds });
  },
  getStudentProgress(studentId: string) {
    return this.post('getStudentProgress', { student_id: studentId });
  },
};

export const OfflineQueue = {
  key: 'mbot_offline_queue',
  enqueue(item: any) {
    if (typeof window === 'undefined') return;
    const q = JSON.parse(localStorage.getItem(this.key) || '[]');
    q.push({ ...item, timestamp: Date.now() });
    localStorage.setItem(this.key, JSON.stringify(q));
  },
  async flush() {
    if (typeof window === 'undefined') return 0;
    const q = JSON.parse(localStorage.getItem(this.key) || '[]');
    if (!q.length) return 0;
    const remaining: any[] = [];
    for (const item of q) {
      const res = await SheetsClient.post(item.action, item.payload);
      if (!res.success) remaining.push(item);
    }
    localStorage.setItem(this.key, JSON.stringify(remaining));
    return q.length - remaining.length;
  },
  isOnline() {
    return typeof navigator !== 'undefined' && navigator.onLine;
  },
};
