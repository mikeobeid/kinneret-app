import { useEffect, useState } from "react";
export type Theme = "light" | "dark";
const KEY = "theme";

export function useTheme() {
  const [theme, setTheme] = useState<Theme>(
    (localStorage.getItem(KEY) as Theme) || "light"
  );

useEffect(() => {
  localStorage.setItem(KEY, theme);
  const root = document.documentElement;
  if (theme === "dark") root.classList.add("dark");
  else root.classList.remove("dark");
  console.log("theme:", theme, "html classes:", root.className);
}, [theme]);

  return { theme, setTheme };
}