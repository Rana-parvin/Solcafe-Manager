import Link from "next/link";
import { Button } from "@/components/ui/Button";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-center">
      <h1 className="text-4xl font-bold text-slate-100">404</h1>
      <p className="text-slate-400 mt-2 text-sm">Page Not Found</p>
      <div className="mt-6">
        <Link href="/">
          <Button variant="primary">Return to Dashboard</Button>
        </Link>
      </div>
    </div>
  );
}
