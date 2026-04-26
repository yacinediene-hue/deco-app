import type { ButtonHTMLAttributes } from "react";

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary";
  fullWidth?: boolean;
}

export default function Button({ variant = "primary", fullWidth, className = "", children, ...props }: Props) {
  const base = "inline-flex items-center justify-center rounded-xl px-5 py-3 text-sm font-semibold transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed";
  const variants = {
    primary: "bg-stone-900 text-white hover:bg-stone-700",
    secondary: "bg-stone-100 text-stone-800 hover:bg-stone-200",
  };
  return (
    <button className={`${base} ${variants[variant]} ${fullWidth ? "w-full" : ""} ${className}`} {...props}>
      {children}
    </button>
  );
}
