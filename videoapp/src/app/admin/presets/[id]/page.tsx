import { notFound } from "next/navigation";
import { AdminForm, Field } from "@/components/admin-form";
import { db } from "@/lib/db";
import { CATEGORIES } from "@/lib/presets";
import { deletePresetAction, savePreset } from "../../actions";

export default async function EditPreset({ params }: PageProps<"/admin/presets/[id]">) {
  const { id } = await params;
  const models = await db().listModels({ includeDisabled: true });
  const p = id === "new" ? null : await db().getPreset(id);
  if (id !== "new" && !p) notFound();
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-black">{p ? `Edit ${p.name}` : "New preset"}</h1>
      <AdminForm action={savePreset}>
        {p && <input type="hidden" name="id" value={p.id} />}
        <Field label="Name"><input className="input" name="name" defaultValue={p?.name} required /></Field>
        <Field label="Slug (URL)"><input className="input" name="slug" defaultValue={p?.slug} required pattern="[a-z0-9-]+" /></Field>
        <Field label="Description" wide><input className="input" name="description" defaultValue={p?.description} /></Field>
        <Field label="Category">
          <select className="input" name="category" defaultValue={p?.category ?? "product-ads"}>
            {CATEGORIES.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
          </select>
        </Field>
        <Field label="Locked model">
          <select className="input" name="model_id" defaultValue={p?.model_id}>
            {models.map((m) => <option key={m.id} value={m.id}>{m.name} ({m.type}, {m.provider})</option>)}
          </select>
        </Field>
        <Field label="Prompt template — use {subject} for the user's words" wide>
          <textarea className="input min-h-28" name="prompt_template" defaultValue={p?.prompt_template} required />
        </Field>
        <Field label='Params JSON (e.g. {"duration":6,"aspect_ratio":"9:16"})' wide>
          <textarea className="input font-mono" name="params_json" defaultValue={JSON.stringify(p?.params_json ?? { duration: 6, aspect_ratio: "9:16" })} />
        </Field>
        <Field label="Preview video URL"><input className="input" name="preview_video_url" defaultValue={p?.preview_video_url ?? ""} /></Field>
        <Field label="…or upload preview (.mp4)"><input className="input" type="file" name="preview_video_file" accept="video/mp4" /></Field>
        <Field label="Thumbnail URL"><input className="input" name="thumbnail_url" defaultValue={p?.thumbnail_url ?? ""} /></Field>
        <Field label="…or upload thumbnail"><input className="input" type="file" name="thumbnail_file" accept="image/*" /></Field>
        <Field label="Sort order"><input className="input" type="number" name="sort_order" defaultValue={p?.sort_order ?? 100} /></Field>
        <div className="flex flex-wrap items-end gap-4 text-sm">
          <label className="flex gap-2"><input type="checkbox" name="requires_image" defaultChecked={p?.requires_image ?? true} /> Needs photo</label>
          <label className="flex gap-2"><input type="checkbox" name="requires_subject" defaultChecked={p?.requires_subject ?? false} /> Needs subject text</label>
          <label className="flex gap-2"><input type="checkbox" name="is_featured" defaultChecked={p?.is_featured ?? false} /> Featured</label>
          <label className="flex gap-2"><input type="checkbox" name="enabled" defaultChecked={p?.enabled ?? true} /> Live</label>
        </div>
      </AdminForm>
      {p && (
        <form action={deletePresetAction}>
          <input type="hidden" name="id" value={p.id} />
          <button className="btn-ghost text-danger">Delete preset</button>
        </form>
      )}
    </div>
  );
}
