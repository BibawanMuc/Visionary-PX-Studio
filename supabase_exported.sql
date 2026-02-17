-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.assets (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  created_at timestamp with time zone DEFAULT now(),
  project_id uuid NOT NULL,
  name text NOT NULL,
  description text,
  category USER-DEFINED DEFAULT 'other'::asset_type,
  status USER-DEFINED DEFAULT 'upload'::asset_status,
  feedback_note text,
  storage_path text,
  file_type text,
  file_size integer,
  is_physical boolean DEFAULT false,
  location text,
  uploaded_by uuid,
  is_visible_to_client boolean DEFAULT false,
  CONSTRAINT assets_pkey PRIMARY KEY (id),
  CONSTRAINT assets_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.projects(id),
  CONSTRAINT assets_uploaded_by_fkey FOREIGN KEY (uploaded_by) REFERENCES public.profiles(id)
);
CREATE TABLE public.chat_sessions (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  title text,
  bot_id text,
  messages jsonb DEFAULT '[]'::jsonb,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT chat_sessions_pkey PRIMARY KEY (id),
  CONSTRAINT chat_sessions_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);
CREATE TABLE public.client_contacts (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  created_at timestamp with time zone DEFAULT now(),
  client_id uuid NOT NULL,
  full_name text NOT NULL,
  email text,
  phone text,
  position text,
  is_primary boolean DEFAULT false,
  notes text,
  CONSTRAINT client_contacts_pkey PRIMARY KEY (id),
  CONSTRAINT client_contacts_client_id_fkey FOREIGN KEY (client_id) REFERENCES public.clients(id)
);
CREATE TABLE public.clients (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  created_at timestamp with time zone DEFAULT now(),
  company_name text NOT NULL,
  address_line1 text,
  zip_code text,
  city text,
  country text DEFAULT 'Germany'::text,
  vat_id text,
  payment_terms_days integer DEFAULT 30,
  website text,
  logo_url text,
  notes text,
  CONSTRAINT clients_pkey PRIMARY KEY (id)
);
CREATE TABLE public.costs (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  created_at timestamp with time zone DEFAULT now(),
  project_id uuid NOT NULL,
  title text NOT NULL,
  amount numeric NOT NULL,
  invoice_document_path text,
  category text,
  is_estimated boolean DEFAULT false,
  CONSTRAINT costs_pkey PRIMARY KEY (id),
  CONSTRAINT costs_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.projects(id)
);
CREATE TABLE public.financial_documents (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  created_at timestamp with time zone DEFAULT now(),
  project_id uuid,
  type USER-DEFINED NOT NULL,
  status USER-DEFINED DEFAULT 'draft'::doc_status,
  document_number text,
  date_issued date DEFAULT CURRENT_DATE,
  due_date date,
  total_net numeric DEFAULT 0,
  vat_percent numeric DEFAULT 19,
  total_gross numeric DEFAULT 0,
  CONSTRAINT financial_documents_pkey PRIMARY KEY (id),
  CONSTRAINT financial_documents_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.projects(id)
);
CREATE TABLE public.financial_items (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  document_id uuid NOT NULL,
  position_title text NOT NULL,
  description text,
  quantity numeric NOT NULL DEFAULT 1,
  unit_price numeric NOT NULL DEFAULT 0,
  total_price numeric DEFAULT (quantity * unit_price),
  service_module_id uuid,
  seniority_level_id uuid,
  CONSTRAINT financial_items_pkey PRIMARY KEY (id),
  CONSTRAINT financial_items_document_id_fkey FOREIGN KEY (document_id) REFERENCES public.financial_documents(id),
  CONSTRAINT financial_items_service_module_id_fkey FOREIGN KEY (service_module_id) REFERENCES public.service_modules(id),
  CONSTRAINT financial_items_seniority_level_id_fkey FOREIGN KEY (seniority_level_id) REFERENCES public.seniority_levels(id)
);
CREATE TABLE public.generated_images (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  prompt text,
  style text,
  image_url text NOT NULL,
  config jsonb DEFAULT '{}'::jsonb,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT generated_images_pkey PRIMARY KEY (id),
  CONSTRAINT generated_images_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);
CREATE TABLE public.generated_thumbnails (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  prompt text,
  platform text,
  image_url text NOT NULL,
  config jsonb DEFAULT '{}'::jsonb,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT generated_thumbnails_pkey PRIMARY KEY (id),
  CONSTRAINT generated_thumbnails_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);
CREATE TABLE public.generated_videos (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  prompt text,
  model text,
  video_url text NOT NULL,
  thumbnail_url text,
  config jsonb DEFAULT '{}'::jsonb,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT generated_videos_pkey PRIMARY KEY (id),
  CONSTRAINT generated_videos_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);
CREATE TABLE public.notifications (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  created_at timestamp with time zone DEFAULT now(),
  user_id uuid NOT NULL,
  type text NOT NULL,
  title text NOT NULL,
  message text,
  link text,
  is_read boolean DEFAULT false,
  related_entity_id uuid,
  related_entity_type text,
  CONSTRAINT notifications_pkey PRIMARY KEY (id),
  CONSTRAINT notifications_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id)
);
CREATE TABLE public.onboarding_embeddings (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  content text NOT NULL,
  heading text,
  tokens integer,
  embedding USER-DEFINED,
  CONSTRAINT onboarding_embeddings_pkey PRIMARY KEY (id)
);
CREATE TABLE public.profiles (
  id uuid NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  email text NOT NULL UNIQUE,
  full_name text,
  avatar_url text,
  role USER-DEFINED DEFAULT 'employee'::user_role,
  billable_hourly_rate numeric DEFAULT 0,
  internal_cost_per_hour numeric DEFAULT 0,
  weekly_hours numeric DEFAULT 40,
  client_id uuid,
  CONSTRAINT profiles_pkey PRIMARY KEY (id),
  CONSTRAINT profiles_client_id_fkey FOREIGN KEY (client_id) REFERENCES public.clients(id),
  CONSTRAINT profiles_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id)
);
CREATE TABLE public.project_members (
  project_id uuid NOT NULL,
  profile_id uuid NOT NULL,
  role text,
  CONSTRAINT project_members_pkey PRIMARY KEY (project_id, profile_id),
  CONSTRAINT project_members_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.projects(id),
  CONSTRAINT project_members_profile_id_fkey FOREIGN KEY (profile_id) REFERENCES public.profiles(id)
);
CREATE TABLE public.projects (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  created_at timestamp with time zone DEFAULT now(),
  project_number integer NOT NULL DEFAULT nextval('projects_project_number_seq'::regclass) UNIQUE,
  title text NOT NULL,
  description text,
  category USER-DEFINED DEFAULT 'other'::project_category,
  status USER-DEFINED DEFAULT 'planned'::project_status,
  color_code text DEFAULT '#3b82f6'::text,
  client_id uuid NOT NULL,
  main_contact_id uuid,
  start_date date,
  deadline date,
  budget_total numeric DEFAULT 0,
  CONSTRAINT projects_pkey PRIMARY KEY (id),
  CONSTRAINT projects_client_id_fkey FOREIGN KEY (client_id) REFERENCES public.clients(id),
  CONSTRAINT projects_main_contact_id_fkey FOREIGN KEY (main_contact_id) REFERENCES public.profiles(id)
);
CREATE TABLE public.seniority_levels (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  created_at timestamp with time zone DEFAULT now(),
  level_name text NOT NULL UNIQUE,
  level_order integer NOT NULL UNIQUE,
  description text,
  experience_years_min integer,
  is_active boolean DEFAULT true,
  CONSTRAINT seniority_levels_pkey PRIMARY KEY (id)
);
CREATE TABLE public.service_modules (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  created_at timestamp with time zone DEFAULT now(),
  category USER-DEFINED NOT NULL,
  service_module text NOT NULL,
  description text,
  default_unit text NOT NULL DEFAULT 'hour'::text,
  is_active boolean DEFAULT true,
  CONSTRAINT service_modules_pkey PRIMARY KEY (id)
);
CREATE TABLE public.service_pricing (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  created_at timestamp with time zone DEFAULT now(),
  service_module_id uuid NOT NULL,
  seniority_level_id uuid NOT NULL,
  rate numeric NOT NULL,
  internal_cost numeric DEFAULT 0,
  margin_percentage numeric DEFAULT 
CASE
    WHEN (rate > (0)::numeric) THEN (((rate - internal_cost) / rate) * (100)::numeric)
    ELSE (0)::numeric
END,
  valid_from date DEFAULT CURRENT_DATE,
  valid_until date,
  is_active boolean DEFAULT true,
  CONSTRAINT service_pricing_pkey PRIMARY KEY (id),
  CONSTRAINT service_pricing_service_module_id_fkey FOREIGN KEY (service_module_id) REFERENCES public.service_modules(id),
  CONSTRAINT service_pricing_seniority_level_id_fkey FOREIGN KEY (seniority_level_id) REFERENCES public.seniority_levels(id)
);
CREATE TABLE public.storyboard_sessions (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  title text,
  concept text,
  target_duration integer,
  num_shots integer,
  config jsonb DEFAULT '{}'::jsonb,
  assets jsonb DEFAULT '[]'::jsonb,
  shots jsonb DEFAULT '[]'::jsonb,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT storyboard_sessions_pkey PRIMARY KEY (id),
  CONSTRAINT storyboard_sessions_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);
CREATE TABLE public.tasks (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  created_at timestamp with time zone DEFAULT now(),
  project_id uuid NOT NULL,
  title text NOT NULL,
  description text,
  status USER-DEFINED DEFAULT 'todo'::task_status,
  position numeric DEFAULT 1000,
  assigned_to uuid,
  start_date timestamp with time zone DEFAULT now(),
  due_date timestamp with time zone,
  planned_minutes integer DEFAULT 0,
  is_visible_to_client boolean DEFAULT false,
  service_module_id uuid,
  seniority_level_id uuid,
  estimated_hours numeric DEFAULT 0,
  estimated_rate numeric DEFAULT 0,
  CONSTRAINT tasks_pkey PRIMARY KEY (id),
  CONSTRAINT tasks_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.projects(id),
  CONSTRAINT tasks_assigned_to_fkey FOREIGN KEY (assigned_to) REFERENCES public.profiles(id),
  CONSTRAINT tasks_service_module_id_fkey FOREIGN KEY (service_module_id) REFERENCES public.service_modules(id),
  CONSTRAINT tasks_seniority_level_id_fkey FOREIGN KEY (seniority_level_id) REFERENCES public.seniority_levels(id)
);
CREATE TABLE public.time_entries (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  created_at timestamp with time zone DEFAULT now(),
  project_id uuid,
  task_id uuid,
  profile_id uuid NOT NULL,
  start_time timestamp with time zone,
  end_time timestamp with time zone,
  duration_minutes integer,
  status USER-DEFINED DEFAULT 'submitted'::time_status,
  rejection_reason text,
  billable boolean DEFAULT true,
  billed_in_invoice_id uuid,
  CONSTRAINT time_entries_pkey PRIMARY KEY (id),
  CONSTRAINT time_entries_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.projects(id),
  CONSTRAINT time_entries_task_id_fkey FOREIGN KEY (task_id) REFERENCES public.tasks(id),
  CONSTRAINT time_entries_profile_id_fkey FOREIGN KEY (profile_id) REFERENCES public.profiles(id),
  CONSTRAINT time_entries_billed_in_invoice_id_fkey FOREIGN KEY (billed_in_invoice_id) REFERENCES public.financial_documents(id)
);