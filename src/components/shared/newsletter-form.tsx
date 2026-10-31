"use client";

import { useEffect, useRef } from "react";
import { ArrowRight, Check, Loader2 } from "lucide-react";
import { subscribeToNewsletter } from "@/app/actions/newsletter";
import { useFormAction } from "@/hooks/use-form-action";
import { cn } from "@/lib/utils";
import type { FormState } from "@/lib/validation/schemas";

const initial: FormState<"email"> = { status: "idle" };

export function NewsletterForm({
  source = "footer",
  tone = "light",
  className,
}: {
  source?: "footer" | "home";
  tone?: "light" | "dark";
  className?: string;
}) {
  const [state, onSubmit, pending] = useFormAction(subscribeToNewsletter, initial);
  const formRef = useRef<HTMLFormElement>(null);
  const id = `newsletter-${source}`;

  useEffect(() => {
    if (state.status === "success") formRef.current?.reset();
  }, [state]);

  const dark = tone === "dark";
  return (
    <form ref={formRef} onSubmit={onSubmit} noValidate className={cn("w-full", className)}>
      <input type="hidden" name="source" value={source} />
      <div aria-hidden className="absolute -left-[9999px]">
        <label>
          Company <input type="text" name="company" tabIndex={-1} autoComplete="off" />
        </label>
      </div>
      <label htmlFor={id} className="sr-only">
        Email address
      </label>
      <div
        className={cn(
          "flex items-center border-b transition-colors focus-within:border-current",
          dark ? "border-background/40" : "border-foreground/30",
          state.status === "error" && "border-destructive",
        )}
      >
        <input
          id={id}
          name="email"
          type="email"
          autoComplete="email"
          inputMode="email"
          required
          placeholder="Email address"
          aria-invalid={state.status === "error"}
          aria-describedby={`${id}-msg`}
          className={cn(
            "h-12 w-full bg-transparent text-[0.9375rem] focus:outline-none",
            dark ? "placeholder:text-background/50" : "placeholder:text-muted-foreground",
          )}
        />
        <button
          type="submit"
          disabled={pending}
          className="flex size-11 shrink-0 items-center justify-center transition-transform duration-300 hover:translate-x-1 disabled:opacity-50"
          aria-label="Subscribe"
        >
          {pending ? (
            <Loader2 className="size-4 animate-spin" />
          ) : state.status === "success" ? (
            <Check className="size-4" />
          ) : (
            <ArrowRight className="size-4" strokeWidth={1.5} />
          )}
        </button>
      </div>
      <p
        id={`${id}-msg`}
        role={state.status === "error" ? "alert" : "status"}
        className={cn(
          "mt-3 min-h-5 text-[13px]",
          state.status === "error" ? "text-destructive" : dark ? "text-background/70" : "text-muted-foreground",
          dark && state.status === "error" && "text-[#f0a597]",
        )}
      >
        {state.message ?? "Early access to new collections. No noise — unsubscribe anytime."}
      </p>
    </form>
  );
}
