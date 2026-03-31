[README.md](https://github.com/user-attachments/files/26364068/README.md)
# ♻️ Teachable Machine - Garbage Classification WebApp

Esta é uma aplicação web interativa e de alto desempenho desenvolvida em **HTML, CSS e Vanilla JavaScript**, que utiliza um modelo pré-treinado do **Teachable Machine (TensorFlow.js)** para a classificação automatizada e avaliação de resíduos (Lixo).

## 🚀 Funcionalidades

1. **Inferência em Tempo Real:**
   - Detecção via **Webcam** diretamente no navegador com rastreamento das 5 classes mais prováveis.
   - Detecção estática através do upload de imagens individuais.
2. **Avaliação Rigorosa em Lote (Rigorous Evaluation):**
   - Importação de pastas inteiras contendo um sub-dataset de validação.
   - Cálculo automático via navegador das métricas essenciais de Machine Learning: **Acurácia**, **Precisão**, **Recall** e **F1-Score** (Macro-Average).
   - Renderização visual dinâmica da **Matriz de Confusão** em HTML5 Canvas.

## 🛠️ Como Executar Localmente

Devido a restrições de **CORS** impostas pelos navegadores sobre a leitura dos arquivos de rede neural locais via protocolo `file://`, você deve hospedar os arquivos usando um servidor HTTP estático.

### Via Visual Studio Code (Recomendado)
1. Abra este diretório no Visual Studio Code.
2. Acesse a aba de *Extensões* e instale o **Live Server**.
3. Abra o arquivo `index.html`.
4. Clique com o botão direito e selecione **"Open with Live Server"**. O navegador se abrirá em `http://127.0.0.1:5500`.

### Via Python
Se você possui o Python instalado, basta abrir o terminal neste diretório e rodar:
```bash
python -m http.server 8000
```
E acessar `http://localhost:8000`.

---

## 📂 Estrutura do Projeto

* `index.html` — Estrutura semântica da aplicação e containers visuais.
* `style.css` — Folha de estilos UI/UX moderna, incluindo animações de estados, Glassmorphism e Dark Theme nativos.
* `main.js` — Orquestração da Interface, como a navegação responsiva entre "Inferência" e "Avaliação".
* `ml.js` — O núcleo de interação com o `@teachablemachine/image` e `@tensorflow/tfjs`, gerencia Webcam e inferência de tensores.
* `metrics.js` — Matemática de Extração de Verdadeiros Postivos/Falsos Positivos e renderização do gráfico de Matriz de Confusão.
* `model.json` / `metadata.json` / `weights.bin` — Camadas da rede Neural Exportadas.

## 📊 Como Avaliar seu Modelo em Lote

Na aba **Avaliação (Lote)**, o sistema exibirá uma lista com **todas as classes** geradas pela inteligência artificial. O processo flui de maneira extremamente visual:

1. Ao lado de cada classe (ex: `plastic`), clique no sub-botão **"Adicionar Imagens"**.
2. Selecione as imagens do seu repositório referentes unicamente a essa classe.
3. O contador da respectiva linha (ex: `0 img` -> `15 img`) será atualizado, confirmando que os tensores entraram na fila de prontidão.
4. Repita o processo injetando arquivos da classe seguinte (ex: `baterry`).
5. Quando finalizar, clique no grande botão **"Iniciar Validação de Todas as Classes"**. O App processará tudo numericamente e desenhará a **Matriz de Confusão**, cruzando os acertos das frentes.

---

## 🧑‍💻 Tecnologias
- [TensorFlow.js](https://www.tensorflow.org/js)
- HTML5 Canvas & Vanilla JS
- MobileNet (Transfer Learning)

--- 
*Projeto focado em sustentabilidade ambiental e exploração exploratória de algoritmos Deep Learning para browsers.*
