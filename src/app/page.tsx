"use client";

import { useEffect, useState } from "react";
import { getProjects, type Project } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function Dashboard() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getProjects()
      .then(setProjects)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <div className="mb-10">
        <h1 className="font-heading text-4xl font-bold tracking-tight mb-2">Dashboard</h1>
        <p className="text-muted-foreground text-lg">
          Deine Projekte und ihr sprachlicher Fingerabdruck.
        </p>
      </div>

      {loading ? (
        <div className="text-muted-foreground">Laden...</div>
      ) : projects.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground mb-4">Noch keine Projekte vorhanden.</p>
            <a
              href="/projects/new"
              className="inline-flex items-center px-4 py-2 bg-primary text-primary-foreground rounded-md font-medium text-sm hover:opacity-90 transition-opacity"
            >
              Erstes Projekt anlegen
            </a>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <a key={project.id} href={`/projects/${project.id}`}>
              <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <CardTitle className="font-heading text-lg">{project.name}</CardTitle>
                    <Badge variant={project.type === "BLOG" ? "default" : "secondary"}>
                      {project.type === "BLOG" ? "Blog" : "Manuell"}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  {project.description && (
                    <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                      {project.description}
                    </p>
                  )}
                  <div className="flex items-baseline gap-2">
                    <span className="font-heading text-3xl font-bold text-primary">
                      {project.analyses && project.analyses.length > 0
                        ? Math.max(...project.analyses.map((a) => a.wordprint_score))
                        : "–"}
                    </span>
                    <span className="text-xs text-muted-foreground uppercase tracking-wider">
                      Wordprint Score
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    {project.analyses?.length || 0} Analyse{(project.analyses?.length || 0) !== 1 ? "n" : ""}
                  </p>
                </CardContent>
              </Card>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
