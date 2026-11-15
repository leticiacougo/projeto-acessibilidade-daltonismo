/**
 * Plataforma de Daltonismo e Teste de Ishihara - Aplicação Web
 * Gerenciamento de Telas, Navegação e Motor Diagnóstico
 */

document.addEventListener('DOMContentLoaded', () => {
  // Estado da Aplicação
  const state = {
    currentScreen: 'screen-home',
    previousScreen: null,
    testCurrentPlateIndex: 0,
    testAnswers: [],
    selectedTypeId: null
  };

  // Mapeamento explícito de todas as telas
  const screenElements = {
    home: document.getElementById('screen-home'),
    types: document.getElementById('screen-types'),
    test: document.getElementById('screen-test'),
    result: document.getElementById('screen-result'),
    adaptation: document.getElementById('screen-adaptation')
  };

  // Botões de Navegação da Home
  const btnGoToTypes = document.getElementById('btn-goto-types');
  const btnAdaptation = document.getElementById('btn-adaptation');
  const btnStartTest = document.getElementById('btn-start-test');

  // Botões de Voltar & Atalhos para o Início
  const backBtnTypes = document.getElementById('back-btn-types');
  const quickHomeFromTypes = document.getElementById('quick-home-from-types');
  const backBtnTest = document.getElementById('back-btn-test');
  const cancelTestBtn = document.getElementById('cancel-test-btn');
  const backBtnResult = document.getElementById('back-btn-result');
  const quickHomeFromResult = document.getElementById('quick-home-from-result');
  const backBtnAdaptation = document.getElementById('back-btn-adaptation');
  const quickHomeFromAdaptation = document.getElementById('quick-home-from-adaptation');

  // Elementos do Teste de Ishihara
  const testStepIndicator = document.getElementById('test-step-indicator');
  const testProgressFill = document.getElementById('test-progress-fill');
  const testQuestion = document.getElementById('test-question');
  const testPlateImage = document.getElementById('test-plate-image');
  const primaryOptionsRow = document.getElementById('primary-options-row');
  const btnNoneOption = document.getElementById('btn-none-option');

  // Elementos da Tela de Resultado
  const resultTitle = document.getElementById('result-title');
  const resultCardContainer = document.getElementById('result-card-container');
  const resultSummary = document.getElementById('result-summary');
  const resultCharacteristics = document.getElementById('result-characteristics');
  const btnRetakeTest = document.getElementById('btn-retake-test');
  const btnBackToHome = document.getElementById('btn-back-to-home');
  const btnBackToTypes = document.getElementById('btn-back-to-types');

  /**
   * Navega para a tela desejada com isolamento absoluto (sem sobreposição)
   * @param {string} targetScreenId 
   * @param {object} options 
   */
  function navigateTo(targetScreenId, options = {}) {
    const targetElement = document.getElementById(targetScreenId);
    if (!targetElement) {
      console.error(`Tela não encontrada: ${targetScreenId}`);
      return;
    }

    state.previousScreen = state.currentScreen;
    state.currentScreen = targetScreenId;

    // 1. Oculta rigorosamente todas as telas via inline style e remoção de classe
    Object.values(screenElements).forEach(screen => {
      if (screen) {
        screen.classList.remove('active');
        screen.style.setProperty('display', 'none', 'important');
      }
    });

    // 2. Exibe exclusivamente a tela alvo
    targetElement.classList.add('active');
    targetElement.style.setProperty('display', 'flex', 'important');
    window.scrollTo({ top: 0, behavior: 'instant' });

    // 3. Inicializa fluxos conforme a tela
    if (targetScreenId === 'screen-test') {
      if (options.resetTest) {
        startIshiharaTest();
      }
    } else if (targetScreenId === 'screen-result') {
      if (options.typeId) {
        renderResultScreen(options.typeId, options.fromTest || false);
      }
    }
  }

  // ==========================================================================
  // EVENT LISTENERS DE NAVEGAÇÃO
  // ==========================================================================

  // Tela 1: Home
  if (btnGoToTypes) {
    btnGoToTypes.addEventListener('click', (e) => {
      e.preventDefault();
      navigateTo('screen-types');
    });
  }

  // Botão 2: Adaptação de gráficos (Ativo - Abre Ferramenta de Adaptação)
  if (btnAdaptation) {
    btnAdaptation.addEventListener('click', (e) => {
      e.preventDefault();
      navigateTo('screen-adaptation');
      if (window.chartAdaptationModule) {
        window.chartAdaptationModule.onOpenScreen();
      }
    });
  }

  // Tela 5: Adaptação de gráficos - Voltar ao Início
  if (backBtnAdaptation) {
    backBtnAdaptation.addEventListener('click', (e) => {
      e.preventDefault();
      if (window.chartAdaptationModule && window.chartAdaptationModule.stopAudio) {
        window.chartAdaptationModule.stopAudio();
      }
      navigateTo('screen-home');
    });
  }

  if (quickHomeFromAdaptation) {
    quickHomeFromAdaptation.addEventListener('click', (e) => {
      e.preventDefault();
      if (window.chartAdaptationModule && window.chartAdaptationModule.stopAudio) {
        window.chartAdaptationModule.stopAudio();
      }
      navigateTo('screen-home');
    });
  }

  // Tela 2: Selecionar
  if (backBtnTypes) {
    backBtnTypes.addEventListener('click', (e) => {
      e.preventDefault();
      navigateTo('screen-home');
    });
  }

  if (quickHomeFromTypes) {
    quickHomeFromTypes.addEventListener('click', (e) => {
      e.preventDefault();
      navigateTo('screen-home');
    });
  }

  if (btnStartTest) {
    btnStartTest.addEventListener('click', (e) => {
      e.preventDefault();
      navigateTo('screen-test', { resetTest: true });
    });
  }

  // Clique em qualquer um dos 4 cartões de tipo para abrir seus detalhes
  const typeCards = document.querySelectorAll('.types-cards-list .type-card');
  typeCards.forEach(card => {
    card.addEventListener('click', () => {
      const typeId = card.getAttribute('data-type');
      if (typeId && COLOR_BLINDNESS_TYPES[typeId]) {
        state.selectedTypeId = typeId;
        navigateTo('screen-result', { typeId, fromTest: false });
      }
    });

    // Acessibilidade via teclado (Enter ou Espaço)
    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        card.click();
      }
    });
  });

  // Tela 3: Teste de Ishihara
  if (backBtnTest) {
    backBtnTest.addEventListener('click', (e) => {
      e.preventDefault();
      navigateTo('screen-types');
    });
  }

  if (cancelTestBtn) {
    cancelTestBtn.addEventListener('click', (e) => {
      e.preventDefault();
      navigateTo('screen-home');
    });
  }

  // Tela 4: Resultado
  if (backBtnResult) {
    backBtnResult.addEventListener('click', (e) => {
      e.preventDefault();
      if (state.previousScreen === 'screen-test') {
        navigateTo('screen-types');
      } else {
        navigateTo(state.previousScreen || 'screen-types');
      }
    });
  }

  if (quickHomeFromResult) {
    quickHomeFromResult.addEventListener('click', (e) => {
      e.preventDefault();
      navigateTo('screen-home');
    });
  }

  if (btnRetakeTest) {
    btnRetakeTest.addEventListener('click', (e) => {
      e.preventDefault();
      navigateTo('screen-test', { resetTest: true });
    });
  }

  if (btnBackToHome) {
    btnBackToHome.addEventListener('click', (e) => {
      e.preventDefault();
      navigateTo('screen-home');
    });
  }

  if (btnBackToTypes) {
    btnBackToTypes.addEventListener('click', (e) => {
      e.preventDefault();
      navigateTo('screen-types');
    });
  }

  // ==========================================================================
  // MOTOR DO TESTE DE ISHIHARA
  // ==========================================================================

  function startIshiharaTest() {
    state.testCurrentPlateIndex = 0;
    state.testAnswers = [];
    renderCurrentPlate();
  }

  function renderCurrentPlate() {
    const currentPlate = ISHIHARA_PLATES[state.testCurrentPlateIndex];
    if (!currentPlate) {
      finishIshiharaTest();
      return;
    }

    // Atualiza texto e barra de progresso
    const totalPlates = ISHIHARA_PLATES.length;
    const currentStep = state.testCurrentPlateIndex + 1;
    testStepIndicator.textContent = `Placa ${currentStep} de ${totalPlates}`;
    if (testProgressFill) {
      testProgressFill.style.width = `${(currentStep / totalPlates) * 100}%`;
    }

    // Atualiza pergunta e imagem
    testQuestion.textContent = currentPlate.question;
    testPlateImage.src = currentPlate.image;
    testPlateImage.alt = `Placa de teste de Ishihara número ${currentPlate.id}`;

    // Renderiza botões das opções primárias
    primaryOptionsRow.innerHTML = '';
    currentPlate.primaryOptions.forEach(optionValue => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'btn-number-choice';
      btn.textContent = optionValue;
      btn.setAttribute('aria-label', `Opção ${optionValue}`);
      btn.addEventListener('click', () => handlePlateAnswer(optionValue));
      primaryOptionsRow.appendChild(btn);
    });

    // Configura botão "Não vejo número"
    btnNoneOption.textContent = currentPlate.noneOption || "Não vejo número";
    btnNoneOption.onclick = () => handlePlateAnswer("none");
  }

  function handlePlateAnswer(answerValue) {
    const currentPlate = ISHIHARA_PLATES[state.testCurrentPlateIndex];

    state.testAnswers.push({
      plateId: currentPlate.id,
      plateTypeHint: currentPlate.typeHint,
      answer: answerValue,
      isCorrect: answerValue === currentPlate.correct
    });

    state.testCurrentPlateIndex++;

    if (state.testCurrentPlateIndex < ISHIHARA_PLATES.length) {
      // Transição visual suave
      testPlateImage.style.opacity = '0.3';
      setTimeout(() => {
        renderCurrentPlate();
        testPlateImage.style.opacity = '1';
      }, 120);
    } else {
      finishIshiharaTest();
    }
  }

  /**
   * Avalia as respostas registradas e diagnostica o tipo de percepção
   */
  function finishIshiharaTest() {
    const answers = state.testAnswers;

    let correctCount = 0;
    let noneCount = 0;
    let protanSigns = 0;
    let deutanSigns = 0;
    let tritanSigns = 0;

    answers.forEach(a => {
      if (a.isCorrect) correctCount++;
      if (a.answer === 'none') noneCount++;

      // Placa 1 (Placa 5 da referência)
      if (a.plateId === 1) {
        if (a.answer === '9' || a.answer === 'none') {
          protanSigns++;
          deutanSigns++;
        }
      }

      // Placa 2 (Placa 74)
      if (a.plateId === 2) {
        if (a.answer === '21' || a.answer === 'none') {
          protanSigns++;
          deutanSigns++;
        }
      }

      // Placa 3 (Placa 26: Diferenciação Protanopia vs Deuteranopia)
      if (a.plateId === 3) {
        if (a.answer === '6') {
          protanSigns += 3; // Enxerga somente o 6 (Protanopia)
        } else if (a.answer === '2') {
          deutanSigns += 3; // Enxerga somente o 2 (Deuteranopia)
        } else if (a.answer === 'none') {
          protanSigns++;
          deutanSigns++;
        }
      }

      // Placa 4 (Placa 8: Tritanopia)
      if (a.plateId === 4) {
        if (a.answer === '3' || a.answer === 'none') {
          tritanSigns += 3;
        }
      }

      // Placa 5 (Placa 12 de controle)
      if (a.plateId === 5) {
        if (a.answer === 'none') {
          noneCount += 2;
        }
      }
    });

    let detectedType = 'normal';

    if (noneCount >= 4) {
      detectedType = 'acromatopsia';
    } else if (tritanSigns >= 3 && protanSigns < 2 && deutanSigns < 2) {
      detectedType = 'tritanopia';
    } else if (protanSigns > deutanSigns && protanSigns >= 2) {
      detectedType = 'protanopia';
    } else if (deutanSigns > protanSigns && deutanSigns >= 2) {
      detectedType = 'deuteranopia';
    } else if (protanSigns >= 2 || deutanSigns >= 2) {
      const plate3Ans = answers.find(a => a.plateId === 3);
      if (plate3Ans && plate3Ans.answer === '6') {
        detectedType = 'protanopia';
      } else {
        detectedType = 'deuteranopia';
      }
    } else if (correctCount >= 4) {
      detectedType = 'normal';
    } else {
      detectedType = 'protanopia';
    }

    state.selectedTypeId = detectedType;
    navigateTo('screen-result', { typeId: detectedType, fromTest: true });
  }

  // ==========================================================================
  // RENDERIZAÇÃO DA TELA 4: RESULTADO & DETALHES
  // ==========================================================================

  function renderResultScreen(typeId, fromTest = false) {
    const typeInfo = COLOR_BLINDNESS_TYPES[typeId] || COLOR_BLINDNESS_TYPES.protanopia;

    // Título da seção (Conforme Imagem 4)
    resultTitle.textContent = fromTest ? "Tipo Identificado:" : "Tipo Selecionado:";

    // Cartão Identificado com Círculo Concêntrico
    resultCardContainer.innerHTML = `
      <div class="type-card" style="cursor: default;">
        <div class="concentric-circle-icon circle-${typeInfo.id}">
          <div class="concentric-inner-circle"></div>
        </div>
        <div class="type-card-name">${typeInfo.name}</div>
      </div>
    `;

    // Parágrafo explicativo
    resultSummary.textContent = typeInfo.summary;

    // Lista de Características com Marcadores Bullet
    resultCharacteristics.innerHTML = '';
    typeInfo.characteristics.forEach(item => {
      const li = document.createElement('li');
      li.className = 'bullet-item';
      li.innerHTML = `<strong>${item.title}:</strong> ${item.desc}`;
      resultCharacteristics.appendChild(li);
    });

    // Simulador Visual de Cores
    setupVisionSimulator(typeInfo);
  }

  /**
   * Configura o painel de simulação cromática
   */
  function setupVisionSimulator(typeInfo) {
    const simulatorContainer = document.getElementById('vision-simulator-container');
    if (!simulatorContainer) return;

    if (typeInfo.id === 'normal') {
      simulatorContainer.innerHTML = '';
      return;
    }

    simulatorContainer.innerHTML = `
      <div class="sim-panel">
        <div class="sim-header">
          <span class="sim-title">Simulação Visual: Percepção de ${typeInfo.name}</span>
          <button type="button" id="btn-toggle-sim" class="btn-toggle-filter">
            Ativar Simulação
          </button>
        </div>
        <p class="sim-desc">
          Compare como as cores básicas abaixo são vistas com visão padrão versus sob a percepção deste tipo de daltonismo:
        </p>
        <div class="sim-colors-grid" id="sim-preview-grid">
          <div class="color-chip" style="background-color: #d32f2f;">Vermelho</div>
          <div class="color-chip" style="background-color: #388e3c;">Verde</div>
          <div class="color-chip" style="background-color: #1976d2;">Azul</div>
          <div class="color-chip" style="background-color: #fbc02d; color: #222;">Amarelo</div>
        </div>
      </div>
    `;

    const btnToggleSim = document.getElementById('btn-toggle-sim');
    const previewGrid = document.getElementById('sim-preview-grid');

    if (btnToggleSim && previewGrid) {
      btnToggleSim.addEventListener('click', () => {
        const filterClass = `apply-filter-${typeInfo.id}`;
        previewGrid.classList.toggle(filterClass);
        const isActive = previewGrid.classList.contains(filterClass);
        btnToggleSim.textContent = isActive ? 'Desativar Simulação' : 'Ativar Simulação';
        btnToggleSim.classList.toggle('active', isActive);
      });
    }
  }

  // ==========================================================================
  // MÓDULO: ADAPTAÇÃO DE CORES DE GRÁFICOS & GERENCIADOR DE GALERIA
  // ==========================================================================

  function initChartAdaptationModule() {
    const adapter = new ChartColorAdapter();
    const gallery = new AdaptedGalleryManager();

    let currentResult = null;
    let isDraggingSplit = false;
    let isDraggingModalSplit = false;
    let activeCategoryFilter = 'all';
    let searchQuery = '';
    let currentChartName = 'salesBar';
    let uploadedFileName = '';

    // Componente de Audiodescrição Inteligente com Voz (TTS)
    let audioDescriber = null;
    if (typeof ChartAudioDescriberComponent === 'function') {
      audioDescriber = new ChartAudioDescriberComponent('chart-audio-describer-slot');
    }

    // Elementos de Aba
    const tabBtnWorkbench = document.getElementById('tab-btn-workbench');
    const tabBtnGallery = document.getElementById('tab-btn-gallery');
    const viewWorkbench = document.getElementById('view-workbench');
    const viewGallery = document.getElementById('view-gallery');
    const galleryCounterBadge = document.getElementById('gallery-counter-badge');

    // Elementos de Importação
    const chartFileInput = document.getElementById('chart-file-input');
    const chartDropzone = document.getElementById('chart-dropzone');
    const btnOpenCamera = document.getElementById('btn-open-camera');
    const btnStageCamera = document.getElementById('btn-stage-camera');
    const cameraFallbackInput = document.getElementById('camera-fallback-input');

    // Elementos do Modal de Câmera ao Vivo
    const modalCameraCapture = document.getElementById('modal-camera-capture');
    const btnCloseCameraModal = document.getElementById('btn-close-camera-modal');
    const cameraVideoStream = document.getElementById('camera-video-stream');
    const cameraCaptureCanvas = document.getElementById('camera-capture-canvas');
    const cameraPhotoPreview = document.getElementById('camera-photo-preview');
    const cameraFrameGuide = document.getElementById('camera-frame-guide');
    const cameraErrorMessage = document.getElementById('camera-error-message');
    const cameraErrorTitle = document.getElementById('camera-error-title');
    const cameraErrorDesc = document.getElementById('camera-error-desc');
    const cameraLoadingIndicator = document.getElementById('camera-loading-indicator');
    const cameraLiveControls = document.getElementById('camera-live-controls');
    const cameraPreviewControls = document.getElementById('camera-preview-controls');
    const btnCameraCapture = document.getElementById('btn-camera-capture');
    const btnCameraSwitch = document.getElementById('btn-camera-switch');
    const btnCameraRetake = document.getElementById('btn-camera-retake');
    const btnCameraConfirm = document.getElementById('btn-camera-confirm');

    let cameraStream = null;
    let cameraFacingMode = 'environment';
    let capturedPhotoDataUrl = null;

    // Elementos do Estágio
    const splitViewport = document.getElementById('split-viewport');
    const splitOverlay = document.getElementById('split-overlay');
    const splitHandle = document.getElementById('split-handle');
    const sideViewport = document.getElementById('side-viewport');
    const stageEmptyPlaceholder = document.getElementById('stage-empty-placeholder');

    const imgAdaptedPreview = document.getElementById('img-adapted-preview');
    const imgOriginalPreview = document.getElementById('img-original-preview');
    const sideImgOriginal = document.getElementById('side-img-original');
    const sideImgAdapted = document.getElementById('side-img-adapted');

    const btnModeSplit = document.getElementById('btn-mode-split');
    const btnModeSide = document.getElementById('btn-mode-side');
    const btnModeAdapted = document.getElementById('btn-mode-adapted');

    // Elementos de Métricas
    const metricContrastGain = document.getElementById('metric-contrast-gain');
    const metricReadability = document.getElementById('metric-readability');
    const metricActiveMode = document.getElementById('metric-active-mode');
    const metricDimensions = document.getElementById('metric-dimensions');

    // Elementos de Controles & Presets
    const presetButtons = document.querySelectorAll('.btn-preset[data-preset]');
    const sliderContrast = document.getElementById('slider-contrast');
    const sliderBrightness = document.getElementById('slider-brightness');
    const sliderSharpness = document.getElementById('slider-sharpness');
    const sliderSaturation = document.getElementById('slider-saturation');
    const checkBgClean = document.getElementById('check-bg-clean');

    const labelValContrast = document.getElementById('label-val-contrast');
    const labelValBrightness = document.getElementById('label-val-brightness');
    const labelValSharpness = document.getElementById('label-val-sharpness');
    const labelValSaturation = document.getElementById('label-val-saturation');
    const btnResetSliders = document.getElementById('btn-reset-sliders');

    // Botões de Ação do Workbench
    const btnSaveToGallery = document.getElementById('btn-save-to-gallery');
    const btnDownloadAdapted = document.getElementById('btn-download-adapted');

    // Elementos da Galeria
    const gallerySearchInput = document.getElementById('gallery-search-input');
    const filterChips = document.querySelectorAll('.gallery-filter-chips .filter-chip');
    const galleryCardsGrid = document.getElementById('gallery-cards-grid');
    const galleryEmptyState = document.getElementById('gallery-empty-state');
    const btnGalleryNewChart = document.getElementById('btn-gallery-new-chart');
    const btnGalleryClearAll = document.getElementById('btn-gallery-clear-all');
    const btnEmptyGoAdapt = document.getElementById('btn-empty-go-adapt');

    // Modal Salvar
    const modalSaveChart = document.getElementById('modal-save-chart');
    const btnCloseSaveModal = document.getElementById('btn-close-save-modal');
    const btnCancelSave = document.getElementById('btn-cancel-save');
    const btnConfirmSave = document.getElementById('btn-confirm-save');
    const modalSaveThumb = document.getElementById('modal-save-thumb');
    const inputSaveTitle = document.getElementById('input-save-title');
    const modalSaveMode = document.getElementById('modal-save-mode');
    const modalSaveContrast = document.getElementById('modal-save-contrast');
    const modalSaveWcag = document.getElementById('modal-save-wcag');

    // Modal Preview em Alta Resolução
    const modalPreviewChart = document.getElementById('modal-preview-chart');
    const btnClosePreviewModal = document.getElementById('btn-close-preview-modal');
    const modalPreviewTitle = document.getElementById('modal-preview-title');
    const modalPreviewBadge = document.getElementById('modal-preview-badge');
    const modalPreviewDate = document.getElementById('modal-preview-date');
    const modalPreviewImgAdapted = document.getElementById('modal-preview-img-adapted');
    const modalPreviewImgOriginal = document.getElementById('modal-preview-img-original');
    const modalSplitViewport = document.getElementById('modal-split-viewport');
    const modalSplitOverlay = document.getElementById('modal-split-overlay');
    const modalSplitHandle = document.getElementById('modal-split-handle');
    const btnModalReopenWorkbench = document.getElementById('btn-modal-reopen-workbench');
    const btnModalDownloadPng = document.getElementById('btn-modal-download-png');
    let previewModalChartItem = null;

    /**
     * Exibe toast notification elegante
     */
    function showToast(message, type = 'success') {
      const container = document.getElementById('toast-container');
      if (!container) return;

      const toast = document.createElement('div');
      toast.className = `toast-message ${type}`;
      toast.textContent = message;
      container.appendChild(toast);

      setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateY(10px)';
        toast.style.transition = 'all 0.25s ease';
        setTimeout(() => toast.remove(), 260);
      }, 3000);
    }

    /**
     * Alternância entre as abas Adaptador e Galeria
     */
    function switchTab(target) {
      if (target === 'workbench') {
        tabBtnWorkbench.classList.add('active');
        tabBtnWorkbench.setAttribute('aria-selected', 'true');
        tabBtnGallery.classList.remove('active');
        tabBtnGallery.setAttribute('aria-selected', 'false');

        viewWorkbench.style.display = 'block';
        viewGallery.style.display = 'none';
      } else {
        tabBtnGallery.classList.add('active');
        tabBtnGallery.setAttribute('aria-selected', 'true');
        tabBtnWorkbench.classList.remove('active');
        tabBtnWorkbench.setAttribute('aria-selected', 'false');

        viewWorkbench.style.display = 'none';
        viewGallery.style.display = 'block';
        renderGallery();
      }
    }

    if (tabBtnWorkbench) tabBtnWorkbench.addEventListener('click', () => switchTab('workbench'));
    if (tabBtnGallery) tabBtnGallery.addEventListener('click', () => switchTab('gallery'));
    if (btnGalleryNewChart) btnGalleryNewChart.addEventListener('click', () => switchTab('workbench'));
    if (btnEmptyGoAdapt) btnEmptyGoAdapt.addEventListener('click', () => switchTab('workbench'));

    /**
     * Executa a adaptação da imagem carregada com as configurações atuais
     */
    function runAdaptation(presetKey = null) {
      if (!adapter.isLoaded) {
        if (stageEmptyPlaceholder) stageEmptyPlaceholder.style.display = 'flex';
        if (imgAdaptedPreview) imgAdaptedPreview.style.display = 'none';
        if (imgOriginalPreview) imgOriginalPreview.style.display = 'none';
        if (splitHandle) splitHandle.style.display = 'none';
        return;
      }

      if (stageEmptyPlaceholder) stageEmptyPlaceholder.style.display = 'none';
      if (imgAdaptedPreview) imgAdaptedPreview.style.display = 'block';
      if (imgOriginalPreview) imgOriginalPreview.style.display = 'block';
      if (splitHandle && btnModeSplit && btnModeSplit.classList.contains('active')) {
        splitHandle.style.display = 'block';
      }

      if (presetKey) {
        adapter.setPreset(presetKey);
        syncSlidersWithAdapter();
        updateActivePresetBtn(presetKey);
      } else {
        adapter.updateSettings({
          contrast: parseInt(sliderContrast.value, 10),
          brightness: parseInt(sliderBrightness.value, 10),
          sharpness: parseInt(sliderSharpness.value, 10),
          saturation: parseInt(sliderSaturation.value, 10),
          bgClean: checkBgClean ? checkBgClean.checked : true,
          simulationMode: 'none'
        });
      }

      currentResult = adapter.process();

      // Atualiza imagens do estágio
      if (imgAdaptedPreview) imgAdaptedPreview.src = currentResult.adaptedDataUrl;
      if (imgOriginalPreview) imgOriginalPreview.src = currentResult.originalDataUrl;
      if (sideImgOriginal) sideImgOriginal.src = currentResult.originalDataUrl;
      if (sideImgAdapted) sideImgAdapted.src = currentResult.adaptedDataUrl;

      // Atualiza métricas
      if (metricContrastGain) metricContrastGain.textContent = currentResult.stats.contrastGain;
      if (metricReadability) metricReadability.textContent = currentResult.stats.readabilityScore;
      if (metricActiveMode) metricActiveMode.textContent = currentResult.stats.mode;
      if (metricDimensions) metricDimensions.textContent = `${currentResult.width} × ${currentResult.height} px`;

      // Atualiza a audiodescrição inteligente com os dados do gráfico ativo
      if (audioDescriber) {
        const activePreset = adapter.currentSettings.preset || presetKey || 'auto';
        const options = {
          preset: activePreset,
          presetInfo: adapter.presets[activePreset] || null,
          originalCanvas: adapter.originalCanvas,
          adaptedCanvas: adapter.adaptedCanvas,
          stats: currentResult ? currentResult.stats : null,
          fileName: uploadedFileName || null
        };
        const chartSource = (currentChartName && currentChartName !== 'custom') ? currentChartName : (adapter.adaptedCanvas || 'custom');
        audioDescriber.updateChart(chartSource, options);
      }
    }

    /**
     * Sincroniza sliders de controle com os valores internos do adapter
     */
    function syncSlidersWithAdapter() {
      const s = adapter.currentSettings;
      if (sliderContrast) {
        sliderContrast.value = s.contrast;
        labelValContrast.textContent = (s.contrast >= 0 ? '+' : '') + s.contrast + '%';
      }
      if (sliderBrightness) {
        sliderBrightness.value = s.brightness;
        labelValBrightness.textContent = (s.brightness >= 0 ? '+' : '') + s.brightness + '%';
      }
      if (sliderSharpness) {
        sliderSharpness.value = s.sharpness;
        labelValSharpness.textContent = s.sharpness + '%';
      }
      if (sliderSaturation) {
        sliderSaturation.value = s.saturation;
        labelValSaturation.textContent = s.saturation + '%';
      }
      if (checkBgClean) {
        checkBgClean.checked = s.bgClean !== false;
      }
    }

    /**
     * Atualiza o botão de preset ativo visualmente
     */
    function updateActivePresetBtn(presetKey) {
      presetButtons.forEach(btn => {
        if (btn.getAttribute('data-preset') === presetKey) {
          btn.classList.add('active');
        } else {
          btn.classList.remove('active');
        }
      });
    }

    /**
     * Carrega uma imagem no adapter a partir de source
     */
    async function loadChartImage(source, defaultPreset = 'auto', successMessage = 'Gráfico importado com sucesso!', chartName = null) {
      try {
        currentChartName = chartName || (typeof source === 'string' && (source.includes('salesBar') || source.includes('marketPie') || source.includes('retentionLine')) ? source : 'custom');
        if (source instanceof File) {
          uploadedFileName = source.name;
        } else if (chartName) {
          uploadedFileName = chartName;
        }
        await adapter.loadImage(source);
        runAdaptation(defaultPreset);
        showToast(successMessage, 'success');
      } catch (err) {
        console.error(err);
        showToast('Erro ao importar gráfico: ' + err.message, 'info');
      }
    }

    // ========================================================================
    // IMPORTAÇÃO DE ARQUIVOS (DRAG & DROP E FILE PICKER)
    // ========================================================================
    if (chartFileInput) {
      chartFileInput.addEventListener('change', (e) => {
        if (e.target.files && e.target.files[0]) {
          uploadedFileName = e.target.files[0].name;
          loadChartImage(e.target.files[0], 'auto', 'Gráfico importado com sucesso!');
        }
      });
    }

    if (chartDropzone) {
      ['dragenter', 'dragover'].forEach(eventName => {
        chartDropzone.addEventListener(eventName, (e) => {
          e.preventDefault();
          chartDropzone.classList.add('dragover');
        });
      });

      ['dragleave', 'drop'].forEach(eventName => {
        chartDropzone.addEventListener(eventName, (e) => {
          e.preventDefault();
          chartDropzone.classList.remove('dragover');
        });
      });

      chartDropzone.addEventListener('drop', (e) => {
        if (e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0]) {
          uploadedFileName = e.dataTransfer.files[0].name;
          loadChartImage(e.dataTransfer.files[0], 'auto', 'Gráfico importado via arrastar e soltar!');
        }
      });
    }

    // ========================================================================
    // RECURSO INTERATIVO: CAPTURA DE FOTO AO VIVO VIA CÂMERA DO DISPOSITIVO
    // ========================================================================
    async function startCameraStream() {
      if (!modalCameraCapture) return;

      modalCameraCapture.classList.add('active');
      if (cameraLoadingIndicator) cameraLoadingIndicator.style.display = 'flex';
      if (cameraErrorMessage) cameraErrorMessage.style.display = 'none';
      if (cameraLiveControls) cameraLiveControls.style.display = 'flex';
      if (cameraPreviewControls) cameraPreviewControls.style.display = 'none';
      if (cameraPhotoPreview) cameraPhotoPreview.style.display = 'none';
      if (cameraVideoStream) cameraVideoStream.style.display = 'block';
      if (cameraFrameGuide) cameraFrameGuide.style.display = 'flex';
      capturedPhotoDataUrl = null;

      stopCameraStream();

      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        showCameraError(
          'Navegador sem suporte direto à câmera',
          'A API de câmera ao vivo não está disponível neste navegador. Use a opção de arquivo ou câmera nativa abaixo.'
        );
        return;
      }

      try {
        const constraints = {
          video: {
            facingMode: cameraFacingMode,
            width: { ideal: 1920 },
            height: { ideal: 1080 }
          },
          audio: false
        };

        let stream;
        try {
          stream = await navigator.mediaDevices.getUserMedia(constraints);
        } catch (firstErr) {
          console.warn('Tentativa com facingMode falhou, tentando qualquer câmera:', firstErr);
          stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
        }

        cameraStream = stream;
        cameraVideoStream.srcObject = stream;

        cameraVideoStream.onloadedmetadata = () => {
          cameraVideoStream.play().catch(e => console.warn('Erro ao reproduzir stream da câmera:', e));
          if (cameraLoadingIndicator) cameraLoadingIndicator.style.display = 'none';
        };
      } catch (err) {
        console.error('Erro ao acessar câmera:', err);
        let errorMsg = 'Não foi possível acessar a câmera do dispositivo.';
        if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
          errorMsg = 'Permissão de câmera negada. Permita o acesso à câmera nas configurações do navegador.';
        } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
          errorMsg = 'Nenhuma câmera conectada ao seu dispositivo foi localizada.';
        } else if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
          errorMsg = 'A câmera já está sendo usada por outro aplicativo ou processo.';
        }

        showCameraError('Acesso à Câmera Indisponível', errorMsg);
      }
    }

    function stopCameraStream() {
      if (cameraStream) {
        cameraStream.getTracks().forEach(track => {
          try { track.stop(); } catch (e) {}
        });
        cameraStream = null;
      }
      if (cameraVideoStream) {
        cameraVideoStream.srcObject = null;
      }
    }

    function showCameraError(title, desc) {
      if (cameraLoadingIndicator) cameraLoadingIndicator.style.display = 'none';
      if (cameraVideoStream) cameraVideoStream.style.display = 'none';
      if (cameraFrameGuide) cameraFrameGuide.style.display = 'none';
      if (cameraLiveControls) cameraLiveControls.style.display = 'none';
      if (cameraPreviewControls) cameraPreviewControls.style.display = 'none';
      if (cameraErrorTitle) cameraErrorTitle.textContent = title;
      if (cameraErrorDesc) cameraErrorDesc.textContent = desc;
      if (cameraErrorMessage) cameraErrorMessage.style.display = 'flex';
    }

    function closeCameraModal() {
      stopCameraStream();
      if (modalCameraCapture) modalCameraCapture.classList.remove('active');
    }

    function captureCameraPhoto() {
      if (!cameraVideoStream || !cameraVideoStream.videoWidth) return;

      const vw = cameraVideoStream.videoWidth;
      const vh = cameraVideoStream.videoHeight;

      cameraCaptureCanvas.width = vw;
      cameraCaptureCanvas.height = vh;
      const ctx = cameraCaptureCanvas.getContext('2d');

      ctx.drawImage(cameraVideoStream, 0, 0, vw, vh);

      capturedPhotoDataUrl = cameraCaptureCanvas.toDataURL('image/png', 0.98);

      cameraPhotoPreview.src = capturedPhotoDataUrl;
      cameraPhotoPreview.style.display = 'block';
      cameraVideoStream.style.display = 'none';
      if (cameraFrameGuide) cameraFrameGuide.style.display = 'none';

      if (cameraLiveControls) cameraLiveControls.style.display = 'none';
      if (cameraPreviewControls) cameraPreviewControls.style.display = 'flex';
    }

    function retakeCameraPhoto() {
      cameraPhotoPreview.style.display = 'none';
      cameraVideoStream.style.display = 'block';
      if (cameraFrameGuide) cameraFrameGuide.style.display = 'flex';
      if (cameraLiveControls) cameraLiveControls.style.display = 'flex';
      if (cameraPreviewControls) cameraPreviewControls.style.display = 'none';
      capturedPhotoDataUrl = null;
    }

    function confirmCapturedPhoto() {
      if (!capturedPhotoDataUrl) return;
      uploadedFileName = 'Foto de Gráfico Físico (Câmera)';
      const photoToImport = capturedPhotoDataUrl;
      closeCameraModal();
      loadChartImage(photoToImport, 'auto', 'Foto do gráfico físico importada e adaptada com sucesso!');
    }

    function toggleCameraFacing() {
      cameraFacingMode = (cameraFacingMode === 'environment') ? 'user' : 'environment';
      startCameraStream();
    }

    if (btnOpenCamera) btnOpenCamera.addEventListener('click', startCameraStream);
    if (btnStageCamera) btnStageCamera.addEventListener('click', startCameraStream);
    if (btnCloseCameraModal) btnCloseCameraModal.addEventListener('click', closeCameraModal);
    if (btnCameraCapture) btnCameraCapture.addEventListener('click', captureCameraPhoto);
    if (btnCameraRetake) btnCameraRetake.addEventListener('click', retakeCameraPhoto);
    if (btnCameraConfirm) btnCameraConfirm.addEventListener('click', confirmCapturedPhoto);
    if (btnCameraSwitch) btnCameraSwitch.addEventListener('click', toggleCameraFacing);

    if (cameraFallbackInput) {
      cameraFallbackInput.addEventListener('change', (e) => {
        if (e.target.files && e.target.files[0]) {
          uploadedFileName = e.target.files[0].name || 'Foto de Gráfico Físico';
          closeCameraModal();
          loadChartImage(e.target.files[0], 'auto', 'Foto do gráfico importada com sucesso!');
        }
      });
    }

    // ========================================================================
    // AMOSTRAS RÁPIDAS COM AUDIODESCRIÇÃO (BARRAS, PIZZA, LINHAS)
    // ========================================================================
    const quickSampleBtns = document.querySelectorAll('.btn-quick-sample');
    quickSampleBtns.forEach(btn => {
      btn.addEventListener('click', async () => {
        const sampleType = btn.getAttribute('data-sample');
        if (sampleType === 'bar') {
          currentChartName = 'salesBar';
          uploadedFileName = 'Desempenho de Vendas (Barras)';
          const sample = adapter.generateSampleBarChart();
          await loadChartImage(sample, 'deuteranopia', 'Gráfico de Vendas trimestrais carregado!', 'salesBar');
        } else if (sampleType === 'pie') {
          currentChartName = 'marketPie';
          uploadedFileName = 'Distribuição de Market Share (Pizza)';
          const sample = adapter.generateSamplePieChart();
          await loadChartImage(sample, 'protanopia', 'Gráfico de Market Share carregado!', 'marketPie');
        } else if (sampleType === 'line') {
          currentChartName = 'retentionLine';
          uploadedFileName = 'Evolução de Retenção e Churn (Linhas)';
          const sample = adapter.generateSampleLineChart();
          await loadChartImage(sample, 'auto', 'Gráfico de Séries Temporais carregado!', 'retentionLine');
        }
      });
    });

    // ========================================================================
    // BOTÃO RÁPIDO: OUVIR AUDIODESCRIÇÃO IA NA BARRA DE FERRAMENTAS
    // ========================================================================
    const btnQuickAudioDesc = document.getElementById('btn-quick-audio-desc');
    if (btnQuickAudioDesc) {
      btnQuickAudioDesc.addEventListener('click', async () => {
        if (!audioDescriber) return;
        const activePreset = adapter.currentSettings.preset || 'auto';
        const options = {
          preset: activePreset,
          presetInfo: adapter.presets[activePreset] || null,
          originalCanvas: adapter.originalCanvas,
          adaptedCanvas: adapter.adaptedCanvas,
          stats: currentResult ? currentResult.stats : null,
          fileName: uploadedFileName || null
        };
        if (!adapter.isLoaded) {
          currentChartName = 'salesBar';
          uploadedFileName = 'Desempenho de Vendas (Barras)';
          const sample = adapter.generateSampleBarChart();
          await loadChartImage(sample, 'deuteranopia', 'Gráfico de demonstração carregado com audiodescrição!', 'salesBar');
        } else {
          audioDescriber.updateChart(currentChartName || adapter.adaptedCanvas, options);
        }
        audioDescriber.speech.togglePlayPause();
        const slot = document.getElementById('chart-audio-describer-slot');
        if (slot) {
          slot.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
      });
    }

    // Botão de Audiodescrição IA no Modal de Preview da Galeria
    const btnModalAudioDesc = document.getElementById('btn-modal-audio-desc');
    if (btnModalAudioDesc) {
      btnModalAudioDesc.addEventListener('click', () => {
        if (!audioDescriber || !previewModalChartItem) return;
        const item = previewModalChartItem;
        const title = item.title || '';
        const preset = item.adaptationType || 'auto';
        const options = {
          preset: preset,
          presetInfo: adapter.presets[preset] || null,
          stats: {
            contrastGain: item.contrastGain || '+25%',
            readabilityScore: 'WCAG AAA',
            mode: adapter.presets[preset] ? adapter.presets[preset].label : preset
          },
          fileName: title
        };
        if (title.includes('Vendas')) {
          audioDescriber.updateChart('salesBar', options);
        } else if (title.includes('Market')) {
          audioDescriber.updateChart('marketPie', options);
        } else if (title.includes('Retenção') || title.includes('Satisfação')) {
          audioDescriber.updateChart('retentionLine', options);
        } else {
          audioDescriber.updateChart(item.adaptedDataUrl || item.originalDataUrl, options);
        }
        audioDescriber.speech.togglePlayPause();
        showToast('Reproduzindo audiodescrição...', 'info');
      });
    }

    // ========================================================================
    // SPLIT SLIDER INTERATIVO (ARRASTAR DIVISOR ANTES / DEPOIS)
    // ========================================================================
    function updateSplitPosition(clientX, containerElem, overlayElem, handleElem) {
      const rect = containerElem.getBoundingClientRect();
      const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
      const percent = (x / rect.width) * 100;
      overlayElem.style.width = '100%';
      overlayElem.style.clipPath = `inset(0 ${100 - percent}% 0 0)`;
      handleElem.style.left = `${percent}%`;
    }

    if (splitViewport) {
      splitViewport.addEventListener('mousedown', (e) => {
        isDraggingSplit = true;
        updateSplitPosition(e.clientX, splitViewport, splitOverlay, splitHandle);
      });

      splitViewport.addEventListener('touchstart', (e) => {
        isDraggingSplit = true;
        if (e.touches[0]) {
          updateSplitPosition(e.touches[0].clientX, splitViewport, splitOverlay, splitHandle);
        }
      }, { passive: true });
    }

    if (modalSplitViewport) {
      modalSplitViewport.addEventListener('mousedown', (e) => {
        isDraggingModalSplit = true;
        updateSplitPosition(e.clientX, modalSplitViewport, modalSplitOverlay, modalSplitHandle);
      });

      modalSplitViewport.addEventListener('touchstart', (e) => {
        isDraggingModalSplit = true;
        if (e.touches[0]) {
          updateSplitPosition(e.touches[0].clientX, modalSplitViewport, modalSplitOverlay, modalSplitHandle);
        }
      }, { passive: true });
    }

    window.addEventListener('mousemove', (e) => {
      if (isDraggingSplit && splitViewport) {
        updateSplitPosition(e.clientX, splitViewport, splitOverlay, splitHandle);
      }
      if (isDraggingModalSplit && modalSplitViewport) {
        updateSplitPosition(e.clientX, modalSplitViewport, modalSplitOverlay, modalSplitHandle);
      }
    });

    window.addEventListener('touchmove', (e) => {
      if (e.touches[0]) {
        if (isDraggingSplit && splitViewport) {
          updateSplitPosition(e.touches[0].clientX, splitViewport, splitOverlay, splitHandle);
        }
        if (isDraggingModalSplit && modalSplitViewport) {
          updateSplitPosition(e.touches[0].clientX, modalSplitViewport, modalSplitOverlay, modalSplitHandle);
        }
      }
    }, { passive: true });

    window.addEventListener('mouseup', () => {
      isDraggingSplit = false;
      isDraggingModalSplit = false;
    });

    window.addEventListener('touchend', () => {
      isDraggingSplit = false;
      isDraggingModalSplit = false;
    });

    // ========================================================================
    // MODOS DE VISUALIZAÇÃO DO ESTÁGIO
    // ========================================================================
    if (btnModeSplit) {
      btnModeSplit.addEventListener('click', () => {
        btnModeSplit.classList.add('active');
        btnModeSide.classList.remove('active');
        btnModeAdapted.classList.remove('active');
        splitViewport.style.display = 'flex';
        sideViewport.style.display = 'none';
        splitOverlay.style.display = 'flex';
        splitOverlay.style.width = '100%';
        splitOverlay.style.clipPath = 'inset(0 50% 0 0)';
        splitHandle.style.display = adapter.isLoaded ? 'block' : 'none';
        splitHandle.style.left = '50%';
      });
    }

    if (btnModeSide) {
      btnModeSide.addEventListener('click', () => {
        btnModeSide.classList.add('active');
        btnModeSplit.classList.remove('active');
        btnModeAdapted.classList.remove('active');
        splitViewport.style.display = 'none';
        sideViewport.style.display = 'grid';
      });
    }

    if (btnModeAdapted) {
      btnModeAdapted.addEventListener('click', () => {
        btnModeAdapted.classList.add('active');
        btnModeSplit.classList.remove('active');
        btnModeSide.classList.remove('active');
        splitViewport.style.display = 'flex';
        sideViewport.style.display = 'none';
        splitOverlay.style.display = 'none';
        splitHandle.style.display = 'none';
      });
    }

    // ========================================================================
    // PRESETS ACESSÍVEIS (1 CLIQUE)
    // ========================================================================
    presetButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const presetKey = btn.getAttribute('data-preset');
        if (!adapter.isLoaded) {
          adapter.setPreset(presetKey);
          syncSlidersWithAdapter();
          updateActivePresetBtn(presetKey);
          if (audioDescriber) {
            audioDescriber.updateChart(currentChartName || 'salesBar', {
              preset: presetKey,
              presetInfo: adapter.presets[presetKey] || null,
              originalCanvas: adapter.originalCanvas,
              adaptedCanvas: adapter.adaptedCanvas
            });
          }
          showToast(`Preset selecionado: ${adapter.presets[presetKey].label}. Importe uma imagem para aplicar!`, 'info');
          return;
        }
        runAdaptation(presetKey);
        showToast(`Preset aplicado: ${adapter.presets[presetKey].label}`, 'success');
      });
    });

    // ========================================================================
    // SLIDERS DE AJUSTE FINO (EVENTOS 'INPUT')
    // ========================================================================
    if (sliderContrast) {
      sliderContrast.addEventListener('input', () => {
        labelValContrast.textContent = (sliderContrast.value >= 0 ? '+' : '') + sliderContrast.value + '%';
        runAdaptation();
      });
    }

    if (sliderBrightness) {
      sliderBrightness.addEventListener('input', () => {
        labelValBrightness.textContent = (sliderBrightness.value >= 0 ? '+' : '') + sliderBrightness.value + '%';
        runAdaptation();
      });
    }

    if (sliderSharpness) {
      sliderSharpness.addEventListener('input', () => {
        labelValSharpness.textContent = sliderSharpness.value + '%';
        runAdaptation();
      });
    }

    if (sliderSaturation) {
      sliderSaturation.addEventListener('input', () => {
        labelValSaturation.textContent = sliderSaturation.value + '%';
        runAdaptation();
      });
    }

    if (checkBgClean) {
      checkBgClean.addEventListener('change', () => {
        runAdaptation();
      });
    }

    if (btnResetSliders) {
      btnResetSliders.addEventListener('click', () => {
        adapter.setPreset(adapter.currentSettings.preset || 'auto');
        syncSlidersWithAdapter();
        runAdaptation();
        showToast('Sliders restaurados aos padrões do preset.', 'info');
      });
    }

    // ========================================================================
    // DOWNLOAD DIRETO DO PNG ADAPTADO
    // ========================================================================
    if (btnDownloadAdapted) {
      btnDownloadAdapted.addEventListener('click', () => {
        if (!currentResult || !currentResult.adaptedDataUrl) {
          showToast('Nenhum gráfico adaptado para download.', 'info');
          return;
        }
        gallery.downloadImage(currentResult.adaptedDataUrl, `grafico-adaptado-${Date.now()}.png`);
        showToast('Download do gráfico adaptado concluído!', 'success');
      });
    }

    // ========================================================================
    // FLUXO DE SALVAMENTO NO REPOSITÓRIO / GALERIA
    // ========================================================================
    if (btnSaveToGallery) {
      btnSaveToGallery.addEventListener('click', () => {
        if (!currentResult || !currentResult.adaptedDataUrl) {
          showToast('Carregue ou adapte um gráfico antes de salvar.', 'info');
          return;
        }

        const nowStr = new Date().toLocaleDateString('pt-BR');
        const modeLabel = adapter.presets[adapter.currentSettings.preset]
          ? adapter.presets[adapter.currentSettings.preset].label
          : 'Otimização Acessível';

        inputSaveTitle.value = `Gráfico Adaptado - ${modeLabel} (${nowStr})`;
        modalSaveThumb.src = currentResult.adaptedDataUrl;
        modalSaveMode.textContent = modeLabel;
        modalSaveContrast.textContent = currentResult.stats.contrastGain;
        modalSaveWcag.textContent = currentResult.stats.readabilityScore;

        modalSaveChart.classList.add('active');
        inputSaveTitle.focus();
      });
    }

    function closeSaveModal() {
      if (modalSaveChart) modalSaveChart.classList.remove('active');
    }

    if (btnCloseSaveModal) btnCloseSaveModal.addEventListener('click', closeSaveModal);
    if (btnCancelSave) btnCancelSave.addEventListener('click', closeSaveModal);

    if (btnConfirmSave) {
      btnConfirmSave.addEventListener('click', async () => {
        if (!currentResult) return;

        const title = inputSaveTitle.value.trim() || 'Gráfico Adaptado';
        const presetKey = adapter.currentSettings.preset || 'auto';
        const presetObj = adapter.presets[presetKey];

        const itemToSave = {
          title: title,
          adaptationType: presetKey,
          adaptationLabel: presetObj ? presetObj.label : 'Personalizado',
          originalDataUrl: currentResult.originalDataUrl,
          adaptedDataUrl: currentResult.adaptedDataUrl,
          stats: currentResult.stats,
          settings: { ...adapter.currentSettings },
          dimensions: { width: currentResult.width, height: currentResult.height }
        };

        try {
          await gallery.saveChart(itemToSave);
          closeSaveModal();
          updateGalleryBadge();
          showToast('Gráfico salvo na Galeria com sucesso!', 'success');
        } catch (err) {
          console.error(err);
          showToast('Erro ao salvar no repositório.', 'info');
        }
      });
    }

    // ========================================================================
    // GERENCIAMENTO DA GALERIA (RENDERIZAÇÃO, FILTROS, BUSCA, AÇÕES)
    // ========================================================================
    async function updateGalleryBadge() {
      try {
        const charts = await gallery.getAllCharts();
        if (galleryCounterBadge) {
          galleryCounterBadge.textContent = charts.length;
        }
      } catch (e) {
        console.warn(e);
      }
    }

    async function renderGallery() {
      if (!galleryCardsGrid) return;

      const allCharts = await gallery.getAllCharts();
      updateGalleryBadge();

      // Aplica Filtro de Categoria e Busca Textual
      const filtered = allCharts.filter(item => {
        const matchesCategory = (activeCategoryFilter === 'all') || (item.adaptationType === activeCategoryFilter);
        const matchesSearch = !searchQuery ||
          item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (item.adaptationLabel && item.adaptationLabel.toLowerCase().includes(searchQuery.toLowerCase()));
        return matchesCategory && matchesSearch;
      });

      if (filtered.length === 0) {
        galleryCardsGrid.innerHTML = '';
        galleryCardsGrid.style.display = 'none';
        galleryEmptyState.style.display = 'flex';
        return;
      }

      galleryCardsGrid.style.display = 'grid';
      galleryEmptyState.style.display = 'none';
      galleryCardsGrid.innerHTML = '';

      filtered.forEach(item => {
        const card = document.createElement('div');
        card.className = 'gallery-card';
        card.setAttribute('role', 'listitem');

        const dateStr = new Date(item.createdAt).toLocaleDateString('pt-BR', {
          day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'
        });

        card.innerHTML = `
          <div class="card-thumb-wrapper">
            <img src="${item.adaptedDataUrl}" alt="${item.title}" class="card-thumb-img">
            <span class="card-badge-mode">${item.adaptationLabel || 'Adaptado'}</span>
          </div>
          <div class="card-body">
            <div class="card-header-meta">
              <h4 class="card-title">${item.title}</h4>
            </div>
            <span class="card-date">${dateStr}</span>
            <div class="card-stats-row">
              <span class="stat-chip stat-positive">${item.stats.contrastGain || '+30%'} Contraste</span>
              <span class="stat-chip">${item.stats.readabilityScore || 'WCAG AAA'}</span>
              <span class="stat-chip">${item.dimensions.width}×${item.dimensions.height}px</span>
            </div>
            <div class="card-actions-bar">
              <button type="button" class="btn-card-primary btn-action-view" data-id="${item.id}" title="Comparar e Visualizar em Alta Resolução">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                <span>Visualizar</span>
              </button>
              <button type="button" class="btn-card-icon btn-action-edit" data-id="${item.id}" title="Reabrir no Adaptador Interativo">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>
              </button>
              <button type="button" class="btn-card-icon btn-action-download" data-id="${item.id}" title="Baixar Imagem PNG">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
              </button>
              <button type="button" class="btn-card-icon btn-card-delete btn-action-delete" data-id="${item.id}" title="Excluir Gráfico">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
              </button>
            </div>
          </div>
        `;

        // Eventos dos botões do card
        const btnView = card.querySelector('.btn-action-view');
        btnView.addEventListener('click', () => openPreviewModal(item));

        const btnEdit = card.querySelector('.btn-action-edit');
        btnEdit.addEventListener('click', () => {
          loadChartImage(item.originalDataUrl || item.adaptedDataUrl, item.adaptationType || 'auto', 'Gráfico reaberto no Adaptador!');
          switchTab('workbench');
        });

        const btnDownload = card.querySelector('.btn-action-download');
        btnDownload.addEventListener('click', () => {
          gallery.downloadImage(item.adaptedDataUrl, `${item.title.replace(/[^a-zA-Z0-9_-]/g, '_')}.png`);
          showToast('Download iniciado!', 'success');
        });

        const btnDelete = card.querySelector('.btn-action-delete');
        btnDelete.addEventListener('click', async () => {
          if (confirm(`Deseja remover "${item.title}" da galeria?`)) {
            await gallery.deleteChart(item.id);
            renderGallery();
            showToast('Gráfico removido da galeria.', 'info');
          }
        });

        galleryCardsGrid.appendChild(card);
      });
    }

    // Filtros de Categoria
    filterChips.forEach(chip => {
      chip.addEventListener('click', () => {
        filterChips.forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        activeCategoryFilter = chip.getAttribute('data-filter') || 'all';
        renderGallery();
      });
    });

    // Busca textual na Galeria
    if (gallerySearchInput) {
      gallerySearchInput.addEventListener('input', (e) => {
        searchQuery = e.target.value.trim();
        renderGallery();
      });
    }

    // Limpar Todo o Repositório
    if (btnGalleryClearAll) {
      btnGalleryClearAll.addEventListener('click', async () => {
        if (confirm('Tem certeza de que deseja limpar todos os gráficos salvos na galeria? Esta ação não pode ser desfeita.')) {
          await gallery.clearAll();
          renderGallery();
          showToast('Galeria de gráficos limpa.', 'info');
        }
      });
    }

    // ========================================================================
    // MODAL DE VISUALIZAÇÃO E COMPARAÇÃO EM ALTA RESOLUÇÃO
    // ========================================================================
    function openPreviewModal(item) {
      previewModalChartItem = item;
      modalPreviewTitle.textContent = item.title;
      modalPreviewBadge.textContent = item.adaptationLabel || 'Adaptado';
      modalPreviewDate.textContent = new Date(item.createdAt).toLocaleDateString('pt-BR');

      modalPreviewImgAdapted.src = item.adaptedDataUrl;
      modalPreviewImgOriginal.src = item.originalDataUrl || item.adaptedDataUrl;

      modalSplitOverlay.style.width = '100%';
      modalSplitOverlay.style.clipPath = 'inset(0 50% 0 0)';
      modalSplitHandle.style.left = '50%';

      modalPreviewChart.classList.add('active');
    }

    function closePreviewModal() {
      if (audioDescriber) audioDescriber.speech.stop();
      modalPreviewChart.classList.remove('active');
      previewModalChartItem = null;
    }

    if (btnClosePreviewModal) btnClosePreviewModal.addEventListener('click', closePreviewModal);

    if (btnModalReopenWorkbench) {
      btnModalReopenWorkbench.addEventListener('click', () => {
        if (previewModalChartItem) {
          loadChartImage(
            previewModalChartItem.originalDataUrl || previewModalChartItem.adaptedDataUrl,
            previewModalChartItem.adaptationType || 'auto',
            'Gráfico carregado no Adaptador!'
          );
          closePreviewModal();
          switchTab('workbench');
        }
      });
    }

    if (btnModalDownloadPng) {
      btnModalDownloadPng.addEventListener('click', () => {
        if (previewModalChartItem) {
          gallery.downloadImage(
            previewModalChartItem.adaptedDataUrl,
            `${previewModalChartItem.title.replace(/[^a-zA-Z0-9_-]/g, '_')}.png`
          );
          showToast('Download da imagem PNG iniciado!', 'success');
        }
      });
    }

    // Fechar modais ao clicar no backdrop ou ESC
    [modalSaveChart, modalPreviewChart, modalCameraCapture].forEach(modal => {
      if (modal) {
        modal.addEventListener('click', (e) => {
          if (e.target === modal) {
            if (modal === modalCameraCapture) {
              closeCameraModal();
            } else {
              modal.classList.remove('active');
            }
          }
        });
      }
    });

    /**
     * Semeia amostras padrão na primeira utilização para uma experiência rica imediata
     */
    async function seedDefaultSamples() {
      const sampleBarOriginal = adapter.generateSampleBarChart();
      await adapter.loadImage(sampleBarOriginal);
      adapter.setPreset('deuteranopia');
      const barResult = adapter.process();

      const samplePieOriginal = adapter.generateSamplePieChart();
      await adapter.loadImage(samplePieOriginal);
      adapter.setPreset('protanopia');
      const pieResult = adapter.process();

      const sampleLineOriginal = adapter.generateSampleLineChart();
      await adapter.loadImage(sampleLineOriginal);
      adapter.setPreset('auto');
      const lineResult = adapter.process();

      const defaultItems = [
        {
          title: 'Desempenho de Vendas Q4 - Deuteranopia',
          adaptationType: 'deuteranopia',
          adaptationLabel: 'Acessível para Deuteranopia',
          originalDataUrl: sampleBarOriginal,
          adaptedDataUrl: barResult.adaptedDataUrl,
          stats: barResult.stats,
          settings: { ...adapter.presets.deuteranopia },
          dimensions: { width: barResult.width, height: barResult.height },
          createdAt: Date.now() - 3600000 * 24
        },
        {
          title: 'Market Share Regional - Protanopia',
          adaptationType: 'protanopia',
          adaptationLabel: 'Acessível para Protanopia',
          originalDataUrl: samplePieOriginal,
          adaptedDataUrl: pieResult.adaptedDataUrl,
          stats: pieResult.stats,
          settings: { ...adapter.presets.protanopia },
          dimensions: { width: pieResult.width, height: pieResult.height },
          createdAt: Date.now() - 3600000 * 12
        },
        {
          title: 'Evolução Mensal de Satisfação - Auto Inteligente',
          adaptationType: 'auto',
          adaptationLabel: 'Otimização Automática Inteligente',
          originalDataUrl: sampleLineOriginal,
          adaptedDataUrl: lineResult.adaptedDataUrl,
          stats: lineResult.stats,
          settings: { ...adapter.presets.auto },
          dimensions: { width: lineResult.width, height: lineResult.height },
          createdAt: Date.now() - 3600000 * 2
        }
      ];

      for (const item of defaultItems) {
        await gallery.saveChart(item);
      }
      updateGalleryBadge();
    }

    /**
     * Chamado ao entrar na tela de adaptação
     */
    function onOpenScreen() {
      if (!adapter.isLoaded) {
        if (stageEmptyPlaceholder) stageEmptyPlaceholder.style.display = 'flex';
        if (imgAdaptedPreview) imgAdaptedPreview.style.display = 'none';
        if (imgOriginalPreview) imgOriginalPreview.style.display = 'none';
        if (splitHandle) splitHandle.style.display = 'none';
        if (audioDescriber && !audioDescriber.currentAnalysis) {
          const activePreset = adapter.currentSettings.preset || 'auto';
          audioDescriber.updateChart('salesBar', {
            preset: activePreset,
            presetInfo: adapter.presets[activePreset] || null,
            originalCanvas: adapter.originalCanvas,
            adaptedCanvas: adapter.adaptedCanvas
          });
        }
      } else {
        if (stageEmptyPlaceholder) stageEmptyPlaceholder.style.display = 'none';
        if (imgAdaptedPreview) imgAdaptedPreview.style.display = 'block';
        if (imgOriginalPreview) imgOriginalPreview.style.display = 'block';
        if (splitHandle && btnModeSplit && btnModeSplit.classList.contains('active')) {
          splitHandle.style.display = 'block';
        }
      }
      updateGalleryBadge();
    }

    // Inicialização da galeria com semente se vazia
    gallery.getAllCharts().then(charts => {
      if (charts.length === 0) {
        seedDefaultSamples();
      } else {
        updateGalleryBadge();
      }
    });

    return {
      onOpenScreen,
      runAdaptation,
      renderGallery,
      startCameraStream,
      closeCameraModal,
      stopAudio: () => { if (audioDescriber) audioDescriber.speech.stop(); }
    };
  }

  // Inicializa o módulo de adaptação de gráficos
  window.chartAdaptationModule = initChartAdaptationModule();

  // Tecla ESC para voltar à tela anterior ou fechar modais
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      const activeModal = document.querySelector('.modal-backdrop.active');
      if (activeModal) {
        if (activeModal.id === 'modal-camera-capture' && window.chartAdaptationModule && window.chartAdaptationModule.closeCameraModal) {
          window.chartAdaptationModule.closeCameraModal();
        } else {
          activeModal.classList.remove('active');
        }
        return;
      }

      if (state.currentScreen === 'screen-test') {
        navigateTo('screen-types');
      } else if (state.currentScreen !== 'screen-home') {
        navigateTo('screen-home');
      }
    }
  });

  // Inicialização forçada na tela home
  navigateTo('screen-home');
});

