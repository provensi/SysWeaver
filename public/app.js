// SystemWeaver - Game Architecture Designer
// Aplicação principal

class SystemWeaver {
    constructor() {
        this.classes = new Map();
        this.connections = new Map();
        this.selectedCard = null;
        this.currentView = 'classes';
        this.activeFilters = new Set(['all']);
        this.undoStack = [];
        this.redoStack = [];
        this.projectName = 'Untitled Project';
        
        this.init();
    }
    
    init() {
        this.setupEventListeners();
        this.setupMonacoEditor();
        this.setupGodotExporter();
        this.loadSampleData();
        this.render();
    }
    
    setupEventListeners() {
        // Header buttons
        document.getElementById('addClassBtn').addEventListener('click', () => this.openClassModal());
        document.getElementById('fabBtn').addEventListener('click', () => this.openClassModal());
        document.getElementById('exportBtn').addEventListener('click', () => this.exportToGodot());
        document.getElementById('openProject').addEventListener('click', () => this.openProject());
        document.getElementById('saveProject').addEventListener('click', () => this.saveProject());
        
        // View tabs
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.switchView(e.target.dataset.view));
        });
        
        // Filter buttons
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.toggleFilter(e.target.dataset.filter));
        });
        
        // Modal events
        document.getElementById('modalClose').addEventListener('click', () => this.closeClassModal());
        document.getElementById('cancelBtn').addEventListener('click', () => this.closeClassModal());
        document.getElementById('classForm').addEventListener('submit', (e) => this.createClass(e));
        
        // Sidebar events
        document.getElementById('sidebarClose').addEventListener('click', () => this.closeSidebar());
        
        // Code editor events
        document.getElementById('editorClose').addEventListener('click', () => this.closeCodeEditor());
        document.getElementById('editorCancel').addEventListener('click', () => this.closeCodeEditor());
        document.getElementById('editorSave').addEventListener('click', () => this.saveCode());
        
        // Overlay events
        document.getElementById('overlay').addEventListener('click', () => {
            this.closeClassModal();
            this.closeSidebar();
        });
        
        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => this.handleKeyboard(e));
        
        // Canvas events
        document.getElementById('classCanvas').addEventListener('click', (e) => {
            if (e.target === e.currentTarget) {
                this.deselectCard();
            }
        });
    }
    
    setupMonacoEditor() {
        // Configurar Monaco Editor
        require.config({ paths: { vs: 'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.44.0/min/vs' } });
        
        require(['vs/editor/editor.main'], () => {
            // Monaco está pronto
            this.monacoReady = true;
        });
    }
    
    setupGodotExporter() {
        this.godotExporter = new GodotExporter(this);
    }
    
    loadSampleData() {
        // Carregar dados de exemplo
        const sampleClasses = [
            {
                id: 'player',
                name: 'Player',
                type: 'normal',
                parent: 'CharacterBody2D',
                interfaces: ['IMovable', 'IDamageable'],
                signals: [
                    { name: 'health_changed', params: ['new_health: int'] },
                    { name: 'died', params: [] }
                ],
                constants: [
                    { name: 'MAX_SPEED', type: 'float', value: '300.0' },
                    { name: 'JUMP_VELOCITY', type: 'float', value: '-400.0' }
                ],
                enums: [
                    { name: 'State', values: ['IDLE', 'RUNNING', 'JUMPING', 'FALLING'] }
                ],
                flags: [
                    { name: 'is_grounded', type: 'bool', default: 'false' },
                    { name: 'is_moving', type: 'bool', default: 'false' }
                ],
                currentProps: [
                    { name: 'cur_health', type: 'int', default: '100' },
                    { name: 'cur_state', type: 'State', default: 'State.IDLE' }
                ],
                interfaceProps: [
                    { name: 'speed', type: 'float', default: '0.0' },
                    { name: 'direction', type: 'Vector2', default: 'Vector2.ZERO' }
                ],
                uniqueProps: [
                    { name: 'inventory', type: 'Inventory', default: 'null' },
                    { name: 'weapon', type: 'Weapon', default: 'null' }
                ],
                functions: [
                    { name: '_ready', params: [], returnType: 'void', code: '# Inicialização do player' },
                    { name: '_physics_process', params: ['delta: float'], returnType: 'void', code: '# Física do player' },
                    { name: 'take_damage', params: ['amount: int'], returnType: 'void', code: '# Receber dano' }
                ],
                position: { x: 100, y: 100 }
            },
            {
                id: 'enemy',
                name: 'Enemy',
                type: 'abstract',
                parent: 'CharacterBody2D',
                interfaces: ['IDamageable', 'IAI'],
                signals: [
                    { name: 'died', params: [] },
                    { name: 'target_spotted', params: ['target: Node2D'] }
                ],
                constants: [
                    { name: 'DETECTION_RANGE', type: 'float', value: '200.0' }
                ],
                flags: [
                    { name: 'is_alive', type: 'bool', default: 'true' },
                    { name: 'is_aggressive', type: 'bool', default: 'false' }
                ],
                currentProps: [
                    { name: 'cur_health', type: 'int', default: '50' },
                    { name: 'cur_target', type: 'Node2D', default: 'null' }
                ],
                functions: [
                    { name: 'attack', params: ['target: Node2D'], returnType: 'void', code: '# Atacar alvo' },
                    { name: 'patrol', params: [], returnType: 'void', code: '# Patrulhar área' }
                ],
                position: { x: 500, y: 100 }
            },
            {
                id: 'imovable',
                name: 'IMovable',
                type: 'interface',
                functions: [
                    { name: 'move', params: ['direction: Vector2'], returnType: 'void' },
                    { name: 'stop', params: [], returnType: 'void' }
                ],
                interfaceProps: [
                    { name: 'speed', type: 'float' },
                    { name: 'max_speed', type: 'float' }
                ],
                position: { x: 100, y: 400 }
            },
            {
                id: 'idamageable',
                name: 'IDamageable',
                type: 'interface',
                functions: [
                    { name: 'take_damage', params: ['amount: int'], returnType: 'void' },
                    { name: 'heal', params: ['amount: int'], returnType: 'void' }
                ],
                interfaceProps: [
                    { name: 'max_health', type: 'int' },
                    { name: 'current_health', type: 'int' }
                ],
                position: { x: 500, y: 400 }
            }
        ];
        
        sampleClasses.forEach(classData => {
            this.classes.set(classData.id, classData);
        });
    }
    
    render() {
        this.renderCanvas();
        this.updateFilters();
    }
    
    renderCanvas() {
        const canvas = document.getElementById('classCanvas');
        canvas.innerHTML = '';
        
        this.classes.forEach((classData, id) => {
            if (this.shouldShowClass(classData)) {
                const cardElement = this.createCardElement(classData);
                canvas.appendChild(cardElement);
            }
        });
        
        // Renderizar conexões
        this.renderConnections();
    }
    
    shouldShowClass(classData) {
        if (this.activeFilters.has('all')) return true;
        
        return this.activeFilters.has(classData.type) || 
               (this.activeFilters.has('components') && classData.hasComponents) ||
               (this.activeFilters.has('abstract') && classData.type === 'abstract') ||
               (this.activeFilters.has('interfaces') && classData.type === 'interface');
    }
    
    createCardElement(classData) {
        const card = document.createElement('div');
        card.className = `class-card type-${classData.type}`;
        card.dataset.id = classData.id;
        
        if (this.selectedCard === classData.id) {
            card.classList.add('selected');
        }
        
        card.innerHTML = `
            <div class="card-header">
                <div class="card-title" contenteditable="false">${classData.name}</div>
                <div class="card-type">${this.getTypeLabel(classData.type)}</div>
                ${classData.parent ? `<div class="card-parent">extends ${classData.parent}</div>` : ''}
                ${classData.interfaces && classData.interfaces.length > 0 ? 
                    `<div class="card-parent">implements ${classData.interfaces.join(', ')}</div>` : ''}
            </div>
            <div class="card-panels">
                ${this.renderSignalsPanel(classData)}
                ${this.renderConstantsPanel(classData)}
                ${this.renderEnumsPanel(classData)}
                ${this.renderFlagsPanel(classData)}
                ${this.renderCurrentPropsPanel(classData)}
                ${this.renderInterfacePropsPanel(classData)}
                ${this.renderUniquePropsPanel(classData)}
                ${this.renderFunctionsPanel(classData)}
                ${classData.hasComponents ? this.renderComponentsPanel(classData) : ''}
            </div>
        `;
        
        // Event listeners para o card
        card.addEventListener('click', (e) => {
            e.stopPropagation();
            this.selectCard(classData.id);
        });
        
        // Event listeners para edição do nome
        const title = card.querySelector('.card-title');
        title.addEventListener('dblclick', () => this.editCardName(title, classData.id));
        
        // Event listeners para painéis
        this.setupPanelListeners(card, classData);
        
        return card;
    }
    
    getTypeLabel(type) {
        const labels = {
            'normal': 'Classe',
            'abstract': 'Abstrata',
            'interface': 'Interface',
            'component': 'Componente',
            'global': 'Global'
        };
        return labels[type] || type;
    }
    
    renderSignalsPanel(classData) {
        const signals = classData.signals || [];
        return `
            <div class="card-panel" data-panel="signals">
                <div class="panel-header">
                    <div class="panel-title">
                        <i class="fas fa-broadcast-tower"></i>
                        Sinais (${signals.length})
                    </div>
                    <i class="fas fa-chevron-down panel-toggle"></i>
                </div>
                <div class="panel-content">
                    <ul class="panel-list">
                        ${signals.map(signal => `
                            <li class="panel-item">
                                <span>${signal.name}(${signal.params.join(', ')})</span>
                                <div class="item-actions">
                                    <button class="item-btn" onclick="systemWeaver.editSignal('${classData.id}', '${signal.name}')">
                                        <i class="fas fa-edit"></i>
                                    </button>
                                    <button class="item-btn" onclick="systemWeaver.emitSignal('${classData.id}', '${signal.name}')">
                                        <i class="fas fa-play"></i>
                                    </button>
                                    <button class="item-btn" onclick="systemWeaver.deleteSignal('${classData.id}', '${signal.name}')">
                                        <i class="fas fa-trash"></i>
                                    </button>
                                </div>
                            </li>
                        `).join('')}
                    </ul>
                    <button class="panel-add-btn" onclick="systemWeaver.addSignal('${classData.id}')">
                        <i class="fas fa-plus"></i>
                        Adicionar Sinal
                    </button>
                </div>
            </div>
        `;
    }
    
    renderConstantsPanel(classData) {
        const constants = classData.constants || [];
        return `
            <div class="card-panel" data-panel="constants">
                <div class="panel-header">
                    <div class="panel-title">
                        <i class="fas fa-lock"></i>
                        Constantes (${constants.length})
                    </div>
                    <i class="fas fa-chevron-down panel-toggle"></i>
                </div>
                <div class="panel-content">
                    <ul class="panel-list">
                        ${constants.map(constant => `
                            <li class="panel-item">
                                <span>${constant.name}: ${constant.type} = ${constant.value}</span>
                                <div class="item-actions">
                                    <button class="item-btn" onclick="systemWeaver.editConstant('${classData.id}', '${constant.name}')">
                                        <i class="fas fa-edit"></i>
                                    </button>
                                    <button class="item-btn" onclick="systemWeaver.deleteConstant('${classData.id}', '${constant.name}')">
                                        <i class="fas fa-trash"></i>
                                    </button>
                                </div>
                            </li>
                        `).join('')}
                    </ul>
                    <button class="panel-add-btn" onclick="systemWeaver.addConstant('${classData.id}')">
                        <i class="fas fa-plus"></i>
                        Adicionar Constante
                    </button>
                </div>
            </div>
        `;
    }
    
    renderEnumsPanel(classData) {
        const enums = classData.enums || [];
        return `
            <div class="card-panel" data-panel="enums">
                <div class="panel-header">
                    <div class="panel-title">
                        <i class="fas fa-list"></i>
                        Enums (${enums.length})
                    </div>
                    <i class="fas fa-chevron-down panel-toggle"></i>
                </div>
                <div class="panel-content">
                    <ul class="panel-list">
                        ${enums.map(enumData => `
                            <li class="panel-item">
                                <span>${enumData.name} {${enumData.values.join(', ')}}</span>
                                <div class="item-actions">
                                    <button class="item-btn" onclick="systemWeaver.editEnum('${classData.id}', '${enumData.name}')">
                                        <i class="fas fa-edit"></i>
                                    </button>
                                    <button class="item-btn" onclick="systemWeaver.deleteEnum('${classData.id}', '${enumData.name}')">
                                        <i class="fas fa-trash"></i>
                                    </button>
                                </div>
                            </li>
                        `).join('')}
                    </ul>
                    <button class="panel-add-btn" onclick="systemWeaver.addEnum('${classData.id}')">
                        <i class="fas fa-plus"></i>
                        Adicionar Enum
                    </button>
                </div>
            </div>
        `;
    }
    
    renderFlagsPanel(classData) {
        const flags = classData.flags || [];
        return `
            <div class="card-panel" data-panel="flags">
                <div class="panel-header">
                    <div class="panel-title">
                        <i class="fas fa-flag"></i>
                        Flags (${flags.length})
                    </div>
                    <i class="fas fa-chevron-down panel-toggle"></i>
                </div>
                <div class="panel-content">
                    <ul class="panel-list">
                        ${flags.map(flag => `
                            <li class="panel-item">
                                <span>${flag.name}: ${flag.type} = ${flag.default}</span>
                                <div class="item-actions">
                                    <button class="item-btn" onclick="systemWeaver.editFlag('${classData.id}', '${flag.name}')">
                                        <i class="fas fa-edit"></i>
                                    </button>
                                    <button class="item-btn" onclick="systemWeaver.deleteFlag('${classData.id}', '${flag.name}')">
                                        <i class="fas fa-trash"></i>
                                    </button>
                                </div>
                            </li>
                        `).join('')}
                    </ul>
                    <button class="panel-add-btn" onclick="systemWeaver.addFlag('${classData.id}')">
                        <i class="fas fa-plus"></i>
                        Adicionar Flag
                    </button>
                </div>
            </div>
        `;
    }
    
    renderCurrentPropsPanel(classData) {
        const currentProps = classData.currentProps || [];
        return `
            <div class="card-panel" data-panel="current-props">
                <div class="panel-header">
                    <div class="panel-title">
                        <i class="fas fa-clock"></i>
                        Props Atuais (${currentProps.length})
                    </div>
                    <i class="fas fa-chevron-down panel-toggle"></i>
                </div>
                <div class="panel-content">
                    <ul class="panel-list">
                        ${currentProps.map(prop => `
                            <li class="panel-item">
                                <span>${prop.name}: ${prop.type} = ${prop.default}</span>
                                <div class="item-actions">
                                    <button class="item-btn" onclick="systemWeaver.editCurrentProp('${classData.id}', '${prop.name}')">
                                        <i class="fas fa-edit"></i>
                                    </button>
                                    <button class="item-btn" onclick="systemWeaver.createSetter('${classData.id}', '${prop.name}')">
                                        <i class="fas fa-cog"></i>
                                    </button>
                                    <button class="item-btn" onclick="systemWeaver.deleteCurrentProp('${classData.id}', '${prop.name}')">
                                        <i class="fas fa-trash"></i>
                                    </button>
                                </div>
                            </li>
                        `).join('')}
                    </ul>
                    <button class="panel-add-btn" onclick="systemWeaver.addCurrentProp('${classData.id}')">
                        <i class="fas fa-plus"></i>
                        Adicionar Prop Atual
                    </button>
                </div>
            </div>
        `;
    }
    
    renderInterfacePropsPanel(classData) {
        const interfaceProps = classData.interfaceProps || [];
        return `
            <div class="card-panel" data-panel="interface-props">
                <div class="panel-header">
                    <div class="panel-title">
                        <i class="fas fa-plug"></i>
                        Props Interface (${interfaceProps.length})
                    </div>
                    <i class="fas fa-chevron-down panel-toggle"></i>
                </div>
                <div class="panel-content">
                    <ul class="panel-list">
                        ${interfaceProps.map(prop => `
                            <li class="panel-item">
                                <span>${prop.name}: ${prop.type}${prop.default ? ` = ${prop.default}` : ''}</span>
                                <div class="item-actions">
                                    <button class="item-btn" onclick="systemWeaver.editInterfaceProp('${classData.id}', '${prop.name}')">
                                        <i class="fas fa-edit"></i>
                                    </button>
                                    <button class="item-btn" onclick="systemWeaver.deleteInterfaceProp('${classData.id}', '${prop.name}')">
                                        <i class="fas fa-trash"></i>
                                    </button>
                                </div>
                            </li>
                        `).join('')}
                    </ul>
                    <button class="panel-add-btn" onclick="systemWeaver.addInterfaceProp('${classData.id}')">
                        <i class="fas fa-plus"></i>
                        Adicionar Prop Interface
                    </button>
                </div>
            </div>
        `;
    }
    
    renderUniquePropsPanel(classData) {
        const uniqueProps = classData.uniqueProps || [];
        return `
            <div class="card-panel" data-panel="unique-props">
                <div class="panel-header">
                    <div class="panel-title">
                        <i class="fas fa-star"></i>
                        Props Únicas (${uniqueProps.length})
                    </div>
                    <i class="fas fa-chevron-down panel-toggle"></i>
                </div>
                <div class="panel-content">
                    <ul class="panel-list">
                        ${uniqueProps.map(prop => `
                            <li class="panel-item">
                                <span>${prop.name}: ${prop.type}${prop.default ? ` = ${prop.default}` : ''}</span>
                                <div class="item-actions">
                                    <button class="item-btn" onclick="systemWeaver.editUniqueProp('${classData.id}', '${prop.name}')">
                                        <i class="fas fa-edit"></i>
                                    </button>
                                    <button class="item-btn" onclick="systemWeaver.createSetter('${classData.id}', '${prop.name}')">
                                        <i class="fas fa-cog"></i>
                                    </button>
                                    <button class="item-btn" onclick="systemWeaver.deleteUniqueProp('${classData.id}', '${prop.name}')">
                                        <i class="fas fa-trash"></i>
                                    </button>
                                </div>
                            </li>
                        `).join('')}
                    </ul>
                    <button class="panel-add-btn" onclick="systemWeaver.addUniqueProp('${classData.id}')">
                        <i class="fas fa-plus"></i>
                        Adicionar Prop Única
                    </button>
                </div>
            </div>
        `;
    }
    
    renderFunctionsPanel(classData) {
        const functions = classData.functions || [];
        return `
            <div class="card-panel" data-panel="functions">
                <div class="panel-header">
                    <div class="panel-title">
                        <i class="fas fa-code"></i>
                        Funções (${functions.length})
                    </div>
                    <i class="fas fa-chevron-down panel-toggle"></i>
                </div>
                <div class="panel-content">
                    <ul class="panel-list">
                        ${functions.map(func => `
                            <li class="panel-item">
                                <span>${func.name}(${func.params.join(', ')}): ${func.returnType}</span>
                                <div class="item-actions">
                                    <button class="item-btn" onclick="systemWeaver.editFunction('${classData.id}', '${func.name}')">
                                        <i class="fas fa-edit"></i>
                                    </button>
                                    <button class="item-btn" onclick="systemWeaver.deleteFunction('${classData.id}', '${func.name}')">
                                        <i class="fas fa-trash"></i>
                                    </button>
                                </div>
                            </li>
                        `).join('')}
                    </ul>
                    <button class="panel-add-btn" onclick="systemWeaver.addFunction('${classData.id}')">
                        <i class="fas fa-plus"></i>
                        Adicionar Função
                    </button>
                </div>
            </div>
        `;
    }
    
    renderComponentsPanel(classData) {
        const components = classData.components || [];
        return `
            <div class="card-panel" data-panel="components">
                <div class="panel-header">
                    <div class="panel-title">
                        <i class="fas fa-puzzle-piece"></i>
                        Componentes (${components.length})
                    </div>
                    <i class="fas fa-chevron-down panel-toggle"></i>
                </div>
                <div class="panel-content">
                    <ul class="panel-list">
                        ${components.map(component => `
                            <li class="panel-item">
                                <span>${component.name}: ${component.type}</span>
                                <div class="item-actions">
                                    <button class="item-btn" onclick="systemWeaver.editComponent('${classData.id}', '${component.name}')">
                                        <i class="fas fa-edit"></i>
                                    </button>
                                    <button class="item-btn" onclick="systemWeaver.deleteComponent('${classData.id}', '${component.name}')">
                                        <i class="fas fa-trash"></i>
                                    </button>
                                </div>
                            </li>
                        `).join('')}
                    </ul>
                    <button class="panel-add-btn" onclick="systemWeaver.addComponent('${classData.id}')">
                        <i class="fas fa-plus"></i>
                        Adicionar Componente
                    </button>
                </div>
            </div>
        `;
    }
    
    setupPanelListeners(card, classData) {
        // Toggle panels
        card.querySelectorAll('.panel-header').forEach(header => {
            header.addEventListener('click', () => {
                const panel = header.parentElement;
                panel.classList.toggle('collapsed');
            });
        });
    }
    
    // Event handlers
    selectCard(id) {
        this.selectedCard = id;
        this.render();
        this.openSidebar(id);
    }
    
    deselectCard() {
        this.selectedCard = null;
        this.render();
        this.closeSidebar();
    }
    
    switchView(view) {
        this.currentView = view;
        
        // Update tab buttons
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.view === view);
        });
        
        this.render();
    }
    
    toggleFilter(filter) {
        if (filter === 'all') {
            this.activeFilters.clear();
            this.activeFilters.add('all');
        } else {
            this.activeFilters.delete('all');
            if (this.activeFilters.has(filter)) {
                this.activeFilters.delete(filter);
            } else {
                this.activeFilters.add(filter);
            }
            
            if (this.activeFilters.size === 0) {
                this.activeFilters.add('all');
            }
        }
        
        this.updateFilters();
        this.render();
    }
    
    updateFilters() {
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.classList.toggle('active', this.activeFilters.has(btn.dataset.filter));
        });
    }
    
    openClassModal() {
        document.getElementById('classModal').classList.add('open');
        document.getElementById('overlay').classList.add('open');
        document.getElementById('className').focus();
    }
    
    closeClassModal() {
        document.getElementById('classModal').classList.remove('open');
        document.getElementById('overlay').classList.remove('open');
        document.getElementById('classForm').reset();
    }
    
    createClass(e) {
        e.preventDefault();
        
        const formData = new FormData(e.target);
        const classData = {
            id: this.generateId(),
            name: formData.get('className'),
            type: formData.get('classType'),
            parent: formData.get('parentClass') || null,
            interfaces: formData.get('interfaces') ? 
                formData.get('interfaces').split(',').map(s => s.trim()) : [],
            signals: [],
            constants: [],
            enums: [],
            flags: [],
            currentProps: [],
            interfaceProps: [],
            uniqueProps: [],
            functions: [],
            position: { x: 100, y: 100 }
        };
        
        this.classes.set(classData.id, classData);
        this.addToUndoStack('create_class', classData);
        this.closeClassModal();
        this.render();
    }
    
    openSidebar(classId) {
        const sidebar = document.getElementById('sidebar');
        const content = document.getElementById('sidebarContent');
        
        if (classId) {
            const classData = this.classes.get(classId);
            content.innerHTML = this.renderSidebarContent(classData);
        }
        
        sidebar.classList.add('open');
        document.getElementById('overlay').classList.add('open');
    }
    
    closeSidebar() {
        document.getElementById('sidebar').classList.remove('open');
        document.getElementById('overlay').classList.remove('open');
    }
    
    renderSidebarContent(classData) {
        return `
            <div class="sidebar-section">
                <h4>Informações Gerais</h4>
                <div class="form-group">
                    <label>Nome</label>
                    <input type="text" value="${classData.name}" onchange="systemWeaver.updateClassName('${classData.id}', this.value)">
                </div>
                <div class="form-group">
                    <label>Tipo</label>
                    <select onchange="systemWeaver.updateClassType('${classData.id}', this.value)">
                        <option value="normal" ${classData.type === 'normal' ? 'selected' : ''}>Classe Normal</option>
                        <option value="abstract" ${classData.type === 'abstract' ? 'selected' : ''}>Classe Abstrata</option>
                        <option value="interface" ${classData.type === 'interface' ? 'selected' : ''}>Interface</option>
                        <option value="component" ${classData.type === 'component' ? 'selected' : ''}>Componente</option>
                        <option value="global" ${classData.type === 'global' ? 'selected' : ''}>Classe Global</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>Classe Pai</label>
                    <input type="text" value="${classData.parent || ''}" onchange="systemWeaver.updateClassParent('${classData.id}', this.value)">
                </div>
                <div class="form-group">
                    <label>Interfaces</label>
                    <input type="text" value="${classData.interfaces ? classData.interfaces.join(', ') : ''}" onchange="systemWeaver.updateClassInterfaces('${classData.id}', this.value)">
                </div>
            </div>
            
            <div class="sidebar-section">
                <h4>Ações</h4>
                <button class="btn-secondary" onclick="systemWeaver.duplicateClass('${classData.id}')">
                    <i class="fas fa-copy"></i>
                    Duplicar Classe
                </button>
                <button class="btn-secondary" onclick="systemWeaver.exportClass('${classData.id}')">
                    <i class="fas fa-download"></i>
                    Exportar GDScript
                </button>
                <button class="btn-secondary" style="background: var(--error); color: white;" onclick="systemWeaver.deleteClass('${classData.id}')">
                    <i class="fas fa-trash"></i>
                    Deletar Classe
                </button>
            </div>
        `;
    }
    
    // Utility methods
    generateId() {
        return 'class_' + Math.random().toString(36).substr(2, 9);
    }
    
    addToUndoStack(action, data) {
        this.undoStack.push({ action, data, timestamp: Date.now() });
        this.redoStack = []; // Clear redo stack
        
        // Limit undo stack size
        if (this.undoStack.length > 50) {
            this.undoStack.shift();
        }
    }
    
    handleKeyboard(e) {
        // Ctrl+Z - Undo
        if (e.ctrlKey && e.key === 'z' && !e.shiftKey) {
            e.preventDefault();
            this.undo();
        }
        
        // Ctrl+Shift+Z - Redo
        if (e.ctrlKey && e.key === 'z' && e.shiftKey) {
            e.preventDefault();
            this.redo();
        }
        
        // F2 - Rename selected card
        if (e.key === 'F2' && this.selectedCard) {
            e.preventDefault();
            this.editCardName(null, this.selectedCard);
        }
        
        // Delete - Delete selected card
        if (e.key === 'Delete' && this.selectedCard) {
            e.preventDefault();
            this.deleteClass(this.selectedCard);
        }
        
        // Escape - Deselect
        if (e.key === 'Escape') {
            e.preventDefault();
            this.deselectCard();
            this.closeClassModal();
            this.closeSidebar();
            this.closeCodeEditor();
        }
    }
    
    // Placeholder methods for functionality to be implemented
    editCardName(element, classId) {
        const classData = this.classes.get(classId);
        const newName = prompt('Nome da classe:', classData.name);
        if (newName && newName !== classData.name) {
            classData.name = newName;
            this.addToUndoStack('rename_class', { id: classId, oldName: classData.name, newName });
            this.render();
        }
    }
    
    renderConnections() {
        // TODO: Implementar renderização de conexões entre classes
    }
    
    openCodeEditor(title, code, callback) {
        if (!this.monacoReady) {
            alert('Editor de código ainda carregando...');
            return;
        }
        
        document.getElementById('editorTitle').textContent = title;
        document.getElementById('codeEditorModal').classList.add('open');
        
        // TODO: Implementar Monaco Editor
    }
    
    closeCodeEditor() {
        document.getElementById('codeEditorModal').classList.remove('open');
    }
    
    saveCode() {
        // TODO: Implementar salvamento de código
        this.closeCodeEditor();
    }
    
    exportToGodot() {
        // Validar projeto antes da exportação
        const validation = this.godotExporter.validateProject();
        
        if (validation.errors.length > 0) {
            alert('Erros encontrados no projeto:\n\n' + validation.errors.join('\n'));
            return;
        }
        
        if (validation.warnings.length > 0) {
            const proceed = confirm('Avisos encontrados:\n\n' + validation.warnings.join('\n') + '\n\nDeseja continuar com a exportação?');
            if (!proceed) return;
        }
        
        // Exportar projeto
        this.godotExporter.exportProject().then(success => {
            if (success) {
                alert('Projeto exportado com sucesso!');
            }
        });
    }
    
    saveProject() {
        const projectData = {
            name: this.projectName,
            classes: Array.from(this.classes.entries()),
            connections: Array.from(this.connections.entries()),
            version: '1.0.0'
        };
        
        const blob = new Blob([JSON.stringify(projectData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${this.projectName}.swproj`;
        a.click();
        URL.revokeObjectURL(url);
    }
    
    openProject() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.swproj,.json';
        input.onchange = (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    try {
                        const projectData = JSON.parse(e.target.result);
                        this.loadProject(projectData);
                    } catch (error) {
                        alert('Erro ao carregar projeto: ' + error.message);
                    }
                };
                reader.readAsText(file);
            }
        };
        input.click();
    }
    
    loadProject(projectData) {
        this.projectName = projectData.name || 'Projeto Carregado';
        this.classes = new Map(projectData.classes || []);
        this.connections = new Map(projectData.connections || []);
        this.selectedCard = null;
        
        document.querySelector('.project-name').textContent = this.projectName;
        this.render();
    }
    
    undo() {
        // TODO: Implementar undo
    }
    
    redo() {
        // TODO: Implementar redo
    }
    
    // Placeholder methods for panel actions
    addSignal(classId) { this.showComingSoon('Adicionar Sinal'); }
    editSignal(classId, signalName) { this.showComingSoon('Editar Sinal'); }
    deleteSignal(classId, signalName) { this.showComingSoon('Deletar Sinal'); }
    emitSignal(classId, signalName) { this.showComingSoon('Emitir Sinal'); }
    
    addConstant(classId) { this.showComingSoon('Adicionar Constante'); }
    editConstant(classId, constantName) { this.showComingSoon('Editar Constante'); }
    deleteConstant(classId, constantName) { this.showComingSoon('Deletar Constante'); }
    
    addEnum(classId) { this.showComingSoon('Adicionar Enum'); }
    editEnum(classId, enumName) { this.showComingSoon('Editar Enum'); }
    deleteEnum(classId, enumName) { this.showComingSoon('Deletar Enum'); }
    
    addFlag(classId) { this.showComingSoon('Adicionar Flag'); }
    editFlag(classId, flagName) { this.showComingSoon('Editar Flag'); }
    deleteFlag(classId, flagName) { this.showComingSoon('Deletar Flag'); }
    
    addCurrentProp(classId) { this.showComingSoon('Adicionar Prop Atual'); }
    editCurrentProp(classId, propName) { this.showComingSoon('Editar Prop Atual'); }
    deleteCurrentProp(classId, propName) { this.showComingSoon('Deletar Prop Atual'); }
    
    addInterfaceProp(classId) { this.showComingSoon('Adicionar Prop Interface'); }
    editInterfaceProp(classId, propName) { this.showComingSoon('Editar Prop Interface'); }
    deleteInterfaceProp(classId, propName) { this.showComingSoon('Deletar Prop Interface'); }
    
    addUniqueProp(classId) { this.showComingSoon('Adicionar Prop Única'); }
    editUniqueProp(classId, propName) { this.showComingSoon('Editar Prop Única'); }
    deleteUniqueProp(classId, propName) { this.showComingSoon('Deletar Prop Única'); }
    
    addFunction(classId) { this.showComingSoon('Adicionar Função'); }
    editFunction(classId, funcName) { this.showComingSoon('Editar Função'); }
    deleteFunction(classId, funcName) { this.showComingSoon('Deletar Função'); }
    
    addComponent(classId) { this.showComingSoon('Adicionar Componente'); }
    editComponent(classId, componentName) { this.showComingSoon('Editar Componente'); }
    deleteComponent(classId, componentName) { this.showComingSoon('Deletar Componente'); }
    
    createSetter(classId, propName) { this.showComingSoon('Criar Setter'); }
    
    updateClassName(classId, newName) {
        const classData = this.classes.get(classId);
        if (classData) {
            classData.name = newName;
            this.render();
        }
    }
    
    updateClassType(classId, newType) {
        const classData = this.classes.get(classId);
        if (classData) {
            classData.type = newType;
            this.render();
        }
    }
    
    updateClassParent(classId, newParent) {
        const classData = this.classes.get(classId);
        if (classData) {
            classData.parent = newParent || null;
            this.render();
        }
    }
    
    updateClassInterfaces(classId, interfacesStr) {
        const classData = this.classes.get(classId);
        if (classData) {
            classData.interfaces = interfacesStr ? 
                interfacesStr.split(',').map(s => s.trim()).filter(s => s) : [];
            this.render();
        }
    }
    
    duplicateClass(classId) { this.showComingSoon('Duplicar Classe'); }
    exportClass(classId) { 
        this.godotExporter.exportClass(classId);
    }
    
    deleteClass(classId) {
        if (confirm('Tem certeza que deseja deletar esta classe?')) {
            this.classes.delete(classId);
            if (this.selectedCard === classId) {
                this.deselectCard();
            }
            this.render();
        }
    }
    
    showComingSoon(feature) {
        alert(`${feature} - Em desenvolvimento!`);
    }
}

// Initialize the application
let systemWeaver;
document.addEventListener('DOMContentLoaded', () => {
    systemWeaver = new SystemWeaver();
});

