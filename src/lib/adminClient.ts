export type AdminPlayerSummary = {
  id: string; display_name: string; masked_phone: string; school_name: string;
  training_year: number; best_score: number; best_rhythm_score: number;
  attempts_count: number; session_count: number; last_activity_at: string; created_at: string;
};
export type AdminOverview = {
  ok: true;
  summary: { total_users: number; active_today: number; completed_missions: number; feedback_count: number };
  users: AdminPlayerSummary[]; page: number; total_count: number; page_size: number;
};
export type AdminAttempt = { id: string; scoring_version: string; scenario_id: string; overall_score: number; sequence_score: number | null; call_score: number | null; cpr_rhythm_score: number; total_time_seconds: number; completed_at: string };
export type AdminPlayerDetail = {
  ok: true;
  player: { id: string; display_name: string; phone: string; school_name: string; training_year: number; created_at: string; updated_at: string; is_admin: boolean };
  sessions: Array<{ id: string; created_at: string; last_seen_at: string; expires_at: string }>;
  attempts: AdminAttempt[];
  feedback: null | { content_rating: number; usability_rating: number; confidence_rating: number; app_rating: number; improvement_area: string; comment: string | null; updated_at: string };
  xp: number;
};

export class AdminClientError extends Error { constructor(public status: number, message: string) { super(message); } }

async function parse<T>(response: Response): Promise<T> {
  const data = await response.json().catch(() => ({ error: "service_unavailable" })) as T & { error?: string };
  if (!response.ok) throw new AdminClientError(response.status, data.error ?? "service_unavailable");
  return data;
}

export async function fetchAdminOverview(search = "", page = 1) {
  const query = new URLSearchParams({ search, page: String(page) });
  return parse<AdminOverview>(await fetch(`/api/player/admin/overview?${query}`, { cache: "no-store" }));
}
export async function fetchAdminPlayer(id: string) {
  return parse<AdminPlayerDetail>(await fetch(`/api/player/admin/players/${encodeURIComponent(id)}`, { cache: "no-store" }));
}
export async function deleteAdminPlayer(id: string, confirmation: string) {
  return parse<{ ok: true }>(await fetch(`/api/player/admin/players/${encodeURIComponent(id)}`, {
    method: "DELETE", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ confirmation }),
  }));
}
