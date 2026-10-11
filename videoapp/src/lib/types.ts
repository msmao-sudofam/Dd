export type Plan = "free" | "paid" | "monthly";
export type Role = "user" | "admin";

export interface Profile {
  id: string;
  email: string;
  credits_balance: number;
  plan: Plan;
  role: Role;
  referral_code: string;
  referred_by: string | null;
  stripe_customer_id?: string | null;
  stripe_subscription_id?: string | null;
  created_at: string;
}

export type LedgerReason =
  | "purchase"
  | "generation"
  | "refund"
  | "signup_bonus"
  | "referral"
  | "subscription"
  | "admin";

export interface LedgerEntry {
  id: number;
  user_id: string;
  delta: number;
  reason: LedgerReason;
  job_id: string | null;
  stripe_event_id: string | null;
  meta: Record<string, unknown>;
  created_at: string;
}

export type ProviderName = "fal" | "replicate" | "self" | "mock";
export type ModelType = "t2v" | "i2v" | "t2i" | "i2i";
export type Tier = "fast" | "mid" | "premium";

export interface Model {
  id: string;
  slug: string;
  name: string;
  description: string;
  provider: ProviderName;
  provider_model_id: string;
  type: ModelType;
  tier: Tier;
  credit_cost: number;
  credit_cost_per_second: number | null;
  api_cost_usd: number;
  default_duration: number | null;
  max_duration: number | null;
  allowed_durations: number[];
  allowed_aspects: string[];
  params_json: Record<string, unknown>;
  sort_order: number;
  enabled: boolean;
  created_at: string;
}

export type PresetCategory = "camera-moves" | "product-ads" | "ugc" | "effects" | "viral";

export interface Preset {
  id: string;
  slug: string;
  name: string;
  description: string;
  thumbnail_url: string | null;
  preview_video_url: string | null;
  model_id: string;
  prompt_template: string;
  params_json: Record<string, unknown>;
  category: PresetCategory;
  requires_image: boolean;
  requires_subject: boolean;
  is_featured: boolean;
  sort_order: number;
  enabled: boolean;
  created_at: string;
}

export type JobStatus = "queued" | "running" | "succeeded" | "failed" | "refunded";

export interface JobInput {
  prompt: string;
  image_url?: string | null;
  image_path?: string | null;
  duration?: number | null;
  aspect_ratio?: string | null;
  face_consent?: boolean;
  [k: string]: unknown;
}

export interface Job {
  id: string;
  user_id: string;
  model_id: string;
  preset_id: string | null;
  input_json: JobInput;
  status: JobStatus;
  provider: ProviderName;
  provider_request_id: string | null;
  output_url: string | null;
  output_type: "video" | "image";
  credits_charged: number;
  cost_usd: number;
  error: string | null;
  created_at: string;
  completed_at: string | null;
}

export interface SessionUser {
  id: string;
  email: string;
}
