"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { getProject, deleteAnalysis, type Project } from "@/lib/api";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function ProjectDetail() {
  const params = useParams();
  const projectId = Number(params.id);
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getProject(projectId)
      .then(setProject)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [projectId]);

  const reload = () => {
    getProject(projectId).then(setProject).catch(console.error);
  };

  if (loading) return <div className="text-muted-foreground">Laden...</div>;
  if (!project) return <div className="text-destructive">Projekt nicht gefunden.</div>;

  const analyses = project.analyses || [];
  const trendData = [...analyses]
    .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
    .map((a) => ({
      name: new Date(a.created_at).toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit" }),
      score: a.wordprint_score,
    }));

  const avgScore = analyses.length
    ? Math.round(analyses.reduce((s, a) => s + a.wordprint_score, 0) / analyses.length)
    : 0;
  const maxScore = analyses.length ? Math.max(...analyses.map((a) => a.wordprint_score)) : 0;

  const handleDelete = async (id: number) => {
    await deleteAnalysis(id);
    reload();
  };

  return (
    <div>
      <div className="flex items-start justify-between mb-8">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="font-heading text-3xl font-bold tracking-tight">{project.name}</h1>
            <Badge variant={project.type === "BLOG" ? "default" : "secondary"}>
              {project.type === "BLOG" ? "Blog" : "Manuell"}
            </Badge>
          </div>
          {project.description && (
            <p className="text-muted-foreground">{project.description}</p>
          )}
        </div>
        <a href={`/projects/${project.id}/analyze`}>
          <Button>Neue Analyse</Button>
        </a>
      </div>

      {/* Stats overview */}
      <div className="grid gap-4 md:grid-cols-3 mb-8">
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Analysen</p>
            <p className="font-heading text-3xl font-bold">{analyses.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Ø Wordprint</p>
            <p className="font-heading text-3xl font-bold text-primary">{avgScore || "–"}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Max. Wordprint</p>
            <p className="font-heading text-3xl font-bold text-accent">{maxScore || "–"}</p>
          </CardContent>
        </Card>
      </div>

      {/* Trend chart */}
      {trendData.length > 1 && (
        <Card className="mb-8">
          <CardContent className="pt-6">
            <h2 className="font-heading text-lg font-semibold mb-4">Wordprint-Trend</h2>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} stroke="var(--muted-foreground)" />
                <YAxis tick={{ fontSize: 12 }} stroke="var(--muted-foreground)" />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="score"
                  stroke="var(--primary)"
                  strokeWidth={2}
                  dot={{ fill: "var(--primary)", r: 4 }}
                  name="Score"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Analyses list */}
      <h2 className="font-heading text-lg font-semibold mb-4">Analysen</h2>
      {analyses.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="py-8 text-center text-muted-foreground">
            Noch keine Analysen. Starte deine erste Analyse.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {analyses.map((a) => (
            <a key={a.id} href={`/analyses/${a.id}`} className="block">
              <Card className="hover:shadow-sm transition-shadow">
                <CardContent className="py-4 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <span className="font-heading text-2xl font-bold text-primary w-16 text-right">
                      {a.wordprint_score}
                    </span>
                    <Separator orientation="vertical" className="h-8" />
                    <div>
                      <p className="font-medium text-sm">{a.source_label.slice(0, 80)}</p>
                      <p className="text-xs text-muted-foreground">
                        {a.source_type} · {new Date(a.created_at).toLocaleDateString("de-DE")}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      handleDelete(a.id);
                    }}
                    className="text-xs text-muted-foreground hover:text-destructive transition-colors"
                  >
                    Löschen
                  </button>
                </CardContent>
              </Card>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
