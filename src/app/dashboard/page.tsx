"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { DashboardLayout } from "@/components/dashboard-layout";
import { Card, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { FileText, Bookmark, Bell, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

export default function DashboardPage() {
  const { data: session } = useSession();
  const [stats, setStats] = useState({ papers: 0, saved: 0, notifications: 0 });
  const [recent, setRecent] = useState<Array<{ id: string; title: string; createdAt: string }>>([]);

  useEffect(() => {
    fetch("/api/users/profile")
      .then((r) => r.json())
      .then((data) => {
        if (data._count) {
          setStats({
            papers: data._count.papers,
            saved: data._count.savedPapers,
            notifications: data._count.notifications,
          });
        }
      });

    fetch("/api/papers")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setRecent(data.slice(0, 5));
      });
  }, []);

  return (
    <DashboardLayout>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold">
            Welcome back, {session?.user?.name?.split(" ")[0]}! 👋
          </h1>
          <p className="mt-1 text-[var(--muted)]">
            Generate AI-powered guess papers for your university courses.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { label: "Papers Generated", value: stats.papers, icon: FileText, color: "text-indigo-500" },
            { label: "Saved Papers", value: stats.saved, icon: Bookmark, color: "text-cyan-400" },
            { label: "Notifications", value: stats.notifications, icon: Bell, color: "text-amber-400" },
            { label: "AI Status", value: "Ready", icon: Sparkles, color: "text-emerald-400" },
          ].map((stat) => (
            <Card key={stat.label}>
              <div className="flex items-center justify-between">
                <div>
                  <CardDescription>{stat.label}</CardDescription>
                  <p className="mt-1 text-2xl font-bold">{stat.value}</p>
                </div>
                <stat.icon className={`h-8 w-8 ${stat.color}`} />
              </div>
            </Card>
          ))}
        </div>

        <Card>
          <CardTitle className="mb-2">Quick Generate</CardTitle>
          <CardDescription className="mb-4">
            Select your university and course to generate a complete guess paper instantly.
          </CardDescription>
          <Link href="/generate">
            <Button>
              <Sparkles className="h-4 w-4" />
              Generate Guess Paper
            </Button>
          </Link>
        </Card>

        <Card>
          <CardTitle className="mb-4">Recent Activity</CardTitle>
          {recent.length === 0 ? (
            <p className="text-[var(--muted)]">No papers generated yet. Start now!</p>
          ) : (
            <div className="space-y-3">
              {recent.map((paper) => (
                <div
                  key={paper.id}
                  className="flex items-center justify-between rounded-xl border border-[var(--card-border)] p-4"
                >
                  <div>
                    <p className="font-medium">{paper.title}</p>
                    <p className="text-xs text-[var(--muted)]">
                      {new Date(paper.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <Link href={`/history?id=${paper.id}`}>
                    <Button variant="ghost" size="sm">View</Button>
                  </Link>
                </div>
              ))}
            </div>
          )}
        </Card>
      </motion.div>
    </DashboardLayout>
  );
}
