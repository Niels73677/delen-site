#!/usr/bin/env node
/**
 * Creates (or promotes) an administrator.
 *
 *   node --env-file=.env.local scripts/create-admin.mjs admin@example.com 'a-strong-password'
 *
 * If the user already exists, the password argument is ignored and the
 * account is simply promoted to the admin role.
 */
import { createClient } from "@supabase/supabase-js";

const [email, password] = process.argv.slice(2);
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!email) {
  console.error("Usage: node --env-file=.env.local scripts/create-admin.mjs <email> [password]");
  process.exit(1);
}
if (!url || !key) {
  console.error("NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set.");
  process.exit(1);
}

const supabase = createClient(url, key, { auth: { persistSession: false } });

const { data: existing } = await supabase.from("profiles").select("id").eq("email", email.toLowerCase()).maybeSingle();
let userId = existing?.id;

if (!userId) {
  if (!password || password.length < 8) {
    console.error("User does not exist yet — provide a password of at least 8 characters.");
    process.exit(1);
  }
  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name: "Store Admin" },
  });
  if (error) {
    console.error("Could not create user:", error.message);
    process.exit(1);
  }
  userId = data.user.id;
}

const { error } = await supabase.from("profiles").update({ role: "admin" }).eq("id", userId);
if (error) {
  console.error("Could not promote user:", error.message);
  process.exit(1);
}
console.log(`✓ ${email} is now an administrator.`);
