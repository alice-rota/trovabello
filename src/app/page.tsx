"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { STATUS_LABEL, CATERER_LABEL, eur } from "@/lib/format";
import {
  CATEGORIES,
  CATEGORY_LABEL,
  CATEGORY_GROUPS,
  isVenueLike,
  type CategoryKey,
} from "@/lib/categories";

type Venue = {
  id: string;
  name: string;
  category: CategoryKey;
  website: string | null;
  country: "FR" | "IT";
  region: string | null;
  status: keyof typeof STATUS_LABEL;
  price: number | null;
  contactName: string | null;
  contactEmail: string | null;
  contactPhone: string | null;
  photoUrl: string | null;
  capacitySeated: number | null;
  capacityStanding: number | null;
  beds: number | null;
  priceVenue: number | null;
  pricePerNightPerGuest: number | null;
  catererType: keyof typeof CATERER_LABEL;
  catererPricePerGuest: number | null;
  minSpend: number | null;
  availabilityNotes: string | null;
  exclusivity: boolean | null;
  notes: string | null;
  isFavorite: boolean;
  comments: Comment[];
  emails?: Email[];
};

type Comment = {
  id: string;
  body: string;
  author: string | null;
  createdAt: string;
};

type Email = {
  id: string;
  direction: "OUTBOUND" | "INBOUND";
  subject: string | null;
  body: string | null;
  fromAddr: string | null;
  toAddr: string | null;
  createdAt: string;
};

export default function Home() {
  const [venues, setVenues] = useState<Venue[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCat, setActiveCat] = useState<CategoryKey | "ALL">("ALL");
  const [favOnly, setFavOnly] = useState(false);
  const [openId, setOpenId] = useState<string | null>(null);

  async function load() {
    try {
      const r = await fetch("/api/venues");
      const data = await r.json();
      setVenues(Array.isArray(data) ? data : []);
    } catch {
      setVenues([]);
    }
    setLoading(false);
  }
  const isDemo = venues.some((v) => v.id.startsWith("demo-"));

  useEffect(() => {
    load();
  }, []);

  // Catégories présentes dans les données (pour les onglets)
  const presentCats = useMemo(() => {
    const counts = new Map<string, number>();
    for (const v of venues) counts.set(v.category, (counts.get(v.category) ?? 0) + 1);
    return CATEGORIES.filter((c) => counts.has(c.key)).map((c) => ({
      ...c,
      count: counts.get(c.key)!,
    }));
  }, [venues]);

  const list = useMemo(() => {
    let l = venues;
    if (activeCat !== "ALL") l = l.filter((v) => v.category === activeCat);
    if (favOnly) l = l.filter((v) => v.isFavorite);
    return [...l].sort((a, b) => (a.price ?? Infinity) - (b.price ?? Infinity));
  }, [venues, activeCat, favOnly]);

  const favCount = useMemo(
    () => venues.filter((v) => v.isFavorite).length,
    [venues],
  );

  // Budget retenu = somme des prix des favoris
  const budget = useMemo(() => {
    const favs = venues.filter((v) => v.isFavorite);
    const total = favs.reduce((s, v) => s + (v.price ?? 0), 0);
    const withPrice = favs.filter((v) => v.price != null).length;
    return { total, count: favs.length, withPrice };
  }, [venues]);

  async function toggleFav(id: string, next: boolean) {
    setVenues((vs) => vs.map((v) => (v.id === id ? { ...v, isFavorite: next } : v)));
    await fetch(`/api/venues/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isFavorite: next }),
    }).catch(() => {});
  }

  return (
    <div className="min-h-screen">
      <header className="relative">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 pt-6 text-center">
          <span className="font-hand text-wine text-lg sm:text-xl tracking-wide">
            Trovabello
          </span>
        </div>
        <div className="mx-auto max-w-3xl px-4 pt-4 pb-8 sm:pb-10 text-center relative">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/illustrations/cherry-coupe.png"
            alt=""
            aria-hidden
            className="hidden sm:block absolute left-2 top-10 w-20 -scale-x-100 select-none"
          />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/illustrations/cherry-coupe.png"
            alt=""
            aria-hidden
            className="hidden sm:block absolute right-2 top-10 w-20 select-none"
          />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/illustrations/couple-cake.png"
            alt="Les mariés trinquant sur la pièce montée"
            className="mx-auto w-44 sm:w-56 select-none"
          />
          <p className="mt-4 text-[11px] uppercase tracking-[0.45em] text-wine/70">
            Le mariage de
          </p>
          <h1 className="mt-2 font-hand uppercase text-wine text-5xl sm:text-7xl leading-none flex items-center justify-center gap-3 sm:gap-4 flex-wrap">
            <span>Nicole</span>
            <span className="text-4xl sm:text-6xl">et</span>
            <span>Tom</span>
          </h1>
          <p className="mt-4 text-sm sm:text-base text-ink/60">
            Votre planner de mariage : lieu, traiteur, photographe, fleuriste,
            DJ… Ajoutez chaque prestataire, comparez, et bâtissez votre budget.
          </p>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 sm:px-6 py-6 sm:py-8 space-y-6">
        {isDemo && (
          <div className="rounded-xl border border-wine/30 bg-wine/5 px-4 py-3 text-sm text-ink/70">
            <strong className="text-wine">Mode démo</strong> : aperçu avec des
            fiches d’exemple.
          </div>
        )}

        <AddForm
          defaultCategory={activeCat === "ALL" ? "LIEU" : activeCat}
          onAdded={load}
        />

        <BudgetSummary budget={budget} />

        {/* Onglets catégories */}
        <CategoryTabs
          present={presentCats}
          total={venues.length}
          active={activeCat}
          onChange={setActiveCat}
          favOnly={favOnly}
          favCount={favCount}
          onToggleFav={() => setFavOnly((f) => !f)}
        />

        {loading ? (
          <p className="text-ink/40">Chargement…</p>
        ) : venues.length === 0 ? (
          <div className="text-center py-10">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/illustrations/banquet-table.png"
              alt=""
              aria-hidden
              className="mx-auto w-72 sm:w-96 opacity-80 select-none"
            />
            <p className="text-ink/40 mt-4">
              Rien pour l’instant. Ajoutez votre premier élément ci-dessus.
            </p>
          </div>
        ) : list.length === 0 ? (
          <p className="text-ink/40 text-center py-10">
            Aucun élément dans cette sélection.
          </p>
        ) : (
          <div className="grid gap-4 sm:gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {list.map((v) => (
              <VenueCard
                key={v.id}
                v={v}
                onToggleFav={toggleFav}
                onOpen={() => setOpenId(v.id)}
              />
            ))}
          </div>
        )}
      </main>

      {openId && (
        <VenueModal
          id={openId}
          onClose={() => setOpenId(null)}
          onChanged={load}
          onToggleFav={toggleFav}
        />
      )}
    </div>
  );
}

function BudgetSummary({
  budget,
}: {
  budget: { total: number; count: number; withPrice: number };
}) {
  return (
    <div className="rounded-2xl border border-ink/15 bg-paper-soft/40 px-5 py-4 flex items-center justify-between gap-4">
      <div>
        <p className="text-xs uppercase tracking-wide text-ink/40">
          Budget retenu (favoris ★)
        </p>
        <p className="text-2xl sm:text-3xl font-semibold text-wine mt-0.5">
          {eur(budget.total)}
        </p>
      </div>
      <p className="text-sm text-ink/50 text-right max-w-[12rem]">
        {budget.count === 0
          ? "Mettez vos coups de cœur en favori ★ pour bâtir le budget."
          : `${budget.count} prestataire${budget.count > 1 ? "s" : ""} retenu${budget.count > 1 ? "s" : ""}`}
      </p>
    </div>
  );
}

function CategoryTabs({
  present,
  total,
  active,
  onChange,
  favOnly,
  favCount,
  onToggleFav,
}: {
  present: { key: CategoryKey; plural: string; count: number }[];
  total: number;
  active: CategoryKey | "ALL";
  onChange: (c: CategoryKey | "ALL") => void;
  favOnly: boolean;
  favCount: number;
  onToggleFav: () => void;
}) {
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 overflow-x-auto">
        <div className="flex gap-2 w-max pb-1">
          <Tab active={active === "ALL"} onClick={() => onChange("ALL")}>
            Tous <span className="opacity-60">({total})</span>
          </Tab>
          {present.map((c) => (
            <Tab
              key={c.key}
              active={active === c.key}
              onClick={() => onChange(c.key)}
            >
              {c.plural} <span className="opacity-60">({c.count})</span>
            </Tab>
          ))}
        </div>
      </div>
      <button
        onClick={onToggleFav}
        className={`shrink-0 flex items-center gap-1 px-3 py-1.5 rounded-full border text-sm transition ${
          favOnly
            ? "border-wine bg-wine/10 text-wine"
            : "border-ink/15 text-ink/50 hover:bg-paper-soft"
        }`}
        title="N'afficher que les favoris"
      >
        <span>{favOnly ? "★" : "☆"}</span>
        {favCount > 0 && <span>{favCount}</span>}
      </button>
    </div>
  );
}

function Tab({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`whitespace-nowrap px-3.5 py-1.5 rounded-full border text-sm transition ${
        active
          ? "bg-ink text-paper border-ink"
          : "border-ink/15 text-ink/60 hover:bg-paper-soft"
      }`}
    >
      {children}
    </button>
  );
}

function AddForm({
  defaultCategory,
  onAdded,
}: {
  defaultCategory: CategoryKey;
  onAdded: () => void;
}) {
  const groupOf = (cat: string) =>
    CATEGORIES.find((c) => c.key === cat)?.group ?? CATEGORY_GROUPS[0];
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [group, setGroup] = useState<string>(groupOf(defaultCategory));
  const [f, setF] = useState({
    name: "",
    category: defaultCategory as string,
    website: "",
    country: "FR",
    contactName: "",
    contactEmail: "",
    contactPhone: "",
  });

  // Suit l'onglet actif tant qu'on n'a pas ouvert le formulaire
  useEffect(() => {
    if (!open) {
      setF((s) => ({ ...s, category: defaultCategory }));
      setGroup(groupOf(defaultCategory));
    }
  }, [defaultCategory, open]);

  function pickGroup(g: string) {
    setGroup(g);
    const first = CATEGORIES.find((c) => c.group === g);
    if (first) setF((s) => ({ ...s, category: first.key }));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!f.name.trim()) return;
    setBusy(true);
    setMsg("Création + recherche des infos…");
    const r = await fetch("/api/venues", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(f),
    });
    const data = await r.json();
    setBusy(false);
    if (!r.ok) {
      setMsg(data.error ?? "Erreur");
      return;
    }
    if (data.warning) setMsg(`Fiche créée. ${data.warning}`);
    else if (data.missing?.length)
      setMsg(`Fiche enrichie — ${data.missing.length} info(s) à demander.`);
    else setMsg("Fiche complète.");
    setF({
      name: "",
      category: f.category,
      website: "",
      country: f.country,
      contactName: "",
      contactEmail: "",
      contactPhone: "",
    });
    onAdded();
  }

  return (
    <section className="rounded-xl border border-ink/20">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between px-5 sm:px-6 py-4"
      >
        <span className="text-base font-hand text-ink">
          + Ajouter au planning
        </span>
        <span className="text-ink/40 text-xl leading-none">
          {open ? "−" : "+"}
        </span>
      </button>
      {open && (
        <form onSubmit={submit} className="px-5 sm:px-6 pb-6 grid gap-3 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <span className="text-ink/55 text-sm">
              Catégorie — 1. choisissez un groupe
            </span>
            <div className="mt-1.5 flex flex-wrap gap-2">
              {CATEGORY_GROUPS.map((g) => (
                <button
                  type="button"
                  key={g}
                  onClick={() => pickGroup(g)}
                  className={`px-3.5 py-1.5 rounded-full border text-sm transition ${
                    group === g
                      ? "bg-ink text-paper border-ink"
                      : "border-ink/20 text-ink/60 hover:bg-paper-soft"
                  }`}
                >
                  {g}
                </button>
              ))}
            </div>
            <span className="mt-3 block text-ink/55 text-sm">2. puis la catégorie</span>
            <div className="mt-1.5 flex flex-wrap gap-2">
              {CATEGORIES.filter((c) => c.group === group).map((c) => (
                <button
                  type="button"
                  key={c.key}
                  onClick={() => setF({ ...f, category: c.key })}
                  className={`px-3 py-1.5 rounded-full border text-sm transition ${
                    f.category === c.key
                      ? "bg-wine text-paper border-wine"
                      : "border-ink/20 text-ink/60 hover:bg-paper-soft"
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>
          <Field label="Nom *" required value={f.name} onChange={(v) => setF({ ...f, name: v })} placeholder="Nom…" />
          <Field label="Site web" value={f.website} onChange={(v) => setF({ ...f, website: v })} placeholder="https://…" />
          <div className="text-sm">
            <span className="text-ink/55">Pays</span>
            <div className="mt-1 grid grid-cols-2 gap-1 rounded-lg border border-ink/25 p-1">
              {(["FR", "IT"] as const).map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setF({ ...f, country: c })}
                  className={`rounded-md py-2 transition ${f.country === c ? "bg-wine text-paper" : "text-ink/60 hover:bg-paper-soft"}`}
                >
                  {c === "FR" ? "France" : "Italie"}
                </button>
              ))}
            </div>
          </div>
          <Field label="Contact (nom)" value={f.contactName} onChange={(v) => setF({ ...f, contactName: v })} />
          <Field label="Email de contact" type="email" value={f.contactEmail} onChange={(v) => setF({ ...f, contactEmail: v })} placeholder="contact@…" />
          <Field label="Téléphone" value={f.contactPhone} onChange={(v) => setF({ ...f, contactPhone: v })} />
          <div className="sm:col-span-2 flex flex-col sm:flex-row sm:items-center gap-3 pt-1">
            <button
              type="submit"
              disabled={busy}
              className="rounded-full bg-wine px-6 py-3 text-paper font-medium hover:bg-wine/90 disabled:opacity-50 transition"
            >
              {busy ? "Recherche…" : "Créer la fiche"}
            </button>
            {msg && <span className="text-sm text-ink/55">{msg}</span>}
          </div>
        </form>
      )}
    </section>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
  required,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  placeholder?: string;
  required?: boolean;
}) {
  return (
    <label className="text-sm">
      <span className="text-ink/55">{label}</span>
      <input
        type={type}
        required={required}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full rounded-lg border border-ink/25 px-3 py-2.5 bg-paper focus:border-wine focus:outline-none"
      />
    </label>
  );
}

function VenueCard({
  v,
  onToggleFav,
  onOpen,
}: {
  v: Venue;
  onToggleFav: (id: string, next: boolean) => void;
  onOpen: () => void;
}) {
  const s = STATUS_LABEL[v.status];
  const venueLike = isVenueLike(v.category);
  const badge = `${CATEGORY_LABEL[v.category]} · ${v.country === "IT" ? "Italie" : "France"}`;

  return (
    <div
      onClick={onOpen}
      className="rounded-xl border border-ink/15 overflow-hidden flex flex-col bg-paper cursor-pointer hover:border-ink/30 hover:shadow-sm transition"
    >
      <div className="h-44 bg-paper-soft relative">
        {v.photoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={v.photoUrl} alt={v.name} className="h-full w-full object-cover sepia-[.12] saturate-[.85]" />
        ) : (
          <div className="h-full w-full flex items-center justify-center text-ink/25 text-sm">
            Pas de photo
          </div>
        )}
        <span className={`absolute top-3 left-3 text-xs px-2.5 py-1 rounded-full ${s.color}`}>
          {s.label}
        </span>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleFav(v.id, !v.isFavorite);
          }}
          aria-label={v.isFavorite ? "Retirer des favoris" : "Ajouter aux favoris"}
          className="absolute top-3 right-3 h-9 w-9 rounded-full bg-paper/90 border border-ink/15 flex items-center justify-center text-lg leading-none hover:bg-paper"
        >
          <span className={v.isFavorite ? "text-wine" : "text-ink/30"}>
            {v.isFavorite ? "★" : "☆"}
          </span>
        </button>
        <span className="absolute bottom-3 left-3 text-xs px-2.5 py-1 rounded-full bg-paper text-ink/70 border border-ink/15">
          {badge}
        </span>
      </div>

      <div className="p-5 flex-1 flex flex-col">
        <h3 className="text-lg font-hand text-ink leading-tight">{v.name}</h3>
        <p className="text-sm text-ink/40">{v.region ?? "Région inconnue"}</p>

        {venueLike && (
          <dl className="mt-4 grid grid-cols-2 gap-y-3 text-sm">
            <Fact label="Capacité" value={v.capacitySeated ? `${v.capacitySeated} pers.` : "-"} />
            <Fact label="Couchages" value={v.beds ? `${v.beds}` : "-"} />
            <Fact label="Traiteur" value={CATERER_LABEL[v.catererType]} />
            <Fact label="Nuit / pers." value={eur(v.pricePerNightPerGuest)} />
          </dl>
        )}

        <div className="mt-4 rounded-lg border border-ink/15 bg-paper-soft/50 p-4 text-center">
          <p className="text-[11px] uppercase tracking-wide text-ink/40">Prix</p>
          <p className="text-2xl font-semibold text-wine mt-0.5">
            {v.price != null ? eur(v.price) : "à compléter"}
          </p>
        </div>

        <p className="mt-4 text-sm font-medium text-wine">Voir la fiche →</p>
      </div>
    </div>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-ink/40 text-xs">{label}</dt>
      <dd className="text-ink/80">{value}</dd>
    </div>
  );
}

function fmtDate(iso: string) {
  try {
    return new Date(iso).toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch {
    return "";
  }
}

function Step({ label, ok }: { label: string; ok: boolean }) {
  return (
    <div className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-sm ${ok ? "border-wine/30 bg-wine/5 text-ink/80" : "border-ink/15 text-ink/50"}`}>
      <span className={`h-5 w-5 rounded-full flex items-center justify-center text-xs shrink-0 ${ok ? "bg-wine text-paper" : "bg-paper-soft text-ink/40 border border-ink/20"}`}>
        {ok ? "✓" : "·"}
      </span>
      <span>{label}</span>
      <span className="ml-auto text-xs font-medium">{ok ? "Oui" : "Non"}</span>
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="text-xs uppercase tracking-wide text-ink/40 mb-2">{children}</h3>
  );
}

function VenueModal({
  id,
  onClose,
  onChanged,
  onToggleFav,
}: {
  id: string;
  onClose: () => void;
  onChanged: () => void;
  onToggleFav: (id: string, next: boolean) => void;
}) {
  const [v, setV] = useState<Venue | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [draft, setDraft] = useState("");

  const reload = useCallback(async () => {
    try {
      const r = await fetch(`/api/venues/${id}`);
      const data = await r.json();
      setV(data);
      setComments(data.comments ?? []);
    } catch {
      setV(null);
    }
  }, [id]);

  useEffect(() => {
    reload();
  }, [reload]);
  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [onClose]);

  async function act(path: string, body?: object) {
    setBusy(path);
    await fetch(path, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body ?? {}),
    }).catch(() => {});
    setBusy(null);
    await reload();
    onChanged();
  }
  async function del() {
    if (!v || !confirm(`Supprimer « ${v.name} » ?`)) return;
    await fetch(`/api/venues/${id}`, { method: "DELETE" }).catch(() => {});
    onChanged();
    onClose();
  }
  function toggleFav() {
    if (!v) return;
    const next = !v.isFavorite;
    setV({ ...v, isFavorite: next });
    onToggleFav(id, next);
  }
  async function addComment(e: React.FormEvent) {
    e.preventDefault();
    const body = draft.trim();
    if (!body) return;
    setDraft("");
    const temp: Comment = {
      id: `tmp-${comments.length}-${body.length}`,
      body,
      author: null,
      createdAt: new Date().toISOString(),
    };
    setComments((c) => [...c, temp]);
    try {
      const r = await fetch(`/api/venues/${id}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body }),
      });
      const saved = await r.json();
      if (saved?.id) setComments((c) => c.map((x) => (x.id === temp.id ? saved : x)));
    } catch {
      /* démo : local */
    }
  }
  async function delComment(cid: string) {
    setComments((c) => c.filter((x) => x.id !== cid));
    await fetch(`/api/venues/${id}/comments/${cid}`, { method: "DELETE" }).catch(() => {});
  }

  const emails = v?.emails ?? [];
  const sent = emails.some((e) => e.direction === "OUTBOUND");
  const replied = emails.some((e) => e.direction === "INBOUND");
  const venueLike = v ? isVenueLike(v.category) : false;

  return (
    <div className="fixed inset-0 z-50 flex items-start sm:items-center justify-center p-3 sm:p-6">
      <div className="absolute inset-0 bg-ink/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-paper rounded-2xl border border-ink/15 w-full max-w-2xl max-h-[92vh] overflow-y-auto shadow-2xl">
        <button
          onClick={onClose}
          aria-label="Fermer"
          className="absolute top-3 right-3 z-10 h-9 w-9 rounded-full bg-paper/90 border border-ink/15 flex items-center justify-center text-ink/60 hover:text-ink text-xl leading-none"
        >
          ×
        </button>

        {!v ? (
          <div className="p-12 text-center text-ink/40">Chargement…</div>
        ) : (
          <>
            <div className="h-48 bg-paper-soft relative">
              {v.photoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={v.photoUrl} alt={v.name} className="h-full w-full object-cover sepia-[.12] saturate-[.85]" />
              ) : (
                <div className="h-full w-full flex items-center justify-center text-ink/25 text-sm">
                  Pas de photo
                </div>
              )}
              <span className={`absolute top-3 left-3 text-xs px-2.5 py-1 rounded-full ${STATUS_LABEL[v.status].color}`}>
                {STATUS_LABEL[v.status].label}
              </span>
              <span className="absolute bottom-3 left-3 text-xs px-2.5 py-1 rounded-full bg-paper text-ink/70 border border-ink/15">
                {CATEGORY_LABEL[v.category]}
              </span>
            </div>

            <div className="p-5 sm:p-6 space-y-6">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-2xl font-hand text-ink leading-tight">{v.name}</h2>
                  <p className="text-sm text-ink/50">
                    {v.region ?? "Région inconnue"} ·{" "}
                    {v.country === "IT" ? "Italie" : "France"}
                  </p>
                </div>
                <button
                  onClick={toggleFav}
                  aria-label="Favori"
                  className="h-9 w-9 shrink-0 rounded-full border border-ink/15 flex items-center justify-center text-lg leading-none hover:bg-paper-soft"
                >
                  <span className={v.isFavorite ? "text-wine" : "text-ink/30"}>
                    {v.isFavorite ? "★" : "☆"}
                  </span>
                </button>
              </div>

              <div className="rounded-xl border border-ink/15 bg-paper-soft/40 px-4 py-3 flex items-center justify-between">
                <span className="text-xs uppercase tracking-wide text-ink/40">Prix</span>
                <span className="text-2xl font-semibold text-wine">
                  {v.price != null ? eur(v.price) : "à compléter"}
                </span>
              </div>

              <section>
                <SectionTitle>Suivi</SectionTitle>
                <div className="grid sm:grid-cols-2 gap-2">
                  <Step label="Demande d'infos envoyée" ok={sent} />
                  <Step label="Réponse reçue" ok={replied} />
                </div>
              </section>

              <section>
                <SectionTitle>Détails</SectionTitle>
                <dl className="grid grid-cols-2 gap-y-3 text-sm">
                  {venueLike && (
                    <>
                      <Fact label="Capacité assise" value={v.capacitySeated ? `${v.capacitySeated} pers.` : "-"} />
                      <Fact label="Capacité debout" value={v.capacityStanding ? `${v.capacityStanding} pers.` : "-"} />
                      <Fact label="Couchages" value={v.beds ? `${v.beds}` : "-"} />
                      <Fact label="Traiteur" value={CATERER_LABEL[v.catererType]} />
                      <Fact label="Traiteur / pers." value={eur(v.catererPricePerGuest)} />
                      <Fact label="Nuit / pers." value={eur(v.pricePerNightPerGuest)} />
                      <Fact label="Minimum de dépense" value={eur(v.minSpend)} />
                      <Fact label="Privatisation" value={v.exclusivity == null ? "-" : v.exclusivity ? "Oui" : "Non"} />
                    </>
                  )}
                  <Fact label="Contact" value={v.contactName ?? "-"} />
                  <Fact label="Email" value={v.contactEmail ?? "-"} />
                  <Fact label="Téléphone" value={v.contactPhone ?? "-"} />
                </dl>
                {v.availabilityNotes && (
                  <p className="mt-3 text-sm text-ink/70">
                    <span className="text-ink/40">Disponibilités : </span>
                    {v.availabilityNotes}
                  </p>
                )}
                {v.notes && (
                  <p className="mt-2 text-sm text-ink/70">
                    <span className="text-ink/40">Notes : </span>
                    {v.notes}
                  </p>
                )}
              </section>

              <section>
                <SectionTitle>Emails ({emails.length})</SectionTitle>
                {emails.length === 0 ? (
                  <p className="text-sm text-ink/40">
                    Aucun email pour l’instant. Utilisez « Demander les infos ».
                  </p>
                ) : (
                  <div className="space-y-3">
                    {emails.map((e) => (
                      <div
                        key={e.id}
                        className={`rounded-xl border p-3 text-sm ${e.direction === "OUTBOUND" ? "border-ink/15 bg-paper-soft/40" : "border-wine/30 bg-wine/5"}`}
                      >
                        <div className="flex justify-between gap-2 text-xs text-ink/45 mb-1">
                          <span className="font-medium">
                            {e.direction === "OUTBOUND" ? "Envoyé →" : "← Reçu"}
                            {e.subject ? ` · ${e.subject}` : ""}
                          </span>
                          <span className="shrink-0">{fmtDate(e.createdAt)}</span>
                        </div>
                        <p className="text-ink/80 whitespace-pre-wrap">{e.body}</p>
                      </div>
                    ))}
                  </div>
                )}
              </section>

              <section>
                <SectionTitle>Commentaires</SectionTitle>
                <div className="space-y-2">
                  {comments.length === 0 && (
                    <p className="text-sm text-ink/40">Aucun commentaire.</p>
                  )}
                  {comments.map((c) => (
                    <div key={c.id} className="text-sm bg-paper-soft/60 rounded-lg px-3 py-2 flex justify-between gap-2">
                      <span className="text-ink/80">
                        {c.author && <strong className="text-ink/60">{c.author} : </strong>}
                        {c.body}
                      </span>
                      <button
                        onClick={() => delComment(c.id)}
                        aria-label="Supprimer le commentaire"
                        className="text-ink/30 hover:text-wine shrink-0"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                  <form onSubmit={addComment} className="flex gap-2">
                    <input
                      value={draft}
                      onChange={(e) => setDraft(e.target.value)}
                      placeholder="Ajouter un commentaire…"
                      className="flex-1 rounded-lg border border-ink/20 px-3 py-2 text-sm focus:border-wine focus:outline-none"
                    />
                    <button type="submit" className="rounded-lg bg-ink text-paper px-3 py-2 text-sm hover:bg-ink/90">
                      OK
                    </button>
                  </form>
                </div>
              </section>

              <div className="flex flex-wrap gap-2 pt-4 border-t border-ink/10 text-sm">
                <button
                  onClick={() => act(`/api/venues/${id}/enrich`)}
                  disabled={!!busy}
                  className="rounded-full border border-ink/25 px-4 py-2 hover:bg-paper-soft disabled:opacity-50"
                >
                  {busy?.includes("enrich") ? "…" : "Re-chercher les infos"}
                </button>
                <button
                  onClick={() => act(`/api/venues/${id}/email`, {})}
                  disabled={!!busy || !v.contactEmail}
                  title={v.contactEmail ?? "Aucun email de contact"}
                  className="rounded-full border border-wine/40 text-wine px-4 py-2 hover:bg-wine/5 disabled:opacity-40"
                >
                  {busy?.includes("email") ? "…" : "Demander les infos par email"}
                </button>
                {v.website && (
                  <a href={v.website} target="_blank" rel="noreferrer" className="rounded-full border border-ink/25 px-4 py-2 hover:bg-paper-soft">
                    Voir le site
                  </a>
                )}
                <button onClick={del} className="ml-auto text-ink/40 hover:text-wine px-2">
                  Supprimer
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
