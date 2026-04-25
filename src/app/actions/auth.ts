'use server';

import { createSupabaseServerClient } from '@/lib/supabase-server';
import { redirect } from 'next/navigation';

export async function signIn(formData: FormData): Promise<void> {
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.signInWithPassword({
    email:    formData.get('email') as string,
    password: formData.get('password') as string,
  });
  if (error) redirect(`/auth?error=${encodeURIComponent(error.message)}`);
  redirect('/bookings');
}

export async function signUp(formData: FormData): Promise<void> {
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.signUp({
    email:    formData.get('email') as string,
    password: formData.get('password') as string,
  });
  if (error) redirect(`/auth?mode=signup&error=${encodeURIComponent(error.message)}`);
  redirect('/bookings');
}

export async function signOut(): Promise<void> {
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();
  redirect('/');
}
