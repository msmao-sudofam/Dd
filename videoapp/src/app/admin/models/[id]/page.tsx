import { notFound } from "next/navigation";
import { AdminForm, Field } from "@/components/admin-form";
import { db } from "@/lib/db";
import { saveModel } from "../../actions";

export default async function EditModel({ params }: PageProps<"/admin/models/[id]">) {
  const { id } = await params;
  const m = id === "new" ? null : await db().getModel(id);
  if (id !== "new" && !m) notFound();
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-black">{m ? `Edit ${m.name}` : "New model"}</h1>
      <AdminForm action={saveModel}>
        {m && <input type="hidden" name="id" value={m.id} />}
        <Field label="Name"><input className="input" name="name" defaultValue={m?.name} required /></Field>
        <Field label="Slug"><input className="input" name="slug" defaultValue={m?.slug} required /></Field>
        <Field label="Description" wide><input className="input" name="description" defaultValue={m?.description} /></Field>
        <Field label="Provider">
          <select className="input" name="provider" defaultValue={m?.provider ?? "fal"}>
            {["fal", "replicate", "self", "mock"].map((p) => <option key={p}>{p}</option>)}
          </select>
        </Field>
        <Field label="Provider model id (e.g. fal-ai/veo3.1)"><input className="input" name="provider_model_id" defaultValue={m?.provider_model_id} required /></Field>
        <Field label="Type">
          <select className="input" name="type" defaultValue={m?.type ?? "t2v"}>
            {["t2v", "i2v", "t2i", "i2i"].map((t) => <option key={t}>{t}</option>)}
          </select>
        </Field>
        <Field label="Tier">
          <select className="input" name="tier" defaultValue={m?.tier ?? "mid"}>
            {["fast", "mid", "premium"].map((t) => <option key={t}>{t}</option>)}
          </select>
        </Field>
        <Field label="Credit cost (default duration)"><input className="input" type="number" name="credit_cost" defaultValue={m?.credit_cost ?? 10} /></Field>
        <Field label="Credits per second (optional)"><input className="input" type="number" name="credit_cost_per_second" defaultValue={m?.credit_cost_per_second ?? ""} /></Field>
        <Field label="API cost USD (default duration)"><input className="input" type="number" step="0.0001" name="api_cost_usd" defaultValue={m?.api_cost_usd ?? 0} /></Field>
        <Field label="Default duration (s)"><input className="input" type="number" name="default_duration" defaultValue={m?.default_duration ?? ""} /></Field>
        <Field label="Max duration (s)"><input className="input" type="number" name="max_duration" defaultValue={m?.max_duration ?? ""} /></Field>
        <Field label="Allowed durations (comma)"><input className="input" name="allowed_durations" defaultValue={m?.allowed_durations.join(",") ?? ""} /></Field>
        <Field label="Allowed aspects (comma)"><input className="input" name="allowed_aspects" defaultValue={m?.allowed_aspects.join(",") ?? "9:16,16:9"} /></Field>
        <Field label="Sort order"><input className="input" type="number" name="sort_order" defaultValue={m?.sort_order ?? 100} /></Field>
        <Field label='Params JSON (duration_format, image_param, aspect_param, defaults)' wide>
          <textarea className="input font-mono" name="params_json" defaultValue={JSON.stringify(m?.params_json ?? { duration_format: "string", defaults: {} })} />
        </Field>
        <label className="flex gap-2 text-sm"><input type="checkbox" name="enabled" defaultChecked={m?.enabled ?? true} /> Enabled</label>
      </AdminForm>
    </div>
  );
}
