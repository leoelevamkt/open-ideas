import { cn } from "@/lib/utils";

export function BrandLogo({
  variant = "plate",
  className,
  imgClassName,
}: {
  variant?: "plate" | "bare";
  className?: string;
  imgClassName?: string;
  priority?: boolean;
}) {
  const img = (
    <img
      src="/logo-guimaraes-guedes.png"
      alt="Guimarães & Guedes Advocacia"
      className={cn("h-full w-auto object-contain", imgClassName)}
    />
  );
  if (variant === "bare") {
    return <span className={cn("inline-flex items-center", className)}>{img}</span>;
  }
  return (
    <span className={cn("inline-flex items-center justify-center rounded-md bg-white px-3 py-2 shadow-sm", className)}>
      {img}
    </span>
  );
}
