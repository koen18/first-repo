-- AI Study Planner: initial schema
-- Every table is scoped to auth.uid() via Row Level Security so this is safe
-- for a real multi-user app: each student only ever sees their own data.

create table if not exists profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  name text not null default '',
  school_level text not null default 'other',
  subjects text[] not null default '{}',
  school_start_time text not null default '08:30',
  school_end_time text not null default '15:00',
  onboarded boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists subjects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  color_index int not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists exams (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  subject_id uuid references subjects (id) on delete set null,
  topic text not null,
  date date not null,
  difficulty text not null default 'medium',
  chapters int not null default 1,
  material text not null default '',
  plan_generated boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  subject_id uuid references subjects (id) on delete set null,
  exam_id uuid references exams (id) on delete cascade,
  title text not null,
  date date not null,
  time text,
  duration_minutes int not null default 30,
  priority text not null default 'medium',
  kind text not null default 'task', -- task | event | study_session
  done boolean not null default false,
  notes text,
  created_at timestamptz not null default now()
);

create table if not exists quizzes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  subject_id uuid references subjects (id) on delete set null,
  title text not null,
  questions jsonb not null default '[]',
  last_score int,
  attempts int not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists flashcard_decks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  subject_id uuid references subjects (id) on delete set null,
  title text not null,
  cards jsonb not null default '[]',
  created_at timestamptz not null default now()
);

create table if not exists summaries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  subject_id uuid references subjects (id) on delete set null,
  title text not null,
  content text not null default '',
  created_at timestamptz not null default now()
);

create table if not exists chat_messages (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  role text not null, -- user | assistant
  content text not null,
  created_at timestamptz not null default now()
);

-- Row Level Security: everyone only ever touches their own rows.
alter table profiles enable row level security;
alter table subjects enable row level security;
alter table exams enable row level security;
alter table tasks enable row level security;
alter table quizzes enable row level security;
alter table flashcard_decks enable row level security;
alter table summaries enable row level security;
alter table chat_messages enable row level security;

create policy "own profile" on profiles for all using (auth.uid() = id) with check (auth.uid() = id);
create policy "own subjects" on subjects for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own exams" on exams for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own tasks" on tasks for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own quizzes" on quizzes for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own decks" on flashcard_decks for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own summaries" on summaries for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own chat" on chat_messages for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Auto-create a profile row whenever a new auth user signs up.
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id) values (new.id);
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
