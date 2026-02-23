import { Goal } from '@/types/goal';
import { supabase } from '@/lib/supabase';

// Map a Supabase row (snake_case) to the Goal interface (camelCase)
function rowToGoal(row: Record<string, unknown>): Goal {
  return {
    id: row.id as number,
    title: row.title as string,
    creator: row.creator as string,
    userId: row.user_id as string,
    target: Number(row.target),
    current: Number(row.current),
    deadline: row.deadline as string,
    supporters: row.supporters as number,
    avatar: row.avatar as string,
    completed: row.completed as boolean,
    grailAccountId: (row.grail_account_id as string | null) ?? undefined,
    autoSaveConfig:
      row.auto_save_enabled
        ? {
            enabled: true,
            frequency: row.auto_save_frequency as Goal['autoSaveConfig'] extends object
              ? Goal['autoSaveConfig']['frequency']
              : never,
            amountGrams: Number(row.auto_save_amount_grams),
            recurringPaymentId: (row.auto_save_recurring_payment_id as string | null) ?? undefined,
          }
        : undefined,
    createdAt: row.created_at as string,
    visibility: row.visibility as 'public' | 'private',
  };
}

export async function getGoals(filters?: { status?: string; userId?: string }): Promise<Goal[]> {
  let query = supabase.from('goals').select('*').order('created_at', { ascending: false });

  if (filters?.status === 'completed') {
    query = query.eq('completed', true);
  } else if (filters?.status === 'active') {
    query = query.eq('completed', false);
  }

  if (filters?.userId) {
    query = query.eq('user_id', filters.userId);
  }

  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return (data ?? []).map(rowToGoal);
}

export async function getGoalById(goalId: number): Promise<Goal | null> {
  const { data, error } = await supabase
    .from('goals')
    .select('*')
    .eq('id', goalId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null; // no rows
    throw new Error(error.message);
  }
  return data ? rowToGoal(data) : null;
}

export async function createGoal(goal: Omit<Goal, 'id'>): Promise<Goal> {
  const { data, error } = await supabase
    .from('goals')
    .insert({
      title: goal.title,
      creator: goal.creator,
      user_id: goal.userId,
      target: goal.target,
      current: goal.current,
      deadline: goal.deadline,
      supporters: goal.supporters,
      avatar: goal.avatar,
      completed: goal.completed ?? false,
      grail_account_id: goal.grailAccountId ?? null,
      auto_save_enabled: goal.autoSaveConfig?.enabled ?? false,
      auto_save_frequency: goal.autoSaveConfig?.frequency ?? null,
      auto_save_amount_grams: goal.autoSaveConfig?.amountGrams ?? null,
      auto_save_recurring_payment_id: goal.autoSaveConfig?.recurringPaymentId ?? null,
      visibility: goal.visibility,
    })
    .select()
    .single();

  if (error) throw new Error(error.message);
  return rowToGoal(data);
}

export async function updateGoalBalance(goalId: number, additionalGrams: number): Promise<Goal | null> {
  // Fetch current value first, then increment
  const existing = await getGoalById(goalId);
  if (!existing) return null;

  const newCurrent = existing.current + additionalGrams;
  const completed = newCurrent >= existing.target;

  const { data, error } = await supabase
    .from('goals')
    .update({ current: newCurrent, completed })
    .eq('id', goalId)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return rowToGoal(data);
}
