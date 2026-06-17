"use client";

import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/dashboard-layout";
import { Card, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PaperViewer } from "@/components/paper-viewer";
import { Bookmark, Eye, Trash2 } from "lucide-react";
import type { GuessPaperContent } from "@/types";

interface SavedItem {
  id: string;
  paper: {
    id: string;
    title: string;
    content: GuessPaperContent;
    createdAt: string;
    university: { name: string };
    course: { name: string };
  };
}

export default function SavedPage() {
  const [saved, setSaved] = useState<SavedItem[]>([]);
  const [viewing, setViewing] = useState<SavedItem | null>(null);

  const fetchSaved = () => {
    fetch("/api/papers/save")
      .then((r) => r.json())
      .then((data) => Array.isArray(data) && setSaved(data));
  };

  useEffect(() => {
    fetchSaved();
  }, []);

  const handleUnsave = async (paperId: string) => {
    await fetch(`/api/papers/save?paperId=${paperId}`, { method: "DELETE" });
    fetchSaved();
    if (viewing?.paper.id === paperId) setViewing(null);
  };

  if (viewing) {
    return (
      <DashboardLayout>
        <Button variant="ghost" onClick={() => setViewing(null)} className="mb-4">
          ← Back to Saved
        </Button>
        <PaperViewer
          title={viewing.paper.title}
          content={viewing.paper.content}
          paperId={viewing.paper.id}
          isSaved
        />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Saved Papers</h1>

        {saved.length === 0 ? (
          <Card className="text-center">
            <Bookmark className="mx-auto mb-4 h-12 w-12 text-[var(--muted)]" />
            <p className="text-[var(--muted)]">No saved papers yet. Bookmark papers from history or after generating.</p>
          </Card>
        ) : (
          <div className="space-y-3">
            {saved.map((item) => (
              <Card key={item.id} className="flex flex-wrap items-center justify-between gap-4 !p-4">
                <div>
                  <CardTitle className="text-base">{item.paper.title}</CardTitle>
                  <p className="text-xs text-[var(--muted)]">
                    {item.paper.university.name} · {item.paper.course.name}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => setViewing(item)}>
                    <Eye className="h-4 w-4" /> View
                  </Button>
                  <Button variant="danger" size="sm" onClick={() => handleUnsave(item.paper.id)}>
                    <Trash2 className="h-4 w-4" /> Remove
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
