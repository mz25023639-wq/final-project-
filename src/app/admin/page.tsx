"use client";

import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/dashboard-layout";
import { Card, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input, Textarea } from "@/components/ui/input";
import { Users, Building2, BarChart3, FileText } from "lucide-react";

type Tab = "analytics" | "users" | "universities" | "prompts";

export default function AdminPage() {
  const [tab, setTab] = useState<Tab>("analytics");
  const [analytics, setAnalytics] = useState<Record<string, unknown>>({});
  const [users, setUsers] = useState<Array<Record<string, unknown>>>([]);
  const [universities, setUniversities] = useState<Array<Record<string, unknown>>>([]);
  const [prompts, setPrompts] = useState<Array<Record<string, unknown>>>([]);
  const [newUni, setNewUni] = useState({ name: "", city: "" });

  useEffect(() => {
    if (tab === "analytics") {
      fetch("/api/admin/analytics").then((r) => r.json()).then(setAnalytics);
    } else if (tab === "users") {
      fetch("/api/admin/users").then((r) => r.json()).then(setUsers);
    } else if (tab === "universities") {
      fetch("/api/admin/universities").then((r) => r.json()).then(setUniversities);
    } else if (tab === "prompts") {
      fetch("/api/admin/prompts").then((r) => r.json()).then(setPrompts);
    }
  }, [tab]);

  const tabs = [
    { id: "analytics" as Tab, label: "Analytics", icon: BarChart3 },
    { id: "users" as Tab, label: "Users", icon: Users },
    { id: "universities" as Tab, label: "Universities", icon: Building2 },
    { id: "prompts" as Tab, label: "AI Prompts", icon: FileText },
  ];

  const addUniversity = async () => {
    await fetch("/api/admin/universities", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newUni),
    });
    setNewUni({ name: "", city: "" });
    fetch("/api/admin/universities").then((r) => r.json()).then(setUniversities);
  };

  const toggleSuspend = async (id: string, isSuspended: boolean) => {
    await fetch("/api/admin/users", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, isSuspended: !isSuspended }),
    });
    fetch("/api/admin/users").then((r) => r.json()).then(setUsers);
  };

  const updatePrompt = async (id: string, template: string) => {
    await fetch("/api/admin/prompts", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, template }),
    });
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Admin Panel</h1>

        <div className="flex flex-wrap gap-2">
          {tabs.map((t) => (
            <Button
              key={t.id}
              variant={tab === t.id ? "default" : "outline"}
              size="sm"
              onClick={() => setTab(t.id)}
            >
              <t.icon className="h-4 w-4" />
              {t.label}
            </Button>
          ))}
        </div>

        {tab === "analytics" && (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardDescription>Total Users</CardDescription>
              <p className="text-3xl font-bold">{String(analytics.totalUsers ?? 0)}</p>
            </Card>
            <Card>
              <CardDescription>Active Users</CardDescription>
              <p className="text-3xl font-bold">{String(analytics.activeUsers ?? 0)}</p>
            </Card>
            <Card>
              <CardDescription>Total Papers</CardDescription>
              <p className="text-3xl font-bold">{String(analytics.totalPapers ?? 0)}</p>
            </Card>
            <Card className="sm:col-span-2">
              <CardTitle className="mb-4">Top Universities</CardTitle>
              {(analytics.topUniversities as Array<{ name: string; count: number }>)?.map((u, i) => (
                <p key={i} className="text-sm">{u.name}: {u.count} papers</p>
              ))}
            </Card>
            <Card>
              <CardTitle className="mb-4">Top Courses</CardTitle>
              {(analytics.topCourses as Array<{ name: string; count: number }>)?.map((c, i) => (
                <p key={i} className="text-sm">{c.name}: {c.count} papers</p>
              ))}
            </Card>
          </div>
        )}

        {tab === "users" && (
          <div className="space-y-3">
            {users.map((user) => (
              <Card key={String(user.id)} className="flex flex-wrap items-center justify-between gap-4 !p-4">
                <div>
                  <CardTitle className="text-base">{String(user.fullName)}</CardTitle>
                  <p className="text-xs text-[var(--muted)]">
                    {String(user.email)} · {String(user.role)} · {String(user._count ? (user._count as { papers: number }).papers : 0)} papers
                  </p>
                </div>
                <Button
                  variant={user.isSuspended ? "default" : "danger"}
                  size="sm"
                  onClick={() => toggleSuspend(String(user.id), Boolean(user.isSuspended))}
                >
                  {user.isSuspended ? "Unsuspend" : "Suspend"}
                </Button>
              </Card>
            ))}
          </div>
        )}

        {tab === "universities" && (
          <div className="space-y-6">
            <Card>
              <CardTitle className="mb-4">Add University</CardTitle>
              <div className="flex flex-wrap gap-4">
                <Input placeholder="University name" value={newUni.name} onChange={(e) => setNewUni({ ...newUni, name: e.target.value })} />
                <Input placeholder="City" value={newUni.city} onChange={(e) => setNewUni({ ...newUni, city: e.target.value })} />
                <Button onClick={addUniversity}>Add</Button>
              </div>
            </Card>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {universities.slice(0, 30).map((uni) => (
                <Card key={String(uni.id)} className="!p-4">
                  <CardTitle className="text-sm">{String(uni.name)}</CardTitle>
                  <p className="text-xs text-[var(--muted)]">
                    {String(uni.city)} · {String((uni._count as { courses: number })?.courses ?? 0)} courses
                  </p>
                </Card>
              ))}
            </div>
            <p className="text-sm text-[var(--muted)]">Showing 30 of {universities.length} universities</p>
          </div>
        )}

        {tab === "prompts" && (
          <div className="space-y-4">
            {prompts.map((prompt) => (
              <Card key={String(prompt.id)}>
                <CardTitle className="mb-4">{String(prompt.name)} AI Prompt</CardTitle>
                <Textarea
                  defaultValue={String(prompt.template)}
                  rows={10}
                  onBlur={(e) => updatePrompt(String(prompt.id), e.target.value)}
                />
                <p className="mt-2 text-xs text-[var(--muted)]">Changes save on blur</p>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
