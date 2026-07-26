let cliques = 0;
let intervaloRisada = null;
let mouseTravado = false;
let animandoBoca = false;
let frameAtual = 1;

const limao = document.getElementById('limao');
const cursorFalso = document.getElementById('cursor-falso');
const somSusto = document.getElementById('som-susto');

// Pre-carregamento das 17 imagens
for (let i = 1; i <= 17; i++) {
  const img = new Image();
  img.src = `assets/frame_${i}.png`;
}

// Atualiza a imagem exibida
function setFrame(numero) {
  frameAtual = numero;
  limao.src = `assets/frame_${numero}.png`;

  // Fundo vermelho gradual a partir do frame 7 ate o 13
  if (frameAtual >= 7 && frameAtual <= 13) {
    let progresso = (frameAtual - 7) / (13 - 7);
    let luminosidade = 10 - (progresso * 6); 
    document.body.style.backgroundColor = `hsl(0, 80%, ${luminosidade}%)`;
  }

  // Ativa a trava visual do mouse APENAS no frame 13
  if (frameAtual >= 13 && !mouseTravado) {
    mouseTravado = true;
    document.body.classList.add('travar-mouse');
    retornarCursorParaOCentro();
  }
}

// Funcao para rodar uma sequencia automatica de frames
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

// Posiciona o cursor no centro do limao
function retornarCursorParaOCentro() {
  if (!mouseTravado) return;
  const rect = limao.getBoundingClientRect();
  const centroX = rect.left + (rect.width / 2);
  const centroY = rect.top + (rect.height / 2);

  cursorFalso.style.left = `${centroX}px`;
  cursorFalso.style.top = `${centroY}px`;
}

// Permite mover o mouse mas puxa o cursor de volta (efeito ima)
document.addEventListener('mousemove', (e) => {
  if (!mouseTravado) return;

  cursorFalso.style.left = `${e.clientX}px`;
  cursorFalso.style.top = `${e.clientY}px`;

  setTimeout(() => {
    retornarCursorParaOCentro();
  }, 100);
});

// Evento principal do clique
limao.addEventListener('click', () => {
  // Impede cliques durante a animacao automatica ou apos o susto
  if (animandoBoca || cliques >= 20) return;

  cliques++;

  // ESTAGIO 1: Frame 2 -> Avanca automaticamente ate o 3
  if (cliques === 1) {
    setFrame(2);
    rodarSequenciaAutomatica([2, 3], 120);
  }
  // ESTAGIO 2: Frame 4 -> Avanca automaticamente pro 5
  else if (cliques === 2) {
    setFrame(4);
    rodarSequenciaAutomatica([4, 5], 120);
  }
  // ESTAGIO 3: Frame 6 (boca abre) -> Avanca AUTOMATICAMENTE para o 7 (boca fecha + fundo vermelho inicia)
  else if (cliques === 3) {
    setFrame(6);
    rodarSequenciaAutomatica([6, 7], 120);
  }
  // ESTAGIO 4: Frame 8 -> Avanca automaticamente ate o 13 + Tremor + Trava no Mouse
  else if (cliques === 4) {
    limao.classList.add('chacoalhar');
    rodarSequenciaAutomatica([8, 9, 10, 11, 12, 13], 100);
  }
  // ESTAGIO 5: O SUSTO FINAL
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

  if (somSusto) somSusto.play();

  // Loop da Risada Maligna (frames 14 a 17)
  const framesRisada = [14, 15, 16, 17];
  let indice = 0;

  intervaloRisada = setInterval(() => {
    setFrame(framesRisada[indice]);
    indice = (indice + 1) % framesRisada.length;
  }, 80);
}