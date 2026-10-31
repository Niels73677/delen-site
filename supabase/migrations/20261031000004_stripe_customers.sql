-- Link customers to a Stripe Customer so their default address is prefilled at checkout.
alter table public.profiles add column stripe_customer_id text unique;
