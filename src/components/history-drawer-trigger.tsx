"use client";

import { Drawer } from "@base-ui/react/drawer";
import { PanelLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { historyDrawerHandle } from "@/lib/history-drawer-handle";

export function HistoryDrawerTrigger() {
  return (
    <Drawer.Trigger
      handle={historyDrawerHandle}
      render={
        <Button variant="ghost" size="icon" aria-label="Open history" className="md:hidden">
          <PanelLeft />
        </Button>
      }
    />
  );
}
