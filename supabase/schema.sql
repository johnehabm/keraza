-- Keraza Platform - Supabase schema, functions, and security policies.
-- Run this file in Supabase Dashboard -> SQL Editor.

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- This project creates the profile from app/api/auth/register/route.ts.
-- If an old auth.users trigger exists from a previous attempt, Supabase Auth
-- can fail with "Database error creating new user" before our API continues.
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS on_auth_user_created_profile ON auth.users;
DROP TRIGGER IF EXISTS handle_new_user ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT NOT NULL,
  phone TEXT UNIQUE NOT NULL,
  grade TEXT NOT NULL,
  church_name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'student' CHECK (role IN ('student', 'admin')),
  avatar_url TEXT,
  total_xp INTEGER NOT NULL DEFAULT 0,
  current_level INTEGER NOT NULL DEFAULT 1,
  streak_days INTEGER NOT NULL DEFAULT 0,
  last_activity_date DATE,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.weeks (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  week_number INTEGER NOT NULL UNIQUE,
  opens_at TIMESTAMPTZ NOT NULL,
  closes_at TIMESTAMPTZ,
  pdf_url TEXT,
  pdf_filename TEXT,
  xp_reward_full INTEGER NOT NULL DEFAULT 100,
  xp_reward_partial INTEGER NOT NULL DEFAULT 50,
  passing_score INTEGER NOT NULL DEFAULT 60,
  is_published BOOLEAN NOT NULL DEFAULT false,
  show_answers_after_close BOOLEAN NOT NULL DEFAULT true,
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.questions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  week_id UUID REFERENCES public.weeks(id) ON DELETE CASCADE NOT NULL,
  question_text TEXT NOT NULL,
  question_type TEXT NOT NULL CHECK (question_type IN ('multiple_choice', 'true_false')),
  options JSONB NOT NULL DEFAULT '[]',
  correct_answer TEXT NOT NULL,
  explanation TEXT,
  points INTEGER NOT NULL DEFAULT 1,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.exams (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  week_id UUID REFERENCES public.weeks(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  time_limit_minutes INTEGER,
  opens_at TIMESTAMPTZ,
  closes_at TIMESTAMPTZ,
  xp_reward_full INTEGER NOT NULL DEFAULT 100,
  xp_reward_partial INTEGER NOT NULL DEFAULT 50,
  passing_score INTEGER NOT NULL DEFAULT 60,
  is_published BOOLEAN NOT NULL DEFAULT true,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.exam_submissions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  student_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  week_id UUID REFERENCES public.weeks(id) ON DELETE CASCADE NOT NULL,
  exam_id UUID REFERENCES public.exams(id) ON DELETE CASCADE,
  answers JSONB NOT NULL DEFAULT '{}',
  score INTEGER,
  total_questions INTEGER,
  correct_count INTEGER,
  xp_earned INTEGER NOT NULL DEFAULT 0,
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  submitted_at TIMESTAMPTZ,
  is_graded BOOLEAN NOT NULL DEFAULT false,
  can_retry BOOLEAN NOT NULL DEFAULT false,
  attempt_number INTEGER NOT NULL DEFAULT 1,
  UNIQUE (student_id, week_id, attempt_number)
);

CREATE TABLE IF NOT EXISTS public.badges (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  name_ar TEXT NOT NULL,
  description TEXT NOT NULL,
  description_ar TEXT NOT NULL,
  icon_url TEXT NOT NULL,
  condition_type TEXT NOT NULL,
  condition_value INTEGER,
  xp_bonus INTEGER NOT NULL DEFAULT 0,
  rarity TEXT NOT NULL DEFAULT 'common' CHECK (rarity IN ('common', 'rare', 'epic', 'legendary')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.student_badges (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  student_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  badge_id UUID REFERENCES public.badges(id) ON DELETE CASCADE NOT NULL,
  earned_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  granted_by_admin UUID REFERENCES public.profiles(id),
  UNIQUE (student_id, badge_id)
);

CREATE TABLE IF NOT EXISTS public.xp_transactions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  student_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  amount INTEGER NOT NULL,
  reason TEXT NOT NULL,
  source_type TEXT NOT NULL,
  source_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  student_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  title_ar TEXT NOT NULL,
  message TEXT NOT NULL,
  message_ar TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'info' CHECK (type IN ('info', 'success', 'warning', 'badge', 'week')),
  is_read BOOLEAN NOT NULL DEFAULT false,
  action_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.weekly_progress (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  student_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  week_id UUID REFERENCES public.weeks(id) ON DELETE CASCADE NOT NULL,
  pdf_viewed BOOLEAN NOT NULL DEFAULT false,
  pdf_viewed_at TIMESTAMPTZ,
  exam_completed BOOLEAN NOT NULL DEFAULT false,
  exam_completed_at TIMESTAMPTZ,
  UNIQUE (student_id, week_id)
);

-- Compatibility upgrades for databases that already had partial tables.
-- CREATE TABLE IF NOT EXISTS does not add missing columns to existing tables,
-- so these ALTER statements make the script safe to rerun.
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS full_name TEXT,
  ADD COLUMN IF NOT EXISTS phone TEXT,
  ADD COLUMN IF NOT EXISTS grade TEXT,
  ADD COLUMN IF NOT EXISTS class_name TEXT,
  ADD COLUMN IF NOT EXISTS church_name TEXT,
  ADD COLUMN IF NOT EXISTS role TEXT NOT NULL DEFAULT 'student',
  ADD COLUMN IF NOT EXISTS avatar_url TEXT,
  ADD COLUMN IF NOT EXISTS total_xp INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS current_level INTEGER NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS streak_days INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS last_activity_date DATE,
  ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW();

UPDATE public.profiles
SET class_name = COALESCE(class_name, grade)
WHERE class_name IS NULL;

ALTER TABLE public.weeks
  ADD COLUMN IF NOT EXISTS title TEXT,
  ADD COLUMN IF NOT EXISTS description TEXT,
  ADD COLUMN IF NOT EXISTS week_number INTEGER,
  ADD COLUMN IF NOT EXISTS opens_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS closes_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS pdf_url TEXT,
  ADD COLUMN IF NOT EXISTS pdf_filename TEXT,
  ADD COLUMN IF NOT EXISTS xp_reward_full INTEGER NOT NULL DEFAULT 100,
  ADD COLUMN IF NOT EXISTS xp_reward_partial INTEGER NOT NULL DEFAULT 50,
  ADD COLUMN IF NOT EXISTS passing_score INTEGER NOT NULL DEFAULT 60,
  ADD COLUMN IF NOT EXISTS is_published BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS show_answers_after_close BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES public.profiles(id),
  ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW();

ALTER TABLE public.questions
  ADD COLUMN IF NOT EXISTS week_id UUID REFERENCES public.weeks(id) ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS exam_id UUID REFERENCES public.exams(id) ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS question_text TEXT,
  ADD COLUMN IF NOT EXISTS question_type TEXT NOT NULL DEFAULT 'multiple_choice',
  ADD COLUMN IF NOT EXISTS options JSONB NOT NULL DEFAULT '[]',
  ADD COLUMN IF NOT EXISTS correct_answer TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS explanation TEXT,
  ADD COLUMN IF NOT EXISTS points INTEGER NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS display_order INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT NOW();

ALTER TABLE public.exam_submissions
  ADD COLUMN IF NOT EXISTS student_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS week_id UUID REFERENCES public.weeks(id) ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS exam_id UUID REFERENCES public.exams(id) ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS answers JSONB NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS score INTEGER,
  ADD COLUMN IF NOT EXISTS total_questions INTEGER,
  ADD COLUMN IF NOT EXISTS correct_count INTEGER,
  ADD COLUMN IF NOT EXISTS xp_earned INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ADD COLUMN IF NOT EXISTS submitted_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS is_graded BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS can_retry BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS attempt_number INTEGER NOT NULL DEFAULT 1;

ALTER TABLE public.exams
  ADD COLUMN IF NOT EXISTS week_id UUID REFERENCES public.weeks(id) ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS title TEXT,
  ADD COLUMN IF NOT EXISTS description TEXT,
  ADD COLUMN IF NOT EXISTS time_limit_minutes INTEGER,
  ADD COLUMN IF NOT EXISTS opens_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS closes_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS xp_reward_full INTEGER NOT NULL DEFAULT 100,
  ADD COLUMN IF NOT EXISTS xp_reward_partial INTEGER NOT NULL DEFAULT 50,
  ADD COLUMN IF NOT EXISTS passing_score INTEGER NOT NULL DEFAULT 60,
  ADD COLUMN IF NOT EXISTS is_published BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS display_order INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW();

-- If you had old weeks with questions directly under the week, create one
-- default exam for each such week and attach those old questions to it.
INSERT INTO public.exams (
  week_id,
  title,
  description,
  xp_reward_full,
  xp_reward_partial,
  passing_score,
  is_published,
  display_order
)
SELECT
  w.id,
  'امتحان الأسبوع',
  'امتحان تم إنشاؤه تلقائيا للأسئلة القديمة',
  w.xp_reward_full,
  w.xp_reward_partial,
  w.passing_score,
  true,
  0
FROM public.weeks w
WHERE EXISTS (
  SELECT 1 FROM public.questions q
  WHERE q.week_id = w.id AND q.exam_id IS NULL
)
AND NOT EXISTS (
  SELECT 1 FROM public.exams e
  WHERE e.week_id = w.id
);

UPDATE public.questions q
SET exam_id = e.id
FROM public.exams e
WHERE q.exam_id IS NULL
  AND q.week_id = e.week_id
  AND e.display_order = 0;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

CREATE OR REPLACE VIEW public.questions_safe AS
SELECT
  q.id,
  q.week_id,
  q.exam_id,
  q.question_text,
  q.question_type,
  q.options,
  q.points,
  q.display_order,
  CASE
    WHEN w.closes_at IS NOT NULL AND w.closes_at < NOW() AND w.show_answers_after_close = true
    THEN q.explanation
    ELSE NULL
  END AS explanation,
  NULL::TEXT AS correct_answer
FROM public.questions q
JOIN public.weeks w ON w.id = q.week_id
LEFT JOIN public.exams e ON e.id = q.exam_id
WHERE w.is_published = true
  AND w.opens_at <= NOW()
  AND (q.exam_id IS NULL OR e.is_published = true)
  AND (e.opens_at IS NULL OR e.opens_at <= NOW());

ALTER TABLE public.exam_submissions
  DROP CONSTRAINT IF EXISTS exam_submissions_student_id_week_id_attempt_number_key;

ALTER TABLE public.exam_submissions
  DROP CONSTRAINT IF EXISTS exam_submissions_student_exam_attempt_unique;

ALTER TABLE public.exam_submissions
  ADD CONSTRAINT exam_submissions_student_exam_attempt_unique
  UNIQUE (student_id, exam_id, attempt_number);

CREATE OR REPLACE FUNCTION public.increment_xp(
  p_student_id UUID,
  p_xp INTEGER,
  p_week_id UUID DEFAULT NULL
)
RETURNS VOID AS $$
DECLARE
  new_total INTEGER;
  new_level INTEGER := 1;
  accumulated INTEGER := 0;
BEGIN
  UPDATE public.profiles
  SET total_xp = total_xp + p_xp,
      last_activity_date = CURRENT_DATE
  WHERE id = p_student_id
  RETURNING total_xp INTO new_total;

  WHILE accumulated + FLOOR(100 * POWER(1.5, new_level - 1)) <= new_total LOOP
    accumulated := accumulated + FLOOR(100 * POWER(1.5, new_level - 1));
    new_level := new_level + 1;
  END LOOP;

  UPDATE public.profiles
  SET current_level = new_level
  WHERE id = p_student_id;

  INSERT INTO public.xp_transactions (student_id, amount, reason, source_type, source_id)
  VALUES (p_student_id, p_xp, 'Exam completion', 'exam', p_week_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.update_streak(p_student_id UUID)
RETURNS VOID AS $$
DECLARE
  last_date DATE;
BEGIN
  SELECT last_activity_date INTO last_date
  FROM public.profiles
  WHERE id = p_student_id;

  IF last_date IS NULL THEN
    UPDATE public.profiles
    SET streak_days = 1, last_activity_date = CURRENT_DATE
    WHERE id = p_student_id;
  ELSIF last_date = CURRENT_DATE - INTERVAL '1 day' THEN
    UPDATE public.profiles
    SET streak_days = streak_days + 1, last_activity_date = CURRENT_DATE
    WHERE id = p_student_id;
  ELSIF last_date < CURRENT_DATE - INTERVAL '1 day' THEN
    UPDATE public.profiles
    SET streak_days = 1, last_activity_date = CURRENT_DATE
    WHERE id = p_student_id;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.weeks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exam_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.xp_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.weekly_progress ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "profiles_own_read" ON public.profiles;
CREATE POLICY "profiles_own_read" ON public.profiles
  FOR SELECT USING (id = auth.uid() OR public.is_admin());

DROP POLICY IF EXISTS "profiles_own_update" ON public.profiles;
CREATE POLICY "profiles_own_update" ON public.profiles
  FOR UPDATE USING (id = auth.uid())
  WITH CHECK (id = auth.uid() AND role = 'student');

DROP POLICY IF EXISTS "profiles_admin_all" ON public.profiles;
CREATE POLICY "profiles_admin_all" ON public.profiles
  FOR ALL USING (public.is_admin());

DROP POLICY IF EXISTS "weeks_student_read" ON public.weeks;
CREATE POLICY "weeks_student_read" ON public.weeks
  FOR SELECT USING ((is_published = true AND opens_at <= NOW()) OR public.is_admin());

DROP POLICY IF EXISTS "weeks_admin_all" ON public.weeks;
CREATE POLICY "weeks_admin_all" ON public.weeks
  FOR ALL USING (public.is_admin());

DROP POLICY IF EXISTS "exams_student_read" ON public.exams;
CREATE POLICY "exams_student_read" ON public.exams
  FOR SELECT USING (
    is_published = true
    AND (opens_at IS NULL OR opens_at <= NOW())
    AND EXISTS (
      SELECT 1 FROM public.weeks w
      WHERE w.id = exams.week_id
      AND w.is_published = true
      AND w.opens_at <= NOW()
    )
    OR public.is_admin()
  );

DROP POLICY IF EXISTS "exams_admin_all" ON public.exams;
CREATE POLICY "exams_admin_all" ON public.exams
  FOR ALL USING (public.is_admin());

DROP POLICY IF EXISTS "questions_admin_only" ON public.questions;
CREATE POLICY "questions_admin_only" ON public.questions
  FOR ALL USING (public.is_admin());

DROP POLICY IF EXISTS "submissions_own_read" ON public.exam_submissions;
CREATE POLICY "submissions_own_read" ON public.exam_submissions
  FOR SELECT USING (student_id = auth.uid() OR public.is_admin());

DROP POLICY IF EXISTS "badges_read_all" ON public.badges;
CREATE POLICY "badges_read_all" ON public.badges
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "student_badges_read" ON public.student_badges;
CREATE POLICY "student_badges_read" ON public.student_badges
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "notifications_own_read" ON public.notifications;
CREATE POLICY "notifications_own_read" ON public.notifications
  FOR SELECT USING (student_id = auth.uid() OR student_id IS NULL OR public.is_admin());

DROP POLICY IF EXISTS "notifications_own_update" ON public.notifications;
CREATE POLICY "notifications_own_update" ON public.notifications
  FOR UPDATE USING (student_id = auth.uid());

DROP POLICY IF EXISTS "xp_own_read" ON public.xp_transactions;
CREATE POLICY "xp_own_read" ON public.xp_transactions
  FOR SELECT USING (student_id = auth.uid() OR public.is_admin());

DROP POLICY IF EXISTS "progress_own_all" ON public.weekly_progress;
CREATE POLICY "progress_own_all" ON public.weekly_progress
  FOR ALL USING (student_id = auth.uid() OR public.is_admin())
  WITH CHECK (student_id = auth.uid() OR public.is_admin());
