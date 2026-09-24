import { CheckCircle2, X } from "lucide-react";
import { useState } from "react";
import type { NavId } from "./data";
import { buildNotifications } from "./domain/notifications";
import { useDialogFocus } from "./hooks/useDialogFocus";
import type { ForgeStore } from "./useForgeStore";

export default function NotificationCenter({
  store,
  close,
  navigate,
}: {
  store: ForgeStore;
  close: () => void;
  navigate: (page: NavId) => void;
}) {
  const [now] = useState(() => Date.now());
  const items = buildNotifications(store, now);
  const dialogRef = useDialogFocus<HTMLElement>(true, close);
  return (
    <div className="modal-backdrop" onMouseDown={close}>
      <section
        ref={dialogRef}
        className="notification-center panel"
        role="dialog"
        aria-modal="true"
        aria-label="Learning notifications"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <header>
          <div>
            <span className="eyebrow">USEFUL NEXT STEPS</span>
            <h2>Notifications</h2>
          </div>
          <button onClick={close} aria-label="Close notifications">
            <X />
          </button>
        </header>
        {items.length ? (
          <div>
            {items.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    navigate(item.page);
                    close();
                  }}
                >
                  <Icon />
                  <span>
                    <b>{item.title}</b>
                    <small>{item.detail}</small>
                  </span>
                </button>
              );
            })}
          </div>
        ) : (
          <div className="notification-empty">
            <CheckCircle2 />
            <b>Nothing needs attention</b>
            <span>
              Forge only notifies you when saved evidence suggests a useful next
              step.
            </span>
          </div>
        )}
      </section>
    </div>
  );
}
