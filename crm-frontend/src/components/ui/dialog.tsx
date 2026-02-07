import * as React from "react";
import { cn } from "@/lib/utils";
import { X } from "lucide-react";

interface DialogProps {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
  className?: string;
}

function Dialog({ open, onClose, children, title, className }: DialogProps) {
  React.useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />
      <div className={cn("relative z-50 w-full max-w-lg rounded-xl bg-white p-6 shadow-xl max-h-screen overflow-y-auto", className)}>
        <div className="flex items-center justify-between mb-4">
          {title && <h2 className="text-lg font-semibold">{title}</h2>}
          <button onClick={onClose} className="ml-auto rounded-sm p-1 hover:bg-gray-100">
            <X className="h-4 w-4" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

export { Dialog };
