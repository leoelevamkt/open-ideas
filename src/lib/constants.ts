export const CASE_STATUSES = [
  "Em Análise","Protocolado","Em Andamento","Audiência Marcada",
  "Aguardando Decisão","Sentenciado","Arquivado","Finalizado",
] as const;

export const LEGAL_AREAS = [
  "Trabalhista","Cível","Família","Criminal","Tributário","Empresarial","Previdenciário","Consumidor",
] as const;

export const DOCUMENT_CATEGORIES = [
  "Contratos","Procurações","Petições","Sentenças","Laudos","Comprovantes","Documentos Pessoais","Outros",
] as const;

export const HEARING_TYPES = ["Presencial","Online","Híbrida"] as const;

export const PIX_KEY_TYPES = ["CPF","CNPJ","E-mail","Telefone","Aleatória"] as const;

export type BannerData = {
  id: string; eyebrow?: string; title: string; subtitle?: string;
  image: string; href?: string; cta?: string;
};

const J = "/banners/banner-justica.png";
const C = "/banners/banner-consultoria.png";
const D = "/banners/banner-documentos.png";

export const lawyerBanners: BannerData[] = [
  { id: "adv-1", eyebrow: "Escritório", title: "Sua advocacia em um só lugar", subtitle: "Clientes, processos, audiências e financeiro com gestão elegante e ágil.", image: J },
  { id: "adv-2", eyebrow: "Agenda", title: "Nunca perca uma audiência", subtitle: "Acompanhe os próximos compromissos e prazos do escritório.", image: C, href: "/agenda", cta: "Abrir agenda" },
];
export const clientBanners: BannerData[] = [
  { id: "cli-1", eyebrow: "Guimarães & Guedes", title: "Acompanhe seu caso com segurança", subtitle: "Processos, audiências e documentos sempre à mão.", image: J },
  { id: "cli-2", eyebrow: "Fale conosco", title: "Dúvidas? Converse com seu advogado", subtitle: "Envie mensagens diretas sem sair do app.", image: C, href: "/mensagens", cta: "Enviar mensagem" },
  { id: "cli-3", eyebrow: "Documentos", title: "Seus documentos organizados", subtitle: "Acesse contratos, petições e comprovantes.", image: D, href: "/documentos", cta: "Ver documentos" },
];
export const pageBanners = {
  financeiro: { id: "pg-f", eyebrow: "Financeiro", title: "Pagamentos simples e seguros", subtitle: "Boletos, PIX e dados bancários do escritório em um só lugar.", image: D },
  processos: { id: "pg-p", eyebrow: "Processos", title: "Transparência em cada etapa", subtitle: "Acompanhe o andamento e as movimentações dos seus processos.", image: J },
  agenda: { id: "pg-a", eyebrow: "Agenda", title: "Compromissos sempre organizados", subtitle: "Audiências, prazos e reuniões reunidos de forma clara.", image: C },
  documentos: { id: "pg-d", eyebrow: "Documentos", title: "Sua documentação protegida", subtitle: "Acesse e envie documentos com praticidade e segurança.", image: D },
  clientes: { id: "pg-c", eyebrow: "Clientes", title: "Relacionamento em primeiro lugar", subtitle: "Gerencie o cadastro e o histórico dos seus clientes.", image: C },
} as const;
