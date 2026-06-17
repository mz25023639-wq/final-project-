"use client";

import type { GuessPaperContent } from "@/types";
import { Card, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Bookmark, Download, RefreshCw } from "lucide-react";
import { paperToText } from "@/lib/ai";

interface PaperViewerProps {
  title: string;
  content: GuessPaperContent;
  paperId?: string;
  onSave?: () => void;
  onRegenerate?: () => void;
  isSaved?: boolean;
}

export function PaperViewer({
  title,
  content,
  paperId,
  onSave,
  onRegenerate,
  isSaved,
}: PaperViewerProps) {
  const handleDownload = () => {
    const text = paperToText(title, content);
    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${title.replace(/[^a-z0-9]/gi, "_")}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handlePrint = () => {
    const text = paperToText(title, content);
    const win = window.open("", "_blank");
    if (win) {
      win.document.write(`<pre style="font-family:monospace;white-space:pre-wrap;padding:2rem">${text}</pre>`);
      win.document.close();
      win.print();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h2 className="text-2xl font-bold">{title}</h2>
        <div className="flex flex-wrap gap-2">
          {onRegenerate && (
            <Button variant="outline" size="sm" onClick={onRegenerate}>
              <RefreshCw className="h-4 w-4" /> Regenerate
            </Button>
          )}
          {onSave && paperId && (
            <Button variant="outline" size="sm" onClick={onSave} disabled={isSaved}>
              <Bookmark className="h-4 w-4" /> {isSaved ? "Saved" : "Save"}
            </Button>
          )}
          <Button variant="outline" size="sm" onClick={handleDownload}>
            <Download className="h-4 w-4" /> Download
          </Button>
          <Button variant="outline" size="sm" onClick={handlePrint}>
            Print / PDF
          </Button>
        </div>
      </div>

      <Card>
        <CardTitle className="mb-4">{content.sectionA.title}</CardTitle>
        <div className="space-y-4">
          {content.sectionA.mcqs.map((mcq, i) => (
            <div key={i} className="rounded-xl border border-[var(--card-border)] p-4">
              <p className="font-medium">{i + 1}. {mcq.question}</p>
              <div className="mt-2 grid gap-1 sm:grid-cols-2">
                {mcq.options.map((opt, j) => (
                  <p key={j} className="text-sm text-[var(--muted)]">
                    {String.fromCharCode(65 + j)}. {opt}
                  </p>
                ))}
              </div>
              <p className="mt-2 text-xs text-emerald-500">Answer: {mcq.answer}</p>
            </div>
          ))}
        </div>
      </Card>

      <Card>
        <CardTitle className="mb-4">{content.sectionB.title}</CardTitle>
        <ol className="list-decimal space-y-2 pl-5">
          {content.sectionB.questions.map((q, i) => (
            <li key={i} className="text-sm">{q}</li>
          ))}
        </ol>
      </Card>

      <Card>
        <CardTitle className="mb-4">{content.sectionC.title}</CardTitle>
        <ol className="list-decimal space-y-3 pl-5">
          {content.sectionC.questions.map((q, i) => (
            <li key={i}>{q}</li>
          ))}
        </ol>
      </Card>

      <Card>
        <CardTitle className="mb-4">{content.sectionD.title}</CardTitle>
        <div className="grid gap-3 sm:grid-cols-2">
          {content.sectionD.topics.map((t, i) => (
            <div key={i} className="rounded-xl border border-[var(--card-border)] p-3">
              <div className="flex items-center justify-between">
                <span className="font-medium">{t.topic}</span>
                <span className={`rounded-full px-2 py-0.5 text-xs ${
                  t.probability === "high" ? "bg-emerald-500/20 text-emerald-400" :
                  t.probability === "medium" ? "bg-amber-500/20 text-amber-400" :
                  "bg-slate-500/20 text-slate-400"
                }`}>
                  {t.probability}
                </span>
              </div>
              <p className="mt-1 text-sm text-[var(--muted)]">{t.notes}</p>
            </div>
          ))}
        </div>
      </Card>

      <Card>
        <CardTitle className="mb-4">{content.sectionE.title}</CardTitle>
        <ul className="space-y-2">
          {content.sectionE.tips.map((tip, i) => (
            <li key={i} className="flex gap-2 text-sm">
              <span className="text-indigo-500">💡</span> {tip}
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}
