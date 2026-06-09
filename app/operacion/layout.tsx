import type { ReactNode } from "react";
import AccessGate from "../../components/AccessGate";
import OperacionShell from "../../components/OperacionShell";

export default function OperacionLayout({ children }: { children: ReactNode }) {
  return (
    <AccessGate>
      <OperacionShell>{children}</OperacionShell>
    </AccessGate>
  );
}
