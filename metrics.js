window.computeAndRenderMetrics = function(yTrue, yPred, labels) {
    let accuracy = 0;
    let correct = 0;
    
    const numClasses = labels.length;
    let matrix = Array(numClasses).fill(0).map(() => Array(numClasses).fill(0));
    
    for(let i=0; i<yTrue.length; i++){
        if(yTrue[i] === yPred[i]) correct++;
        
        const trueIdx = labels.indexOf(yTrue[i]);
        const predIdx = labels.indexOf(yPred[i]);
        if(trueIdx >= 0 && predIdx >= 0) {
            matrix[trueIdx][predIdx]++;
        }
    }

    accuracy = yTrue.length > 0 ? (correct / yTrue.length) : 0;
    
    let macroPrecision = 0;
    let macroRecall = 0;
    let macroF1 = 0;

    for(let i=0; i<numClasses; i++) {
        let tp = matrix[i][i];
        let fp = 0;
        let fn = 0;
        
        for(let j=0; j<numClasses; j++){
            if(i !== j) {
                fp += matrix[j][i];
                fn += matrix[i][j];
            }
        }

        let p = (tp + fp) === 0 ? 0 : tp / (tp + fp);
        let r = (tp + fn) === 0 ? 0 : tp / (tp + fn);
        let f1 = (p + r) === 0 ? 0 : 2 * (p * r) / (p + r);

        macroPrecision += p;
        macroRecall += r;
        macroF1 += f1;
    }

    macroPrecision /= numClasses;
    macroRecall /= numClasses;
    macroF1 /= numClasses;

    document.getElementById("stat-accuracy").innerText = (accuracy * 100).toFixed(1) + "%";
    document.getElementById("stat-precision").innerText = (macroPrecision * 100).toFixed(1) + "%";
    document.getElementById("stat-recall").innerText = (macroRecall * 100).toFixed(1) + "%";
    document.getElementById("stat-f1").innerText = (macroF1 * 100).toFixed(1) + "%";

    drawConfusionMatrix(matrix, labels);
}

function drawConfusionMatrix(matrix, labels) {
    const canvas = document.getElementById("confusion-matrix-canvas");
    const ctx = canvas.getContext("2d");
    
    const cellSize = 50;
    const paddingLeft = 120;
    const paddingTop = 120;
    const paddingRight = 40;
    const paddingBottom = 40;

    canvas.width = paddingLeft + labels.length * cellSize + paddingRight;
    canvas.height = paddingTop + labels.length * cellSize + paddingBottom;

    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.font = "14px Inter, sans-serif";
    ctx.textBaseline = "middle";

    let maxVal = 0;
    for(let i=0; i<labels.length; i++) {
        for(let j=0; j<labels.length; j++) {
            if(matrix[i][j] > maxVal) maxVal = matrix[i][j];
        }
    }

    // Title
    ctx.fillStyle = "#8b949e";
    ctx.fillText("True Labels", paddingLeft - 80, paddingTop - 40);
    ctx.fillText("Predicted ->", paddingLeft, paddingTop - 80);

    for(let i=0; i<labels.length; i++) {
        // True Labels (Y axis)
        ctx.fillStyle = "#fff";
        ctx.textAlign = "right";
        ctx.fillText(labels[i], paddingLeft - 15, paddingTop + i*cellSize + cellSize/2);

        // Pred Labels (X axis) -> rotated
        ctx.save();
        ctx.translate(paddingLeft + i*cellSize + cellSize/2, paddingTop - 15);
        ctx.rotate(-Math.PI/4);
        ctx.textAlign = "left";
        ctx.fillText(labels[i], 0, 0);
        ctx.restore();

        for(let j=0; j<labels.length; j++) {
            const val = matrix[i][j];
            let alpha = maxVal > 0 ? val/maxVal : 0;
            
            if (i === j) {
                // Correct
                ctx.fillStyle = `rgba(35, 134, 54, ${Math.max(0.1, alpha)})`;
            } else {
                // Incorrect
                ctx.fillStyle = `rgba(215, 58, 73, ${Math.max(0.1, alpha)})`;
            }
            if(val === 0) ctx.fillStyle = "#161b22";

            const x = paddingLeft + j*cellSize;
            const y = paddingTop + i*cellSize;

            ctx.fillRect(x, y, cellSize, cellSize);
            ctx.strokeStyle = "#30363d";
            ctx.strokeRect(x, y, cellSize, cellSize);

            if(val > 0) {
                ctx.fillStyle = alpha > 0.4 ? "#fff" : "#8b949e";
                ctx.textAlign = "center";
                ctx.fillText(val.toString(), x + cellSize/2, y + cellSize/2);
            }
        }
    }
}
