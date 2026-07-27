import { createFileRoute, Link } from "@tanstack/react-router";
import { BrandLogo } from "@/components/brand-logo";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export const Route = createFileRoute("/politica-de-privacidade")({
  component: PrivacyPolicyPage,
});

function PrivacyPolicyPage() {
  const lastUpdated = "27 de julho de 2026";

  return (
    <div className="mx-auto flex min-h-[100dvh] max-w-3xl flex-col gap-6 px-4 py-8 sm:px-6 sm:py-12">
      <header className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <BrandLogo variant="plate" className="h-11 w-fit px-3 py-1.5" />
          <Button variant="ghost" size="sm" render={<Link to="/" />}>
            <ArrowLeft className="mr-2 size-4" aria-hidden="true" />
            Voltar
          </Button>
        </div>
        <div>
          <span className="mb-2 block h-0.5 w-10 rounded-full bg-gold" aria-hidden="true" />
          <h1 className="font-heading text-3xl font-semibold tracking-refined text-foreground">
            Política de Privacidade
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Guimarães &amp; Guedes Advocacia · Última atualização: {lastUpdated}
          </p>
        </div>
      </header>

      <main className="prose prose-sm max-w-none space-y-6 text-foreground/90">
        <section>
          <p className="text-sm leading-relaxed">
            Esta Política descreve como o escritório <strong>Guimarães &amp; Guedes Advocacia</strong>
            {" "}("nós") coleta, utiliza, armazena e protege os dados pessoais dos usuários ("você")
            do aplicativo e portal do cliente ("Aplicativo"), em conformidade com a Lei Geral de
            Proteção de Dados (Lei nº 13.709/2018 — LGPD).
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-heading text-xl font-semibold">1. Dados que coletamos</h2>
          <ul className="ml-5 list-disc space-y-1 text-sm leading-relaxed">
            <li><strong>Dados de cadastro:</strong> nome, e-mail, telefone/WhatsApp, CPF/CNPJ, RG e endereço.</li>
            <li><strong>Dados processuais:</strong> informações de processos, audiências, prazos, documentos e valores relacionados aos serviços jurídicos contratados.</li>
            <li><strong>Dados de acesso:</strong> registros de autenticação, endereço IP, tipo de dispositivo e navegador para fins de segurança.</li>
            <li><strong>Comunicações:</strong> mensagens trocadas dentro do Aplicativo entre cliente e escritório.</li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="font-heading text-xl font-semibold">2. Finalidade do tratamento</h2>
          <p className="text-sm leading-relaxed">
            Utilizamos seus dados para: (i) prestação dos serviços jurídicos contratados;
            (ii) gestão de processos, audiências e documentos; (iii) emissão e controle financeiro
            de honorários; (iv) comunicação sobre o andamento de causas; (v) cumprimento de
            obrigações legais e regulatórias; e (vi) segurança e prevenção a fraudes.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-heading text-xl font-semibold">3. Base legal</h2>
          <p className="text-sm leading-relaxed">
            O tratamento é fundamentado em: execução de contrato (art. 7º, V da LGPD),
            cumprimento de obrigação legal (art. 7º, II), exercício regular de direitos em
            processos (art. 7º, VI) e, quando aplicável, consentimento (art. 7º, I).
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-heading text-xl font-semibold">4. Compartilhamento</h2>
          <p className="text-sm leading-relaxed">
            Seus dados não são vendidos. Podem ser compartilhados apenas com:
            (a) tribunais e órgãos públicos, quando necessário para o processo;
            (b) contadores e correspondentes jurídicos vinculados ao seu caso;
            (c) prestadores de infraestrutura (hospedagem em nuvem e banco de dados),
            sob obrigação contratual de confidencialidade; (d) autoridades, mediante ordem legal.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-heading text-xl font-semibold">5. Armazenamento e segurança</h2>
          <p className="text-sm leading-relaxed">
            Os dados são armazenados em ambiente de nuvem com criptografia em trânsito (HTTPS/TLS)
            e em repouso. O acesso é restrito por autenticação individual e políticas de permissão
            por perfil (advogado, estagiário, cliente). Auditoria de acessos e backups periódicos
            são mantidos.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-heading text-xl font-semibold">6. Retenção</h2>
          <p className="text-sm leading-relaxed">
            Mantemos os dados enquanto durar a relação contratual e pelos prazos legais aplicáveis
            (prescrição civil, tributária e obrigações da OAB). Após esse período, os dados são
            eliminados ou anonimizados.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-heading text-xl font-semibold">7. Seus direitos (LGPD)</h2>
          <p className="text-sm leading-relaxed">
            Você pode, a qualquer momento, solicitar: confirmação da existência de tratamento;
            acesso, correção, anonimização ou eliminação de dados; portabilidade; informações
            sobre compartilhamento; e revogação de consentimento — respeitados os deveres legais
            de guarda documental do escritório.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-heading text-xl font-semibold">8. Cookies e tecnologias</h2>
          <p className="text-sm leading-relaxed">
            Utilizamos armazenamento local do navegador apenas para manter a sessão autenticada
            e preferências (como tema visual). Não usamos cookies de rastreamento publicitário.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-heading text-xl font-semibold">9. Menores de idade</h2>
          <p className="text-sm leading-relaxed">
            O Aplicativo é destinado a maiores de 18 anos. Dados de menores só são tratados no
            contexto de processos judiciais, sob responsabilidade do representante legal.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-heading text-xl font-semibold">10. Alterações desta Política</h2>
          <p className="text-sm leading-relaxed">
            Podemos atualizar esta Política a qualquer momento. A versão vigente estará sempre
            disponível nesta página, com a data da última atualização.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-heading text-xl font-semibold">11. Encarregado (DPO) e contato</h2>
          <p className="text-sm leading-relaxed">
            Para exercer seus direitos ou tirar dúvidas sobre esta Política, entre em contato:
          </p>
          <ul className="ml-5 list-disc space-y-1 text-sm leading-relaxed">
            <li>E-mail: <a className="text-gold-strong underline" href="mailto:contato@guimaraeseguedesadvocacia.com.br">contato@guimaraeseguedesadvocacia.com.br</a></li>
            <li>Site: <a className="text-gold-strong underline" href="https://guimaraeseguedesadvocacia.com.br" target="_blank" rel="noreferrer">guimaraeseguedesadvocacia.com.br</a></li>
          </ul>
        </section>
      </main>

      <footer className="border-t border-border/60 pt-4 text-xs text-muted-foreground">
        © {new Date().getFullYear()} Guimarães &amp; Guedes Advocacia. Todos os direitos reservados.
      </footer>
    </div>
  );
}
