"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CloudUpload, AlertCircle, CheckCircle2 } from "lucide-react"

interface DocumentUploadFormProps {
  clientId: number
  caseId?: number
}

export function DocumentUploadForm({ clientId, caseId }: DocumentUploadFormProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [uploadStatus, setUploadStatus] = useState<"idle" | "success" | "error">("idle")
  const [formData, setFormData] = useState<{
    title: string
    description: string
    category: string
    caseId: string
  }>({
    title: "",
    description: "",
    category: "",
    caseId: caseId ? String(caseId) : "",
  })
  const [file, setFile] = useState<File | null>(null)

  const categories = [
    "RG",
    "CPF",
    "Comprovante de Residência",
    "Procuração",
    "Contrato",
    "Nota Fiscal",
    "Declaração",
    "Comprovante de Renda",
    "Comprovante de Pagamento",
    "Outro",
  ]

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0]
      if (selectedFile.size > 10 * 1024 * 1024) {
        setUploadStatus("error")
        setTimeout(() => setUploadStatus("idle"), 5000)
        return
      }
      setFile(selectedFile)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!file || !formData.title || !formData.category) {
      return
    }

    setIsUploading(true)
    try {
      // Simular upload (em produção, fazer request à API)
      await new Promise((resolve) => setTimeout(resolve, 1500))
      setUploadStatus("success")
      setFormData({ title: "", description: "", category: "", caseId: caseId ? String(caseId) : "" })
      setFile(null)
      setTimeout(() => setUploadStatus("idle"), 3000)
    } catch (error) {
      setUploadStatus("error")
      setTimeout(() => setUploadStatus("idle"), 3000)
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Enviar Documento</CardTitle>
        <CardDescription>Compartilhe documentos solicitados pelo advogado ou anexe arquivos relevantes ao seu processo.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {uploadStatus === "success" && (
            <Alert className="border-green-200 bg-green-50">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">Documento enviado com sucesso!</AlertDescription>
            </Alert>
          )}
          {uploadStatus === "error" && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>Erro ao enviar documento. Tente novamente.</AlertDescription>
            </Alert>
          )}

          <div>
            <Label htmlFor="title">Título do Documento *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="ex: RG frente e verso"
              className="mt-2"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="category">Categoria *</Label>
              <Select value={formData.category} onValueChange={(value: string | null) => value && setFormData({ ...formData, category: value })}>
                <SelectTrigger className="mt-2">
                  <SelectValue placeholder="Selecione a categoria" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="description">Descrição (opcional)</Label>
            <Textarea
              id="description"
              value={formData.description || ""}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Informações adicionais sobre o documento..."
              className="mt-2"
              rows={3}
            />
          </div>

          <div>
            <Label htmlFor="file">Selecione o Arquivo *</Label>
            <div className="mt-2">
              <input
                id="file"
                type="file"
                onChange={handleFileChange}
                disabled={isUploading}
                className="hidden"
                required
              />
              <label
                htmlFor="file"
                className="flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-border p-6 cursor-pointer hover:bg-muted transition-colors"
              >
                <CloudUpload className="h-8 w-8 text-muted-foreground" />
                <div className="text-center">
                  <p className="text-sm font-medium">{file ? file.name : "Clique para selecionar arquivo"}</p>
                  <p className="text-xs text-muted-foreground">Máx. 10 MB (PDF, DOC, DOCX, JPG, PNG)</p>
                </div>
              </label>
            </div>
          </div>

          <Button type="submit" disabled={!file || !formData.title || !formData.category || isUploading} className="w-full">
            {isUploading ? "Enviando..." : "Enviar Documento"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
