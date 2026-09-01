import { useEffect, useMemo, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Header } from "@/components/nairabay/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  adminSetItemStatus,
  fetchAdminItems,
  fetchAdminReports,
  fetchAdminSellers,
  fetchAdminStats,
  isAdmin,
  ITEM_STATUSES,
  REPORT_STATUSES,
  setReportStatus,
  setSellerVerified,
} from "@/lib/admin";
import { formatNaira, timeAgo } from "@/lib/nairabay";

export const Route = createFileRoute("/_authenticated/admin")({
  head: () => ({
    meta: [
      { title: "Admin console — nairaBay team" },
      {
        name: "description",
        content: "Review seller reports, approve Bay# verification and manage listings on nairaBay.",
      },
      { property: "og:title", content: "Admin console — nairaBay team" },
      {
        property: "og:description",
        content: "Internal moderation tools for the nairaBay team.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminPage,
});

function AdminPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [allowed, setAllowed] = useState<boolean | null>(null);
  const [email, setEmail] = useState("");

  useEffect(() => {
    void (async () => {
      const { data } = await supabase.auth.getUser();
      const user = data.user;
      if (!user) return setAllowed(false);
      setEmail(user.email ?? "");
      setAllowed(await isAdmin(user.id));
    })();
  }, []);

  async function signOut() {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }

  if (allowed === null) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <p className="p-6 text-sm text-muted-foreground">Checking your access…</p>
      </div>
    );
  }

  if (!allowed) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="mx-auto max-w-md px-4 py-12 text-center">
          <h1 className="font-display text-2xl">No admin access</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {email ? `${email} is signed in` : "You are signed in"}, but this account has not been
            granted the admin role yet. Ask an owner to add you to the team roles list.
          </p>
          <Button className="mt-6" variant="outline" onClick={() => void signOut()}>
            Sign out
          </Button>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="mx-auto w-full max-w-5xl px-4 py-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="font-display text-3xl">Admin console</h1>
            <p className="text-sm text-muted-foreground">Signed in as {email}</p>
          </div>
          <Button variant="outline" onClick={() => void signOut()}>
            Sign out
          </Button>
        </div>

        <StatsRow />

        <Tabs defaultValue="reports" className="mt-6">
          <TabsList>
            <TabsTrigger value="reports">Reports</TabsTrigger>
            <TabsTrigger value="sellers">Bay# verification</TabsTrigger>
            <TabsTrigger value="listings">Listings</TabsTrigger>
          </TabsList>
          <TabsContent value="reports" className="mt-4">
            <ReportsTab />
          </TabsContent>
          <TabsContent value="sellers" className="mt-4">
            <SellersTab />
          </TabsContent>
          <TabsContent value="listings" className="mt-4">
            <ListingsTab />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}

function StatsRow() {
  const { data } = useQuery({ queryKey: ["admin", "stats"], queryFn: fetchAdminStats });
  const cards = [
    { label: "Open reports", value: data?.open_reports ?? 0 },
    { label: "Unverified bays", value: data?.unverified_sellers ?? 0 },
    { label: "Active listings", value: data?.active_items ?? 0 },
    { label: "Total sellers", value: data?.sellers_total ?? 0 },
  ];
  return (
    <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
      {cards.map((c) => (
        <div key={c.label} className="surface-card p-4">
          <p className="font-display text-2xl">{c.value}</p>
          <p className="text-xs text-muted-foreground">{c.label}</p>
        </div>
      ))}
    </div>
  );
}

function useRefresh() {
  const queryClient = useQueryClient();
  return () => void queryClient.invalidateQueries({ queryKey: ["admin"] });
}

function ReportsTab() {
  const [status, setStatus] = useState("open");
  const refresh = useRefresh();
  const { data, isLoading } = useQuery({
    queryKey: ["admin", "reports", status],
    queryFn: () => fetchAdminReports(status === "all" ? undefined : status),
  });
  const mutation = useMutation({
    mutationFn: (vars: { id: string; status: string }) => setReportStatus(vars.id, vars.status),
    onSuccess: refresh,
  });

  return (
    <div className="space-y-3">
      <div className="w-48">
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All reports</SelectItem>
            {REPORT_STATUSES.map((s) => (
              <SelectItem key={s} value={s}>
                {s}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      {isLoading ? <p className="text-sm text-muted-foreground">Loading reports…</p> : null}
      {!isLoading && (data?.length ?? 0) === 0 ? (
        <p className="text-sm text-muted-foreground">Nothing to review here.</p>
      ) : null}
      {(data ?? []).map((r) => (
        <div key={r.id} className="surface-card space-y-2 p-4">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="secondary">{r.status}</Badge>
            <span className="font-semibold">{r.reason}</span>
            <span className="text-xs text-muted-foreground">{timeAgo(r.created_at)}</span>
          </div>
          <p className="text-sm text-muted-foreground">
            Bay #{r.bay_handle} · {r.phone_verified_at ? "verified" : "unverified"}
            {r.item_title ? ` · listing: ${r.item_title} (${r.item_status})` : ""}
          </p>
          {r.details ? <p className="text-sm">{r.details}</p> : null}
          <div className="flex flex-wrap gap-2">
            {REPORT_STATUSES.filter((s) => s !== r.status).map((s) => (
              <Button
                key={s}
                size="sm"
                variant="outline"
                disabled={mutation.isPending}
                onClick={() => mutation.mutate({ id: r.id, status: s })}
              >
                Mark {s}
              </Button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function SellersTab() {
  const [search, setSearch] = useState("");
  const refresh = useRefresh();
  const { data, isLoading } = useQuery({
    queryKey: ["admin", "sellers", search],
    queryFn: () => fetchAdminSellers(search || undefined),
  });
  const mutation = useMutation({
    mutationFn: (vars: { id: string; verified: boolean }) =>
      setSellerVerified(vars.id, vars.verified),
    onSuccess: refresh,
  });

  return (
    <div className="space-y-3">
      <Input
        placeholder="Search Bay#, phone or name"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
      {isLoading ? <p className="text-sm text-muted-foreground">Loading sellers…</p> : null}
      {(data ?? []).map((s) => (
        <div key={s.id} className="surface-card flex flex-wrap items-center justify-between gap-3 p-4">
          <div>
            <p className="font-semibold">
              Bay #{s.bay_handle}{" "}
              <Badge variant={s.phone_verified_at ? "default" : "secondary"}>
                {s.phone_verified_at ? "verified" : "unverified"}
              </Badge>
            </p>
            <p className="text-xs text-muted-foreground">
              {s.display_name ? `${s.display_name} · ` : ""}
              {s.phone_number} · {s.location_city || s.location_state || "Nigeria"} ·{" "}
              {s.item_count} listings · joined {timeAgo(s.created_at)}
            </p>
          </div>
          <Button
            size="sm"
            variant={s.phone_verified_at ? "outline" : "default"}
            disabled={mutation.isPending}
            onClick={() => mutation.mutate({ id: s.id, verified: !s.phone_verified_at })}
          >
            {s.phone_verified_at ? "Revoke verification" : "Approve verification"}
          </Button>
        </div>
      ))}
      {!isLoading && (data?.length ?? 0) === 0 ? (
        <p className="text-sm text-muted-foreground">No sellers matched.</p>
      ) : null}
    </div>
  );
}

function ListingsTab() {
  const [status, setStatus] = useState("all");
  const [search, setSearch] = useState("");
  const refresh = useRefresh();
  const { data, isLoading } = useQuery({
    queryKey: ["admin", "items", status, search],
    queryFn: () =>
      fetchAdminItems({
        ...(status !== "all" ? { status } : {}),
        ...(search ? { search } : {}),
      }),
  });
  const mutation = useMutation({
    mutationFn: (vars: { id: string; status: string }) => adminSetItemStatus(vars.id, vars.status),
    onSuccess: refresh,
  });

  const rows = useMemo(() => data ?? [], [data]);

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-3">
        <div className="w-40">
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              {ITEM_STATUSES.map((s) => (
                <SelectItem key={s} value={s}>
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Input
          className="flex-1"
          placeholder="Search title or Bay#"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>
      {isLoading ? <p className="text-sm text-muted-foreground">Loading listings…</p> : null}
      {rows.map((i) => (
        <div key={i.id} className="surface-card flex flex-wrap items-center justify-between gap-3 p-4">
          <div>
            <p className="font-semibold">
              {i.title} <Badge variant="secondary">{i.status}</Badge>
            </p>
            <p className="text-xs text-muted-foreground">
              {formatNaira(Number(i.price))} · {i.category} · Bay #{i.bay_handle} ·{" "}
              {i.location_city || i.location_state || "Nigeria"} · {i.views} views ·{" "}
              {timeAgo(i.created_at)}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {ITEM_STATUSES.filter((s) => s !== i.status).map((s) => (
              <Button
                key={s}
                size="sm"
                variant="outline"
                disabled={mutation.isPending}
                onClick={() => mutation.mutate({ id: i.id, status: s })}
              >
                {s === "removed" ? "Remove" : `Mark ${s}`}
              </Button>
            ))}
          </div>
        </div>
      ))}
      {!isLoading && rows.length === 0 ? (
        <p className="text-sm text-muted-foreground">No listings matched.</p>
      ) : null}
    </div>
  );
}
