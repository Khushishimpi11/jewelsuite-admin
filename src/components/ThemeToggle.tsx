import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";

export function ThemeToggle() {
  const [dark, setDark] = useState(() => document.documentElement.classList.contains("dark"));

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
    localStorage.setItem("jk-theme", dark ? "dark" : "light");
  }, [dark]);

  useEffect(() => {
    const saved = localStorage.getItem("jk-theme");
    if (saved === "dark") setDark(true);
  }, []);

  return (
    <Button
  onClick={() => setDark(!dark)}
  className="h-9 w-9 bg-primary text-white hover:bg-primary/90 rounded-full flex items-center justify-center"
>
  {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
</Button>
  );
}
