"use client";

import { useCallback, useEffect, useState } from "react";
import { DashboardLayout } from "@/components/dashboard-layout";
import { Card, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SearchSelect } from "@/components/search-select";
import { PaperViewer } from "@/components/paper-viewer";
import { Sparkles, Loader2 } from "lucide-react";
import type { GuessPaperContent } from "@/types";
import { motion } from "framer-motion";

interface University {
  id: string;
  name: string;
  city?: string;
}

interface Course {
  id: string;
  name: string;
}

export default function GeneratePage() {
  const [universities, setUniversities] = useState<University[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [universityId, setUniversityId] = useState("");
  const [courseId, setCourseId] = useState("");
  const [loading, setLoading] = useState(false);
  const [paper, setPaper] = useState<{
    id: string;
    title: string;
    content: GuessPaperContent;
  } | null>(null);
  const [isSaved, setIsSaved] = useState(false);

  const fetchUniversities = useCallback((search = "") => {
    fetch(`/api/universities?search=${encodeURIComponent(search)}`)
      .then((r) => r.json())
      .then((data) => Array.isArray(data) && setUniversities(data));
  }, []);

  const fetchCourses = useCallback(
    (search = "") => {
      if (!universityId) return;
      fetch(`/api/courses?universityId=${universityId}&search=${encodeURIComponent(search)}`)
        .then((r) => r.json())
        .then((data) => Array.isArray(data) && setCourses(data));
    },
    [universityId]
  );

  useEffect(() => {
    fetchUniversities();
  }, [fetchUniversities]);

  useEffect(() => {
    setCourseId("");
    setCourses([]);
    if (universityId) fetchCourses();
  }, [universityId, fetchCourses]);

  const handleGenerate = async () => {
    if (!universityId || !courseId) return;
    setLoading(true);
    setPaper(null);

    const res = await fetch("/api/papers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ universityId, courseId }),
    });

    const data = await res.json();
    if (res.ok) {
      setPaper({ id: data.id, title: data.title, content: data.content });
      setIsSaved(false);
    }
    setLoading(false);
  };

  const handleSave = async () => {
    if (!paper) return;
    await fetch("/api/papers/save", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ paperId: paper.id }),
    });
    setIsSaved(true);
  };

  return (
    <DashboardLayout>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold">Generate Guess Paper</h1>
          <p className="mt-1 text-[var(--muted)]">
            Select university and course to generate your AI-powered guess paper.
          </p>
        </div>

        <Card>
          <CardTitle className="mb-2">Select University & Course</CardTitle>
          <CardDescription className="mb-6">
            100+ universities and 40+ courses available per university.
          </CardDescription>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium text-[var(--muted)]">
                University
              </label>
              <SearchSelect
                options={universities.map((u) => ({
                  id: u.id,
                  name: u.name,
                  subtitle: u.city,
                }))}
                value={universityId}
                onChange={setUniversityId}
                placeholder="Search universities..."
                onSearch={fetchUniversities}
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-[var(--muted)]">
                Course
              </label>
              <SearchSelect
                options={courses.map((c) => ({ id: c.id, name: c.name }))}
                value={courseId}
                onChange={setCourseId}
                placeholder="Select course..."
                disabled={!universityId}
                onSearch={fetchCourses}
              />
            </div>
          </div>

          <Button
            className="mt-6"
            onClick={handleGenerate}
            disabled={!universityId || !courseId || loading}
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                Generate Guess Paper
              </>
            )}
          </Button>
        </Card>

        {loading && (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="skeleton h-32 rounded-2xl" />
            ))}
          </div>
        )}

        {paper && !loading && (
          <PaperViewer
            title={paper.title}
            content={paper.content}
            paperId={paper.id}
            onSave={handleSave}
            onRegenerate={handleGenerate}
            isSaved={isSaved}
          />
        )}
      </motion.div>
    </DashboardLayout>
  );
}
