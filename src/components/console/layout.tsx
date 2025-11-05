import { ReactNode } from "react";
import { Sidebar } from "@/types/blocks/sidebar";

export default function ConsoleLayout({ children, sidebar }: { children: ReactNode; sidebar?: Sidebar }) {
  return <div className="console-layout">{children}</div>;
}

