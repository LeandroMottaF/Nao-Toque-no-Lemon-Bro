let cliques = 0;
let intervaloRisada = null;
let mouseTravado = false;
let animandoBoca = false;
let frameAtual = 1;
let risadaIniciada = false;
let audiosLiberados = false;

// Detecta se o dispositivo e celular ou possui tela touch
const eDispositivoTouch = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0) || (window.matchMedia("(pointer: coarse)").matches);

const limao = document.getElementById('limao');
const cursorFalso = document.getElementById('cursor-falso');

// Se for celular/touch, remove o cursor falso do HTML de forma definitiva
if (eDispositivoTouch && cursorFalso) {
  cursorFalso.remove();
}

// Criacao dos objetos de audio
const somBoca = new Audio('assets/som-boca.mp3');
const somRisada = new Audio('assets/som-risada.mp3');
const somJumpscare = new Audio('assets/som-jumpscare.mp3');

// Configura os audios que precisam rodar em loop
somRisada.loop = true;
somJumpscare.loop = true;

// Funcao para destravar o contexto de audio do navegador sem interferir no primeiro som
function liberarAudios() {
  if (audiosLiberados) return;

  // Destrava a politica de autoplay carregando os audios em segundo plano
  [somBoca, somRisada, somJumpscare].forEach(audio => {
    audio.load();
  });

  audiosLiberados = true;
}

// Pre-carregamento das 17 imagens
for (let i = 1; i <= 17; i++) {
  const img = new Image();
  img.src = `assets/frame_${i}.png`;
}

// Funcao auxiliar para tocar o som de abrir a boca sem atrasos
function tocarSomBoca() {
  somBoca.currentTime = 0;
  somBoca.play().catch(e => {
    console.log("Aguardando interacao para reproduzir audio:", e);
  });
}

// Atualiza a imagem exibida na tela e controla eventos por frame
function setFrame(numero) {
  frameAtual = numero;
  limao.src = `assets/frame_${numero}.png`;

  // Dispara a risada maligna em loop assim que atinge o frame 8
  if (frameAtual >= 8 && !risadaIniciada) {
    risadaIniciada = true;
    somRisada.play();
  }

  // Fundo vermelho gradual a partir do frame 7 ate o 13
  if (frameAtual >= 7 && frameAtual <= 13) {
    let progresso = (frameAtual - 7) / (13 - 7);
    let luminosidade = 10 - (progresso * 6); 
    document.body.style.backgroundColor = `hsl(0, 80%, ${luminosidade}%)`;
  }

  // Ativa a trava visual do mouse no frame 13 APENAS SE NAO FOR TOUCH
  if (frameAtual >= 13 && !mouseTravado && !eDispositivoTouch) {
    mouseTravado = true;
    document.body.classList.add('travar-mouse');
    retornarCursorParaOCentro();
  }
}

// Funcao para rodar uma sequencia automatica de frames (boca abrindo e fechando)
function rodarSequenciaAutomatica(framesArray, velocidadeMs, callbackFinal) {
  animandoBoca = true;
  let idx = 0;

  let timer = setInterval(() => {
    idx++;
    if (idx < framesArray.length) {
      setFrame(framesArray[idx]);
    } else {
      clearInterval(timer);
      animandoBoca = false;
      if (callbackFinal) callbackFinal();
    }
  }, velocidadeMs);
}

// Posiciona o cursor no centro do limao (Apenas Desktop)
function retornarCursorParaOCentro() {
  if (!mouseTravado || eDispositivoTouch || !cursorFalso || !document.body.contains(cursorFalso)) return;
  const rect = limao.getBoundingClientRect();
  const centroX = rect.left + (rect.width / 2);
  const centroY = rect.top + (rect.height / 2);

  cursorFalso.style.left = `${centroX}px`;
  cursorFalso.style.top = `${centroY}px`;
}

// Acompanha o mouse real o tempo todo (Apenas Desktop)
document.addEventListener('mousemove', (e) => {
  if (eDispositivoTouch || !cursorFalso || !document.body.contains(cursorFalso)) return;

  cursorFalso.style.left = `${e.clientX}px`;
  cursorFalso.style.top = `${e.clientY}px`;

  if (mouseTravado) {
    setTimeout(() => {
      retornarCursorParaOCentro();
    }, 15);
  }
});

// Evento principal do clique no limao
limao.addEventListener('click', () => {
  liberarAudios();

  if (animandoBoca || cliques >= 20) return;

  cliques++;

  // ESTAGIO 1: Frame 2 (Abre boca + som) -> Avanca automaticamente ate o 3
  if (cliques === 1) {
    tocarSomBoca();
    setFrame(2);
    rodarSequenciaAutomatica([2, 3], 120);
  }
  // ESTAGIO 2: Frame 4 (Abre boca + som) -> Avanca automaticamente pro 5
  else if (cliques === 2) {
    tocarSomBoca();
    setFrame(4);
    rodarSequenciaAutomatica([4, 5], 120);
  }
  // ESTAGIO 3: Frame 6 (Abre boca + som) -> Avanca pro 7 (boca fecha + fundo vermelho)
  else if (cliques === 3) {
    tocarSomBoca();
    setFrame(6);
    rodarSequenciaAutomatica([6, 7], 120);
  }
  // ESTAGIO 4: Frame 8 -> Avanca ate o 13 + Tremor + Risada no frame 8 + Trava no Mouse
  else if (cliques === 4) {
    limao.classList.add('chacoalhar');
    rodarSequenciaAutomatica([8, 9, 10, 11, 12, 13], 100);
  }
  // ESTAGIO 5: O SUSTO FINAL (Jumpscare)
  else if (cliques >= 5) {
    dispararSusto();
  }
});

function dispararSusto() {
  mouseTravado = false;
  document.body.classList.remove('travar-mouse');

  limao.classList.remove('chacoalhar');
  limao.classList.add('susto-limao');
  document.body.classList.add('susto-bg');

  // Para a risada
  somRisada.pause();
  somRisada.currentTime = 0;

  // Toca apenas o som do jumpscare em loop
  somJumpscare.currentTime = 0;
  somJumpscare.play();

  // Loop visual da Risada Maligna no final (frames 14 a 17)
  const framesRisada = [14, 15, 16, 17];
  let indice = 0;

  intervaloRisada = setInterval(() => {
    setFrame(framesRisada[indice]);
    indice = (indice + 1) % framesRisada.length;
  }, 80);
}