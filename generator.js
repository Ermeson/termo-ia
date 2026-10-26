const PURPOSES = [
    { key: 'ideias', label: 'Geração de ideias (brainstorming)', fragment: 'geração de ideias (brainstorming)' },
    { key: 'planejamento', label: 'Planejamento ou estruturação do trabalho', fragment: 'planejamento ou estruturação do trabalho' },
    { key: 'conceitos', label: 'Explicação de conceitos em estudo', fragment: 'explicação de conceitos em estudo' },
    { key: 'fontes', label: 'Busca ou sumarização de fontes', fragment: 'busca ou sumarização de fontes' },
    { key: 'metodos', label: 'Desenho de métodos ou experimentos', fragment: 'desenho de métodos ou experimentos' },
    { key: 'dados', label: 'Análise de dados', fragment: 'análise de dados' },
    { key: 'codigo', label: 'Redação ou depuração de código', fragment: 'redação ou depuração de código' },
    { key: 'imagens', label: 'Criação de imagens, figuras ou tabelas', fragment: 'criação de imagens, figuras ou tabelas' },
    { key: 'redacao', label: 'Redação de texto incluído no trabalho', fragment: 'redação de texto incluído no trabalho' },
    { key: 'reescrita', label: 'Reescrita ou paráfrase de texto próprio', fragment: 'reescrita ou paráfrase de texto próprio' },
    { key: 'feedback', label: 'Feedback sobre o rascunho', fragment: 'obtenção de feedback sobre o rascunho' },
    { key: 'edicao', label: 'Edição para clareza, tom ou fluidez', fragment: 'edição para clareza, tom ou fluidez' },
    { key: 'ortografia', label: 'Correção ortográfica e gramatical', fragment: 'correção ortográfica e gramatical' },
    { key: 'traducao', label: 'Tradução', fragment: 'tradução de texto' },
    { key: 'referencias', label: 'Formatação de referências', fragment: 'formatação de referências' },
];

const TOOLS = [
    'ChatGPT (OpenAI)',
    'Claude (Anthropic)',
    'Gemini (Google)',
    'Microsoft Copilot',
    'GitHub Copilot',
    'DeepL',
    'DALL-E',
    'Paperpal',
    'MathGPT',
    'ResearchRabbit',
];

const OPCAO_A_TEXT = 'Declaramos que os autores NÃO UTILIZARAM qualquer ferramenta de Inteligência Artificial Generativa no desenvolvimento desta pesquisa ou na redação do documento, tendo empregado apenas softwares convencionais de processamento de texto e editores de referências.';

const toolsContainer = document.getElementById('gen-tools');
const addToolBtn = document.getElementById('gen-add-tool');
const outputText = document.getElementById('gen-output-text');
const copyBtn = document.getElementById('gen-copy-btn');
const gateRadios = document.querySelectorAll('input[name="gen-used-ai"]');
const formWrap = document.querySelector('.generator__form');

function buildToolSelectOptions() {
    return ['<option value="">Selecione...</option>']
        .concat(TOOLS.map((t) => `<option value="${t}">${t}</option>`))
        .concat(['<option value="outra">Outra (especificar)</option>'])
        .join('');
}

function buildPurposeList() {
    return PURPOSES.map((p) => `
        <label class="gen-pill">
            <input type="checkbox" data-purpose="${p.key}" />
            ${p.label}
        </label>
    `).join('');
}

function createToolCard() {
    const card = document.createElement('div');
    card.className = 'gen-tool-card';
    card.innerHTML = `
        <div class="gen-tool-card__header">
            <span>Ferramenta</span>
            <button type="button" class="gen-remove-btn" aria-label="Remover ferramenta">&times;</button>
        </div>
        <label class="gen-field">
            <span>Qual ferramenta?</span>
            <select class="gen-tool-select">${buildToolSelectOptions()}</select>
        </label>
        <label class="gen-field gen-field--other" hidden>
            <span>Nome da ferramenta</span>
            <input type="text" class="gen-tool-other" placeholder="Ex.: Elicit" />
        </label>
        <label class="gen-field">
            <span>Versão ou modelo (opcional)</span>
            <input type="text" class="gen-tool-version" placeholder="Ex.: GPT-4o" />
        </label>
        <div class="gen-field">
            <span>Para que foi utilizada?</span>
            <div class="gen-purpose-list">${buildPurposeList()}</div>
        </div>
    `;
    toolsContainer.appendChild(card);
    renumberTools();
    return card;
}

function renumberTools() {
    const cards = toolsContainer.querySelectorAll('.gen-tool-card');
    cards.forEach((card, index) => {
        card.querySelector('.gen-tool-card__header span').textContent = `Ferramenta ${index + 1}`;
    });
}

function joinWithE(items) {
    if (items.length === 0) return '';
    if (items.length === 1) return items[0];
    return `${items.slice(0, -1).join(', ')} e ${items[items.length - 1]}`;
}

function readToolData(card) {
    const select = card.querySelector('.gen-tool-select');
    const otherInput = card.querySelector('.gen-tool-other');
    const versionInput = card.querySelector('.gen-tool-version');
    const name = select.value === 'outra' ? otherInput.value.trim() : select.value;
    const version = versionInput.value.trim();
    const purposeKeys = Array.from(card.querySelectorAll('.gen-purpose-list input:checked')).map((i) => i.dataset.purpose);
    const fragments = PURPOSES.filter((p) => purposeKeys.includes(p.key)).map((p) => p.fragment);
    return { name, version, fragments };
}

function generateOutput() {
    const usedAI = document.querySelector('input[name="gen-used-ai"]:checked').value;

    if (usedAI === 'no') {
        outputText.textContent = OPCAO_A_TEXT;
        return;
    }

    const cards = Array.from(toolsContainer.querySelectorAll('.gen-tool-card'));
    const toolSentences = [];

    cards.forEach((card) => {
        const { name, version, fragments } = readToolData(card);
        if (!name || fragments.length === 0) return;
        const versionPart = version ? `, versão ${version},` : '';
        toolSentences.push(`a ferramenta ${name}${versionPart} para ${joinWithE(fragments)}`);
    });

    if (toolSentences.length === 0) {
        outputText.textContent = 'Selecione ao menos uma ferramenta e uma finalidade de uso para gerar o texto da declaração.';
        return;
    }

    const intro = toolSentences.length === 1
        ? 'Durante a preparação deste trabalho, os autores utilizaram'
        : 'Durante a preparação deste trabalho, os autores utilizaram as seguintes ferramentas de Inteligência Artificial Generativa:';

    const body = `${intro} ${toolSentences.join('; ')}.`;
    const closing = ' Após o uso destas ferramentas, os autores revisaram criticamente, validaram e editaram todo o conteúdo gerado, assumindo integral responsabilidade pela precisão, integridade e originalidade do trabalho final.';

    outputText.textContent = body + closing;
}

toolsContainer.addEventListener('change', (event) => {
    const target = event.target;

    if (target.classList.contains('gen-tool-select')) {
        const card = target.closest('.gen-tool-card');
        card.querySelector('.gen-field--other').hidden = target.value !== 'outra';
    }

    if (target.matches('.gen-purpose-list input[type="checkbox"]')) {
        target.closest('.gen-pill').classList.toggle('is-checked', target.checked);
    }

    generateOutput();
});

toolsContainer.addEventListener('input', (event) => {
    if (event.target.matches('.gen-tool-other, .gen-tool-version')) {
        generateOutput();
    }
});

toolsContainer.addEventListener('click', (event) => {
    if (event.target.classList.contains('gen-remove-btn')) {
        event.target.closest('.gen-tool-card').remove();
        renumberTools();
        generateOutput();
    }
});

addToolBtn.addEventListener('click', () => {
    createToolCard();
    generateOutput();
});

gateRadios.forEach((radio) => {
    radio.addEventListener('change', () => {
        formWrap.classList.toggle('gen-disabled', radio.value === 'no' && radio.checked);
        generateOutput();
    });
});

copyBtn.addEventListener('click', () => {
    const text = outputText.textContent;
    if (!text) return;
    navigator.clipboard.writeText(text).then(() => {
        copyBtn.classList.add('is-copied');
        copyBtn.textContent = 'Copiado!';
        setTimeout(() => {
            copyBtn.classList.remove('is-copied');
            copyBtn.textContent = 'Copiar declaração';
        }, 1800);
    });
});

createToolCard();
generateOutput();
