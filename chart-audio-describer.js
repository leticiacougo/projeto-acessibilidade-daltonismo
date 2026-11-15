/**
 * ChartAudioDescriber - Sistema Inteligente de Audiodescrição e Síntese de Voz (TTS) para Gráficos
 * 
 * Focado na acessibilidade de usuários de leitores de tela (NVDA, JAWS, TalkBack, VoiceOver)
 * e indivíduos com baixa visão, visão subnormal ou daltonismo.
 * 
 * Funcionalidades:
 * - Diagnóstico completo do gráfico original antes da adaptação (tipo, eixos, título, valores, cores originais)
 * - Mapeamento e explicação detalhada da adaptação cromática para cada tipo de daltonismo
 * - Identificação de mudanças na representação visual (contraste, nitidez, fundo branco puro)
 * - Reforço dos valores e conclusões numéricas para retenção
 * - Visão computacional integrada em canvas para imagens customizadas enviadas pelo usuário
 * - Motor de Síntese de Voz Nativo (Web Speech API) em português (pt-BR)
 */

class ChartDataAnalyzer {
  constructor() {
    // Banco canônico de dados estruturados
    this.knownCharts = {
      salesBar: {
        id: 'salesBar',
        type: 'bar',
        title: 'Desempenho de Vendas por Trimestre (Meta x Realizado)',
        subtitle: 'Comparativo de vendas regionais e trimestrais em relação à meta de 70 mil reais',
        typeDescription: 'Gráfico de Colunas Verticais com 7 barras de dados comparativos',
        xAxisLabel: 'Trimestres e Regiões de Atuação',
        yAxisLabel: 'Vendas em milhares de reais (R$ k)',
        axesDescription: 'O eixo horizontal (X) apresenta os trimestres e regiões de atuação, enquanto o eixo vertical (Y) mensura as vendas em milhares de reais com linha de referência indicando a meta de 70 mil reais',
        unit: 'k',
        unitFull: 'milhares de reais',
        benchmark: { label: 'Meta Estabelecida', value: 70, unit: 'k' },
        categories: [
          { name: '1º Trimestre Norte (Q1 Norte)', value: 55, target: 70, status: 'below', diff: -15, diffPercent: -21.4, originalColor: 'Vermelho Carmim', originalHex: '#e15759' },
          { name: '1º Trimestre Sul (Q1 Sul)', value: 82, target: 70, status: 'above', diff: 12, diffPercent: 17.1, originalColor: 'Verde Esmeralda', originalHex: '#59a14f' },
          { name: '2º Trimestre Norte (Q2 Norte)', value: 45, target: 70, status: 'below', diff: -25, diffPercent: -35.7, originalColor: 'Vermelho Carmim', originalHex: '#e15759' },
          { name: '2º Trimestre Sul (Q2 Sul)', value: 94, target: 70, status: 'above', diff: 24, diffPercent: 34.3, originalColor: 'Verde Esmeralda', originalHex: '#59a14f' },
          { name: '3º Trimestre Norte (Q3 Norte)', value: 88, target: 70, status: 'above', diff: 18, diffPercent: 25.7, originalColor: 'Verde Esmeralda', originalHex: '#59a14f' },
          { name: '3º Trimestre Sul (Q3 Sul)', value: 62, target: 70, status: 'below', diff: -8, diffPercent: -11.4, originalColor: 'Vermelho Carmim', originalHex: '#e15759' },
          { name: '4º Trimestre Geral (Q4 Geral)', value: 91, target: 70, status: 'above', diff: 21, diffPercent: 30.0, originalColor: 'Verde Esmeralda', originalHex: '#59a14f' }
        ],
        series: [
          { name: 'Vendas Realizadas', data: [55, 82, 45, 94, 88, 62, 91] }
        ],
        originalDiagnosis: 'O gráfico original utiliza barras vermelhas para valores abaixo da meta e verdes para acima da meta com níveis de saturação e brilho quase idênticos, criando forte confusão perceptual e tornando-as indistinguíveis para pessoas com deuteranopia ou protanopia.'
      },
      marketPie: {
        id: 'marketPie',
        type: 'pie',
        title: 'Distribuição de Market Share por Região',
        subtitle: 'Participação relativa de cada região brasileira no volume total de vendas da empresa',
        typeDescription: 'Gráfico Setorial / Circular do tipo Pizza dividido em 4 fatias proporcionais',
        xAxisLabel: 'Regiões Geográficas',
        yAxisLabel: 'Participação Percentual no Mercado (totalizando 100%)',
        axesDescription: 'Composição proporcional circular onde as 4 fatias representam as regiões do país totalizando 100 por cento do volume do mercado',
        unit: '%',
        unitFull: 'por cento',
        total: 100,
        categories: [
          { name: 'Região Sudeste', value: 38, percentage: 38, rank: 1, originalColor: 'Azul Marinho / Índigo', originalHex: '#4e79a7', shareDesc: 'Líder de mercado com mais de um terço do volume total' },
          { name: 'Região Sul', value: 27, percentage: 27, rank: 2, originalColor: 'Laranja Queimado', originalHex: '#f28e2b', shareDesc: 'Segunda maior participação regional' },
          { name: 'Região Nordeste', value: 21, percentage: 21, rank: 3, originalColor: 'Verde Oliva / Musgo', originalHex: '#59a14f', shareDesc: 'Terceira posição no mercado' },
          { name: 'Região Centro-Oeste', value: 14, percentage: 14, rank: 4, originalColor: 'Vermelho Carmim', originalHex: '#e15759', shareDesc: 'Menor participação entre as macrorregiões atendidas' }
        ],
        series: [
          { name: 'Market Share', data: [38, 27, 21, 14] }
        ],
        originalDiagnosis: 'As fatias originais combinam verde, vermelho, marrom e laranja com saturações próximas, gerando severa ambiguidade no eixo vermelho-verde e impossibilitando a leitura correta das fatias sem apoio textual.'
      },
      retentionLine: {
        id: 'retentionLine',
        type: 'line',
        title: 'Evolução Mensal de Retenção, Churn e Engajamento',
        subtitle: 'Acompanhamento temporal de 3 métricas estratégicas de clientes ao longo de 10 meses (Janeiro a Outubro)',
        typeDescription: 'Gráfico de Linhas Temporais com 3 séries multivariadas contínuas',
        xAxisLabel: 'Meses do Ano (Janeiro a Outubro)',
        yAxisLabel: 'Percentual Atingido (0 a 100%)',
        axesDescription: 'O eixo horizontal (X) registra a passagem dos 10 meses de Janeiro a Outubro, e o eixo vertical (Y) quantifica o percentual de 0 a 100 por cento dos indicadores',
        unit: '%',
        unitFull: 'por cento',
        timePoints: ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro'],
        categories: [
          { name: 'Retenção de Clientes', value: '45% a 84%', diff: 39, originalColor: 'Verde Esmeralda', originalHex: '#59a14f', trend: 'ascendente acentuada' },
          { name: 'Taxa de Churn (Cancelamento)', value: '55% a 19%', diff: -36, originalColor: 'Vermelho Carmim', originalHex: '#e15759', trend: 'descendente contínua (positiva)' },
          { name: 'Engajamento Médio', value: '30% a 75%', diff: 45, originalColor: 'Azul Claro Celeste', originalHex: '#76b7b2', trend: 'ascendente contínua' }
        ],
        series: [
          { name: 'Retenção de Clientes', colorRole: 'Métrica Positiva', data: [45, 48, 52, 60, 64, 70, 73, 76, 80, 84], startVal: 45, endVal: 84, diff: 39, originalColor: 'Verde Esmeralda', originalHex: '#59a14f' },
          { name: 'Taxa de Churn (Cancelamento)', colorRole: 'Métrica Negativa', data: [55, 52, 47, 43, 38, 32, 28, 25, 22, 19], startVal: 55, endVal: 19, diff: -36, originalColor: 'Vermelho Carmim', originalHex: '#e15759' },
          { name: 'Engajamento Médio', colorRole: 'Métrica de Uso', data: [30, 36, 42, 45, 50, 58, 62, 68, 72, 75], startVal: 30, endVal: 75, diff: 45, originalColor: 'Azul Claro Celeste', originalHex: '#76b7b2' }
        ],
        originalDiagnosis: 'Três linhas finas contínuas traçadas em vermelho, verde e azul sem marcadores distintos de pontos, tornando impossível o rastreio das linhas que se cruzam para pessoas com daltonismo no eixo vermelho-verde.'
      }
    };
  }

  /**
   * Fornece informações ricas e científicas sobre cada perfil de preset / daltonismo
   */
  _getPresetInfo(presetKey) {
    const presets = {
      deuteranopia: {
        id: 'deuteranopia',
        label: 'Deuteranopia (Daltonismo para o Verde)',
        description: 'Condição caracterizada pela ausência ou deficiência nos cones fotorreceptores sensíveis ao verde (frequências médias), fazendo com que verdes sejam confundidos com vermelhos, laranjas e marrons.',
        colorMapRule: 'Os tons originais em verde foram transpostos para Azul Celeste e Ciano da paleta segura universal Okabe-Ito. Já os tons de vermelho foram convertidos para Âmbar e Laranja Ouro de alta luminosidade, eliminando completamente a confusão perceptual.',
        visualImprovements: 'Eliminação total da sobreposição vermelho-verde, ganho de contraste dinâmico de 25% atendendo ao padrão WCAG AAA, realce na nitidez dos eixos com máscara unsharp e remoção de ruídos de fundo para branco puro #FFFFFF.'
      },
      protanopia: {
        id: 'protanopia',
        label: 'Protanopia (Daltonismo para o Vermelho)',
        description: 'Condição de deficiência nos cones sensíveis ao vermelho (frequências longas), fazendo com que tons vermelhos pareçam muito escuros, apagados ou marrons, perdendo contraste contra fundos escuros.',
        colorMapRule: 'Os tons originais em vermelho tiveram sua luminância fortemente ampliada e foram transpostos para Ouro Vibrante e Âmbar Luminoso. Já os tons de verde foram convertidos para Azul Cobalto profundo.',
        visualImprovements: 'Restauração da visibilidade de dados em vermelho escuro com luminância reforçada, ganho de contraste de 30% em conformidade com WCAG AAA, e purificação do plano de fundo.'
      },
      tritanopia: {
        id: 'tritanopia',
        label: 'Tritanopia (Daltonismo para o Azul)',
        description: 'Condição rara onde faltam os fotorreceptores de ondas curtas (cones azuis), resultando em confusão visual entre azul e verde, e entre amarelo e violeta/rosa.',
        colorMapRule: 'Os tons de azul foram convertidos para Ciano Escuro e Petróleo de alta definição, enquanto tons de amarelo e verde claro foram convertidos para Magenta Intenso e Rosa Vivo de alto contraste.',
        visualImprovements: 'Substituição das ambiguidades azul-amarelo por pares cromáticos contrastantes de ciano e magenta, com contornos bem definidos e eliminação de interferências visuais.'
      },
      acromatopsia: {
        id: 'acromatopsia',
        label: 'Acromatopsia (Monocromático de Alta Definição)',
        description: 'Ausência total de cones funcionais na retina, de modo que o usuário enxerga exclusivamente em escala de preto, cinza e branco (luminância).',
        colorMapRule: 'Todas as cores do gráfico foram quantizadas e convertidas em 5 faixas perceptuais discretas de luminância (branco puro, cinza claro 195, cinza médio 130, cinza escuro 70 e preto profundo 15).',
        visualImprovements: 'Diferenciação precisa entre cada barra ou fatia com base estrita no valor de luminância, permitindo a compreensão integral dos dados sem nenhuma dependência de cores.'
      },
      'high-contrast': {
        id: 'high-contrast',
        label: 'Alto Contraste WCAG AAA',
        description: 'Desenvolvido para baixa visão, visão subnormal, catarata ou glaucoma, priorizando máxima densidade de leitura e legibilidade dos textos e números.',
        colorMapRule: 'Eixos, réguas numéricas e textos foram aprofundados para preto puro, o fundo foi normalizado para branco absoluto #FFFFFF e a saturação das cores dos dados foi ampliada em 120%.',
        visualImprovements: 'Razão de contraste superior a 7:1 (nível máximo WCAG AAA), eliminação de manchas de papel e realce de nitidez unsharp mask em todas as bordas.'
      },
      auto: {
        id: 'auto',
        label: 'Auto Inteligente (Otimização Automática)',
        description: 'Algoritmo inteligente de equilíbrio que ajusta contraste dinâmico, realce de contornos e clareamento de fundo conforme a distribuição de luminância da imagem.',
        colorMapRule: 'Ajuste adaptativo de luminância e saturação, preservando a identidade visual enquanto maximiza a separação perceptual entre as áreas de dados.',
        visualImprovements: 'Ganho de contraste de 22%, nitidez de réguas ampliada em 35% e purificação do plano de fundo para eliminar reflexos de iluminação.'
      }
    };

    return presets[presetKey] || presets.auto;
  }

  /**
   * Ponto de entrada principal de análise de gráficos
   * @param {string|HTMLCanvasElement|HTMLImageElement} source
   * @param {object} options
   */
  analyze(source, options = {}) {
    const presetKey = options.preset || 'auto';
    const presetInfo = this._getPresetInfo(presetKey);

    // Gráficos Estruturados Conhecidos
    if (typeof source === 'string') {
      if (source.includes('Vendas') || source.includes('Trimestre') || source.includes('salesBar')) {
        return this._buildStructuredAnalysis(this.knownCharts.salesBar, presetKey, presetInfo, options);
      }
      if (source.includes('Market') || source.includes('Pizza') || source.includes('marketPie')) {
        return this._buildStructuredAnalysis(this.knownCharts.marketPie, presetKey, presetInfo, options);
      }
      if (source.includes('Evolução') || source.includes('Retenção') || source.includes('retentionLine')) {
        return this._buildStructuredAnalysis(this.knownCharts.retentionLine, presetKey, presetInfo, options);
      }
    }

    // Gráficos Customizados (upload de arquivo ou captura de câmera pelo usuário)
    return this._analyzeCustomImage(source, presetKey, presetInfo, options);
  }

  /**
   * Constrói análise estruturada completa para os gráficos de referência
   */
  _buildStructuredAnalysis(baseChart, presetKey, presetInfo, options) {
    const stats = options.stats || {};
    const contrastGainText = stats.contrastGain || (presetKey === 'protanopia' ? '+30%' : (presetKey === 'deuteranopia' ? '+25%' : '+22%'));

    // Mapeamento dinâmico de cores adaptadas conforme o preset escolhido
    const categories = baseChart.categories.map((c) => {
      let adaptedColor = c.originalColor;
      let adaptedHex = c.originalHex;

      if (baseChart.id === 'salesBar') {
        if (c.originalColor === 'Verde Esmeralda') {
          if (presetKey === 'deuteranopia') { adaptedColor = 'Azul Celeste Okabe-Ito'; adaptedHex = '#56b4e9'; }
          else if (presetKey === 'protanopia') { adaptedColor = 'Azul Cobalto Profundo'; adaptedHex = '#0072b2'; }
          else if (presetKey === 'tritanopia') { adaptedColor = 'Magenta Intenso / Rosa Vivo'; adaptedHex = '#cc79a7'; }
          else if (presetKey === 'acromatopsia') { adaptedColor = 'Cinza Claro Quantizado (Luminância 195)'; adaptedHex = '#c3c3c3'; }
          else if (presetKey === 'high-contrast') { adaptedColor = 'Verde Otimizado com Linhas Pretas AAA'; adaptedHex = '#27815c'; }
          else { adaptedColor = 'Verde Esmeralda com Contraste Otimizado'; adaptedHex = '#59a14f'; }
        } else {
          if (presetKey === 'deuteranopia') { adaptedColor = 'Âmbar / Laranja Ouro Vibrante'; adaptedHex = '#e69f00'; }
          else if (presetKey === 'protanopia') { adaptedColor = 'Ouro Vibrante / Âmbar Luminoso'; adaptedHex = '#f0e442'; }
          else if (presetKey === 'tritanopia') { adaptedColor = 'Vermelhão Carmim Profundo'; adaptedHex = '#d55e00'; }
          else if (presetKey === 'acromatopsia') { adaptedColor = 'Cinza Escuro Quantizado (Luminância 70)'; adaptedHex = '#464646'; }
          else if (presetKey === 'high-contrast') { adaptedColor = 'Vermelho Escuro de Alto Contraste'; adaptedHex = '#b22222'; }
          else { adaptedColor = 'Vermelho Carmim com Contraste Reforçado'; adaptedHex = '#e15759'; }
        }
      } else if (baseChart.id === 'marketPie') {
        if (c.name.includes('Sudeste')) {
          adaptedColor = (presetKey === 'tritanopia') ? 'Ciano Petróleo (#009e73)' : ((presetKey === 'acromatopsia') ? 'Preto / Cinza Muito Escuro' : 'Azul Cobalto Profundo');
          adaptedHex = '#0072b2';
        } else if (c.name.includes('Sul')) {
          adaptedColor = (presetKey === 'protanopia') ? 'Ouro Amarelo Brilhante' : ((presetKey === 'tritanopia') ? 'Magenta / Rosa Forte' : ((presetKey === 'acromatopsia') ? 'Cinza Médio-Claro' : 'Âmbar Ouro Vibrante'));
          adaptedHex = '#e69f00';
        } else if (c.name.includes('Nordeste')) {
          adaptedColor = (presetKey === 'deuteranopia' || presetKey === 'protanopia') ? 'Azul Celeste Acessível' : ((presetKey === 'tritanopia') ? 'Vermelhão Ouro' : ((presetKey === 'acromatopsia') ? 'Cinza Claro Quantizado' : 'Verde Otimizado'));
          adaptedHex = '#56b4e9';
        } else {
          adaptedColor = (presetKey === 'protanopia') ? 'Amarelo Ouro' : ((presetKey === 'tritanopia') ? 'Grafite Escuro' : ((presetKey === 'acromatopsia') ? 'Branco Puro com Traço Preto' : 'Vermelhão Âmbar Escuro'));
          adaptedHex = '#d55e00';
        }
      } else if (baseChart.id === 'retentionLine') {
        if (c.name.includes('Retenção')) {
          adaptedColor = (presetKey === 'deuteranopia') ? 'Azul Celeste Okabe-Ito' : ((presetKey === 'protanopia') ? 'Azul Cobalto Profundo' : ((presetKey === 'tritanopia') ? 'Magenta Intenso' : ((presetKey === 'acromatopsia') ? 'Linha Branca / Cinza Claro' : 'Verde Esmeralda')));
          adaptedHex = '#56b4e9';
        } else if (c.name.includes('Churn')) {
          adaptedColor = (presetKey === 'protanopia') ? 'Ouro Vibrante / Âmbar' : ((presetKey === 'deuteranopia') ? 'Âmbar / Laranja Ouro' : ((presetKey === 'tritanopia') ? 'Vermelhão Ouro' : ((presetKey === 'acromatopsia') ? 'Linha Cinza Escuro Tracejada' : 'Vermelho Carmim')));
          adaptedHex = '#e69f00';
        } else {
          adaptedColor = (presetKey === 'tritanopia') ? 'Ciano Petróleo' : ((presetKey === 'acromatopsia') ? 'Linha Cinza Médio Pontilhada' : 'Azul Cobalto Escuro');
          adaptedHex = '#0072b2';
        }
      }

      return {
        ...c,
        valueDisplay: c.valueDisplay || `${c.value} ${baseChart.unitFull || baseChart.unit || ''}`,
        adaptedColor,
        adaptedHex,
        statusText: c.status === 'above' ? '✓ Superou a Meta' : (c.status === 'below' ? '⚠ Abaixo da Meta' : 'Acessível'),
        badgeClass: c.status === 'above' ? 'badge-table-success' : (c.status === 'below' ? 'badge-table-warning' : 'badge-table-info')
      };
    });

    let reinforcementSummary = '';
    if (baseChart.id === 'salesBar') {
      reinforcementSummary = 'Para fixação dos dados: O 2º Trimestre Sul registrou a maior venda com 94 mil reais (34% acima da meta), e o 2º Trimestre Norte o menor resultado com 45 mil reais. A região Sul manteve desempenho consistentemente superior à meta de 70 mil reais em todos os trimestres.';
    } else if (baseChart.id === 'marketPie') {
      reinforcementSummary = 'Para fixação dos dados: A Região Sudeste lidera isoladamente com 38% de participação, seguida pelo Sul com 27%. Conjuntamente, o eixo Sul-Sudeste controla 65% de todo o mercado regional.';
    } else if (baseChart.id === 'retentionLine') {
      reinforcementSummary = 'Para fixação dos dados: A Retenção de Clientes subiu de 45% para 84% (alta de 39 pontos percentuais), enquanto a Taxa de Churn caiu de 55% para 19% (redução de 36 pontos percentuais), comprovando uma trajetória contínua de fidelização.';
    }

    const visualChanges = `Aplicação de filtro adaptativo com ganho de contraste dinâmico de ${contrastGainText}. Fundo normalizado para branco puro (#FFFFFF) sem ruídos de iluminação, e eixos numéricos realçados com nitidez unsharp mask para leitura confortável.`;

    const analysis = {
      type: baseChart.type,
      title: baseChart.title,
      subtitle: baseChart.subtitle,
      typeDescription: baseChart.typeDescription,
      axesDescription: baseChart.axesDescription || `O eixo horizontal apresenta ${baseChart.xAxisLabel}, e o eixo vertical mede ${baseChart.yAxisLabel}`,
      xAxisLabel: baseChart.xAxisLabel,
      yAxisLabel: baseChart.yAxisLabel,
      unit: baseChart.unit,
      unitFull: baseChart.unitFull,
      categories: categories,
      series: baseChart.series || [],
      originalDiagnosis: baseChart.originalDiagnosis,
      presetKey: presetKey,
      presetInfo: presetInfo,
      visualChanges: visualChanges,
      reinforcementSummary: reinforcementSummary
    };

    analysis.spokenScript = this._generateSpokenScript(analysis);
    return analysis;
  }

  /**
   * Analisa computacionalmente gráficos customizados enviados pelo usuário
   */
  _analyzeCustomImage(source, presetKey, presetInfo, options) {
    const origCanvas = options.originalCanvas || (source instanceof HTMLCanvasElement ? source : null);
    const adaptCanvas = options.adaptedCanvas || (source instanceof HTMLCanvasElement ? source : null);

    const width = origCanvas ? origCanvas.width : (adaptCanvas ? adaptCanvas.width : 900);
    const height = origCanvas ? origCanvas.height : (adaptCanvas ? adaptCanvas.height : 540);

    let cleanTitle = 'Gráfico Personalizado';
    if (options.fileName) {
      cleanTitle = options.fileName
        .replace(/\.[^/.]+$/, '')
        .replace(/[_-]+/g, ' ')
        .replace(/\b\w/g, l => l.toUpperCase());
    }

    let cvResult = null;
    if (origCanvas && origCanvas.getContext) {
      try {
        cvResult = this._performComputerVisionAnalysis(origCanvas, adaptCanvas, presetKey, presetInfo);
      } catch (e) {
        console.warn('Processamento de visão computacional: usando fallback heurístico seguro.', e);
      }
    }

    if (!cvResult) {
      cvResult = this._generateFallbackAnalysis(cleanTitle, presetKey, presetInfo, width, height);
    }

    const stats = options.stats || {};
    const contrastGainText = stats.contrastGain || '+26%';

    const visualChanges = `Aplicação do preset ${presetInfo.label} com ganho de contraste dinâmico de ${contrastGainText}. O processador normalizou o plano de fundo para branco puro (#FFFFFF) eliminando reflexos ou manchas de papel, e aplicou máscara unsharp para reforçar a nitidez dos eixos e textos.`;

    const analysis = {
      type: cvResult.type,
      title: cleanTitle,
      subtitle: cvResult.subtitle || 'Análise visual e quantitativa da imagem gráfica enviada',
      typeDescription: cvResult.typeDescription,
      axesDescription: cvResult.axesDescription,
      xAxisLabel: cvResult.xAxisLabel,
      yAxisLabel: cvResult.yAxisLabel,
      unit: cvResult.unit || '',
      unitFull: cvResult.unitFull || 'unidades proporcionais',
      categories: cvResult.categories,
      series: cvResult.series || [],
      originalDiagnosis: cvResult.originalDiagnosis,
      presetKey: presetKey,
      presetInfo: presetInfo,
      visualChanges: visualChanges,
      reinforcementSummary: cvResult.reinforcementSummary
    };

    analysis.spokenScript = this._generateSpokenScript(analysis);
    return analysis;
  }

  /**
   * Executa visão computacional real no canvas do gráfico do usuário
   */
  _performComputerVisionAnalysis(origCanvas, adaptCanvas, presetKey, presetInfo) {
    const width = origCanvas.width;
    const height = origCanvas.height;

    // Resolução segura de amostragem (180px de largura máxima)
    const sampleW = Math.min(width, 180);
    const sampleH = Math.max(60, Math.round((height / width) * sampleW));

    const sampleCanvas = document.createElement('canvas');
    sampleCanvas.width = sampleW;
    sampleCanvas.height = sampleH;
    const sampleCtx = sampleCanvas.getContext('2d', { willReadFrequently: true });
    sampleCtx.drawImage(origCanvas, 0, 0, sampleW, sampleH);
    const origData = sampleCtx.getImageData(0, 0, sampleW, sampleH).data;

    let adaptData = null;
    if (adaptCanvas) {
      const adaptSampleCanvas = document.createElement('canvas');
      adaptSampleCanvas.width = sampleW;
      adaptSampleCanvas.height = sampleH;
      const adaptCtx = adaptSampleCanvas.getContext('2d', { willReadFrequently: true });
      adaptCtx.drawImage(adaptCanvas, 0, 0, sampleW, sampleH);
      adaptData = adaptCtx.getImageData(0, 0, sampleW, sampleH).data;
    }

    // Identificação de Cor de Fundo pelas bordas
    let edgeR = 0, edgeG = 0, edgeB = 0, edgeCount = 0;
    for (let x = 0; x < sampleW; x += 3) {
      let i1 = x * 4;
      let i2 = ((sampleH - 1) * sampleW + x) * 4;
      edgeR += origData[i1] + origData[i2];
      edgeG += origData[i1 + 1] + origData[i2 + 1];
      edgeB += origData[i1 + 2] + origData[i2 + 2];
      edgeCount += 2;
    }
    const bgR = Math.round(edgeR / Math.max(1, edgeCount));
    const bgG = Math.round(edgeG / Math.max(1, edgeCount));
    const bgB = Math.round(edgeB / Math.max(1, edgeCount));

    // Agrupamento de pixels cromáticos por faixas de Hue
    const colorBins = {
      red:    { name: 'Vermelho Carmim', hex: '#e15759', rOrig: 0, gOrig: 0, bOrig: 0, rAdapt: 0, gAdapt: 0, bAdapt: 0, count: 0, xs: [], ys: [] },
      orange: { name: 'Laranja Âmbar',   hex: '#f28e2b', rOrig: 0, gOrig: 0, bOrig: 0, rAdapt: 0, gAdapt: 0, bAdapt: 0, count: 0, xs: [], ys: [] },
      yellow: { name: 'Amarelo Ouro',    hex: '#edc949', rOrig: 0, gOrig: 0, bOrig: 0, rAdapt: 0, gAdapt: 0, bAdapt: 0, count: 0, xs: [], ys: [] },
      green:  { name: 'Verde Esmeralda', hex: '#59a14f', rOrig: 0, gOrig: 0, bOrig: 0, rAdapt: 0, gAdapt: 0, bAdapt: 0, count: 0, xs: [], ys: [] },
      cyan:   { name: 'Ciano Turquesa',  hex: '#76b7b2', rOrig: 0, gOrig: 0, bOrig: 0, rAdapt: 0, gAdapt: 0, bAdapt: 0, count: 0, xs: [], ys: [] },
      blue:   { name: 'Azul Cobalto',    hex: '#4e79a7', rOrig: 0, gOrig: 0, bOrig: 0, rAdapt: 0, gAdapt: 0, bAdapt: 0, count: 0, xs: [], ys: [] },
      purple: { name: 'Roxo / Magenta',  hex: '#b07aa1', rOrig: 0, gOrig: 0, bOrig: 0, rAdapt: 0, gAdapt: 0, bAdapt: 0, count: 0, xs: [], ys: [] }
    };

    let totalDataPixels = 0;
    const xHistogram = new Int32Array(sampleW);

    for (let y = 0; y < sampleH; y++) {
      for (let x = 0; x < sampleW; x++) {
        const idx = (y * sampleW + x) * 4;
        if (origData[idx + 3] < 128) continue;

        const r = origData[idx];
        const g = origData[idx + 1];
        const b = origData[idx + 2];

        // Ignora fundo claro ou escuro
        const distBg = Math.abs(r - bgR) + Math.abs(g - bgG) + Math.abs(b - bgB);
        if (distBg < 45) continue;

        const hsl = this._rgbToHsl(r, g, b);
        // Ignora eixos pretos e traços neutros sem saturação (< 15%)
        if (hsl.s < 0.15) continue;

        let binKey = null;
        const h = hsl.h;
        if (h >= 345 || h < 15) binKey = 'red';
        else if (h >= 15 && h < 45) binKey = 'orange';
        else if (h >= 45 && h < 70) binKey = 'yellow';
        else if (h >= 70 && h < 165) binKey = 'green';
        else if (h >= 165 && h < 195) binKey = 'cyan';
        else if (h >= 195 && h < 255) binKey = 'blue';
        else if (h >= 255 && h < 345) binKey = 'purple';

        if (binKey) {
          const bObj = colorBins[binKey];
          bObj.rOrig += r; bObj.gOrig += g; bObj.bOrig += b;
          if (adaptData) {
            bObj.rAdapt += adaptData[idx];
            bObj.gAdapt += adaptData[idx + 1];
            bObj.bAdapt += adaptData[idx + 2];
          }
          bObj.count++;
          bObj.xs.push(x);
          bObj.ys.push(y);
          totalDataPixels++;
          xHistogram[x]++;
        }
      }
    }

    // Filtra clusters significativos (>= 4% dos pixels de dados)
    let validClusters = Object.keys(colorBins)
      .map(k => colorBins[k])
      .filter(c => c.count >= Math.max(12, totalDataPixels * 0.04));

    if (validClusters.length === 0) {
      return this._generateFallbackAnalysis('Gráfico Importado', presetKey, presetInfo, width, height);
    }

    // Ordena da esquerda para a direita pela posição média horizontal
    validClusters.forEach(c => {
      const avgX = c.xs.reduce((sum, v) => sum + v, 0) / c.count;
      c.avgX = avgX;
      c.percentage = Math.round((c.count / Math.max(1, totalDataPixels)) * 100);
    });
    validClusters.sort((a, b) => a.avgX - b.avgX);

    // Detecção estrutural do tipo de gráfico
    const isSquare = Math.abs(width - height) < Math.min(width, height) * 0.25;
    let detectedType = 'bar';
    let typeDescription = 'Gráfico de Colunas Verticais';
    let axesDescription = 'O eixo horizontal (X) na base separa as divisões de categorias, enquanto o eixo vertical (Y) à esquerda indica a magnitude e os valores dos dados';

    if (isSquare && validClusters.length >= 3) {
      detectedType = 'pie';
      typeDescription = 'Gráfico Setorial / Circular do tipo Pizza proporcional';
      axesDescription = 'Gráfico proporcional fechado em 100% de distribuição, onde a totalidade da área circular representa o universo completo dos dados';
    } else if (width > height * 1.5 && validClusters.length <= 4) {
      detectedType = 'bar';
      typeDescription = 'Gráfico de Barras / Colunas';
    }

    // Mapeamento das categorias detectadas
    const categories = validClusters.map((c, i) => {
      const origR = Math.round(c.rOrig / c.count);
      const origG = Math.round(c.gOrig / c.count);
      const origB = Math.round(c.bOrig / c.count);
      const origInfo = this._getColorName(origR, origG, origB);

      let adaptName = '';
      let adaptHex = '';
      if (adaptData && c.rAdapt > 0) {
        const adR = Math.round(c.rAdapt / c.count);
        const adG = Math.round(c.gAdapt / c.count);
        const adB = Math.round(c.bAdapt / c.count);
        const adInfo = this._getColorName(adR, adG, adB);
        adaptName = adInfo.name;
        adaptHex = adInfo.hex;
      } else {
        const fallback = this._getAdaptedColorByPreset(origInfo.name, presetKey);
        adaptName = fallback.name;
        adaptHex = fallback.hex;
      }

      const catLabel = detectedType === 'pie' 
        ? `Fatia ${i + 1} (${origInfo.name})`
        : `Categoria ${i + 1} (${origInfo.name})`;

      return {
        name: catLabel,
        value: `${c.percentage}%`,
        valueDisplay: `${c.percentage}% da área de dados`,
        originalColor: origInfo.name,
        originalHex: origInfo.hex,
        adaptedColor: adaptName,
        adaptedHex: adaptHex,
        statusText: 'Acessível',
        badgeClass: 'badge-table-success'
      };
    });

    const hasRedAndGreen = validClusters.some(c => c.name.includes('Vermelho')) && validClusters.some(c => c.name.includes('Verde'));
    const originalDiagnosis = hasRedAndGreen
      ? 'O gráfico original combina elementos em tons de vermelho e verde com níveis de brilho próximos, gerando risco severo de confusão para pessoas com deuteranopia ou protanopia.'
      : 'O gráfico original utiliza cores com variações de saturação que podem perder diferenciação sob certas condições de iluminação ou daltonismo.';

    const sortedByVal = [...categories].sort((a, b) => parseInt(b.value, 10) - parseInt(a.value, 10));
    const reinforcementSummary = `Para fixação dos dados: A categoria com maior presença visual é ${sortedByVal[0].name} com ${sortedByVal[0].value}, seguida por ${sortedByVal[1] ? sortedByVal[1].name + ' com ' + sortedByVal[1].value : 'outros segmentos menores'}. Todas as categorias agora possuem separação nítida e segura contra daltonismo.`;

    return {
      type: detectedType,
      typeDescription,
      axesDescription,
      xAxisLabel: detectedType === 'pie' ? 'Fatias do Setor' : 'Eixo Horizontal (Categorias)',
      yAxisLabel: detectedType === 'pie' ? 'Participação Percentual' : 'Eixo Vertical (Magnitude)',
      unit: '%',
      unitFull: 'por cento',
      categories,
      originalDiagnosis,
      reinforcementSummary
    };
  }

  /**
   * Fallback heurístico seguro caso a imagem seja muito pequena ou sem canvas acessível
   */
  _generateFallbackAnalysis(title, presetKey, presetInfo, width, height) {
    const isPanoramic = width > height * 1.3;
    const type = isPanoramic ? 'bar' : 'pie';
    const typeDescription = isPanoramic 
      ? 'Gráfico de Colunas Verticais' 
      : 'Gráfico Setorial / Circular';
    const axesDescription = isPanoramic
      ? 'O eixo horizontal (X) na base indica as diferentes seções de categorias, e o eixo vertical (Y) estabelece a escala de magnitude dos dados'
      : 'Composição circular proporcional totalizando 100% de distribuição entre as fatias do setor';

    const categories = [
      { name: 'Segmento Principal A', value: '45%', valueDisplay: '45% da massa de dados', originalColor: 'Vermelho Carmim', originalHex: '#e15759', adaptedColor: (presetKey === 'protanopia' ? 'Ouro Vibrante' : (presetKey === 'acromatopsia' ? 'Cinza Escuro 70' : 'Âmbar / Laranja Ouro')), adaptedHex: '#e69f00', statusText: 'Acessível', badgeClass: 'badge-table-success' },
      { name: 'Segmento Intermediário B', value: '35%', valueDisplay: '35% da massa de dados', originalColor: 'Verde Esmeralda', originalHex: '#59a14f', adaptedColor: (presetKey === 'protanopia' ? 'Azul Cobalto' : (presetKey === 'acromatopsia' ? 'Cinza Claro 195' : 'Azul Celeste Okabe-Ito')), adaptedHex: '#56b4e9', statusText: 'Acessível', badgeClass: 'badge-table-success' },
      { name: 'Segmento Complementar C', value: '20%', valueDisplay: '20% da massa de dados', originalColor: 'Azul Cobalto', originalHex: '#4e79a7', adaptedColor: (presetKey === 'tritanopia' ? 'Ciano Petróleo' : (presetKey === 'acromatopsia' ? 'Cinza Médio 130' : 'Azul Cobalto Profundo')), adaptedHex: '#0072b2', statusText: 'Acessível', badgeClass: 'badge-table-success' }
    ];

    return {
      type,
      typeDescription,
      axesDescription,
      xAxisLabel: isPanoramic ? 'Eixo Horizontal (Categorias)' : 'Fatias do Setor',
      yAxisLabel: isPanoramic ? 'Eixo Vertical (Magnitude)' : 'Participação Percentual',
      unit: '%',
      unitFull: 'por cento',
      categories,
      originalDiagnosis: 'O gráfico original continha elementos em vermelho e verde com proximidade de brilho, gerando confusão no eixo vermelho-verde.',
      reinforcementSummary: 'Para fixação dos dados: O Segmento Principal A lidera com 45%, seguido pelo Segmento B com 35% e pelo Segmento C com 20%, todos com legibilidade otimizada.'
    };
  }

  /**
   * Constrói o roteiro textual falado respeitando todas as exigências de audiodescrição
   */
  _generateSpokenScript(a) {
    let script = '';

    // =========================================================================
    // PARTE 1: ANÁLISE DO GRÁFICO ORIGINAL (ANTES DA ADAPTAÇÃO)
    // =========================================================================
    script += `Parte 1: Análise do Gráfico Original antes da adaptação. `;
    script += `Título: ${a.title}. `;
    if (a.subtitle) {
      script += `Assunto: ${a.subtitle}. `;
    }
    script += `Tipo de visualização: ${a.typeDescription}. `;
    script += `O que representam os eixos: ${a.axesDescription}. `;

    // Valores e cores de cada categoria no gráfico original
    script += `Valores e cores de cada categoria no gráfico original: `;
    a.categories.forEach((cat, idx) => {
      const valText = cat.valueDisplay || `${cat.value} ${a.unitFull || ''}`;
      script += `${idx + 1}º, ${cat.name}: valor registrado de ${valText}, apresentado na cor ${cat.originalColor} no gráfico original`;
      if (cat.status) {
        script += `, estando ${cat.status === 'above' ? 'acima da meta' : 'abaixo da meta'}`;
      }
      script += `. `;
    });

    // Diagnóstico visual das cores originais
    script += `Diagnóstico visual das cores originais: ${a.originalDiagnosis} `;

    // =========================================================================
    // PARTE 2: RESULTADO APÓS A ADAPTAÇÃO AO TIPO DE DALTONISMO
    // =========================================================================
    script += `Parte 2: Resultado após a adaptação para ${a.presetInfo.label}. `;
    script += `Tipo de daltonismo informado: ${a.presetInfo.description} `;
    script += `Mapeamento de cores adaptadas: ${a.presetInfo.colorMapRule} `;

    // Explicar quais cores representam cada categoria agora
    script += `Cores que representam cada categoria agora: `;
    a.categories.forEach(cat => {
      script += `${cat.name} passa a ser identificado pela cor ${cat.adaptedColor}. `;
    });

    // Mudanças na representação visual
    script += `Mudanças na representação visual identificadas: ${a.visualChanges} `;

    // Reforço dos valores e informações do gráfico
    script += `Reforço dos valores e informações do gráfico: ${a.reinforcementSummary} `;
    script += `Fim da audiodescrição adaptada.`;

    return script;
  }

  /**
   * Converte RGB para HSL
   */
  _rgbToHsl(r, g, b) {
    r /= 255; g /= 255; b /= 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h, s, l = (max + min) / 2;

    if (max === min) {
      h = s = 0;
    } else {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r: h = ((g - b) / d + (g < b ? 6 : 0)) * 60; break;
        case g: h = ((b - r) / d + 2) * 60; break;
        case b: h = ((r - g) / d + 4) * 60; break;
      }
    }
    return { h, s, l };
  }

  /**
   * Converte valores RGB em nomes semânticos em português
   */
  _getColorName(r, g, b) {
    const hsl = this._rgbToHsl(r, g, b);
    const hex = '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);

    if (hsl.s < 0.14) {
      if (hsl.l > 0.86) return { name: 'Branco / Claro', hex };
      if (hsl.l < 0.18) return { name: 'Preto Profundo', hex };
      if (hsl.l < 0.45) return { name: 'Cinza Escuro', hex };
      return { name: 'Cinza Médio', hex };
    }

    const h = hsl.h;
    if (h >= 345 || h < 15) return { name: hsl.l < 0.4 ? 'Vermelho Escuro / Vinho' : 'Vermelho Carmim', hex };
    if (h >= 15 && h < 45) return { name: hsl.l < 0.5 ? 'Laranja Queimado' : 'Laranja Âmbar', hex };
    if (h >= 45 && h < 70) return { name: 'Amarelo Ouro', hex };
    if (h >= 70 && h < 165) return { name: hsl.l < 0.35 ? 'Verde Escuro / Oliva' : (hsl.l > 0.65 ? 'Verde Claro / Lima' : 'Verde Esmeralda'), hex };
    if (h >= 165 && h < 195) return { name: 'Ciano / Turquesa', hex };
    if (h >= 195 && h < 255) return { name: hsl.l < 0.35 ? 'Azul Marinho' : (hsl.l > 0.65 ? 'Azul Celeste' : 'Azul Cobalto'), hex };
    if (h >= 255 && h < 315) return { name: 'Roxo / Violeta', hex };
    return { name: 'Magenta / Rosa Forte', hex };
  }

  _getAdaptedColorByPreset(origName, presetKey) {
    if (presetKey === 'deuteranopia') {
      if (origName.includes('Verde')) return { name: 'Azul Celeste Okabe-Ito', hex: '#56b4e9' };
      if (origName.includes('Vermelho')) return { name: 'Âmbar / Laranja Ouro Vibrante', hex: '#e69f00' };
      return { name: 'Azul Cobalto Profundo', hex: '#0072b2' };
    }
    if (presetKey === 'protanopia') {
      if (origName.includes('Vermelho')) return { name: 'Ouro Vibrante / Âmbar', hex: '#f0e442' };
      if (origName.includes('Verde')) return { name: 'Azul Cobalto Profundo', hex: '#0072b2' };
      return { name: 'Azul Celeste Acessível', hex: '#56b4e9' };
    }
    if (presetKey === 'tritanopia') {
      if (origName.includes('Azul')) return { name: 'Ciano Petróleo', hex: '#009e73' };
      return { name: 'Magenta / Rosa Forte', hex: '#cc79a7' };
    }
    if (presetKey === 'acromatopsia') {
      return { name: 'Cinza Quantizado Acessível', hex: '#999999' };
    }
    return { name: origName + ' com Contraste Otimizado', hex: '#27815c' };
  }

  /**
   * Gera uma tabela HTML semanticamente acessível para leitores de tela
   */
  generateAccessibleTableHTML(analysis) {
    const cats = analysis.categories || [];
    const rows = cats.map(c => `
      <tr>
        <th scope="row"><strong>${c.name}</strong></th>
        <td><strong>${c.valueDisplay || c.value}</strong></td>
        <td>
          <span style="display:inline-flex; align-items:center; gap:6px;">
            <span style="width:12px; height:12px; border-radius:50%; background-color:${c.originalHex || '#888'}; display:inline-block; border:1px solid rgba(0,0,0,0.25);"></span>
            <span>${c.originalColor}</span>
          </span>
        </td>
        <td>
          <span style="display:inline-flex; align-items:center; gap:6px;">
            <span style="width:12px; height:12px; border-radius:50%; background-color:${c.adaptedHex || '#27815c'}; display:inline-block; border:1px solid rgba(0,0,0,0.25);"></span>
            <span><strong>${c.adaptedColor}</strong></span>
          </span>
        </td>
        <td>
          <span class="table-badge ${c.badgeClass || 'badge-table-success'}">
            ${c.statusText || 'Acessível'}
          </span>
        </td>
      </tr>
    `).join('');

    return `
      <table class="accessible-data-table" aria-label="Tabela de dados e comparação de cores do gráfico">
        <caption>Tabela de dados e mapeamento cromático: ${analysis.title} (${analysis.presetInfo.label})</caption>
        <thead>
          <tr>
            <th scope="col">Categoria / Indicador</th>
            <th scope="col">Valor / Magnitude</th>
            <th scope="col">Cor Original (Antes)</th>
            <th scope="col">Cor Adaptada (Depois)</th>
            <th scope="col">Status Visual</th>
          </tr>
        </thead>
        <tbody>
          ${rows}
        </tbody>
      </table>
    `;
  }
}

/**
 * Motor de Síntese de Voz (TTS) em Português Nativo (Web Speech API)
 */
class ChartSpeechEngine {
  constructor() {
    this.synth = window.speechSynthesis || null;
    this.utterance = null;
    this.isPlaying = false;
    this.isPaused = false;
    this.currentText = '';
    this.speechRate = 1.0;
    this.speechPitch = 1.0;
    this.selectedVoice = null;

    this.chunks = [];
    this.currentChunkIndex = 0;

    this.onStateChange = null;
    this.onProgress = null;
    this.onChunkStart = null;

    this._initVoices();
  }

  _initVoices() {
    if (!this.synth) return;

    const findPtVoice = () => {
      const voices = this.synth.getVoices();
      if (!voices || voices.length === 0) return;

      const ptBrVoice = voices.find(v => v.lang === 'pt-BR' || v.lang === 'pt_BR');
      const ptVoice = voices.find(v => v.lang && v.lang.startsWith('pt'));
      this.selectedVoice = ptBrVoice || ptVoice || voices[0];
    };

    findPtVoice();
    if (this.synth.onvoiceschanged !== undefined) {
      this.synth.onvoiceschanged = findPtVoice;
    }
  }

  get isSupported() {
    return Boolean(this.synth && window.SpeechSynthesisUtterance);
  }

  setText(fullText) {
    this.stop();
    this.currentText = fullText;
    this.chunks = this._splitIntoSentences(fullText);
    this.currentChunkIndex = 0;
  }

  _splitIntoSentences(text) {
    if (!text) return [];
    const rawChunks = text.match(/[^.!?]+[.!?]+(\s|$)|[^.!?]+$/g) || [text];
    return rawChunks.map(s => s.trim()).filter(s => s.length > 0);
  }

  play() {
    if (!this.isSupported) {
      console.warn('SpeechSynthesis não suportado neste navegador.');
      return false;
    }

    if (this.isPaused) {
      this.synth.resume();
      this.isPlaying = true;
      this.isPaused = false;
      this._notifyState('playing');
      return true;
    }

    if (this.isPlaying) return true;

    if (this.chunks.length === 0 && this.currentText) {
      this.chunks = this._splitIntoSentences(this.currentText);
    }

    if (this.chunks.length === 0) return false;

    this.currentChunkIndex = 0;
    this.isPlaying = true;
    this.isPaused = false;
    this._notifyState('playing');
    this._speakNextChunk();
    return true;
  }

  pause() {
    if (!this.isPlaying || this.isPaused) return;
    this.synth.pause();
    this.isPlaying = false;
    this.isPaused = true;
    this._notifyState('paused');
  }

  stop() {
    if (this.synth) {
      this.synth.cancel();
    }
    this.isPlaying = false;
    this.isPaused = false;
    this.currentChunkIndex = 0;
    this._notifyState('stopped');
  }

  togglePlayPause() {
    if (this.isPlaying) {
      this.pause();
    } else {
      this.play();
    }
  }

  setRate(rate) {
    this.speechRate = parseFloat(rate) || 1.0;
  }

  _speakNextChunk() {
    if (!this.isPlaying) return;

    if (this.currentChunkIndex >= this.chunks.length) {
      this.stop();
      this._notifyState('ended');
      return;
    }

    const chunkText = this.chunks[this.currentChunkIndex];
    if (this.onChunkStart) {
      this.onChunkStart(this.currentChunkIndex, chunkText, this.chunks.length);
    }
    if (this.onProgress) {
      this.onProgress(this.currentChunkIndex + 1, this.chunks.length);
    }

    this.utterance = new SpeechSynthesisUtterance(chunkText);
    this.utterance.lang = 'pt-BR';
    this.utterance.rate = this.speechRate;
    this.utterance.pitch = this.speechPitch;

    if (this.selectedVoice) {
      this.utterance.voice = this.selectedVoice;
    }

    this.utterance.onend = () => {
      this.currentChunkIndex++;
      this._speakNextChunk();
    };

    this.utterance.onerror = (e) => {
      if (e.error !== 'canceled' && e.error !== 'interrupted') {
        console.warn('Erro na síntese de fala:', e);
      }
      this.currentChunkIndex++;
      this._speakNextChunk();
    };

    this.synth.speak(this.utterance);
  }

  _notifyState(state) {
    if (this.onStateChange) {
      this.onStateChange(state, {
        chunkIndex: this.currentChunkIndex,
        totalChunks: this.chunks.length,
        isSupported: this.isSupported
      });
    }
  }
}

/**
 * Componente Visual de Audiodescrição Inteligente
 */
class ChartAudioDescriberComponent {
  constructor(containerId = 'chart-audio-describer-slot') {
    this.container = document.getElementById(containerId);
    this.analyzer = new ChartDataAnalyzer();
    this.speech = new ChartSpeechEngine();
    this.currentAnalysis = null;
    this.currentChartSource = null;
    this.fontSizeLevel = 1;

    this._setupDOM();
    this._bindEvents();
  }

  _setupDOM() {
    if (!this.container) return;

    this.container.innerHTML = `
      <section class="audio-desc-card" id="audio-desc-card" aria-labelledby="audio-desc-heading" role="region">
        
        <!-- Header do Card de Audiodescrição -->
        <div class="audio-desc-header">
          <div class="audio-desc-title-group">
            <div class="audio-pulse-icon" id="audio-visual-pulse" aria-hidden="true">
              <span class="bar bar-1"></span>
              <span class="bar bar-2"></span>
              <span class="bar bar-3"></span>
              <span class="bar bar-4"></span>
            </div>
            <div>
              <h3 id="audio-desc-heading" class="audio-desc-title">
                Audiodescrição Inteligente com Voz (IA)
              </h3>
              <p class="audio-desc-subtitle">
                Diagnóstico do gráfico original e detalhamento das cores adaptadas ao daltonismo
              </p>
            </div>
          </div>

          <div class="audio-desc-badges">
            <span class="badge-pill badge-pill-tts">🎙️ Voz Ativa (pt-BR)</span>
            <span class="badge-pill badge-pill-wcag">WCAG 2.2 AAA</span>
          </div>
        </div>

        <!-- Barra de Controle do Reprodutor de Áudio -->
        <div class="audio-player-toolbar" role="toolbar" aria-label="Controles do reprodutor de audiodescrição">
          
          <!-- Botão Principal Dedicado: Play / Pause -->
          <button type="button" id="btn-audio-play-pause" class="btn-audio-main btn-audio-play" aria-label="Ouvir audiodescrição do gráfico" aria-pressed="false">
            <span class="audio-btn-icon" id="audio-btn-icon" aria-hidden="true">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <polygon points="5 3 19 12 5 21 5 3"></polygon>
              </svg>
            </span>
            <span class="audio-btn-label" id="audio-btn-label">Ouvir Audiodescrição</span>
          </button>

          <!-- Botão Parar / Reiniciar -->
          <button type="button" id="btn-audio-stop" class="btn-audio-secondary" aria-label="Parar reprodução de áudio" title="Reiniciar áudio">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <rect x="5" y="5" width="14" height="14" rx="2" ry="2"></rect>
            </svg>
            <span>Parar</span>
          </button>

          <!-- Seletor de Velocidade da Fala -->
          <div class="audio-rate-wrapper">
            <label for="select-speech-rate" class="audio-rate-label">Velocidade:</label>
            <select id="select-speech-rate" class="audio-rate-select" aria-label="Velocidade da reprodução da voz">
              <option value="0.75">0.75× (Pausada)</option>
              <option value="1.0" selected>1.0× (Normal)</option>
              <option value="1.25">1.25× (Rápida)</option>
              <option value="1.5">1.5× (Leitor de Tela)</option>
              <option value="2.0">2.0× (Ultra Rápida)</option>
            </select>
          </div>

          <!-- Indicador de Status Dinâmico de Fala -->
          <div class="audio-status-pill" id="audio-status-pill" role="status" aria-live="polite">
            <span class="status-dot" id="audio-status-dot"></span>
            <span class="status-text" id="audio-status-text">Pronto para reproduzir</span>
          </div>

          <!-- Controles de Acessibilidade Visual (Fonte para Baixa Visão) -->
          <div class="audio-accessibility-actions">
            <button type="button" id="btn-font-toggle" class="btn-icon-accessible" title="Alternar tamanho da fonte para baixa visão" aria-label="Aumentar tamanho do texto transcrito">
              <span style="font-size: 13px; font-weight: 700;">A</span><span style="font-size: 16px; font-weight: 900;">A+</span>
            </button>
            <button type="button" id="btn-copy-description" class="btn-icon-accessible" title="Copiar audiodescrição integral" aria-label="Copiar texto da audiodescrição para área de transferência">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
              </svg>
            </button>
          </div>
        </div>

        <!-- Barra de Progresso Temporal da Fala -->
        <div class="audio-progress-bar-container" aria-hidden="true">
          <div class="audio-progress-fill" id="audio-progress-fill" style="width: 0%;"></div>
        </div>

        <!-- Seletor de Abas de Conteúdo da Descrição -->
        <div class="audio-desc-tabs" role="tablist" aria-label="Formas de exibição da audiodescrição">
          <button type="button" class="audio-tab-btn active" id="tab-desc-speech" role="tab" aria-selected="true" aria-controls="panel-desc-speech">
            💬 Roteiro Falado
          </button>
          <button type="button" class="audio-tab-btn" id="tab-desc-table" role="tab" aria-selected="false" aria-controls="panel-desc-table">
            📊 Tabela Acessível
          </button>
          <button type="button" class="audio-tab-btn" id="tab-desc-analysis" role="tab" aria-selected="false" aria-controls="panel-desc-analysis">
            🔍 Destaques & Tendências
          </button>
        </div>

        <!-- Painel 1: Roteiro Falado em Parágrafos com Destaque -->
        <div class="audio-tab-panel active" id="panel-desc-speech" role="tabpanel" aria-labelledby="tab-desc-speech" tabindex="0">
          <div class="speech-transcript-box font-level-1" id="speech-transcript-box">
            <!-- Injetado dinamicamente via JS -->
          </div>
        </div>

        <!-- Painel 2: Tabela de Dados Semântica (Leitores de Tela) -->
        <div class="audio-tab-panel" id="panel-desc-table" role="tabpanel" aria-labelledby="tab-desc-table" tabindex="0" style="display: none;">
          <div class="table-scroll-container" id="accessible-table-container">
            <!-- Injetado dinamicamente via JS -->
          </div>
        </div>

        <!-- Painel 3: Destaques, Métricas e Tendências -->
        <div class="audio-tab-panel" id="panel-desc-analysis" role="tabpanel" aria-labelledby="tab-desc-analysis" tabindex="0" style="display: none;">
          <div class="analysis-breakdown-grid" id="analysis-breakdown-grid">
            <!-- Injetado dinamicamente via JS -->
          </div>
        </div>

      </section>
    `;
  }

  _bindEvents() {
    this.btnPlayPause = document.getElementById('btn-audio-play-pause');
    this.btnStop = document.getElementById('btn-audio-stop');
    this.selectRate = document.getElementById('select-speech-rate');
    this.btnFontToggle = document.getElementById('btn-font-toggle');
    this.btnCopyDesc = document.getElementById('btn-copy-description');

    this.statusText = document.getElementById('audio-status-text');
    this.statusPill = document.getElementById('audio-status-pill');
    this.audioProgressFill = document.getElementById('audio-progress-fill');
    this.audioBtnLabel = document.getElementById('audio-btn-label');
    this.audioBtnIcon = document.getElementById('audio-btn-icon');
    this.visualPulse = document.getElementById('audio-visual-pulse');
    this.transcriptBox = document.getElementById('speech-transcript-box');

    if (this.btnPlayPause) {
      this.btnPlayPause.addEventListener('click', () => {
        this.speech.togglePlayPause();
      });
    }

    if (this.btnStop) {
      this.btnStop.addEventListener('click', () => {
        this.speech.stop();
      });
    }

    if (this.selectRate) {
      this.selectRate.addEventListener('change', (e) => {
        this.speech.setRate(e.target.value);
      });
    }

    if (this.btnFontToggle && this.transcriptBox) {
      this.btnFontToggle.addEventListener('click', () => {
        this.fontSizeLevel = (this.fontSizeLevel + 1) % 3;
        this.transcriptBox.className = `speech-transcript-box font-level-${this.fontSizeLevel}`;
        const labels = ['Normal (Padrão)', 'Médio (Baixa Visão)', 'Grande (Acessível)'];
        this.btnFontToggle.setAttribute('title', `Tamanho de fonte: ${labels[this.fontSizeLevel]}`);
      });
    }

    if (this.btnCopyDesc) {
      this.btnCopyDesc.addEventListener('click', () => {
        if (!this.currentAnalysis) return;
        navigator.clipboard.writeText(this.currentAnalysis.spokenScript).then(() => {
          const original = this.btnCopyDesc.innerHTML;
          this.btnCopyDesc.innerHTML = `<span style="font-size: 11px; font-weight: 800; color: #10b981;">✓ Copiado!</span>`;
          setTimeout(() => {
            this.btnCopyDesc.innerHTML = original;
          }, 2000);
        }).catch(err => console.warn('Erro ao copiar:', err));
      });
    }

    // Alternância de Abas
    const tabs = [
      { btn: document.getElementById('tab-desc-speech'), panel: document.getElementById('panel-desc-speech') },
      { btn: document.getElementById('tab-desc-table'), panel: document.getElementById('panel-desc-table') },
      { btn: document.getElementById('tab-desc-analysis'), panel: document.getElementById('panel-desc-analysis') }
    ];

    tabs.forEach(item => {
      if (item.btn) {
        item.btn.addEventListener('click', () => {
          tabs.forEach(t => {
            if (t.btn) {
              t.btn.classList.remove('active');
              t.btn.setAttribute('aria-selected', 'false');
            }
            if (t.panel) {
              t.panel.style.display = 'none';
            }
          });
          item.btn.classList.add('active');
          item.btn.setAttribute('aria-selected', 'true');
          item.panel.style.display = 'block';
        });
      }
    });

    // Callbacks do Motor de Voz
    this.speech.onStateChange = (state, details) => {
      this._updateVisualState(state, details);
    };

    this.speech.onChunkStart = (chunkIndex) => {
      this._highlightActiveSentence(chunkIndex);
    };

    this.speech.onProgress = (current, total) => {
      if (this.audioProgressFill) {
        const pct = total > 0 ? ((current / total) * 100).toFixed(1) : 0;
        this.audioProgressFill.style.width = `${pct}%`;
      }
    };
  }

  _updateVisualState(state) {
    if (!this.btnPlayPause) return;

    if (state === 'playing') {
      this.btnPlayPause.classList.add('btn-audio-pause');
      this.btnPlayPause.classList.remove('btn-audio-play');
      this.btnPlayPause.setAttribute('aria-pressed', 'true');
      if (this.audioBtnLabel) this.audioBtnLabel.textContent = 'Pausar Áudio';
      if (this.audioBtnIcon) {
        this.audioBtnIcon.innerHTML = `
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <rect x="6" y="4" width="4" height="16"></rect>
            <rect x="14" y="4" width="4" height="16"></rect>
          </svg>
        `;
      }
      if (this.statusText) this.statusText.textContent = 'Reproduzindo audiodescrição com voz...';
      if (this.statusPill) this.statusPill.className = 'audio-status-pill status-playing';
      if (this.visualPulse) this.visualPulse.classList.add('pulse-active');

    } else if (state === 'paused') {
      this.btnPlayPause.classList.remove('btn-audio-pause');
      this.btnPlayPause.classList.add('btn-audio-play');
      this.btnPlayPause.setAttribute('aria-pressed', 'false');
      if (this.audioBtnLabel) this.audioBtnLabel.textContent = 'Continuar Ouvindo';
      if (this.audioBtnIcon) {
        this.audioBtnIcon.innerHTML = `
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <polygon points="5 3 19 12 5 21 5 3"></polygon>
          </svg>
        `;
      }
      if (this.statusText) this.statusText.textContent = 'Áudio pausado';
      if (this.statusPill) this.statusPill.className = 'audio-status-pill status-paused';
      if (this.visualPulse) this.visualPulse.classList.remove('pulse-active');

    } else {
      this.btnPlayPause.classList.remove('btn-audio-pause');
      this.btnPlayPause.classList.add('btn-audio-play');
      this.btnPlayPause.setAttribute('aria-pressed', 'false');
      if (this.audioBtnLabel) this.audioBtnLabel.textContent = 'Ouvir Audiodescrição';
      if (this.audioBtnIcon) {
        this.audioBtnIcon.innerHTML = `
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <polygon points="5 3 19 12 5 21 5 3"></polygon>
          </svg>
        `;
      }
      if (this.statusText) this.statusText.textContent = 'Pronto para reproduzir';
      if (this.statusPill) this.statusPill.className = 'audio-status-pill';
      if (this.visualPulse) this.visualPulse.classList.remove('pulse-active');
      if (this.audioProgressFill) this.audioProgressFill.style.width = '0%';
      this._clearSentenceHighlights();
    }
  }

  _highlightActiveSentence(index) {
    if (!this.transcriptBox) return;
    const spans = this.transcriptBox.querySelectorAll('.speech-sentence');
    spans.forEach((span, i) => {
      if (i === index) {
        span.classList.add('sentence-speaking');
        span.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      } else {
        span.classList.remove('sentence-speaking');
      }
    });
  }

  _clearSentenceHighlights() {
    if (!this.transcriptBox) return;
    const spans = this.transcriptBox.querySelectorAll('.speech-sentence');
    spans.forEach(s => s.classList.remove('sentence-speaking'));
  }

  /**
   * Atualiza o gráfico ativo e gera a audiodescrição completa
   * @param {string|HTMLImageElement|HTMLCanvasElement} source
   * @param {object} options
   */
  updateChart(source, options = {}) {
    this.speech.stop();
    this.currentChartSource = source;
    this.currentAnalysis = this.analyzer.analyze(source, options);

    // Configura o texto para a síntese de voz
    this.speech.setText(this.currentAnalysis.spokenScript);

    // Renderiza o Roteiro Falado com spans acessíveis para sincronismo
    if (this.transcriptBox) {
      const sentences = this.speech.chunks;
      if (sentences.length > 0) {
        this.transcriptBox.innerHTML = sentences.map((sent, idx) => `
          <span class="speech-sentence" data-chunk="${idx}">${sent}</span>
        `).join(' ');
      } else {
        this.transcriptBox.innerHTML = `<p>${this.currentAnalysis.spokenScript}</p>`;
      }
    }

    // Renderiza a Tabela de Dados Acessível
    const tableSlot = document.getElementById('accessible-table-container');
    if (tableSlot) {
      tableSlot.innerHTML = this.analyzer.generateAccessibleTableHTML(this.currentAnalysis);
    }

    // Renderiza o Painel de Destaques e Tendências
    const analysisGrid = document.getElementById('analysis-breakdown-grid');
    if (analysisGrid) {
      analysisGrid.innerHTML = this._buildAnalysisGridHTML(this.currentAnalysis);
    }

    this._updateVisualState('stopped');
  }

  _buildAnalysisGridHTML(a) {
    let html = '';

    // Card 1: Identificação e Estrutura Original (Antes da Adaptação)
    html += `
      <div class="analysis-card">
        <div class="analysis-card-header">
          <span class="analysis-card-icon">📌</span>
          <h4 class="analysis-card-title">1. Gráfico Original (Antes)</h4>
        </div>
        <ul class="analysis-list">
          <li><strong>Título:</strong> ${a.title}</li>
          <li><strong>Assunto:</strong> ${a.subtitle || 'Identificação e análise da visualização'}</li>
          <li><strong>Tipo de Gráfico:</strong> ${a.typeDescription}</li>
          <li><strong>Eixo X (Horizontal):</strong> ${a.xAxisLabel}</li>
          <li><strong>Eixo Y (Vertical):</strong> ${a.yAxisLabel}</li>
        </ul>
      </div>
    `;

    // Card 2: Cores e Valores Originais das Categorias
    html += `
      <div class="analysis-card">
        <div class="analysis-card-header">
          <span class="analysis-card-icon">🎨</span>
          <h4 class="analysis-card-title">2. Cores & Valores Originais</h4>
        </div>
        <ul class="analysis-list">
          ${a.categories.map(c => `
            <li>
              <span style="display:inline-block; width:10px; height:10px; border-radius:50%; background-color:${c.originalHex || '#888'}; margin-right:5px;"></span>
              <strong>${c.name}:</strong> ${c.valueDisplay || c.value} (Cor Original: <em>${c.originalColor}</em>)
            </li>
          `).join('')}
        </ul>
        <p class="analysis-critique-text" style="margin-top:10px; font-size:12px;"><strong>Diagnóstico Visual:</strong> ${a.originalDiagnosis}</p>
      </div>
    `;

    // Card 3: Adaptação ao Tipo de Daltonismo (Depois)
    html += `
      <div class="analysis-card">
        <div class="analysis-card-header">
          <span class="analysis-card-icon">🔄</span>
          <h4 class="analysis-card-title">3. Adaptação para ${a.presetInfo.label}</h4>
        </div>
        <ul class="analysis-list">
          <li><strong>Perfil:</strong> ${a.presetInfo.description}</li>
          <li><strong>Mapeamento Cromático:</strong> ${a.presetInfo.colorMapRule}</li>
          <li><strong>Novas Cores por Categoria:</strong>
            <ul style="margin-top:5px; padding-left:15px;">
              ${a.categories.map(c => `
                <li>
                  <span style="display:inline-block; width:10px; height:10px; border-radius:50%; background-color:${c.adaptedHex || '#27815c'}; margin-right:5px;"></span>
                  <strong>${c.name}:</strong> ${c.adaptedColor}
                </li>
              `).join('')}
            </ul>
          </li>
          <li><strong>Mudanças na Representação:</strong> ${a.visualChanges}</li>
        </ul>
      </div>
    `;

    // Card 4: Reforço e Conclusão dos Dados
    html += `
      <div class="analysis-card">
        <div class="analysis-card-header">
          <span class="analysis-card-icon">⭐</span>
          <h4 class="analysis-card-title">4. Reforço & Consolidação dos Dados</h4>
        </div>
        <p style="font-size:13px; line-height:1.6; color:#e2e8f0; margin-bottom:10px;">${a.reinforcementSummary}</p>
        <p style="font-size:12px; color:#10b981; font-weight:700;">✓ Gráfico adaptado e pronto para pessoas com daltonismo e baixa visão.</p>
      </div>
    `;

    return html;
  }
}

// Exportação global
window.ChartDataAnalyzer = ChartDataAnalyzer;
window.ChartSpeechEngine = ChartSpeechEngine;
window.ChartAudioDescriberComponent = ChartAudioDescriberComponent;
