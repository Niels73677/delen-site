"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "motion/react";
import { brand } from "@/config/brand";
import { Button } from "@/components/ui/button";

const ease = [0.22, 1, 0.36, 1] as const;

export function Hero() {
  const words = brand.hero.headline.split(" ");
  return (
    <section className="relative h-[100svh] min-h-[600px] overflow-hidden bg-foreground text-background" aria-label="Introduction">
      <motion.div
        className="absolute inset-0"
        initial={{ scale: 1.12 }}
        animate={{ scale: 1 }}
        transition={{ duration: 2.4, ease }}
      >
        <Image
          src={brand.hero.image}
          alt={brand.hero.imageAlt}
          fill
          priority
          sizes="100vw"
          quality={85}
          className="object-cover object-[50%_35%]"
        />
      </motion.div>
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-black/25" aria-hidden />

      <div className="container-page relative flex h-full flex-col justify-end pb-14 sm:pb-20 lg:pb-24">
        <motion.p
          className="eyebrow mb-6 text-background/80"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.3, ease }}
        >
          Autumn / Winter 2026
        </motion.p>
        <h1 className="text-display max-w-[14ch] font-semibold uppercase">
          {words.map((word, i) => (
            <span key={i} className="inline-block overflow-hidden pb-[0.06em] align-bottom">
              <motion.span
                className="inline-block"
                initial={{ y: "105%" }}
                animate={{ y: 0 }}
                transition={{ duration: 1.1, delay: 0.35 + i * 0.09, ease }}
              >
                {word}
                {i < words.length - 1 ? " " : ""}
              </motion.span>
            </span>
          ))}
        </h1>
        <div className="mt-8 flex flex-col gap-8 sm:flex-row sm:items-end sm:justify-between">
          <motion.p
            className="max-w-sm text-[0.9375rem] leading-relaxed text-background/85 sm:text-base"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.8, ease }}
          >
            {brand.hero.copy}
          </motion.p>
          <motion.div
            className="flex flex-col gap-3 sm:flex-row"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.95, ease }}
          >
            <Button asChild variant="light" size="lg">
              <Link href="/shop">Shop Collection</Link>
            </Button>
            <Button asChild variant="outline-light" size="lg">
              <Link href="/about">Explore Brand</Link>
            </Button>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
