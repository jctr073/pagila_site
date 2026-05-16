"use client";

import { useState } from "react";
import {
  Avatar,
  Btn,
  CategoryChip,
  Check,
  Chip,
  Icon,
  Input,
  MiniBars,
  Rating,
  Sparkline,
  StockBar,
  type RatingValue,
} from "@/components/ui";

const SECTION: React.CSSProperties = {
  padding: 18,
  border: "1px solid var(--border)",
  borderRadius: 12,
  background: "var(--surface)",
  display: "flex",
  flexDirection: "column",
  gap: 12,
};

const ROW: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  flexWrap: "wrap",
  gap: 10,
};

const H2: React.CSSProperties = {
  fontSize: 11,
  fontWeight: 700,
  letterSpacing: "0.06em",
  textTransform: "uppercase",
  color: "var(--text-muted)",
  margin: 0,
};

const RATINGS: RatingValue[] = ["G", "PG", "PG-13", "R", "NC-17"];
const CATEGORIES = [
  "Action",
  "Animation",
  "Children",
  "Classics",
  "Comedy",
  "Documentary",
  "Drama",
  "Family",
  "Foreign",
  "Games",
  "Horror",
  "Music",
  "New",
  "Sci-Fi",
  "Sports",
  "Travel",
];

const SPARK = [3, 5, 4, 6, 8, 7, 9, 6, 10, 11, 9, 12, 14, 13];
const BARS = [4, 6, 5, 8, 7, 10, 12];

export default function SandboxPage() {
  const [check1, setCheck1] = useState(false);
  const [check2, setCheck2] = useState(true);
  const [headerCheck, setHeaderCheck] = useState(false);
  const [search, setSearch] = useState("");

  return (
    <main
      style={{
        padding: 32,
        maxWidth: 1200,
        margin: "0 auto",
        display: "flex",
        flexDirection: "column",
        gap: 18,
      }}
    >
      <header style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        <h1
          style={{
            fontSize: 22,
            fontWeight: 700,
            letterSpacing: "-0.018em",
            margin: 0,
          }}
        >
          Component sandbox
        </h1>
        <p style={{ color: "var(--text-muted)", margin: 0, fontSize: 13 }}>
          Visual smoke test for Phase 2 UI primitives.
        </p>
      </header>

      {/* Btn */}
      <section style={SECTION}>
        <h2 style={H2}>Btn</h2>
        <div style={ROW}>
          <Btn>Default</Btn>
          <Btn variant="primary">Primary</Btn>
          <Btn variant="ghost">Ghost</Btn>
          <Btn variant="danger-ghost" leftIcon="trash">
            Delete
          </Btn>
        </div>
        <div style={ROW}>
          <Btn size="sm">Small</Btn>
          <Btn size="sm" variant="primary" leftIcon="plus">
            New film
          </Btn>
          <Btn size="lg" variant="primary">
            Large primary
          </Btn>
          <Btn iconOnly aria-label="more">
            <Icon name="more-horiz" size={14} />
          </Btn>
          <Btn iconOnly size="sm" variant="ghost" aria-label="settings">
            <Icon name="settings" size={12} />
          </Btn>
          <Btn leftIcon="download" variant="ghost">
            Export
          </Btn>
          <Btn rightIcon="chevron-down" size="sm" variant="ghost">
            25
          </Btn>
        </div>
      </section>

      {/* Input */}
      <section style={SECTION}>
        <h2 style={H2}>Input</h2>
        <div style={ROW}>
          <Input
            leftIcon="search"
            placeholder="Search films…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            wrapStyle={{ width: 280 }}
          />
          <Input
            leftIcon="search"
            placeholder="Quick find"
            size="sm"
            kbd="⌘K"
            wrapStyle={{ width: 220 }}
          />
          <Input placeholder="No icon" size="sm" wrapStyle={{ width: 160 }} />
        </div>
      </section>

      {/* Chip / Rating / CategoryChip */}
      <section style={SECTION}>
        <h2 style={H2}>Chip — tones</h2>
        <div style={ROW}>
          <Chip>Default</Chip>
          <Chip tone="solid">Solid</Chip>
          <Chip tone="teal">Teal</Chip>
          <Chip tone="success" dot>
            Active
          </Chip>
          <Chip tone="warning" dot>
            Low stock
          </Chip>
          <Chip tone="danger" dot>
            Critical
          </Chip>
          <Chip tone="violet">Violet</Chip>
        </div>
        <h2 style={H2}>Rating</h2>
        <div style={ROW}>
          {RATINGS.map((r) => (
            <Rating key={r} value={r} />
          ))}
        </div>
        <h2 style={H2}>CategoryChip</h2>
        <div style={ROW}>
          {CATEGORIES.map((c) => (
            <CategoryChip key={c} value={c} />
          ))}
        </div>
      </section>

      {/* Avatar */}
      <section style={SECTION}>
        <h2 style={H2}>Avatar</h2>
        <div style={ROW}>
          <Avatar initials="JC" />
          <Avatar initials="MK" tone="accent" />
          <Avatar initials="SR" tone="teal" />
          <Avatar initials="LV" tone="violet" />
          <Avatar initials="EG" tone="success" />
          <Avatar name="Jane Doe" tone="accent" size={36} />
          <Avatar name="A" size={20} />
        </div>
      </section>

      {/* Check */}
      <section style={SECTION}>
        <h2 style={H2}>Check (tri-state)</h2>
        <div style={ROW}>
          <label style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
            <Check
              checked={check1}
              onChange={setCheck1}
              ariaLabel="Toggle 1"
            />
            <span style={{ fontSize: 13 }}>Toggleable (off → on)</span>
          </label>
          <label style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
            <Check
              checked={check2}
              onChange={setCheck2}
              ariaLabel="Toggle 2"
            />
            <span style={{ fontSize: 13 }}>Default-on</span>
          </label>
          <label style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
            <Check
              mixed
              checked={headerCheck}
              onChange={setHeaderCheck}
              ariaLabel="Mixed"
            />
            <span style={{ fontSize: 13 }}>Mixed (header)</span>
          </label>
        </div>
      </section>

      {/* Sparkline / MiniBars / StockBar */}
      <section style={SECTION}>
        <h2 style={H2}>Sparkline</h2>
        <div style={ROW}>
          <Sparkline data={SPARK} />
          <Sparkline data={SPARK} color="var(--success)" />
          <Sparkline data={SPARK} color="var(--teal)" width={140} height={36} />
          <Sparkline data={SPARK} showDot={false} fill={false} />
        </div>
        <h2 style={H2}>MiniBars</h2>
        <div style={ROW}>
          <MiniBars data={BARS} />
          <MiniBars data={BARS} color="var(--teal)" width={160} height={40} />
        </div>
        <h2 style={H2}>StockBar</h2>
        <div style={{ ...ROW, gap: 18 }}>
          <StockBar count={8} />
          <StockBar count={5} />
          <StockBar count={2} />
          <StockBar count={12} max={20} />
        </div>
      </section>

      {/* Icon sample row */}
      <section style={SECTION}>
        <h2 style={H2}>Icon sample</h2>
        <div style={{ ...ROW, color: "var(--text-muted)" }}>
          {(
            [
              "search",
              "bell",
              "plus",
              "x",
              "check",
              "chevron-down",
              "chevron-right",
              "film",
              "store",
              "users",
              "home",
              "settings",
              "more-horiz",
              "eye",
              "edit",
              "trash",
              "duplicate",
              "archive",
              "download",
              "upload",
              "filter",
              "sort",
              "sun",
              "moon",
            ] as const
          ).map((n) => (
            <span
              key={n}
              title={n}
              style={{ display: "inline-flex", padding: 4 }}
            >
              <Icon name={n} size={16} />
            </span>
          ))}
        </div>
      </section>
    </main>
  );
}
