-- Run this once in your Supabase SQL Editor
-- Creates the vector similarity search function for the Onboarding chatbot

-- STEP 1: Ensure pgvector is enabled (usually already on in Supabase)
-- create extension if not exists vector;

-- STEP 2: Check current embedding column dimension
-- select atttypmod from pg_attribute
-- where attrelid = 'public.onboarding_embeddings'::regclass
-- and attname = 'embedding';
-- Result: atttypmod = 772 means vector(768), -1 means untyped

-- STEP 3: If embedding column has no dimension set, update it:
-- ALTER TABLE onboarding_embeddings ALTER COLUMN embedding TYPE vector(768);

-- STEP 4: Create the similarity search function
create or replace function match_onboarding_docs(
  query_embedding vector(768),
  match_count int default 5
)
returns table (
  id uuid,
  heading text,
  content text,
  similarity float
)
language sql stable as $$
  select
    id,
    heading,
    content,
    1 - (embedding <=> query_embedding) as similarity
  from onboarding_embeddings
  where embedding is not null
  order by embedding <=> query_embedding
  limit match_count;
$$;
