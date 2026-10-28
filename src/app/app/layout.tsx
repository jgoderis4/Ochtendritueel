import { AppProvider } from "./AppProvider";
import { AppTabs } from "./AppTabs";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <AppProvider>
      <div className="mx-auto flex min-h-screen max-w-md flex-col">
        <div className="flex-1 px-6 pb-28 pt-8">{children}</div>
        <AppTabs />
      </div>
    </AppProvider>
  );
}
