"use client";

import { Ruler } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { sizeGuide, type SizeGuideKey } from "@/config/size-guide";

export function SizeGuideDialog({ guide, fit }: { guide: SizeGuideKey; fit?: string | null }) {
  const g = sizeGuide[guide];
  return (
    <Dialog>
      <DialogTrigger className="flex items-center gap-1.5 text-[13px] text-muted-foreground underline-offset-4 hover:text-foreground hover:underline">
        <Ruler className="size-3.5" strokeWidth={1.5} /> Size guide
      </DialogTrigger>
      <DialogContent>
        <DialogTitle>Size guide</DialogTitle>
        <DialogDescription>{g.title} — measurements in centimetres.</DialogDescription>
        {fit && <p className="mt-6 border-l-2 border-accent pl-4 text-sm">{fit}</p>}
        <div className="mt-6 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-foreground">
                {g.columns.map((c) => (
                  <th key={c} scope="col" className="eyebrow py-3 pr-4 font-medium">
                    {c}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {g.rows.map((row) => (
                <tr key={row[0]} className="border-b border-border">
                  {row.map((cell, i) =>
                    i === 0 ? (
                      <th key={i} scope="row" className="py-3 pr-4 font-medium">
                        {cell}
                      </th>
                    ) : (
                      <td key={i} className="py-3 pr-4 tabular-nums text-muted-foreground">
                        {cell}
                      </td>
                    ),
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-6 text-xs text-muted-foreground">{g.note} Between sizes? Choose the larger for a relaxed fit.</p>
      </DialogContent>
    </Dialog>
  );
}
