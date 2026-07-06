import { createClient } from '@supabase/supabase-js'

const supabaseUrl  = import.meta.env.VITE_SUPABASE_URL
const supabaseKey  = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseKey)

// ─── Auth helpers ─────────────────────────────────────────────────────────────
export const signUp = (email, password) =>
  supabase.auth.signUp({ email, password })

export const signIn = (email, password) =>
  supabase.auth.signInWithPassword({ email, password })

export const signOut = () => supabase.auth.signOut()

export const getUser = () => supabase.auth.getUser()

// ─── Meals ────────────────────────────────────────────────────────────────────
export const getMeals = async (userId, date) => {
  const { data, error } = await supabase
    .from('meals')
    .select('*')
    .eq('user_id', userId)
    .eq('date', date)
    .order('created_at', { ascending: true })
  if (error) throw error
  return data
}

export const addMeal = async (userId, meal, date) => {
  const { data, error } = await supabase
    .from('meals')
    .insert([{ user_id: userId, date, ...meal }])
    .select()
    .single()
  if (error) throw error
  return data
}

export const deleteMeal = async (mealId) => {
  const { error } = await supabase
    .from('meals')
    .delete()
    .eq('id', mealId)
  if (error) throw error
}

export const clearMeals = async (userId, date) => {
  const { error } = await supabase
    .from('meals')
    .delete()
    .eq('user_id', userId)
    .eq('date', date)
  if (error) throw error
}

export const getMealsHistory = async (userId, fromDate, toDate) => {
  const { data, error } = await supabase
    .from('meals')
    .select('date, cal, prot, carbs, fat, fiber')
    .eq('user_id', userId)
    .gte('date', fromDate)
    .lte('date', toDate)
    .order('date', { ascending: false })
  if (error) throw error
  return data
}

// ─── Goals ────────────────────────────────────────────────────────────────────
export const getGoals = async (userId) => {
  const { data, error } = await supabase
    .from('goals')
    .select('*')
    .eq('user_id', userId)
    .single()
  if (error && error.code !== 'PGRST116') throw error
  return data
}

export const upsertGoals = async (userId, goals) => {
  const { data, error } = await supabase
    .from('goals')
    .upsert([{ user_id: userId, ...goals, updated_at: new Date().toISOString() }], { onConflict: 'user_id' })
    .select()
    .single()
  if (error) throw error
  return data
}

// ─── Profile ──────────────────────────────────────────────────────────────────
export const getProfile = async (userId) => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', userId)
    .single()
  if (error && error.code !== 'PGRST116') throw error
  return data
}

export const upsertProfile = async (userId, profile) => {
  const { data, error } = await supabase
    .from('profiles')
    .upsert([{ user_id: userId, ...profile, updated_at: new Date().toISOString() }], { onConflict: 'user_id' })
    .select()
    .single()
  if (error) throw error
  return data
}

// ─── Weight log ───────────────────────────────────────────────────────────────
export const getWeightLog = async (userId, limit = 30) => {
  const { data, error } = await supabase
    .from('weight_log')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit)
  if (error) throw error
  return data
}

export const addWeight = async (userId, weight, note = '') => {
  const { data, error } = await supabase
    .from('weight_log')
    .insert([{
      user_id: userId,
      weight,
      note,
      date: new Date().toLocaleDateString('es-ES', { day: 'numeric', month: 'short' }),
    }])
    .select()
    .single()
  if (error) throw error
  return data
}

// ─── Nutrition plans ──────────────────────────────────────────────────────────
export const savePlan = async (userId, plan, context) => {
  const { data, error } = await supabase
    .from('nutrition_plans')
    .insert([{ user_id: userId, plan_data: plan, context }])
    .select()
    .single()
  if (error) throw error
  return data
}

export const getLatestPlan = async (userId) => {
  const { data, error } = await supabase
    .from('nutrition_plans')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(1)
    .single()
  if (error && error.code !== 'PGRST116') throw error
  return data
}
