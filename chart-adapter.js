/**
 * ChartColorAdapter - Motor de Processamento, Adaptação e Acessibilidade para Gráficos
 * 
 * Funcionalidades:
 * - Importação de imagens de gráficos locais (Canvas / Blob / File)
 * - Expansão Dinâmica de Contraste e Normalização de Fundo (White Boost)
 * - Realce de Bordas e Nitidez para Eixos, Legendas e Réguas (Unsharp Masking)
 * - Mapeamento para Paletas Acessíveis (Deuteranopia, Protanopia, Tritanopia, Acromatopsia)
 * - Modo Alto Contraste WCAG AAA
 * - Simulação em tempo real da visão de daltônicos para validação
 * - Gerador integrado de Gráficos de Exemplo (Barras, Pizza, Linhas)
 */

class ChartColorAdapter {
  constructor() {
    this.originalCanvas = document.createElement('canvas');
    this.originalCtx = this.originalCanvas.getContext('2d', { willReadFrequently: true });

    this.adaptedCanvas = document.createElement('canvas');
    this.adaptedCtx = this.adaptedCanvas.getContext('2d', { willReadFrequently: true });

    this.originalImage = null;
    this.isLoaded = false;

    // Presets padrão
    this.presets = {
      auto: {
        id: 'auto',
        label: 'Otimização Automática Inteligente',
        contrast: 22,
        brightness: 5,
        sharpness: 35,
        saturation: 115,
        bgClean: true,
        palette: 'auto',
        description: 'Equilíbrio dinâmico de contraste, nitidez de eixos e pureza de fundo.'
      },
      'high-contrast': {
        id: 'high-contrast',
        label: 'Alto Contraste WCAG AAA',
        contrast: 45,
        brightness: -2,
        sharpness: 45,
        saturation: 120,
        bgClean: true,
        palette: 'high-contrast',
        description: 'Pretos e traçados profundos com brancos puros, maximizando a legibilidade de textos e réguas.'
      },
      deuteranopia: {
        id: 'deuteranopia',
        label: 'Acessível para Deuteranopia (Verde)',
        contrast: 25,
        brightness: 4,
        sharpness: 30,
        saturation: 125,
        bgClean: true,
        palette: 'deuteranopia',
        description: 'Recolore confusões vermelho-verde para tons seguros de Azul Celeste, Vermelhão e Âmbar (Okabe-Ito).'
      },
      protanopia: {
        id: 'protanopia',
        label: 'Acessível para Protanopia (Vermelho)',
        contrast: 30,
        brightness: 8,
        sharpness: 35,
        saturation: 130,
        bgClean: true,
        palette: 'protanopia',
        description: 'Aumenta a luminância de vermelhos escurecidos e converte para tons vivos de Ouro e Azul Cobalto.'
      },
      tritanopia: {
        id: 'tritanopia',
        label: 'Acessível para Tritanopia (Azul)',
        contrast: 25,
        brightness: 5,
        sharpness: 30,
        saturation: 120,
        bgClean: true,
        palette: 'tritanopia',
        description: 'Corrige ambiguidades azul-verde e amarelo-violeta para ciano intenso, magenta e grafite.'
      },
      acromatopsia: {
        id: 'acromatopsia',
        label: 'Monocromático de Alta Definição (Total)',
        contrast: 40,
        brightness: 2,
        sharpness: 40,
        saturation: 0,
        bgClean: true,
        palette: 'acromatopsia',
        description: 'Converte cores em faixas discretas de luminância perceptual, diferenciando fatias mesmo sem cor.'
      }
    };

    this.currentSettings = {
      preset: 'auto',
      contrast: 22,
      brightness: 5,
      sharpness: 35,
      saturation: 115,
      bgClean: true,
      simulationMode: 'none' // 'none' | 'deuteranopia' | 'protanopia' | 'tritanopia' | 'acromatopsia'
    };
  }

  /**
   * Carrega uma imagem a partir de File, Blob, DataURL ou HTMLImageElement
   * @param {File|Blob|string|HTMLImageElement} source 
   * @returns {Promise<HTMLImageElement>}
   */
  loadImage(source) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      if (typeof source === 'string' && (source.startsWith('http://') || source.startsWith('https://'))) {
        img.crossOrigin = 'anonymous';
      }

      img.onload = () => {
        this.originalImage = img;
        this.originalCanvas.width = img.naturalWidth || img.width;
        this.originalCanvas.height = img.naturalHeight || img.height;
        this.originalCtx.drawImage(img, 0, 0);

        this.adaptedCanvas.width = this.originalCanvas.width;
        this.adaptedCanvas.height = this.originalCanvas.height;

        this.isLoaded = true;
        resolve(img);
      };

      img.onerror = (err) => reject(new Error('Falha ao carregar a imagem do gráfico: ' + err));

      if (source instanceof File || source instanceof Blob) {
        const reader = new FileReader();
        reader.onload = (e) => { img.src = e.target.result; };
        reader.onerror = reject;
        reader.readAsDataURL(source);
      } else if (typeof source === 'string') {
        img.src = source;
      } else if (source instanceof HTMLImageElement) {
        img.src = source.src;
      } else if (source instanceof HTMLCanvasElement) {
        img.src = source.toDataURL('image/png');
      } else {
        reject(new Error('Formato de fonte não suportado.'));
      }
    });
  }

  /**
   * Aplica um preset pré-definido
   * @param {string} presetKey 
   */
  setPreset(presetKey) {
    if (!this.presets[presetKey]) return;
    const preset = this.presets[presetKey];
    this.currentSettings.preset = presetKey;
    this.currentSettings.contrast = preset.contrast;
    this.currentSettings.brightness = preset.brightness;
    this.currentSettings.sharpness = preset.sharpness;
    this.currentSettings.saturation = preset.saturation;
    this.currentSettings.bgClean = preset.bgClean;
  }

  /**
   * Atualiza configurações personalizadas
   * @param {Object} partialSettings 
   */
  updateSettings(partialSettings) {
    Object.assign(this.currentSettings, partialSettings);
  }

  /**
   * Processa a imagem do gráfico aplicando todos os filtros de acessibilidade e adaptação de cor
   * @returns {Object} { adaptedDataUrl, stats, width, height }
   */
  process() {
    if (!this.isLoaded || !this.originalImage) {
      throw new Error('Nenhuma imagem carregada no adaptador.');
    }

    const w = this.originalCanvas.width;
    const h = this.originalCanvas.height;

    // Obtém os dados brutos da imagem original
    const srcData = this.originalCtx.getImageData(0, 0, w, h);
    const srcPixels = srcData.data;

    // Cria o buffer destino
    const destData = this.adaptedCtx.createImageData(w, h);
    const destPixels = destData.data;

    const totalPixels = w * h;

    // 1. ANÁLISE DE HISTOGRAMA E LUMINÂNCIA ORIGINAL
    let minLum = 255;
    let maxLum = 0;
    let sumLum = 0;

    for (let i = 0; i < srcPixels.length; i += 4) {
      const r = srcPixels[i];
      const g = srcPixels[i + 1];
      const b = srcPixels[i + 2];
      // Luminância WCAG / Rec. 709
      const lum = 0.2126 * r + 0.7152 * g + 0.0722 * b;
      if (lum < minLum) minLum = lum;
      if (lum > maxLum) maxLum = lum;
      sumLum += lum;
    }

    const avgLum = sumLum / totalPixels;
    const initialContrastRatio = ((maxLum + 0.05) / (minLum + 0.05)).toFixed(2);

    // Fatores de ajuste dos sliders
    const contrastFactor = (259 * (this.currentSettings.contrast + 255)) / (255 * (259 - this.currentSettings.contrast));
    const brightnessOffset = (this.currentSettings.brightness / 100) * 255;
    const saturationRatio = this.currentSettings.saturation / 100;
    const presetMode = this.currentSettings.preset;
    const bgClean = this.currentSettings.bgClean;

    // 2. PROCESSAMENTO PIXEL A PIXEL
    for (let i = 0; i < srcPixels.length; i += 4) {
      let r = srcPixels[i];
      let g = srcPixels[i + 1];
      let b = srcPixels[i + 2];
      let a = srcPixels[i + 3];

      if (a === 0) {
        destPixels[i] = 0;
        destPixels[i + 1] = 0;
        destPixels[i + 2] = 0;
        destPixels[i + 3] = 0;
        continue;
      }

      // Converte para HSL para manipulação perceptual
      let hsl = this.rgbToHsl(r, g, b);

      // (A) Normalização de Fundo (White Boost): limpa fundos acinzentados ou amarelados suavemente
      // Transição contínua suave (anti-ruído) para evitar limiar binário brusco que causava ruído estático
      let bgBoost = 0;
      if (bgClean && hsl.l > 0.82 && hsl.s < 0.25) {
        const lFactor = (hsl.l - 0.82) / 0.16; // 0 a 1 conforme se aproxima do branco
        const sFactor = (0.25 - hsl.s) / 0.25; // 0 a 1 conforme menor saturação
        bgBoost = Math.max(0, Math.min(1, lFactor * sFactor));
      }

      // (B) Adaptação de Paleta Conforme Daltonismo / Preset
      // Só recolore elementos com saturação real e que não sejam o fundo de papel claro (evita manchas/chiado cromático)
      if (presetMode === 'deuteranopia') {
        // Deuteranopia: confusão vermelho-verde
        // Shift de verdes (65° a 165°) para Azul Celeste e Ciano de Alto Contraste (195° a 215°)
        if (hsl.h >= 65 && hsl.h <= 165 && hsl.s > 0.18 && hsl.l < 0.90) {
          hsl.h = 205; // Ciano/Azul seguro
          hsl.s = Math.min(1, hsl.s * 1.3);
          hsl.l = Math.min(0.85, hsl.l * 1.05);
        } else if ((hsl.h >= 340 || hsl.h <= 30) && hsl.s > 0.18 && hsl.l < 0.90) {
          // Vermelhos/laranjas -> Vermelhão Acessível / Âmbar vivo com alta luminosidade
          hsl.h = 24; // Âmbar/Laranja
          hsl.s = Math.min(1, hsl.s * 1.25);
          hsl.l = Math.max(0.35, Math.min(0.65, hsl.l));
        }
        const rgbAdapted = this.hslToRgb(hsl.h, hsl.s, hsl.l);
        r = rgbAdapted.r;
        g = rgbAdapted.g;
        b = rgbAdapted.b;
      } else if (presetMode === 'protanopia') {
        // Protanopia: cones vermelhos inativos -> vermelhos parecem pretos ou marrons
        if ((hsl.h >= 335 || hsl.h <= 30) && hsl.s > 0.18 && hsl.l < 0.90) {
          // Eleva luminância para o vermelho não sumir, convertendo para Ouro/Âmbar
          hsl.h = 38; // Ouro vibrante
          hsl.s = Math.min(1, hsl.s * 1.3);
          hsl.l = Math.min(0.75, Math.max(0.45, hsl.l * 1.5 + 0.1));
        } else if (hsl.h >= 80 && hsl.h <= 160 && hsl.s > 0.18 && hsl.l < 0.90) {
          // Verdes -> Azul Cobalto / Ciano
          hsl.h = 210;
          hsl.s = Math.min(1, hsl.s * 1.2);
        }
        const rgbAdapted = this.hslToRgb(hsl.h, hsl.s, hsl.l);
        r = rgbAdapted.r;
        g = rgbAdapted.g;
        b = rgbAdapted.b;
      } else if (presetMode === 'tritanopia') {
        // Tritanopia: azul-amarelo e verde-azul
        if (hsl.h >= 170 && hsl.h <= 250 && hsl.s > 0.18 && hsl.l < 0.90) {
          // Azuis -> Ciano Escuro / Petróleo
          hsl.h = 185;
          hsl.s = Math.min(1, hsl.s * 1.3);
          hsl.l = Math.max(0.25, hsl.l * 0.85);
        } else if (hsl.h >= 45 && hsl.h <= 90 && hsl.s > 0.18 && hsl.l < 0.90) {
          // Amarelos/Verdes claros -> Magenta/Rosa Forte
          hsl.h = 325;
          hsl.s = Math.min(1, hsl.s * 1.35);
          hsl.l = Math.min(0.65, hsl.l);
        }
        const rgbAdapted = this.hslToRgb(hsl.h, hsl.s, hsl.l);
        r = rgbAdapted.r;
        g = rgbAdapted.g;
        b = rgbAdapted.b;
      } else if (presetMode === 'acromatopsia') {
        // Acromatopsia: converte para escala de cinza perceptual com quantização de contraste
        let lum = 0.2126 * r + 0.7152 * g + 0.0722 * b;
        // Expansão de degraus para que cores próximas não fiquem no mesmo cinza
        if (lum > 225) lum = 255;
        else if (lum > 170) lum = 195;
        else if (lum > 110) lum = 130;
        else if (lum > 50) lum = 70;
        else lum = 15;
        r = g = b = lum;
      } else if (presetMode === 'high-contrast') {
        // Modo Alto Contraste: reforça pretos para linhas e legendas
        const lum = 0.2126 * r + 0.7152 * g + 0.0722 * b;
        if (lum < 90) {
          r = Math.max(0, r * 0.4);
          g = Math.max(0, g * 0.4);
          b = Math.max(0, b * 0.4);
        } else if (lum > 210) {
          r = g = b = 255;
        }
      }

      // (C) Ajuste de Saturação Global
      if (saturationRatio !== 1 && presetMode !== 'acromatopsia') {
        const lum = 0.2126 * r + 0.7152 * g + 0.0722 * b;
        r = lum + (r - lum) * saturationRatio;
        g = lum + (g - lum) * saturationRatio;
        b = lum + (b - lum) * saturationRatio;
      }

      // (D) Ajuste de Contraste
      r = contrastFactor * (r - 128) + 128;
      g = contrastFactor * (g - 128) + 128;
      b = contrastFactor * (b - 128) + 128;

      // (E) Ajuste de Brilho
      r += brightnessOffset;
      g += brightnessOffset;
      b += brightnessOffset;

      // Aplica White Boost suave se houver
      if (bgBoost > 0) {
        r = r * (1 - bgBoost) + 255 * bgBoost;
        g = g * (1 - bgBoost) + 255 * bgBoost;
        b = b * (1 - bgBoost) + 255 * bgBoost;
      }

      // Limita ao intervalo [0, 255]
      destPixels[i] = Math.max(0, Math.min(255, Math.round(r)));
      destPixels[i + 1] = Math.max(0, Math.min(255, Math.round(g)));
      destPixels[i + 2] = Math.max(0, Math.min(255, Math.round(b)));
      destPixels[i + 3] = a;
    }

    // 3. NITIDEZ / UNSHARP MASK (Para tornar eixos, números e linhas de grade ultra nítidos)
    if (this.currentSettings.sharpness > 0) {
      this.applyUnsharpMask(destPixels, w, h, this.currentSettings.sharpness / 100);
    }

    // 4. SIMULAÇÃO DE DALTONISMO (Para validação de acessibilidade)
    if (this.currentSettings.simulationMode && this.currentSettings.simulationMode !== 'none') {
      this.applyVisionSimulation(destPixels, this.currentSettings.simulationMode);
    }

    // Renderiza no Canvas Adaptado
    this.adaptedCtx.putImageData(destData, 0, 0);

    // 5. CÁLCULO DE MÉTRICAS E GANHO DE CONTRASTE
    let finalMinLum = 255;
    let finalMaxLum = 0;
    for (let i = 0; i < destPixels.length; i += 4) {
      const lum = 0.2126 * destPixels[i] + 0.7152 * destPixels[i + 1] + 0.0722 * destPixels[i + 2];
      if (lum < finalMinLum) finalMinLum = lum;
      if (lum > finalMaxLum) finalMaxLum = lum;
    }

    const finalContrastRatio = ((finalMaxLum + 0.05) / (finalMinLum + 0.05)).toFixed(2);
    const contrastGainPercent = Math.max(0, Math.round(((finalContrastRatio - initialContrastRatio) / Math.max(1, initialContrastRatio)) * 100));

    const readabilityGrade = finalContrastRatio >= 7.0 ? 'WCAG AAA (Excelente)' : finalContrastRatio >= 4.5 ? 'WCAG AA (Conforme)' : 'Melhorado';

    const result = {
      adaptedDataUrl: this.adaptedCanvas.toDataURL('image/png', 0.95),
      originalDataUrl: this.originalCanvas.toDataURL('image/png', 0.95),
      width: w,
      height: h,
      stats: {
        initialContrastRatio: `${initialContrastRatio}:1`,
        finalContrastRatio: `${finalContrastRatio}:1`,
        contrastGain: `+${contrastGainPercent}%`,
        readabilityScore: readabilityGrade,
        mode: this.presets[presetMode] ? this.presets[presetMode].label : 'Personalizado'
      }
    };

    return result;
  }

  /**
   * Converte RGB para HSL
   */
  rgbToHsl(r, g, b) {
    r /= 255; g /= 255; b /= 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h, s, l = (max + min) / 2;

    if (max === min) {
      h = s = 0; // monocromático
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
   * Converte HSL para RGB
   */
  hslToRgb(h, s, l) {
    let r, g, b;
    h = (h % 360 + 360) % 360;

    if (s === 0) {
      r = g = b = l;
    } else {
      const hue2rgb = (p, q, t) => {
        if (t < 0) t += 1;
        if (t > 1) t -= 1;
        if (t < 1/6) return p + (q - p) * 6 * t;
        if (t < 1/2) return q;
        if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
        return p;
      };

      const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
      const p = 2 * l - q;
      const hk = h / 360;
      r = hue2rgb(p, q, hk + 1/3);
      g = hue2rgb(p, q, hk);
      b = hue2rgb(p, q, hk - 1/3);
    }

    return {
      r: Math.round(r * 255),
      g: Math.round(g * 255),
      b: Math.round(b * 255)
    };
  }

  /**
   * Filtro de Nitidez / Unsharp Mask com Suavização Gaussiana e Limiar de Coring (Anti-Ruído / Anti-Chiado)
   * Realça eixos, rótulos e bordas do gráfico sem amplificar ruído estático em fundos ou áreas lisas.
   */
  applyUnsharpMask(pixels, width, height, amount) {
    if (amount <= 0) return;
    const copy = new Uint8ClampedArray(pixels);
    const threshold = 6; // Ignora micro-flutuações de ruído de sensor/papel (<= 6 níveis)
    const boost = amount * 1.8;

    for (let y = 1; y < height - 1; y++) {
      const rowOffset = y * width;
      const prevRowOffset = (y - 1) * width;
      const nextRowOffset = (y + 1) * width;

      for (let x = 1; x < width - 1; x++) {
        const idx = (rowOffset + x) * 4;

        // Amostragem ponderada Gaussiana 3x3 (Kernel [1,2,1; 2,4,2; 1,2,1] / 16)
        const pTL = (prevRowOffset + (x - 1)) * 4;
        const pTC = (prevRowOffset + x) * 4;
        const pTR = (prevRowOffset + (x + 1)) * 4;

        const pML = (rowOffset + (x - 1)) * 4;
        const pMC = idx;
        const pMR = (rowOffset + (x + 1)) * 4;

        const pBL = (nextRowOffset + (x - 1)) * 4;
        const pBC = (nextRowOffset + x) * 4;
        const pBR = (nextRowOffset + (x + 1)) * 4;

        // R
        const blurR = (
          (copy[pTL] + copy[pTR] + copy[pBL] + copy[pBR]) +
          (copy[pTC] + copy[pML] + copy[pMR] + copy[pBC]) * 2 +
          copy[pMC] * 4
        ) / 16;

        // G
        const blurG = (
          (copy[pTL + 1] + copy[pTR + 1] + copy[pBL + 1] + copy[pBR + 1]) +
          (copy[pTC + 1] + copy[pML + 1] + copy[pMR + 1] + copy[pBC + 1]) * 2 +
          copy[pMC + 1] * 4
        ) / 16;

        // B
        const blurB = (
          (copy[pTL + 2] + copy[pTR + 2] + copy[pBL + 2] + copy[pBR + 2]) +
          (copy[pTC + 2] + copy[pML + 2] + copy[pMR + 2] + copy[pBC + 2]) * 2 +
          copy[pMC + 2] * 4
        ) / 16;

        const diffR = copy[idx] - blurR;
        const diffG = copy[idx + 1] - blurG;
        const diffB = copy[idx + 2] - blurB;

        // Limiar com transição suave (Coring) para eliminar ruído estático (chiado)
        if (Math.abs(diffR) > threshold) {
          const edgeR = diffR > 0 ? diffR - threshold : diffR + threshold;
          pixels[idx] = Math.max(0, Math.min(255, Math.round(copy[idx] + edgeR * boost)));
        }
        if (Math.abs(diffG) > threshold) {
          const edgeG = diffG > 0 ? diffG - threshold : diffG + threshold;
          pixels[idx + 1] = Math.max(0, Math.min(255, Math.round(copy[idx + 1] + edgeG * boost)));
        }
        if (Math.abs(diffB) > threshold) {
          const edgeB = diffB > 0 ? diffB - threshold : diffB + threshold;
          pixels[idx + 2] = Math.max(0, Math.min(255, Math.round(copy[idx + 2] + edgeB * boost)));
        }
      }
    }
  }

  /**
   * Simulação visual de daltonismo usando Matrizes de Transformação de Cor de Brettel/Machado
   */
  applyVisionSimulation(pixels, mode) {
    const matrices = {
      deuteranopia: [
        0.625, 0.375, 0.000,
        0.700, 0.300, 0.000,
        0.000, 0.300, 0.700
      ],
      protanopia: [
        0.567, 0.433, 0.000,
        0.558, 0.442, 0.000,
        0.000, 0.242, 0.758
      ],
      tritanopia: [
        0.950, 0.050, 0.000,
        0.000, 0.433, 0.567,
        0.000, 0.475, 0.525
      ],
      acromatopsia: [
        0.299, 0.587, 0.114,
        0.299, 0.587, 0.114,
        0.299, 0.587, 0.114
      ]
    };

    const m = matrices[mode];
    if (!m) return;

    for (let i = 0; i < pixels.length; i += 4) {
      const r = pixels[i];
      const g = pixels[i + 1];
      const b = pixels[i + 2];

      pixels[i] = Math.min(255, Math.max(0, r * m[0] + g * m[1] + b * m[2]));
      pixels[i + 1] = Math.min(255, Math.max(0, r * m[3] + g * m[4] + b * m[5]));
      pixels[i + 2] = Math.min(255, Math.max(0, r * m[6] + g * m[7] + b * m[8]));
    }
  }

  /**
   * =========================================================================
   * GERADORES DE GRÁFICOS DE EXEMPLO (Canvas procedural de alta resolução)
   * Permite que o usuário teste a ferramenta imediatamente sem precisar de arquivo
   * =========================================================================
   */

  /**
   * Gráfico de Barras 1: Vendas vs Metas Trimestrais (Conflito Clássico Verde x Vermelho)
   */
  generateSampleBarChart() {
    const canvas = document.createElement('canvas');
    canvas.width = 900;
    canvas.height = 540;
    const ctx = canvas.getContext('2d');

    // Fundo limpo
    ctx.fillStyle = '#fafbfa';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Título e Subtítulo
    ctx.fillStyle = '#1c3b44';
    ctx.font = 'bold 22px Nunito, Inter, sans-serif';
    ctx.fillText('Desempenho de Vendas por Trimestre (Meta x Realizado)', 50, 50);

    ctx.fillStyle = '#617d84';
    ctx.font = '14px Inter, sans-serif';
    ctx.fillText('Nota: Barras vermelhas (Abaixo da Meta) e verdes (Acima da Meta) são indistinguíveis em daltônicos', 50, 75);

    // Eixos
    const ox = 90, oy = 440, w = 750, h = 330;
    ctx.strokeStyle = '#c5d5d8';
    ctx.lineWidth = 1.5;

    // Linhas de Grade e Valores Y
    ctx.font = '12px Inter, sans-serif';
    ctx.fillStyle = '#577077';
    for (let i = 0; i <= 5; i++) {
      const y = oy - (h / 5) * i;
      ctx.beginPath();
      ctx.moveTo(ox, y);
      ctx.lineTo(ox + w, y);
      ctx.stroke();

      const label = `${i * 20}k`;
      ctx.fillText(label, ox - 35, y + 4);
    }

    // Linha de Meta Pontilhada
    const metaY = oy - (h / 5) * 3.5;
    ctx.strokeStyle = '#d97706';
    ctx.lineWidth = 2;
    ctx.setLineDash([6, 6]);
    ctx.beginPath();
    ctx.moveTo(ox, metaY);
    ctx.lineTo(ox + w, metaY);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = '#d97706';
    ctx.font = 'bold 12px Inter, sans-serif';
    ctx.fillText('Meta (70k)', ox + w - 75, metaY - 8);

    // Dados das Barras (Trimestres)
    // Cores originais não-acessíveis: Vermelho (#d93838) e Verde (#2e9b43)
    const quarters = [
      { name: 'Q1 Norte', val: 55, target: 70, ok: false },
      { name: 'Q1 Sul', val: 82, target: 70, ok: true },
      { name: 'Q2 Norte', val: 45, target: 70, ok: false },
      { name: 'Q2 Sul', val: 94, target: 70, ok: true },
      { name: 'Q3 Norte', val: 88, target: 70, ok: true },
      { name: 'Q3 Sul', val: 62, target: 70, ok: false },
      { name: 'Q4 Geral', val: 91, target: 70, ok: true }
    ];

    const barWidth = 60;
    const spacing = (w - (quarters.length * barWidth)) / (quarters.length + 1);

    quarters.forEach((q, idx) => {
      const bx = ox + spacing + idx * (barWidth + spacing);
      const barHeight = (q.val / 100) * h;
      const by = oy - barHeight;

      // Cor clássica problemática
      ctx.fillStyle = q.ok ? '#2e9b43' : '#d93838';
      ctx.fillRect(bx, by, barWidth, barHeight);

      // Borda sutil
      ctx.strokeStyle = q.ok ? '#216c30' : '#992222';
      ctx.lineWidth = 1;
      ctx.strokeRect(bx, by, barWidth, barHeight);

      // Valor no topo da barra
      ctx.fillStyle = '#222222';
      ctx.font = 'bold 13px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(`${q.val}k`, bx + barWidth / 2, by - 8);

      // Nome do Trimestre no eixo X
      ctx.fillStyle = '#445b61';
      ctx.font = '12px Inter, sans-serif';
      ctx.fillText(q.name, bx + barWidth / 2, oy + 22);
    });

    ctx.textAlign = 'left';

    // Legenda no canto superior direito
    const lx = 600, ly = 40;
    // Verde
    ctx.fillStyle = '#2e9b43';
    ctx.fillRect(lx, ly, 16, 16);
    ctx.fillStyle = '#222';
    ctx.font = '13px Inter, sans-serif';
    ctx.fillText('Acima da Meta', lx + 24, ly + 13);

    // Vermelho
    ctx.fillStyle = '#d93838';
    ctx.fillRect(lx + 130, ly, 16, 16);
    ctx.fillText('Abaixo da Meta', lx + 154, ly + 13);

    return canvas.toDataURL('image/png');
  }

  /**
   * Gráfico de Pizza 2: Distribuição de Mercado
   */
  generateSamplePieChart() {
    const canvas = document.createElement('canvas');
    canvas.width = 900;
    canvas.height = 540;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = '#fcfdfc';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = '#1c3b44';
    ctx.font = 'bold 22px Nunito, Inter, sans-serif';
    ctx.fillText('Market Share por Região (Cores em Conflito de Daltonismo)', 50, 50);

    ctx.fillStyle = '#617d84';
    ctx.font = '14px Inter, sans-serif';
    ctx.fillText('Cores críticas: Vermelho, Verde Oliva, Marrom e Laranja sem diferenciação de luminância', 50, 75);

    const cx = 330, cy = 290, radius = 170;
    const slices = [
      { label: 'Sudeste (38%)', value: 0.38, color: '#318c46' }, // Verde
      { label: 'Sul (27%)', value: 0.27, color: '#c73a3a' },     // Vermelho
      { label: 'Nordeste (21%)', value: 0.21, color: '#8c6131' }, // Marrom (confunde com vermelho e verde)
      { label: 'Centro-Oeste (14%)', value: 0.14, color: '#e08f26' } // Laranja
    ];

    let startAngle = -Math.PI / 2;
    slices.forEach((slice) => {
      const sliceAngle = slice.value * 2 * Math.PI;
      const endAngle = startAngle + sliceAngle;

      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, radius, startAngle, endAngle);
      ctx.closePath();
      ctx.fillStyle = slice.color;
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2.5;
      ctx.stroke();

      startAngle = endAngle;
    });

    // Legenda lateral
    const legX = 570;
    let legY = 190;
    slices.forEach((s) => {
      ctx.fillStyle = s.color;
      ctx.beginPath();
      ctx.arc(legX + 10, legY + 8, 9, 0, 2 * Math.PI);
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      ctx.fillStyle = '#1c3b44';
      ctx.font = '600 15px Inter, sans-serif';
      ctx.fillText(s.label, legX + 30, legY + 13);

      legY += 48;
    });

    return canvas.toDataURL('image/png');
  }

  /**
   * Gráfico de Linhas 3: Tendência Multivariada de Métricas
   */
  generateSampleLineChart() {
    const canvas = document.createElement('canvas');
    canvas.width = 900;
    canvas.height = 540;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = '#1c3b44';
    ctx.font = 'bold 22px Nunito, Inter, sans-serif';
    ctx.fillText('Evolução Mensal de Satisfação e Retenção', 50, 50);

    ctx.fillStyle = '#617d84';
    ctx.font = '14px Inter, sans-serif';
    ctx.fillText('3 séries temporais: Verde, Vermelho e Azul sem reforço de espessura e símbolos', 50, 75);

    const ox = 80, oy = 440, w = 760, h = 330;
    ctx.strokeStyle = '#e2ebee';
    ctx.lineWidth = 1;

    for (let i = 0; i <= 5; i++) {
      const y = oy - (h / 5) * i;
      ctx.beginPath();
      ctx.moveTo(ox, y);
      ctx.lineTo(ox + w, y);
      ctx.stroke();

      ctx.fillStyle = '#637a80';
      ctx.font = '12px Inter, sans-serif';
      ctx.fillText(`${i * 20}%`, ox - 40, y + 4);
    }

    const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out'];
    const stepX = w / (months.length - 1);

    months.forEach((m, idx) => {
      ctx.fillStyle = '#4f686e';
      ctx.font = '12px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(m, ox + idx * stepX, oy + 24);
    });
    ctx.textAlign = 'left';

    const series = [
      { name: 'Retenção de Clientes', color: '#27943c', data: [45, 48, 52, 60, 64, 70, 73, 76, 80, 84] },
      { name: 'Taxa de Churn', color: '#cb3535', data: [55, 52, 47, 43, 38, 32, 28, 25, 22, 19] },
      { name: 'Engajamento Médio', color: '#2d67a4', data: [30, 36, 42, 45, 50, 58, 62, 68, 72, 75] }
    ];

    series.forEach((s) => {
      ctx.strokeStyle = s.color;
      ctx.lineWidth = 3;
      ctx.beginPath();
      s.data.forEach((val, idx) => {
        const x = ox + idx * stepX;
        const y = oy - (val / 100) * h;
        if (idx === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.stroke();

      // Pontos
      s.data.forEach((val, idx) => {
        const x = ox + idx * stepX;
        const y = oy - (val / 100) * h;
        ctx.fillStyle = s.color;
        ctx.beginPath();
        ctx.arc(x, y, 5, 0, 2 * Math.PI);
        ctx.fill();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.stroke();
      });
    });

    // Legenda
    const legX = 460;
    const legY = 40;
    series.forEach((s, idx) => {
      const lx = legX + idx * 140;
      ctx.fillStyle = s.color;
      ctx.fillRect(lx, legY, 18, 5);
      ctx.fillStyle = '#222';
      ctx.font = '12px Inter, sans-serif';
      ctx.fillText(s.name, lx + 24, legY + 8);
    });

    return canvas.toDataURL('image/png');
  }
}

// Exportação global
window.ChartColorAdapter = ChartColorAdapter;
