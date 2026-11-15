/**
 * Base de dados de Daltonismo e Placas de Teste de Ishihara
 */

const COLOR_BLINDNESS_TYPES = {
  deuteranopia: {
    id: "deuteranopia",
    name: "Deuteranopia (Verde)",
    badge: "Verde",
    color: "#2D691F",
    ringColor: "#98BC96",
    summary:
      "A deuteranopia é a forma mais comum de daltonismo, caracterizada pela ausência ou deficiência funcional dos fotorreceptores cones sensíveis ao verde na retina (cones M).",
    characteristics: [
      {
        title: "Confusão de Cores",
        desc: "Dificuldade em distinguir tons de verde, vermelho, marrom e amarelo. Verdes claros podem parecer cinza, bege ou desbotados."
      },
      {
        title: "Preservação de Luminosidade",
        desc: "Diferente da protanopia, os tons de vermelho não parecem escurecidos ou apagados, pois a sensibilidade aos comprimentos de onda longos permanece ativa."
      },
      {
        title: "Causas Genéticas",
        desc: "Condição hereditária recessiva ligada ao cromossomo X, sendo muito mais frequente em homens (cerca de 5% a 6% da população masculina) do que em mulheres."
      },
      {
        title: "Diagnóstico e Acessibilidade",
        desc: "Identificada com facilidade em testes como o de Ishihara. No design de gráficos e interfaces, o uso de texturas, rótulos textuais e alto contraste elimina as barreiras visuais."
      }
    ]
  },
  protanopia: {
    id: "protanopia",
    name: "Protanopia (Vermelho)",
    badge: "Vermelho",
    color: "#BE4228",
    ringColor: "#D7A79B",
    summary:
      "A protanopia é um tipo de daltonismo caracterizado pela ausência ou mau funcionamento dos cones responsáveis por captar a cor vermelha na retina",
    characteristics: [
      {
        title: "Confusão de Cores",
        desc: "É comum confundir vermelho com preto, marrom ou verde escuro. Tonalidades de laranja e rosa também podem ser vistas como cinza ou verde."
      },
      {
        title: "Baixa Luminosidade",
        desc: "Devido à falta dos cones de onda longa (vermelhos), cores escuras nessa faixa podem parecer quase pretas."
      },
      {
        title: "Causas Genéticas",
        desc: "É uma condição hereditária recessiva ligada ao cromossomo X, o que a torna significativamente mais comum em homens do que em mulheres."
      },
      {
        title: "Diagnóstico e Controle",
        desc: "Pode ser identificada em testes como o de Ishihara. Não há cura, mas o uso de lentes ou óculos com filtros especiais prescritos por oftalmologistas pode auxiliar na percepção e distinção das cores."
      }
    ]
  },
  tritanopia: {
    id: "tritanopia",
    name: "Tritanopia (Azul)",
    badge: "Azul",
    color: "#204A56",
    ringColor: "#A0C6D1",
    summary:
      "A tritanopia é um tipo raro de daltonismo decorrente da ausência total ou anomalia grave nos cones fotorreceptores de comprimento de onda curto (cones S), responsáveis pela percepção da cor azul.",
    characteristics: [
      {
        title: "Confusão de Cores",
        desc: "Dificuldade acentuada em diferenciar azul de verde, e amarelo de violeta ou cinza. Cores azuis claras podem parecer esverdeadas ou neutras."
      },
      {
        title: "Espectro Visual",
        desc: "O mundo é percebido predominantemente através das faixas do vermelho, verde e tons neutros de cinza, sem a capacidade de registrar o contraste azul-amarelo."
      },
      {
        title: "Causas Genéticas e Adquiridas",
        desc: "Ao contrário dos tipos vermelho-verde, está associada a mutações no cromossomo 7 (não ligada ao sexo), afetando homens e mulheres igualmente, podendo também surgir decorrente de traumas ou doenças oculares."
      },
      {
        title: "Diagnóstico e Recomendações",
        desc: "Diagnosticada por testes especializados de placas de Tritan ou testes de ordenação de tons (Farnsworth-Munsell). Não há cura, recomendando-se interfaces com alto contraste de luminância."
      }
    ]
  },
  acromatopsia: {
    id: "acromatopsia",
    name: "Acromatopsia (Total)",
    badge: "Total",
    color: "#F5F5F3",
    ringColor: "#B0B0AE",
    summary:
      "A acromatopsia, ou daltonismo total, é uma condição rara em que a pessoa não possui cones funcionais na retina, enxergando o mundo exclusivamente em tons de preto, branco e cinza.",
    characteristics: [
      {
        title: "Visão Acromática Total",
        desc: "Ausência completa de percepção de qualquer tonalidade cromática; a visão opera exclusivamente por meio dos bastonetes fotorreceptores."
      },
      {
        title: "Fotofobia Acentuada",
        desc: "Intensa sensibilidade à luz ambiente diurna ou forte, já que os bastonetes saturam rapidamente sob iluminação moderada a alta."
      },
      {
        title: "Acuidade Visual e Nistagmo",
        desc: "Redução importante da nitidez visual central (geralmente entre 20/200), frequentemente associada a movimentos oscilatórios involuntários dos olhos (nistagmo)."
      },
      {
        title: "Manejo e Acessibilidade",
        desc: "Condição autossômica recessiva diagnosticada por eletrorretinografia. O manejo inclui óculos com lentes filtrantes escuras e designs digitais com máximo contraste e tipografia ampliada."
      }
    ]
  },
  normal: {
    id: "normal",
    name: "Visão Normal (Tricromata)",
    badge: "Normal",
    color: "#3F8BA2",
    ringColor: "#A0D2DE",
    summary:
      "Parabéns! De acordo com as suas respostas às placas de teste pseudoisocromático de Ishihara, não foram detectados indícios de daltonismo. Sua percepção para as faixas vermelha, verde e azul está plenamente calibrada.",
    characteristics: [
      {
        title: "Tricromacia Completa",
        desc: "Você identificou com precisão os números e padrões nas placas de controle, nas placas de diferenciação vermelho-verde e no teste do espectro azul."
      },
      {
        title: "Sensibilidade dos Cones",
        desc: "Os três tipos de cones da retina (L - onda longa/vermelho, M - onda média/verde e S - onda curta/azul) operam em harmonia para formar milhões de cores perceptíveis."
      },
      {
        title: "Importância da Triagem",
        desc: "Embora este teste digital sirva como uma triagem interativa precisa e confiável, ele tem fins informativos e não substitui um exame oftalmológico presencial completo."
      },
      {
        title: "Design Acessível",
        desc: "Conhecer a experiência de pessoas daltônicas ajuda a criar gráficos, relatórios e interfaces que qualquer pessoa possa compreender sem depender unicamente de códigos de cores."
      }
    ]
  }
};

/**
 * Placas do Teste de Ishihara sequenciais
 */
const ISHIHARA_PLATES = [
  {
    id: 1,
    image: "assets/plate_5.png",
    question: "Qual número você vê na imagem abaixo?",
    primaryOptions: ["5", "9"],
    noneOption: "Não vejo número",
    correct: "5",
    deficiencyValue: "9",
    typeHint: "red-green",
    note: "Pessoas com visão normal veem o número 5. Indivíduos com deficiência vermelho-verde frequentemente não veem nenhum número ou podem ver outros traçados."
  },
  {
    id: 2,
    image: "assets/plate_74.jpg",
    question: "Qual número você vê na imagem abaixo?",
    primaryOptions: ["74", "21"],
    noneOption: "Não vejo número",
    correct: "74",
    deficiencyValue: "21",
    typeHint: "red-green",
    note: "Pessoas com visão normal veem 74. Pessoas com daltonismo vermelho-verde frequentemente leem 21."
  },
  {
    id: 3,
    image: "assets/plate_26.jpg",
    question: "Qual número você vê na imagem abaixo?",
    primaryOptions: ["26", "6", "2"],
    noneOption: "Não vejo número",
    correct: "26",
    protanopiaValue: "6",
    deuteranopiaValue: "2",
    typeHint: "protan-vs-deutan",
    note: "Placa diagnóstica diferencial: pessoas com protanopia veem apenas o 6 (devido ao vermelho escurecido/apagado), e pessoas com deuteranopia veem apenas o 2!"
  },
  {
    id: 4,
    image: "assets/plate_8.jpg",
    question: "Qual número você vê na imagem abaixo?",
    primaryOptions: ["8", "3"],
    noneOption: "Não vejo número",
    correct: "8",
    deficiencyValue: "3",
    typeHint: "tritan",
    note: "Placa de triagem para tritanopia (eixo azul-amarelo). Visão normal lê 8."
  },
  {
    id: 5,
    image: "assets/plate_12.jpg",
    question: "Qual número você vê na imagem abaixo?",
    primaryOptions: ["12", "7"],
    noneOption: "Não vejo número",
    correct: "12",
    typeHint: "control",
    note: "Placa de controle/demonstração. Quase todas as pessoas, incluindo daltônicos, veem o número 12, exceto em casos de acromatopsia total ou deficiência visual severa."
  }
];
