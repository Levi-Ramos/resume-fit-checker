"use client";

import { useState, type ReactNode } from "react";
import { Drawer } from "@base-ui/react/drawer";
import { PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { historyDrawerHandle } from "@/lib/history-drawer-handle";
import { cn } from "@/lib/utils";

export function HistorySidebarShell({
  children,
  headerAction,
}: {
  children: ReactNode;
  headerAction?: ReactNode;
}) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <>
      {/* Desktop: persistent, collapsible column */}
      <aside
        aria-label="History"
        className={cn(
          "hidden shrink-0 flex-col overflow-hidden border-r border-border transition-[width] duration-200 ease-out md:flex",
          collapsed ? "w-14" : "w-72"
        )}
      >
        <div className="flex h-14 shrink-0 items-center justify-between gap-2 border-b border-border px-3">
          {!collapsed && (
            <span className="truncate font-mono text-xs font-medium tracking-wide text-muted-foreground">
              History
            </span>
          )}
          <div className={cn("flex shrink-0 items-center gap-1", collapsed && "mx-auto")}>
            {!collapsed && headerAction}
            <Button
              variant="ghost"
              size="icon"
              aria-label={collapsed ? "Expand history" : "Collapse history"}
              onClick={() => setCollapsed((c) => !c)}
            >
              {collapsed ? <PanelLeftOpen /> : <PanelLeftClose />}
            </Button>
          </div>
        </div>
        {!collapsed && <div className="flex-1 overflow-y-auto p-2">{children}</div>}
      </aside>

      {/* Mobile: overlay drawer, opened via the nav's HistoryDrawerTrigger */}
      <Drawer.Root handle={historyDrawerHandle} swipeDirection="left">
        <Drawer.Portal>
          <Drawer.Backdrop className="fixed inset-0 z-40 bg-black/50 duration-200 data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0" />
          <Drawer.Viewport className="fixed inset-0 z-40 flex items-stretch justify-start">
            <Drawer.Popup className="flex h-full w-72 max-w-[85vw] flex-col border-r border-border bg-background outline-none duration-200 ease-out data-open:animate-in data-open:slide-in-from-left data-closed:animate-out data-closed:slide-out-to-left">
              <Drawer.Title className="sr-only">History</Drawer.Title>
              <div className="flex h-14 shrink-0 items-center justify-between gap-2 border-b border-border px-3">
                <span className="font-mono text-xs font-medium tracking-wide text-muted-foreground">
                  History
                </span>
                {headerAction}
              </div>
              <div className="flex-1 overflow-y-auto p-2">{children}</div>
            </Drawer.Popup>
          </Drawer.Viewport>
        </Drawer.Portal>
      </Drawer.Root>
    </>
  );
}
