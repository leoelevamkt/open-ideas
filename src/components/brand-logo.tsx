import { cn } from "@/lib/utils";

export function BrandLogo({
  variant = "plate",
  className,
}: {
  variant?: "plate" | "bare";
  className?: string;
}) {
  const img = (
    <img
      src="/logo-guimaraes-guedes.png"
      alt="Guimarães & Guedes Advocacia"
      className="h-full w-auto object-contain"
    />
  );
  if (variant === "bare") {
    return <span className={cn("inline-flex items-center", className)}>{img}</span>;
  }
  return (
    <span className={cn("inline-flex h-16 items-center justify-center rounded-md bg-white px-3 py-2 shadow-sm", className)}>
      {img}
    </span>
  );
}
