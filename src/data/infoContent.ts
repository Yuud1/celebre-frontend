export type InfoPageKind = 'sobre' | 'diretrizes' | 'politicas'

export interface InfoSubsection {
  title: string
  paragraphs?: string[]
  bullets?: string[]
}

export interface InfoSection {
  id: string
  title: string
  paragraphs?: string[]
  bullets?: string[]
  subsections?: InfoSubsection[]
}

export interface InfoPageContent {
  badge: string
  title: string
  subtitle: string
  updatedAt: string
  sections: InfoSection[]
  showCta?: boolean
}

export const INFO_PAGES: Record<InfoPageKind, InfoPageContent> = {
  sobre: {
    badge: 'Institucional',
    title: 'Sobre o Celebre',
    subtitle:
      'Uma plataforma brasileira para transformar celebrações em páginas bonitas, com listas de presentes e pagamentos integrados.',
    updatedAt: '23 de maio de 2026',
    showCta: true,
    sections: [
      {
        id: 'o-que-e',
        title: 'O que é o Celebre',
        paragraphs: [
          'O Celebre é uma plataforma digital que ajuda você a criar páginas elegantes para casamentos, chás de bebê, revelações, chás de panela, aniversários e outras celebrações — com lista de presentes, vaquinhas e recebimento via PIX e cartão.',
          'Em vez de planilhas, links soltos e grupos de mensagens confusos, você publica um endereço único, compartilha com convidados e acompanha tudo pelo painel: quem presenteou, quanto entrou e o saldo disponível para saque.',
        ],
      },
      {
        id: 'para-quem',
        title: 'Para quem é',
        bullets: [
          'Casais e famílias organizando listas de casamento ou chá de bebê',
          'Anfitriões de chá de panela, revelação de gênero ou aniversário',
          'Quem quer arrecadar contribuições de forma transparente e organizada',
          'Organizadores que precisam de uma página profissional sem depender de desenvolvedor',
        ],
      },
      {
        id: 'como-funciona',
        title: 'Como funciona',
        paragraphs: [
          'O fluxo foi pensado para ser simples, mesmo para quem não tem experiência com tecnologia:',
        ],
        subsections: [
          {
            title: '1. Crie sua página',
            paragraphs: [
              'Escolha o tipo de celebração, selecione um template e uma paleta de cores. Nosso assiste guia você com perguntas rápidas para personalizar nomes, data, local e mensagem.',
            ],
          },
          {
            title: '2. Publique e compartilhe',
            paragraphs: [
              'Após revisar o preview, publique sua página e compartilhe o link no WhatsApp, redes sociais ou convite digital. Seus convidados acessam sem precisar criar conta.',
            ],
          },
          {
            title: '3. Receba presentes',
            paragraphs: [
              'Convidados escolhem itens da lista ou contribuem com valores livres. Os pagamentos são processados de forma segura e ficam registrados no seu painel.',
            ],
          },
          {
            title: '4. Configure e saque',
            paragraphs: [
              'Você configura sua conta de recebimentos e chave PIX no painel. Quando houver saldo disponível, solicita o saque para sua conta.',
            ],
          },
        ],
      },
      {
        id: 'recursos',
        title: 'O que você encontra na plataforma',
        bullets: [
          'Templates prontos para diferentes tipos de evento, com preview em tempo real',
          'Listas com presentes fixos, vaquinhas e itens em destaque',
          'Página pública responsiva, pensada para mobile',
          'Painel com contribuições, saldo e histórico de saques',
          'Verificação de identidade e configuração de PIX para recebimentos',
          'Suporte por e-mail conforme o plano contratado',
        ],
      },
      {
        id: 'missao',
        title: 'Nossa missão',
        paragraphs: [
          'Acreditamos que celebrar momentos importantes deve ser leve, bonito e transparente. Nossa missão é conectar pessoas, presentes e memórias em um só lugar — reduzindo a fricção entre convidados que querem presentear e anfitriões que querem organizar tudo com clareza.',
          'Trabalhamos para que cada página transmita o cuidado de quem organiza o evento, sem exigir conhecimento técnico ou longas configurações.',
        ],
      },
      {
        id: 'valores',
        title: 'O que nos guia',
        bullets: [
          'Simplicidade: menos passos, mais clareza',
          'Beleza: páginas que você tem orgulho de compartilhar',
          'Transparência: informações claras sobre pagamentos e saldo',
          'Segurança: dados e transações tratados com responsabilidade',
          'Respeito: cada celebração é única e merece acolhimento',
        ],
      },
      {
        id: 'planos',
        title: 'Planos e publicação',
        paragraphs: [
          'A criação da página pode ser iniciada sem cadastro. Para publicar e receber presentes, é necessário criar uma conta e concluir a taxa de publicação do evento, conforme o plano escolhido na home.',
          'Planos podem incluir recursos adicionais como domínio personalizado, templates premium e suporte prioritário. Valores e benefícios atualizados estão sempre disponíveis na página inicial.',
        ],
      },
      {
        id: 'contato',
        title: 'Fale conosco',
        paragraphs: [
          'Dúvidas, sugestões ou parcerias: entre em contato pelo e-mail suporte@celebre.app.br. Respondemos em dias úteis, priorizando questões relacionadas a pagamentos e publicação de eventos.',
        ],
      },
    ],
  },

  diretrizes: {
    badge: 'Comunidade',
    title: 'Diretrizes de uso',
    subtitle:
      'Regras para manter o Celebre seguro, transparente e acolhedor para anfitriões e convidados.',
    updatedAt: '23 de maio de 2026',
    sections: [
      {
        id: 'principios',
        title: 'Princípios gerais',
        paragraphs: [
          'O Celebre existe para apoiar celebrações reais e arrecadações legítimas. Ao usar a plataforma, você concorda em agir com honestidade, respeito e clareza com todos os participantes.',
          'Estas diretrizes complementam nossos Termos de Uso e Política de Privacidade. Em caso de conflito, prevalecem os documentos legais completos.',
        ],
      },
      {
        id: 'uso-permitido',
        title: 'Uso permitido',
        bullets: [
          'Criar páginas para eventos pessoais ou familiares com informações verdadeiras',
          'Arrecadar presentes e contribuições declarando claramente a finalidade',
          'Personalizar textos, imagens e listas de acordo com o seu evento',
          'Compartilhar o link apenas com pessoas convidadas ou interessadas legítimas',
          'Utilizar o painel para acompanhar pagamentos e solicitar saques do seu saldo',
        ],
      },
      {
        id: 'conteudo-proibido',
        title: 'Conteúdo e condutas proibidas',
        paragraphs: ['Não publique, solicite ou incentive:'],
        bullets: [
          'Conteúdo falso, enganoso ou que simule eventos inexistentes',
          'Arrecadações fraudulentas, esquemas de pirâide ou causas não relacionadas ao evento divulgado',
          'Material ofensivo, discriminatório, violento ou sexualmente explícito',
          'Violação de direitos autorais, de imagem ou de privacidade de terceiros',
          'Coleta de dados pessoais além do necessário para presentear ou contribuir',
          'Spam, assédio ou contato indesejado com convidados ou outros usuários',
          'Tentativas de burlar pagamentos, taxas ou sistemas de verificação da plataforma',
        ],
      },
      {
        id: 'pagamentos',
        title: 'Pagamentos e arrecadações',
        paragraphs: [
          'Toda página que recebe valores deve deixar claro quem organiza o evento, para que serve a arrecadação e como os convidados podem entrar em contato.',
        ],
        bullets: [
          'Descreva presentes e vaquinhas de forma honesta — evite valores ou metas enganosas',
          'Não prometa benefícios ou retornos financeiros inexistentes',
          'Não utilize a plataforma para lavagem de dinheiro ou transações simuladas',
          'Mantenha sua conta de recebimentos e chave PIX atualizadas e em seu nome',
          'Saques devem respeitar o saldo disponível e passar pela análise da plataforma quando aplicável',
        ],
      },
      {
        id: 'convidados',
        title: 'Respeito aos convidados',
        bullets: [
          'Informe data, local (quando houver) e contexto do evento de forma compreensível',
          'Não pressione convidados a contribuir ou compartilhar dados desnecessários',
          'Responda dúvidas sobre a lista ou o evento quando possível',
          'Proteja mensagens e nomes de quem presenteou, usando essas informações apenas no contexto da celebração',
        ],
      },
      {
        id: 'imagens',
        title: 'Imagens e identidade visual',
        paragraphs: [
          'Use fotos e textos que você tem direito de publicar. Prefira imagens do casal, da família ou ilustrações licenciadas. Não utilize marcas, logos ou obras de terceiros sem autorização.',
          'Templates e paletas do Celebre são disponibilizados para uso dentro da plataforma, conforme o plano contratado.',
        ],
      },
      {
        id: 'moderacao',
        title: 'Moderação e medidas',
        paragraphs: [
          'Podemos revisar páginas, suspender publicações ou encerrar contas que violem estas diretrizes, os Termos de Uso ou a legislação aplicável — especialmente em casos de fraude, denúncia fundamentada ou risco a convidados.',
          'Em situações graves, valores em análise podem ser retidos até conclusão de verificação, respeitando prazos legais e contratos com processadores de pagamento.',
          'Se você identificar uso indevido da plataforma, reporte para suporte@celebre.app.br com o link da página e uma descrição do ocorrido.',
        ],
      },
    ],
  },

  politicas: {
    badge: 'Legal',
    title: 'Políticas e privacidade',
    subtitle:
      'Como tratamos seus dados, processamos pagamentos e estabelecemos as regras de uso do Celebre.',
    updatedAt: '23 de maio de 2026',
    sections: [
      {
        id: 'introducao',
        title: 'Introdução',
        paragraphs: [
          'Esta página reúne informações sobre privacidade, termos de uso e práticas de pagamento do Celebre, em conformidade com a Lei Geral de Proteção de Dados (LGPD — Lei nº 13.709/2018) e demais normas aplicáveis no Brasil.',
          'Ao criar uma conta, publicar um evento ou presentear através de uma página Celebre, você declara ter lido e concordado com estas políticas.',
        ],
      },
      {
        id: 'privacidade',
        title: 'Política de privacidade',
        subsections: [
          {
            title: 'Quem somos',
            paragraphs: [
              'O Celebre é operado como plataforma de páginas de eventos e presentes. Para exercer seus direitos de titular de dados, utilize suporte@celebre.app.br.',
            ],
          },
          {
            title: 'Dados que coletamos',
            bullets: [
              'Cadastro: nome, e-mail, senha (armazenada de forma criptografada), CPF/CNPJ quando exigido para recebimentos',
              'Verificação financeira: data de nascimento, telefone, endereço, renda declarada e dados exigidos pelo provedor de pagamentos',
              'Evento: textos, imagens, listas de presentes e configurações da página que você publica',
              'Pagamentos: valores, status de transações, identificadores de cobrança e histórico de contribuições',
              'Uso: logs técnicos, endereço IP, tipo de navegador e interações com a plataforma para segurança e melhoria do serviço',
            ],
          },
          {
            title: 'Finalidades do tratamento',
            bullets: [
              'Criar e autenticar sua conta',
              'Publicar e exibir páginas de evento',
              'Processar pagamentos de publicação e contribuições de convidados',
              'Permitir saques para a chave PIX cadastrada',
              'Prevenir fraudes, cumprir obrigações legais e responder a solicitações de autoridades',
              'Enviar comunicações essenciais sobre sua conta, pagamentos ou alterações nestas políticas',
            ],
          },
          {
            title: 'Compartilhamento',
            paragraphs: [
              'Compartilhamos dados apenas quando necessário para operar o serviço:',
            ],
            bullets: [
              'Processadores de pagamento (incluindo parceiros como Asaas) para cobranças, contas de recebimento e transferências PIX',
              'Provedores de infraestrutura (hospedagem, e-mail, monitoramento) sob contratos de confidencialidade',
              'Autoridades públicas, quando houver obrigação legal ou ordem válida',
            ],
          },
          {
            title: 'Seus direitos (LGPD)',
            bullets: [
              'Confirmar a existência de tratamento e acessar seus dados',
              'Corrigir dados incompletos ou desatualizados',
              'Solicitar anonimização, bloqueio ou eliminação de dados desnecessários',
              'Revogar consentimento quando aplicável',
              'Solicitar portabilidade, conforme regulamentação da ANPD',
            ],
          },
          {
            title: 'Retenção e segurança',
            paragraphs: [
              'Mantemos dados pelo tempo necessário para cumprir as finalidades descritas, obrigações fiscais e prazos legais. Adotamos medidas técnicas e organizacionais para proteger informações contra acesso não autorizado, perda ou alteração indevida.',
            ],
          },
        ],
      },
      {
        id: 'termos',
        title: 'Termos de uso',
        subsections: [
          {
            title: 'Conta e elegibilidade',
            paragraphs: [
              'Você deve ter capacidade civil para contratar e fornecer informações verdadeiras. É responsável por manter a confidencialidade da senha e por todas as ações realizadas em sua conta.',
            ],
          },
          {
            title: 'Publicação de eventos',
            bullets: [
              'A taxa de publicação é cobrada por evento, conforme plano escolhido no momento do checkout',
              'Rascunhos podem ser salvos antes da publicação; após publicado, o evento recebe um link público (/p/slug)',
              'Você é responsável pelo conteúdo publicado e pela veracidade das informações exibidas aos convidados',
            ],
          },
          {
            title: 'Convidados e contribuições',
            paragraphs: [
              'Convidados que presenteiam não precisam criar conta na plataforma. Ao contribuir, concordam em fornecer dados mínimos exigidos pelo processador de pagamento (como nome e e-mail para comprovante).',
              'Contribuições são voluntárias e vinculadas à página visitada; reembolsos seguem regras do meio de pagamento e análise caso a caso via suporte.',
            ],
          },
          {
            title: 'Propriedade intelectual',
            paragraphs: [
              'O conteúdo que você envia permanece seu. Concede ao Celebre licença limitada para hospedar, exibir e processar esse conteúdo na operação da plataforma. Marcas, templates e software do Celebre permanecem de propriedade da plataforma.',
            ],
          },
          {
            title: 'Limitação de responsabilidade',
            paragraphs: [
              'O Celebre atua como intermediário tecnológico entre anfitriões e convidados. Não nos responsabilizamos por disputas entre participantes do evento, cancelamentos ou descumprimento de promessas feitas fora da plataforma, dentro dos limites permitidos pela lei.',
            ],
          },
        ],
      },
      {
        id: 'pagamentos-politica',
        title: 'Pagamentos, taxas e saques',
        paragraphs: [
          'Pagamentos na plataforma são processados por parceiros regulados. Ao configurar recebimentos, você também aceita os termos desses provedores.',
        ],
        bullets: [
          'Taxa de publicação: cobrada uma vez por evento para ativar a página pública',
          'Contribuições: valores pagos por convidados entram no fluxo financeiro vinculado à conta do anfitrião',
          'Verificação (KYC): pode ser exigida identificação, endereço e chave PIX antes de saques',
          'Saldo disponível: exibido no painel; saques respeitam valores já liquidados e pendências em análise',
          'Saques: solicitados para a chave PIX cadastrada; podem passar por revisão manual em casos de alerta de risco',
          'Tarifas de terceiros: o processador de pagamentos pode aplicar taxas próprias conforme contrato',
        ],
      },
      {
        id: 'cookies',
        title: 'Cookies e tecnologias similares',
        paragraphs: [
          'Utilizamos cookies e armazenamento local essenciais para manter sua sessão, preferências do builder e segurança. Não vendemos seus dados a anunciantes.',
          'Você pode gerenciar cookies no navegador; desativá-los pode limitar funcionalidades como login persistente ou salvamento de rascunho.',
        ],
      },
      {
        id: 'menores',
        title: 'Crianças e adolescentes',
        paragraphs: [
          'O Celebre não é destinado a menores de 18 anos criarem contas de anfitrião. Páginas de chá de bebê e eventos infantis podem ser criadas por responsáveis legais. Não coletamos intencionalmente dados de crianças sem consentimento dos responsáveis.',
        ],
      },
      {
        id: 'alteracoes',
        title: 'Alterações nestas políticas',
        paragraphs: [
          'Podemos atualizar este documento para refletir novas funcionalidades, exigências legais ou melhorias de segurança. A data da última revisão aparece no topo da página. Mudanças relevantes serão comunicadas por e-mail ou aviso na plataforma quando apropriado.',
        ],
      },
      {
        id: 'contato-lgpd',
        title: 'Contato e encarregado de dados',
        paragraphs: [
          'Para dúvidas sobre privacidade, termos ou exercício de direitos LGPD: suporte@celebre.app.br',
          'Responderemos em prazo razoável, conforme a complexidade da solicitação e prazos legais aplicáveis.',
        ],
      },
    ],
  },
}

export const INFO_NAV: { kind: InfoPageKind; label: string }[] = [
  { kind: 'sobre', label: 'Sobre' },
  { kind: 'diretrizes', label: 'Diretrizes' },
  { kind: 'politicas', label: 'Políticas' },
]
