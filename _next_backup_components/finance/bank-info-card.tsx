import { Landmark, QrCode, Info } from "lucide-react"
import type { BankInfo } from "@/lib/types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CopyButton } from "@/components/finance/copy-button"

function Row({
  label,
  value,
  copyable,
}: {
  label: string
  value: string | null
  copyable?: boolean
}) {
  if (!value) return null
  return (
    <div className="flex items-center justify-between gap-3 border-b border-border/60 py-2.5 last:border-0">
      <div className="min-w-0">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="truncate text-sm font-medium text-foreground">{value}</p>
      </div>
      {copyable ? <CopyButton value={value} className="shrink-0" /> : null}
    </div>
  )
}

export function BankInfoCard({ bank }: { bank: BankInfo | null }) {
  if (!bank || (!bank.bank_name && !bank.pix_key)) {
    return (
      <Card>
        <CardContent className="p-6 text-sm text-muted-foreground">
          Os dados bancários ainda não foram cadastrados pelo escritório.
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      {bank.bank_name ? (
        <Card className="overflow-hidden">
          <CardHeader className="flex flex-row items-center gap-2 border-b border-border bg-muted/40">
            <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Landmark className="size-4" aria-hidden="true" />
            </span>
            <CardTitle className="text-base">Transferência bancária</CardTitle>
          </CardHeader>
          <CardContent className="py-1">
            <Row label="Banco" value={bank.bank_name} />
            <Row label="Agência" value={bank.agency} copyable />
            <Row label="Conta" value={bank.account} copyable />
            <Row label="Tipo de conta" value={bank.account_type} />
            <Row label="Titular" value={bank.holder} />
            <Row label="CNPJ / CPF" value={bank.document} copyable />
          </CardContent>
        </Card>
      ) : null}

      {bank.pix_key ? (
        <Card className="overflow-hidden">
          <CardHeader className="flex flex-row items-center gap-2 border-b border-border bg-accent/15">
            <span className="flex size-8 items-center justify-center rounded-lg bg-accent text-accent-foreground">
              <QrCode className="size-4" aria-hidden="true" />
            </span>
            <CardTitle className="text-base">Pagamento via PIX</CardTitle>
          </CardHeader>
          <CardContent className="py-1">
            <Row label={`Chave PIX${bank.pix_type ? ` (${bank.pix_type})` : ""}`} value={bank.pix_key} copyable />
            <Row label="Titular" value={bank.holder} />
          </CardContent>
        </Card>
      ) : null}

      {bank.notes ? (
        <div className="flex items-start gap-2 rounded-xl border border-border bg-muted/40 p-3 text-xs text-muted-foreground">
          <Info className="mt-0.5 size-4 shrink-0 text-accent-foreground" aria-hidden="true" />
          <p className="leading-relaxed">{bank.notes}</p>
        </div>
      ) : null}
    </div>
  )
}
