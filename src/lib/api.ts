const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...init?.headers,
    },
  });
  if (!res.ok) {
    throw new Error(`API error: ${res.status} ${res.statusText}`);
  }
  if (res.status === 204) return undefined as T;
  return res.json();
}

export interface Project {
  id: number;
  name: string;
  description: string | null;
  type: string;
  blog_url: string | null;
  created_at: string;
  updated_at: string;
  analyses?: AnalysisSummary[];
}

export interface AnalysisSummary {
  id: number;
  project_id: number;
  source_type: string;
  source_label: string;
  wordprint_score: number;
  created_at: string;
}

export interface AnalysisDetail extends AnalysisSummary {
  raw_text: string;
  statistics: Statistics | null;
  words: WordRecord[];
}

export interface WordRecord {
  id: number;
  surface_form: string;
  lemma: string;
  pos_tag: string;
  frequency: number;
  is_foreign: boolean;
  is_technical: boolean;
}

export interface Statistics {
  wordprint_score: number;
  total_tokens: number;
  total_sentences: number;
  avg_sentence_length: number;
  avg_word_length: number;
  lexical_density: number;
  unique_lemmas: number;
  hapax_legomena: number;
  by_pos: {
    detailed: Record<string, number>;
    simplified: Record<string, number>;
  };
  foreign_words: { count: number; words: string[] };
  technical_words: { count: number; words: string[] };
  top_words: { surface: string; lemma: string; pos: string; count: number }[];
  top_lemmas: { lemma: string; pos: string; total_count: number }[];
  pos_ratio: { content_words: number; function_words: number };
}

// Projects
export const getProjects = () => apiFetch<Project[]>("/projects");
export const getProject = (id: number) => apiFetch<Project>(`/projects/${id}`);
export const createProject = (data: { name: string; description?: string; type?: string; blog_url?: string }) =>
  apiFetch<Project>("/projects", { method: "POST", body: JSON.stringify(data) });
export const deleteProject = (id: number) =>
  apiFetch<void>(`/projects/${id}`, { method: "DELETE" });

// Analyses
export const getAnalyses = (projectId: number) => apiFetch<AnalysisSummary[]>(`/projects/${projectId}/analyses`);
export const getAnalysis = (id: number) => apiFetch<AnalysisDetail>(`/analyses/${id}`);
export const deleteAnalysis = (id: number) => apiFetch<void>(`/analyses/${id}`, { method: "DELETE" });

export const analyzeText = (projectId: number, text: string) =>
  apiFetch<AnalysisSummary>(`/projects/${projectId}/analyze/text`, {
    method: "POST",
    body: JSON.stringify({ text }),
  });

export const analyzeUrl = (projectId: number, url: string) =>
  apiFetch<AnalysisSummary>(`/projects/${projectId}/analyze/url`, {
    method: "POST",
    body: JSON.stringify({ url }),
  });

export async function analyzeFiles(projectId: number, files: File[]): Promise<AnalysisSummary> {
  const formData = new FormData();
  files.forEach((f) => formData.append("files", f));
  const res = await fetch(`${API_BASE}/projects/${projectId}/analyze/files`, {
    method: "POST",
    body: formData,
  });
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}

export const crawlBlog = (projectId: number) =>
  apiFetch<AnalysisSummary[]>(`/projects/${projectId}/crawl`, { method: "POST" });
