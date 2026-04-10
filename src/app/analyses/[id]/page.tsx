"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { getAnalysis, type AnalysisDetail } from "@/lib/api";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

const BAR_COLORS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
  "var(--muted-foreground)",
];

export default function AnalysisPage() {
  const params = useParams();
  const analysisId = Number(params.id);
  const [analysis, setAnalysis] = useState<AnalysisDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [posMode, setPosMode] = useState<"simplified" | "detailed">("simplified");
  const [showForeign, setShowForeign] = useState(false);
  const [showTechnical, setShowTechnical] = useState(false);

  useEffect(() => {
    getAnalysis(analysisId)
      .then(setAnalysis)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [analysisId]);

  if (loading) return <div className="text-muted-foreground">Laden...</div>;
  if (!analysis) return <div className="text-destructive">Analyse nicht gefunden.</div>;

  const stats = analysis.statistics;
  if (!stats) return <div className="text-muted-foreground">Keine Statistiken vorhanden.</div>;

  const posData = Object.entries(stats.by_pos[posMode])
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);

  return (
    <div>
      {/* Hero score */}
      <div className="text-center mb-10">
        <p className="text-xs text-muted-foreground uppercase tracking-widest mb-2">Wordprint Score</p>
        <p className="font-heading text-7xl font-extrabold text-primary mb-2">
          {stats.wordprint_score}
        </p>
        <p className="text-sm text-muted-foreground">
          {analysis.source_label.slice(0, 100)}
        </p>
      </div>

      {/* Metric cards */}
      <div className="grid gap-3 grid-cols-2 md:grid-cols-4 mb-8">
        {[
          { label: "Tokens gesamt", value: stats.total_tokens },
          { label: "Sätze", value: stats.total_sentences },
          { label: "Ø Satzlänge", value: stats.avg_sentence_length },
          { label: "Ø Wortlänge", value: stats.avg_word_length },
          { label: "Lexikalische Dichte", value: (stats.lexical_density * 100).toFixed(0) + "%" },
          { label: "Hapax Legomena", value: stats.hapax_legomena },
          { label: "Inhaltswörter", value: (stats.pos_ratio.content_words * 100).toFixed(0) + "%" },
          { label: "Funktionswörter", value: (stats.pos_ratio.function_words * 100).toFixed(0) + "%" },
        ].map((m) => (
          <Card key={m.label}>
            <CardContent className="py-4 text-center">
              <p className="text-[11px] text-muted-foreground uppercase tracking-wider mb-1">{m.label}</p>
              <p className="font-heading text-2xl font-bold">{m.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* POS chart */}
      <Card className="mb-8">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-heading text-lg font-semibold">Wortarten</h2>
            <div className="flex gap-1 text-xs">
              <button
                onClick={() => setPosMode("simplified")}
                className={`px-3 py-1 rounded-md transition-colors ${
                  posMode === "simplified"
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Vereinfacht
              </button>
              <button
                onClick={() => setPosMode("detailed")}
                className={`px-3 py-1 rounded-md transition-colors ${
                  posMode === "detailed"
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Detailliert
              </button>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={posData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis type="number" tick={{ fontSize: 12 }} stroke="var(--muted-foreground)" />
              <YAxis
                type="category"
                dataKey="name"
                width={100}
                tick={{ fontSize: 12 }}
                stroke="var(--muted-foreground)"
              />
              <Tooltip />
              <Bar dataKey="value" radius={[0, 4, 4, 0]} name="Anzahl">
                {posData.map((_, i) => (
                  <Cell key={i} fill={BAR_COLORS[i % BAR_COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Top words */}
      <Card className="mb-8">
        <CardContent className="pt-6">
          <h2 className="font-heading text-lg font-semibold mb-4">Top 20 Wörter</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-muted-foreground">
                  <th className="pb-2 font-medium">Wort</th>
                  <th className="pb-2 font-medium">Lemma</th>
                  <th className="pb-2 font-medium">Wortart</th>
                  <th className="pb-2 font-medium text-right">Häufigkeit</th>
                </tr>
              </thead>
              <tbody>
                {stats.top_words.map((w, i) => (
                  <tr key={i} className="border-b border-border/50">
                    <td className="py-2 font-medium">{w.surface}</td>
                    <td className="py-2 text-muted-foreground">{w.lemma}</td>
                    <td className="py-2">
                      <Badge variant="secondary" className="text-xs">{w.pos}</Badge>
                    </td>
                    <td className="py-2 text-right font-mono">{w.count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Foreign words */}
      {stats.foreign_words.count > 0 && (
        <Card className="mb-4">
          <CardContent className="py-4">
            <button
              onClick={() => setShowForeign(!showForeign)}
              className="w-full flex items-center justify-between"
            >
              <span className="font-medium text-sm">
                Fremdwörter ({stats.foreign_words.count})
              </span>
              <span className="text-muted-foreground text-xs">{showForeign ? "▲" : "▼"}</span>
            </button>
            {showForeign && (
              <div className="mt-3 flex flex-wrap gap-2">
                {stats.foreign_words.words.map((w) => (
                  <Badge key={w} variant="secondary">{w}</Badge>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Technical words */}
      {stats.technical_words.count > 0 && (
        <Card className="mb-8">
          <CardContent className="py-4">
            <button
              onClick={() => setShowTechnical(!showTechnical)}
              className="w-full flex items-center justify-between"
            >
              <span className="font-medium text-sm">
                Fachbegriffe ({stats.technical_words.count})
              </span>
              <span className="text-muted-foreground text-xs">{showTechnical ? "▲" : "▼"}</span>
            </button>
            {showTechnical && (
              <div className="mt-3 flex flex-wrap gap-2">
                {stats.technical_words.words.map((w) => (
                  <Badge key={w} variant="secondary">{w}</Badge>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
