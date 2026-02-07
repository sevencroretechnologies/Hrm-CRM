import { useEffect, useState } from "react";
import { salesStageApi, lostReasonApi, competitorApi, settingsApi } from "@/services/crmService";
import type { SalesStage, OpportunityLostReason, Competitor, CrmSetting } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Plus, Trash2 } from "lucide-react";

export default function SettingsPage() {
  const [stages, setStages] = useState<SalesStage[]>([]);
  const [reasons, setReasons] = useState<OpportunityLostReason[]>([]);
  const [competitors, setCompetitors] = useState<Competitor[]>([]);
  const [settings, setSettings] = useState<CrmSetting | null>(null);
  const [newStage, setNewStage] = useState("");
  const [newReason, setNewReason] = useState("");
  const [newCompetitor, setNewCompetitor] = useState("");

  useEffect(() => {
    salesStageApi.list().then(setStages).catch(() => {});
    lostReasonApi.list().then(setReasons).catch(() => {});
    competitorApi.list().then(setCompetitors).catch(() => {});
    settingsApi.get().then(setSettings).catch(() => {});
  }, []);

  const addStage = async () => {
    if (!newStage.trim()) return;
    const stage = await salesStageApi.create({ stage_name: newStage });
    setStages((p) => [...p, stage]);
    setNewStage("");
  };

  const deleteStage = async (id: number) => {
    await salesStageApi.delete(id);
    setStages((p) => p.filter((s) => s.id !== id));
  };

  const addReason = async () => {
    if (!newReason.trim()) return;
    const reason = await lostReasonApi.create({ reason: newReason });
    setReasons((p) => [...p, reason]);
    setNewReason("");
  };

  const deleteReason = async (id: number) => {
    await lostReasonApi.delete(id);
    setReasons((p) => p.filter((r) => r.id !== id));
  };

  const addCompetitor = async () => {
    if (!newCompetitor.trim()) return;
    const comp = await competitorApi.create({ competitor_name: newCompetitor });
    setCompetitors((p) => [...p, comp]);
    setNewCompetitor("");
  };

  const deleteCompetitor = async (id: number) => {
    await competitorApi.delete(id);
    setCompetitors((p) => p.filter((c) => c.id !== id));
  };

  const updateSetting = async (key: string, value: boolean | number | string) => {
    if (!settings) return;
    const updated = await settingsApi.update({ [key]: value });
    setSettings(updated);
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">CRM Settings</h2>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border p-5">
          <h3 className="font-semibold mb-3">Sales Stages</h3>
          <div className="flex gap-2 mb-3">
            <Input placeholder="Stage name" value={newStage} onChange={(e) => setNewStage(e.target.value)} />
            <Button onClick={addStage} size="sm"><Plus className="h-4 w-4" /></Button>
          </div>
          <Table>
            <TableHeader><TableRow><TableHead>Name</TableHead><TableHead className="w-16"></TableHead></TableRow></TableHeader>
            <TableBody>
              {stages.map((s) => (
                <TableRow key={s.id}>
                  <TableCell>{s.stage_name}</TableCell>
                  <TableCell><Button variant="ghost" size="icon" onClick={() => deleteStage(s.id)}><Trash2 className="h-4 w-4 text-red-500" /></Button></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        <div className="bg-white rounded-xl border p-5">
          <h3 className="font-semibold mb-3">Lost Reasons</h3>
          <div className="flex gap-2 mb-3">
            <Input placeholder="Reason" value={newReason} onChange={(e) => setNewReason(e.target.value)} />
            <Button onClick={addReason} size="sm"><Plus className="h-4 w-4" /></Button>
          </div>
          <Table>
            <TableHeader><TableRow><TableHead>Reason</TableHead><TableHead className="w-16"></TableHead></TableRow></TableHeader>
            <TableBody>
              {reasons.map((r) => (
                <TableRow key={r.id}>
                  <TableCell>{r.reason}</TableCell>
                  <TableCell><Button variant="ghost" size="icon" onClick={() => deleteReason(r.id)}><Trash2 className="h-4 w-4 text-red-500" /></Button></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        <div className="bg-white rounded-xl border p-5">
          <h3 className="font-semibold mb-3">Competitors</h3>
          <div className="flex gap-2 mb-3">
            <Input placeholder="Competitor name" value={newCompetitor} onChange={(e) => setNewCompetitor(e.target.value)} />
            <Button onClick={addCompetitor} size="sm"><Plus className="h-4 w-4" /></Button>
          </div>
          <Table>
            <TableHeader><TableRow><TableHead>Name</TableHead><TableHead className="w-16"></TableHead></TableRow></TableHeader>
            <TableBody>
              {competitors.map((c) => (
                <TableRow key={c.id}>
                  <TableCell>{c.competitor_name}</TableCell>
                  <TableCell><Button variant="ghost" size="icon" onClick={() => deleteCompetitor(c.id)}><Trash2 className="h-4 w-4 text-red-500" /></Button></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        {settings && (
          <div className="bg-white rounded-xl border p-5">
            <h3 className="font-semibold mb-3">General Settings</h3>
            <div className="space-y-3">
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={settings.allow_lead_duplication_based_on_emails} onChange={(e) => updateSetting("allow_lead_duplication_based_on_emails", e.target.checked)} className="rounded" />
                Allow lead duplication based on emails
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={settings.auto_creation_of_contact} onChange={(e) => updateSetting("auto_creation_of_contact", e.target.checked)} className="rounded" />
                Auto-create contact
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={settings.carry_forward_communication_and_comments} onChange={(e) => updateSetting("carry_forward_communication_and_comments", e.target.checked)} className="rounded" />
                Carry forward communication and comments
              </label>
              <div>
                <label className="text-xs font-medium text-gray-600">Close opportunity after days</label>
                <Input type="number" value={settings.close_opportunity_after_days ?? ""} onChange={(e) => updateSetting("close_opportunity_after_days", Number(e.target.value))} />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
