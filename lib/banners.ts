import type { BannerData } from "@/components/promo-banner"

const JUSTICA = "/banners/banner-justica.png"
const CONSULTORIA = "/banners/banner-consultoria.png"
const DOCUMENTOS = "/banners/banner-documentos.png"

/** Banners do painel do cliente (carrossel). */
export const clientBanners: BannerData[] = [
  {
    id: "cli-atendimento",
    eyebrow: "Guimarães & Guedes",
    title: "Acompanhe seu caso com segurança",
    subtitle: "Processos, audiências e documentos sempre à mão, com total transparência.",
    image: JUSTICA,
  },
  {
    id: "cli-mensagens",
    eyebrow: "Fale conosco",
    title: "Dúvidas? Converse com seu advogado",
    subtitle: "Envie mensagens diretas e receba orientações sem sair do aplicativo.",
    image: CONSULTORIA,
    href: "/mensagens",
    cta: "Enviar mensagem",
  },
  {
    id: "cli-documentos",
    eyebrow: "Documentos",
    title: "Seus documentos organizados",
    subtitle: "Acesse contratos, petições e comprovantes com poucos toques.",
    image: DOCUMENTOS,
    href: "/documentos",
    cta: "Ver documentos",
  },
]

/** Banners do painel da advogada (carrossel). */
export const lawyerBanners: BannerData[] = [
  {
    id: "adv-visao",
    eyebrow: "Escritório",
    title: "Sua advocacia em um só lugar",
    subtitle: "Clientes, processos, audiências e financeiro com gestão elegante e ágil.",
    image: JUSTICA,
  },
  {
    id: "adv-agenda",
    eyebrow: "Agenda",
    title: "Nunca perca uma audiência",
    subtitle: "Acompanhe os próximos compromissos e prazos do escritório.",
    image: CONSULTORIA,
    href: "/agenda",
    cta: "Abrir agenda",
  },
]

/** Banner único por seção (topo de páginas internas). */
export const pageBanners = {
  financeiro: {
    id: "pg-financeiro",
    eyebrow: "Financeiro",
    title: "Pagamentos simples e seguros",
    subtitle: "Boletos, PIX e dados bancários do escritório em um só lugar.",
    image: DOCUMENTOS,
  } satisfies BannerData,
  processos: {
    id: "pg-processos",
    eyebrow: "Processos",
    title: "Transparência em cada etapa",
    subtitle: "Acompanhe o andamento e as movimentações dos seus processos.",
    image: JUSTICA,
  } satisfies BannerData,
  agenda: {
    id: "pg-agenda",
    eyebrow: "Agenda",
    title: "Compromissos sempre organizados",
    subtitle: "Audiências, prazos e reuniões reunidos de forma clara.",
    image: CONSULTORIA,
  } satisfies BannerData,
  documentos: {
    id: "pg-documentos",
    eyebrow: "Documentos",
    title: "Sua documentação protegida",
    subtitle: "Acesse e envie documentos com praticidade e segurança.",
    image: DOCUMENTOS,
  } satisfies BannerData,
  clientes: {
    id: "pg-clientes",
    eyebrow: "Clientes",
    title: "Relacionamento em primeiro lugar",
    subtitle: "Gerencie o cadastro e o histórico dos seus clientes.",
    image: CONSULTORIA,
  } satisfies BannerData,
}
