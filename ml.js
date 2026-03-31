const URL = "./";
let model, webcam, maxPredictions;

async function initModel() {
    try {
        const modelURL = URL + "model.json";
        const metadataURL = URL + "metadata.json";
        model = await tmImage.load(modelURL, metadataURL);
        maxPredictions = model.getTotalClasses();
        console.log("Model loaded successfully. Classes: ", maxPredictions);

        const listDiv = document.getElementById("eval-classes-list");
        if(listDiv) {
            listDiv.innerHTML = "";
            model.getClassLabels().forEach(label => {
                const row = document.createElement("div");
                row.className = "class-upload-row";
                row.innerHTML = `
                    <span class="class-name">${label}</span>
                    <label class="btn primary small" style="margin: 0; cursor: pointer;">
                        Adicionar Imagens
                        <input type="file" accept="image/*" multiple style="display:none" data-label="${label}">
                    </label>
                    <span class="class-count" id="count-${label}">0 img</span>
                `;
                listDiv.appendChild(row);
            });
            
            // Delegate event listener for uploads
            listDiv.addEventListener("change", (e) => {
                if (e.target && e.target.tagName === 'INPUT' && e.target.type === 'file') {
                    const label = e.target.getAttribute("data-label");
                    const newFiles = Array.from(e.target.files).filter(f => f.type.startsWith('image/'));
                    newFiles.forEach(f => {
                        evalFiles.push({ file: f, label: label });
                    });
                    updateEvalQueueUI();
                    e.target.value = ""; // Reset input
                }
            });
        }
    } catch (e) {
        console.error("Failed to load TM Image model", e);
        document.getElementById("live-results").innerHTML = "<p style='color:red;'>Erro ao carregar o modelo. Certifique-se de estar usando um servidor local (HTTP).</p>";
    }
}

// Inference (Webcam)
let isWebcamActive = false;
document.getElementById('btn-webcam').addEventListener('click', async () => {
    if(!model) await initModel();
    const btn = document.getElementById('btn-webcam');
    
    if(!isWebcamActive) {
        const flip = true; 
        webcam = new tmImage.Webcam(224, 224, flip);
        await webcam.setup(); 
        await webcam.play();
        window.requestAnimationFrame(loop);

        const webcamContainer = document.getElementById("webcam");
        const placeholder = document.getElementById("placeholder");
        const uploadedImg = document.getElementById("uploaded-img");

        webcamContainer.srcObject = webcam.webcam.srcObject;
        webcamContainer.style.display = "block";
        placeholder.style.display = "none";
        uploadedImg.style.display = "none";

        isWebcamActive = true;
        btn.textContent = "Parar Webcam";
        btn.classList.replace("primary", "secondary");
    } else {
        webcam.stop();
        document.getElementById("webcam").style.display = "none";
        document.getElementById("placeholder").style.display = "block";
        isWebcamActive = false;
        btn.textContent = "Iniciar Webcam";
        btn.classList.replace("secondary", "primary");
    }
});

async function loop() {
    if(!isWebcamActive) return;
    webcam.update(); 
    await predict(webcam.canvas);
    window.requestAnimationFrame(loop);
}

// Inference (Upload File)
document.getElementById("img-upload").addEventListener("change", async (e) => {
    const file = e.target.files[0];
    if(!file) return;

    if(isWebcamActive) {
        document.getElementById('btn-webcam').click();
    }

    if(!model) await initModel();

    const img = document.getElementById("uploaded-img");
    img.src = window.URL.createObjectURL(file);
    img.style.display = "block";
    document.getElementById("placeholder").style.display = "none";

    img.onload = async () => {
        await predict(img);
    }
});

async function predict(imageElement) {
    const prediction = await model.predict(imageElement);
    
    // Sort by probability desc
    prediction.sort((a,b) => b.probability - a.probability);

    const list = document.getElementById("predictions-list");
    list.innerHTML = "";
    
    for (let i = 0; i < maxPredictions; i++) {
        if(i > 4 && prediction[i].probability < 0.05) continue; // Show top results
        const val = (prediction[i].probability * 100).toFixed(1);
        
        list.innerHTML += `
            <div class="prediction-item">
                <div class="pred-header">
                    <span>${prediction[i].className}</span>
                    <span>${val}%</span>
                </div>
                <div class="pred-bar-bg">
                    <div class="pred-bar-fill" style="width: ${val}%;"></div>
                </div>
            </div>
        `;
    }
}

// Evaluation Logic
let evalFiles = [];

function updateEvalQueueUI() {
    const btnStart = document.getElementById("btn-start-eval");
    if(evalFiles.length > 0) {
        document.getElementById("eval-status").innerText = `${evalFiles.length} imagens no total preparadas para a verificação.`;
        btnStart.removeAttribute("disabled");
    } else {
        btnStart.setAttribute("disabled", "true");
        document.getElementById("eval-status").innerText = "";
    }
    
    // reset visual counts
    if (model) {
        model.getClassLabels().forEach(l => {
            const el = document.getElementById(`count-${l}`);
            if (el) el.innerText = "0 img";
        });
    }

    const counts = {};
    evalFiles.forEach(obj => { counts[obj.label] = (counts[obj.label] || 0) + 1; });

    for(const [label, count] of Object.entries(counts)) {
        const el = document.getElementById(`count-${label}`);
        if (el) {
            el.innerText = `${count} img`;
            el.style.color = "var(--primary-color)";
            el.style.fontWeight = "bold";
        }
    }
}

document.getElementById("btn-start-eval").addEventListener("click", async () => {
    if(evalFiles.length === 0) return;
    if(!model) await initModel();

    document.getElementById("eval-status").innerText = "Processando predições... Aguarde (Isso pode levar alguns instantes).";
    const progBox = document.getElementById("eval-progress-container");
    const progBar = document.getElementById("eval-progress-bar");
    progBox.style.display = "block";
    progBar.style.width = "0%";

    const labels = model.getClassLabels();
    let yTrue = [];
    let yPred = [];
    
    for(let i=0; i < evalFiles.length; i++) {
        const item = evalFiles[i];
        let trueLabel = item.label;
        
        const img = new Image();
        img.src = window.URL.createObjectURL(item.file);
        await new Promise(res => img.onload = res);

        let prediction = await model.predict(img);
        prediction.sort((a,b) => b.probability - a.probability);
        let predictedLabel = prediction[0].className;

        yTrue.push(trueLabel);
        yPred.push(predictedLabel);

        progBar.style.width = `${((i+1)/evalFiles.length)*100}%`;
    }

    document.getElementById("eval-status").innerHTML = "<span style='color: var(--secondary-color);'>Avaliação Concluída! Veja as métricas na matriz abaixo.</span>";
    
    window.computeAndRenderMetrics(yTrue, yPred, labels);
    document.getElementById("metrics-dashboard").style.display = "block";
});

// Initialize model on script load to populate selects
initModel();
