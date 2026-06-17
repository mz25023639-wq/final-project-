"use client";

import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/dashboard-layout";
import { Card, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PaperViewer } from "@/components/paper-viewer";
import { Trash2, Search, Eye } from "lucide-react";
import type { GuessPaperContent } from "@/types";

interface Paper {
  id: string;
  title: string;
  content: GuessPaperContent;
  createdAt: string;
  university: { name: string };
  course: { name: string };
  savedBy: { id: string }[];
}

export default function HistoryPage() {
  const [papers, setPapers] = useState<Paper[]>([]);
  const [search, setSearch] = useState("");
  const [viewing, setViewing] = useState<Paper | null>(null);

  const fetchPapers = (q = "") => {
    fetch(`/api/papers?search=${encodeURIComponent(q)}`)
      .then((r) => r.json())
      .then((data) => Array.isArray(data) && setPapers(data));
  };

  useEffect(() => {
    const timer = setTimeout(() => fetchPapers(search), 300);
    return () => clearTimeout(timer);
  }, [search]);

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this paper?")) return;
    await fetch(`/api/papers/${id}`, { method: "DELETE" });
    fetchPapers(search);
    if (viewing?.id === id) setViewing(null);
  };

  const handleSave = async (paperId: string) => {
    await fetch("/api/papers/save", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ paperId }),
    });
    fetchPapers(search);
  };

  if (viewing) {
    return (
      <DashboardLayout>
        <Button variant="ghost" onClick={() => setViewing(null)} className="mb-4">
          ← Back to History
        </Button>
        <PaperViewer
          title={viewing.title}
          content={viewing.content}
          paperId={viewing.id}
          onSave={() => handleSave(viewing.id)}
          isSaved={viewing.savedBy.length > 0}
        />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h1 className="text-3xl font-bold">Paper History</h1>
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--muted)]" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search papers..."
              className="pl-9"
            />
          </div>
        </div>

        {papers.length === 0 ? (
          <Card>
            <p className="text-[var(--muted)]">No papers found. Generate your first guess paper!</p>
          </Card>
        ) : (
          <div className="space-y-3">
            {papers.map((paper) => (
              <Card key={paper.id} className="flex flex-wrap items-center justify-between gap-4 !p-4">
                <div>
                  <CardTitle className="text-base">{paper.title}</CardTitle>
                  <p className="text-xs text-[var(--muted)]">
                    {paper.university.name} · {paper.course.name} ·{" "}
                    {new Date(paper.createdAt).toLocaleString()}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => setViewing(paper)}>
                    <Eye className="h-4 w-4" /> View
                  </Button>
                  <Button variant="danger" size="sm" onClick={() => handleDelete(paper.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
