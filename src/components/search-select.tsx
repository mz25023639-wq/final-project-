"use client";

import { useState, useEffect } from "react";
import { Input } from "./ui/input";
import { cn } from "@/lib/utils";
import { Search, ChevronDown, Check } from "lucide-react";

interface Option {
  id: string;
  name: string;
  subtitle?: string;
}

interface SearchSelectProps {
  options: Option[];
  value: string;
  onChange: (id: string) => void;
  placeholder: string;
  disabled?: boolean;
  onSearch?: (query: string) => void;
}

export function SearchSelect({
  options,
  value,
  onChange,
  placeholder,
  disabled,
  onSearch,
}: SearchSelectProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const selected = options.find((o) => o.id === value);

  useEffect(() => {
    const timer = setTimeout(() => onSearch?.(search), 300);
    return () => clearTimeout(timer);
  }, [search, onSearch]);

  const filtered = options.filter((o) =>
    o.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="relative">
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen(!open)}
        className={cn(
          "flex h-11 w-full items-center justify-between rounded-xl border border-[var(--card-border)] bg-[var(--card)] px-4 text-sm backdrop-blur-sm transition-colors",
          disabled && "opacity-50 cursor-not-allowed"
        )}
      >
        <span className={selected ? "" : "text-[var(--muted)]"}>
          {selected ? selected.name : placeholder}
        </span>
        <ChevronDown className="h-4 w-4 text-[var(--muted)]" />
      </button>

      {open && !disabled && (
        <div className="absolute z-50 mt-2 w-full rounded-xl border border-[var(--card-border)] bg-[var(--background)] shadow-2xl">
          <div className="p-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--muted)]" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search..."
                className="pl-9"
              />
            </div>
          </div>
          <div className="max-h-60 overflow-y-auto p-1">
            {filtered.length === 0 ? (
              <p className="p-3 text-center text-sm text-[var(--muted)]">No results</p>
            ) : (
              filtered.map((option) => (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => {
                    onChange(option.id);
                    setOpen(false);
                    setSearch("");
                  }}
                  className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm hover:bg-[var(--card)]"
                >
                  <div className="text-left">
                    <div>{option.name}</div>
                    {option.subtitle && (
                      <div className="text-xs text-[var(--muted)]">{option.subtitle}</div>
                    )}
                  </div>
                  {value === option.id && <Check className="h-4 w-4 text-indigo-500" />}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
