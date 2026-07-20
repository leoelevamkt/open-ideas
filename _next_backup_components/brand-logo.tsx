import Image from "next/image"
import { cn } from "@/lib/utils"

/**
 * Logo do escritório Guimarães & Guedes Advocacia (PNG com fundo transparente).
 * Como os elementos da logo são escuros, em superfícies escuras ela é exibida
 * sobre uma "placa" clara arredondada para manter a legibilidade. Em superfícies
 * claras, use a variante "bare" para exibir a logo diretamente, sem moldura.
 */
export function BrandLogo({
  variant = "plate",
  className,
  imgClassName,
  priority,
}: {
  variant?: "plate" | "bare"
  className?: string
  imgClassName?: string
  priority?: boolean
}) {
  const img = (
    <Image
      src="/logo-guimaraes-guedes.png"
      alt="Guimarães & Guedes Advocacia"
      width={800}
      height={370}
      priority={priority}
      className={cn("h-full w-auto object-contain", imgClassName)}
    />
  )

  if (variant === "bare") {
    return <span className={cn("inline-flex items-center", className)}>{img}</span>
  }

  return (
    <span
      className={cn(
        "inline-flex items-center justify-center rounded-md bg-white px-3 py-2 shadow-sm",
        className,
      )}
    >
      {img}
    </span>
  )
}
