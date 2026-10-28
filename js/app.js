/**
 * Lógica principal de la aplicación Aves de Río Negro WebAR
 * ESRN Rural Virtual
 */

document.addEventListener("DOMContentLoaded", () => {
  initApp();
});

let currentAudio = null;

function initApp() {
  renderGallery();
  setupEventListeners();
}

function setupEventListeners() {
  document.getElementById("btn-start-ar").addEventListener("click", () => {
    switchView("ar-view");
    startARScanner();
  });

  document.getElementById("btn-gallery").addEventListener("click", () => {
    switchView("gallery-view");
  });

  document.getElementById("btn-back-home").addEventListener("click", () => {
    stopARScanner();
    switchView("home-view");
  });

  document.getElementById("btn-back-home-2").addEventListener("click", () => {
    switchView("home-view");
  });

  document.getElementById("search-input").addEventListener("input", (e) => {
    const term = e.target.value.toLowerCase();
    filterGallery(term);
  });

  document.getElementById("close-modal").addEventListener("click", closeModal);
}

function switchView(viewId) {
  document.querySelectorAll(".view").forEach(v => v.classList.remove("active"));
  document.getElementById(viewId).classList.add("active");
  
  if (viewId !== "ar-view") {
    stopARScanner();
    stopAudio();
  }
}

function renderGallery(filter = "") {
  const container = document.getElementById("birds-container");
  container.innerHTML = "";

  const filtered = avesData.filter(bird => 
    bird.nombreComun.toLowerCase().includes(filter) || 
    bird.nombreCientifico.toLowerCase().includes(filter)
  );

  filtered.forEach(bird => {
    const card = document.createElement("div");
    card.className = "bird-card";
    card.innerHTML = `
      <img src="${bird.imagenUrl}" alt="${bird.nombreComun}" loading="lazy">
      <div class="bird-card-content">
        <div>
          <h3>${bird.nombreComun}</h3>
          <i>${bird.nombreCientifico}</i>
          <p style="font-size: 0.85rem; color: #555;">${bird.tamano} | ${bird.habitat.substring(0, 45)}...</p>
        </div>
        <button class="btn-secondary" onclick="openBirdModal('${bird.id}')" style="margin-top: 0.8rem; width: 100%;">Ver Ficha y Canto</button>
      </div>
    `;
    container.appendChild(card);
  });
}

function filterGallery(term) {
  renderGallery(term);
}

window.openBirdModal = function(birdId) {
  const bird = avesData.find(b => b.id === birdId);
  if (!bird) return;

  const modalBody = document.getElementById("modal-body-content");
  modalBody.innerHTML = `
    <img src="${bird.imagenUrl}" alt="${bird.nombreComun}">
    <h2 style="color: #2c5e3b; margin-bottom: 0.2rem;">${bird.nombreComun}</h2>
    <i style="display:block; margin-bottom: 1rem; color: #555;">${bird.nombreCientifico}</i>
    
    <div class="info-grid">
      <div><span>Tamaño:</span> ${bird.tamano}</div>
      <div><span>Hábitat:</span> ${bird.habitat}</div>
      <div><span>Alimentación:</span> ${bird.alimentacion}</div>
      <div><span>Distribución:</span> ${bird.distribucionRioNegro}</div>
    </div>

    <p style="margin-bottom: 0.8rem; font-size: 0.95rem;"><strong>Descripción:</strong> ${bird.descripcionFisica}</p>
    <p style="margin-bottom: 0.8rem; font-size: 0.95rem;"><strong>Comportamiento:</strong> ${bird.comportamiento}</p>
    <p style="margin-bottom: 0.8rem; font-size: 0.95rem;"><strong>Dato curioso:</strong> ${bird.datoCurioso}</p>

    <div class="audio-player-box">
      <p style="font-size: 0.9rem; margin-bottom: 0.5rem; font-weight: bold;">Canto / Vocalización (Local):</p>
      <button class="btn-primary" onclick="playBirdAudio('${bird.audioUrl}')">Reproducir Canto</button>
      <button class="btn-secondary" onclick="stopAudio()">Detener</button>
    </div>

    <div style="margin-top: 1rem; font-size: 0.75rem; color: #777; text-align: center;">
      Fuente: ${bird.fuente} | Autor: ${bird.autor} (${bird.licencia})
    </div>
  `;

  document.getElementById("bird-modal").classList.add("active");
};

function closeModal() {
  document.getElementById("bird-modal").classList.remove("active");
  stopAudio();
}

window.playBirdAudio = function(url) {
  stopAudio();
  currentAudio = new Audio(url);
  currentAudio.play().catch(err => {
    alert("El navegador requiere interacción táctil para reproducir el audio.");
  });
};

window.stopAudio = function() {
  if (currentAudio) {
    currentAudio.pause();
    currentAudio = null;
  }
};

// Control limpio del sistema MindAR estático
function startARScanner() {
  const sceneEl = document.getElementById("ar-scene");
  if (sceneEl && sceneEl.systems["mindar-image-system"]) {
    sceneEl.systems["mindar-image-system"].start();
  } else if (sceneEl) {
    // Si la escena recién carga, le damos un breve delay para iniciar el sistema AR
    setTimeout(() => {
      if (sceneEl.systems["mindar-image-system"]) {
        sceneEl.systems["mindar-image-system"].start();
      }
    }, 500);
  }
}

function stopARScanner() {
  const sceneEl = document.getElementById("ar-scene");
  if (sceneEl && sceneEl.systems["mindar-image-system"]) {
    sceneEl.systems["mindar-image-system"].stop();
  }
}