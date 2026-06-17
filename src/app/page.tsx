"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import {
  Brain,
  FileText,
  GraduationCap,
  Sparkles,
  Zap,
  Download,
  Shield,
} from "lucide-react";

const features = [
  {
    icon: Brain,
    title: "AI-Powered Generation",
    desc: "Smart analysis of curriculum, exam patterns, and frequently asked topics.",
  },
  {
    icon: GraduationCap,
    title: "100+ Universities",
    desc: "NUST, COMSATS, FAST, UET, Punjab University, and many more.",
  },
  {
    icon: FileText,
    title: "Complete Guess Papers",
    desc: "30 MCQs, 20 short questions, 10 long questions, topics & study tips.",
  },
  {
    icon: Download,
    title: "Export & Save",
    desc: "Download, print, save papers and access your history anytime.",
  },
  {
    icon: Zap,
    title: "Instant Results",
    desc: "Generate comprehensive guess papers in seconds.",
  },
  {
    icon: Shield,
    title: "Secure & Private",
    desc: "Your data is encrypted and protected with industry-standard security.",
  },
];

export default function LandingPage() {
  return (
    <div className="gradient-bg min-h-screen">
      <nav className="fixed top-0 z-50 w-full border-b border-[var(--card-border)] bg-[var(--background)]/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <Link href="/" className="text-xl font-bold">
            <span className="bg-gradient-to-r from-indigo-500 to-cyan-400 bg-clip-text text-transparent">
              GuessPaper AI
            </span>
          </Link>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Link href="/login">
              <Button variant="ghost">Login</Button>
            </Link>
            <Link href="/signup">
              <Button>Sign Up</Button>
            </Link>
          </div>
        </div>
      </nav>

      <section className="relative px-6 pb-20 pt-32">
        <div className="mx-auto max-w-7xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-4 py-2 text-sm text-indigo-400">
              <Sparkles className="h-4 w-4" />
              AI-Powered Exam Preparation
            </div>
            <h1 className="mb-6 text-5xl font-bold tracking-tight md:text-7xl">
              Generate Smart
              <br />
              <span className="bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-400 bg-clip-text text-transparent">
                Guess Papers
              </span>
            </h1>
            <p className="mx-auto mb-10 max-w-2xl text-lg text-[var(--muted)]">
              Select your university and course. Get AI-generated guess papers with MCQs,
              short & long questions, important topics, and study tips — instantly.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Link href="/signup">
                <Button size="lg">Get Started Free</Button>
              </Link>
              <Link href="/login">
                <Button size="lg" variant="outline">
                  Login to Dashboard
                </Button>
              </Link>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="mx-auto mt-16 max-w-4xl"
          >
            <div className="glass rounded-3xl p-8">
              <div className="grid gap-4 text-left md:grid-cols-3">
                <div className="rounded-2xl border border-[var(--card-border)] p-4">
                  <p className="text-3xl font-bold text-indigo-500">30</p>
                  <p className="text-sm text-[var(--muted)]">MCQs per paper</p>
                </div>
                <div className="rounded-2xl border border-[var(--card-border)] p-4">
                  <p className="text-3xl font-bold text-cyan-400">100+</p>
                  <p className="text-sm text-[var(--muted)]">Universities</p>
                </div>
                <div className="rounded-2xl border border-[var(--card-border)] p-4">
                  <p className="text-3xl font-bold text-purple-400">40+</p>
                  <p className="text-sm text-[var(--muted)]">Courses each</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="px-6 py-20">
        <div className="mx-auto max-w-7xl">
          <h2 className="mb-12 text-center text-3xl font-bold">Why GuessPaper AI?</h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                viewport={{ once: true }}
                className="glass rounded-2xl p-6 transition-transform hover:scale-[1.02]"
              >
                <f.icon className="mb-4 h-10 w-10 text-indigo-500" />
                <h3 className="mb-2 text-lg font-semibold">{f.title}</h3>
                <p className="text-sm text-[var(--muted)]">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-6 py-20">
        <div className="mx-auto max-w-3xl text-center">
          <div className="glass rounded-3xl p-12">
            <h2 className="mb-4 text-3xl font-bold">Ready to ace your exams?</h2>
            <p className="mb-8 text-[var(--muted)]">
              Join thousands of students preparing smarter with AI-generated guess papers.
            </p>
            <Link href="/signup">
              <Button size="lg">Create Free Account</Button>
            </Link>
          </div>
        </div>
      </section>

      <footer className="border-t border-[var(--card-border)] px-6 py-8 text-center text-sm text-[var(--muted)]">
        © 2026 GuessPaper AI. AI-assisted study tool — not official exam material.
      </footer>
    </div>
  );
}
