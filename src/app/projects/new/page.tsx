"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createProject } from "@/lib/api";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export default function NewProject() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState("MANUAL");
  const [blogUrl, setBlogUrl] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const project = await createProject({
        name,
        description: description || undefined,
        type,
        blog_url: type === "BLOG" ? blogUrl : undefined,
      });
      router.push(`/projects/${project.id}`);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto">
      <h1 className="font-heading text-3xl font-bold tracking-tight mb-6">Neues Projekt</h1>

      <Card>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="name">Projektname</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="z.B. Mein Blog"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Beschreibung</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Worum geht es in diesem Projekt?"
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label>Typ</Label>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setType("MANUAL")}
                  className={`flex-1 py-3 px-4 rounded-md border text-sm font-medium transition-colors ${
                    type === "MANUAL"
                      ? "border-primary bg-primary/5 text-primary"
                      : "border-border text-muted-foreground hover:border-primary/50"
                  }`}
                >
                  Manuell
                </button>
                <button
                  type="button"
                  onClick={() => setType("BLOG")}
                  className={`flex-1 py-3 px-4 rounded-md border text-sm font-medium transition-colors ${
                    type === "BLOG"
                      ? "border-primary bg-primary/5 text-primary"
                      : "border-border text-muted-foreground hover:border-primary/50"
                  }`}
                >
                  Blog
                </button>
              </div>
            </div>

            {type === "BLOG" && (
              <div className="space-y-2">
                <Label htmlFor="blogUrl">Blog-URL</Label>
                <Input
                  id="blogUrl"
                  value={blogUrl}
                  onChange={(e) => setBlogUrl(e.target.value)}
                  placeholder="https://meinblog.de"
                  type="url"
                />
              </div>
            )}

            <Button type="submit" disabled={loading || !name} className="w-full">
              {loading ? "Wird angelegt..." : "Projekt anlegen"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
