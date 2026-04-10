"use client";

import { useCallback, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { analyzeText, analyzeFiles, analyzeUrl } from "@/lib/api";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function AnalyzePage() {
  const params = useParams();
  const router = useRouter();
  const projectId = Number(params.id);

  const [text, setText] = useState("");
  const [url, setUrl] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;
  const charCount = text.length;

  const handleTextSubmit = async () => {
    if (!text.trim()) return;
    setLoading(true);
    setError("");
    try {
      const result = await analyzeText(projectId, text);
      router.push(`/analyses/${result.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Fehler");
      setLoading(false);
    }
  };

  const handleFileSubmit = async () => {
    if (files.length === 0) return;
    setLoading(true);
    setError("");
    try {
      const result = await analyzeFiles(projectId, files);
      router.push(`/analyses/${result.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Fehler");
      setLoading(false);
    }
  };

  const handleUrlSubmit = async () => {
    if (!url.trim()) return;
    setLoading(true);
    setError("");
    try {
      const result = await analyzeUrl(projectId, url);
      router.push(`/analyses/${result.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Fehler");
      setLoading(false);
    }
  };

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const droppedFiles = Array.from(e.dataTransfer.files).filter((f) =>
      f.name.endsWith(".txt")
    );
    setFiles((prev) => [...prev, ...droppedFiles]);
  }, []);

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="font-heading text-3xl font-bold tracking-tight mb-6">Neue Analyse</h1>

      {error && (
        <div className="bg-destructive/10 text-destructive rounded-md p-3 mb-4 text-sm">
          {error}
        </div>
      )}

      <Card>
        <CardContent className="pt-6">
          <Tabs defaultValue="text">
            <TabsList className="mb-4">
              <TabsTrigger value="text">Text</TabsTrigger>
              <TabsTrigger value="files">Dateien</TabsTrigger>
              <TabsTrigger value="url">URL</TabsTrigger>
            </TabsList>

            <TabsContent value="text" className="space-y-4">
              <Textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Text hier einfügen..."
                rows={12}
                className="resize-y"
              />
              <div className="flex items-center justify-between">
                <p className="text-xs text-muted-foreground">
                  {charCount} Zeichen · {wordCount} Wörter
                </p>
                <Button onClick={handleTextSubmit} disabled={loading || !text.trim()}>
                  {loading ? "Analysiere..." : "Analysieren"}
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="files" className="space-y-4">
              <div
                onDrop={onDrop}
                onDragOver={(e) => e.preventDefault()}
                className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:border-primary/50 transition-colors"
                onClick={() => document.getElementById("file-input")?.click()}
              >
                <p className="text-muted-foreground mb-2">
                  .txt-Dateien hierher ziehen oder klicken
                </p>
                <input
                  id="file-input"
                  type="file"
                  accept=".txt"
                  multiple
                  className="hidden"
                  onChange={(e) => {
                    const selected = Array.from(e.target.files || []);
                    setFiles((prev) => [...prev, ...selected]);
                  }}
                />
                {files.length > 0 && (
                  <div className="mt-4 space-y-1">
                    {files.map((f, i) => (
                      <div key={i} className="text-sm flex items-center justify-between">
                        <span>{f.name}</span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setFiles(files.filter((_, j) => j !== i));
                          }}
                          className="text-muted-foreground hover:text-destructive text-xs"
                        >
                          Entfernen
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="flex justify-end">
                <Button onClick={handleFileSubmit} disabled={loading || files.length === 0}>
                  {loading ? "Analysiere..." : `${files.length} Datei${files.length !== 1 ? "en" : ""} analysieren`}
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="url" className="space-y-4">
              <Input
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://example.com/artikel"
                type="url"
              />
              <div className="flex justify-end">
                <Button onClick={handleUrlSubmit} disabled={loading || !url.trim()}>
                  {loading ? "Analysiere..." : "URL analysieren"}
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
