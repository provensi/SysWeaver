// Class Card Management para SystemWeaver
// Gerencia funcionalidades específicas dos cards de classe

class ClassCard {
    constructor(classData, systemWeaver) {
        this.classData = classData;
        this.systemWeaver = systemWeaver;
        this.element = null;
        this.isDragging = false;
        this.dragOffset = { x: 0, y: 0 };
        this.connections = new Map();
    }
    
    createElement() {
        const card = document.createElement('div');
        card.className = `class-card type-${this.classData.type}`;
        card.dataset.id = this.classData.id;
        
        // Aplicar posição se definida
        if (this.classData.position) {
            card.style.transform = `translate(${this.classData.position.x}px, ${this.classData.position.y}px)`;
        }
        
        card.innerHTML = this.generateHTML();
        this.element = card;
        
        this.setupEventListeners();
        return card;
    }
    
    generateHTML() {
        return `
            <div class="card-header">
                <div class="card-title-container">
                    <div class="card-title" contenteditable="false">${this.classData.name}</div>
                    <div class="card-actions">
                        <button class="card-action-btn" data-action="rename" title="Renomear (F2)">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="card-action-btn" data-action="duplicate" title="Duplicar">
                            <i class="fas fa-copy"></i>
                        </button>
                        <button class="card-action-btn" data-action="delete" title="Deletar">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
                <div class="card-type">${this.getTypeLabel()}</div>
                ${this.renderInheritance()}
                ${this.renderTypeIndicators()}
            </div>
            <div class="card-panels">
                ${this.renderAllPanels()}
            </div>
            ${this.renderConnectionPoints()}
        `;
    }
    
    getTypeLabel() {
        const labels = {
            'normal': 'Classe',
            'abstract': 'Abstrata',
            'interface': 'Interface',
            'component': 'Componente',
            'global': 'Global'
        };
        return labels[this.classData.type] || this.classData.type;
    }
    
    renderInheritance() {
        let html = '';
        
        if (this.classData.parent) {
            html += `<div class="card-parent">extends ${this.classData.parent}</div>`;
        }
        
        if (this.classData.interfaces && this.classData.interfaces.length > 0) {
            html += `<div class="card-interfaces">implements ${this.classData.interfaces.join(', ')}</div>`;
        }
        
        return html;
    }
    
    renderTypeIndicators() {
        const indicators = [];
        
        if (this.classData.hasComponents) {
            indicators.push('<span class="type-indicator component-indicator" title="Tem Componentes"><i class="fas fa-puzzle-piece"></i></span>');
        }
        
        if (this.classData.signals && this.classData.signals.length > 0) {
            indicators.push('<span class="type-indicator signal-indicator" title="Tem Sinais"><i class="fas fa-broadcast-tower"></i></span>');
        }
        
        if (this.classData.functions && this.classData.functions.some(f => f.name.startsWith('_'))) {
            indicators.push('<span class="type-indicator override-indicator" title="Override Methods"><i class="fas fa-code"></i></span>');
        }
        
        if (indicators.length > 0) {
            return `<div class="card-indicators">${indicators.join('')}</div>`;
        }
        
        return '';
    }
    
    renderAllPanels() {
        const panels = [];
        
        // Ordem dos painéis conforme especificação
        panels.push(this.renderSignalsPanel());
        panels.push(this.renderConstantsPanel());
        panels.push(this.renderEnumsPanel());
        panels.push(this.renderDictionariesPanel());
        panels.push(this.renderFlagsPanel());
        panels.push(this.renderCurrentPropsPanel());
        panels.push(this.renderInterfacePropsPanel());
        panels.push(this.renderUniquePropsPanel());
        panels.push(this.renderFunctionsPanel());
        
        if (this.classData.hasComponents) {
            panels.push(this.renderComponentsPanel());
        }
        
        return panels.filter(panel => panel).join('');
    }
    
    renderSignalsPanel() {
        const signals = this.classData.signals || [];
        if (signals.length === 0 && this.classData.type === 'interface') return '';
        
        return this.createPanel('signals', 'Sinais', 'broadcast-tower', signals.length, 
            signals.map(signal => ({
                content: `${signal.name}(${signal.params.join(', ')})`,
                actions: [
                    { icon: 'edit', action: 'editSignal', tooltip: 'Editar' },
                    { icon: 'play', action: 'emitSignal', tooltip: 'Emitir' },
                    { icon: 'trash', action: 'deleteSignal', tooltip: 'Deletar' }
                ]
            })),
            'addSignal'
        );
    }
    
    renderConstantsPanel() {
        const constants = this.classData.constants || [];
        if (constants.length === 0 && this.classData.type === 'interface') return '';
        
        return this.createPanel('constants', 'Constantes', 'lock', constants.length,
            constants.map(constant => ({
                content: `${constant.name}: ${constant.type} = ${constant.value}`,
                actions: [
                    { icon: 'edit', action: 'editConstant', tooltip: 'Editar' },
                    { icon: 'search', action: 'findUsage', tooltip: 'Localizar Uso' },
                    { icon: 'trash', action: 'deleteConstant', tooltip: 'Deletar' }
                ]
            })),
            'addConstant'
        );
    }
    
    renderEnumsPanel() {
        const enums = this.classData.enums || [];
        if (enums.length === 0) return '';
        
        return this.createPanel('enums', 'Enums', 'list', enums.length,
            enums.map(enumData => ({
                content: `${enumData.name} {${enumData.values.join(', ')}}`,
                actions: [
                    { icon: 'edit', action: 'editEnum', tooltip: 'Editar' },
                    { icon: 'plus-square', action: 'createDictAccess', tooltip: 'Criar Dict Access' },
                    { icon: 'trash', action: 'deleteEnum', tooltip: 'Deletar' }
                ]
            })),
            'addEnum'
        );
    }
    
    renderDictionariesPanel() {
        const dictionaries = this.classData.dictionaries || [];
        if (dictionaries.length === 0) return '';
        
        return this.createPanel('dictionaries', 'Dicionários', 'book', dictionaries.length,
            dictionaries.map(dict => ({
                content: `${dict.name}: Dictionary<${dict.keyType}, ${dict.valueType}>`,
                actions: [
                    { icon: 'edit', action: 'editDictionary', tooltip: 'Editar' },
                    { icon: 'trash', action: 'deleteDictionary', tooltip: 'Deletar' }
                ]
            })),
            'addDictionary'
        );
    }
    
    renderFlagsPanel() {
        const flags = this.classData.flags || [];
        if (flags.length === 0) return '';
        
        return this.createPanel('flags', 'Flags', 'flag', flags.length,
            flags.map(flag => ({
                content: `${flag.name}: ${flag.type} = ${flag.default}`,
                actions: [
                    { icon: 'edit', action: 'editFlag', tooltip: 'Editar' },
                    { icon: 'broadcast-tower', action: 'createFlagSignal', tooltip: 'Criar Sinal' },
                    { icon: 'cog', action: 'createFlagFunction', tooltip: 'Criar Função' },
                    { icon: 'trash', action: 'deleteFlag', tooltip: 'Deletar' }
                ]
            })),
            'addFlag'
        );
    }
    
    renderCurrentPropsPanel() {
        const currentProps = this.classData.currentProps || [];
        if (currentProps.length === 0) return '';
        
        return this.createPanel('current-props', 'Props Atuais', 'clock', currentProps.length,
            currentProps.map(prop => ({
                content: `${prop.name}: ${prop.type} = ${prop.default}`,
                actions: [
                    { icon: 'edit', action: 'editCurrentProp', tooltip: 'Editar' },
                    { icon: 'cog', action: 'createSetter', tooltip: 'Criar Setter' },
                    { icon: 'broadcast-tower', action: 'createChangeSignal', tooltip: 'Sinal de Mudança' },
                    { icon: 'trash', action: 'deleteCurrentProp', tooltip: 'Deletar' }
                ]
            })),
            'addCurrentProp'
        );
    }
    
    renderInterfacePropsPanel() {
        const interfaceProps = this.classData.interfaceProps || [];
        if (interfaceProps.length === 0) return '';
        
        return this.createPanel('interface-props', 'Props Interface', 'plug', interfaceProps.length,
            interfaceProps.map(prop => ({
                content: `${prop.name}: ${prop.type}${prop.default ? ` = ${prop.default}` : ''}`,
                actions: [
                    { icon: 'edit', action: 'editInterfaceProp', tooltip: 'Editar' },
                    { icon: 'trash', action: 'deleteInterfaceProp', tooltip: 'Deletar' }
                ]
            })),
            'addInterfaceProp'
        );
    }
    
    renderUniquePropsPanel() {
        const uniqueProps = this.classData.uniqueProps || [];
        if (uniqueProps.length === 0) return '';
        
        return this.createPanel('unique-props', 'Props Únicas', 'star', uniqueProps.length,
            uniqueProps.map(prop => ({
                content: `${prop.name}: ${prop.type}${prop.default ? ` = ${prop.default}` : ''}`,
                actions: [
                    { icon: 'edit', action: 'editUniqueProp', tooltip: 'Editar' },
                    { icon: 'cog', action: 'createSetter', tooltip: 'Criar Setter' },
                    { icon: 'plus', action: 'createMissingClass', tooltip: 'Criar Classe' },
                    { icon: 'trash', action: 'deleteUniqueProp', tooltip: 'Deletar' }
                ]
            })),
            'addUniqueProp'
        );
    }
    
    renderFunctionsPanel() {
        const functions = this.classData.functions || [];
        const baseFunctions = functions.filter(f => this.isBaseModelFunction(f.name));
        const uniqueFunctions = functions.filter(f => !this.isBaseModelFunction(f.name));
        
        let html = '';
        
        if (baseFunctions.length > 0) {
            html += this.createPanel('base-functions', 'IBaseModel', 'code', baseFunctions.length,
                baseFunctions.map(func => ({
                    content: `${func.name}(${func.params.join(', ')}): ${func.returnType}`,
                    actions: [
                        { icon: 'edit', action: 'editFunction', tooltip: 'Editar Código' }
                    ]
                })),
                null, true
            );
        }
        
        if (uniqueFunctions.length > 0 || this.classData.type !== 'interface') {
            html += this.createPanel('unique-functions', 'Funções Únicas', 'code', uniqueFunctions.length,
                uniqueFunctions.map(func => ({
                    content: `${func.name}(${func.params.join(', ')}): ${func.returnType}`,
                    actions: [
                        { icon: 'edit', action: 'editFunction', tooltip: 'Editar Código' },
                        { icon: 'trash', action: 'deleteFunction', tooltip: 'Deletar' }
                    ]
                })),
                'addFunction'
            );
        }
        
        return html;
    }
    
    renderComponentsPanel() {
        const components = this.classData.components || [];
        
        return this.createPanel('components', 'Componentes', 'puzzle-piece', components.length,
            components.map(component => ({
                content: `${component.name}: ${component.type}`,
                actions: [
                    { icon: 'edit', action: 'editComponent', tooltip: 'Editar' },
                    { icon: 'link', action: 'connectComponent', tooltip: 'Conectar' },
                    { icon: 'trash', action: 'deleteComponent', tooltip: 'Deletar' }
                ]
            })),
            'addComponent'
        );
    }
    
    createPanel(id, title, icon, count, items, addAction, collapsed = false) {
        const itemsHtml = items.map(item => `
            <li class="panel-item">
                <span class="item-content">${item.content}</span>
                <div class="item-actions">
                    ${item.actions.map(action => `
                        <button class="item-btn" data-action="${action.action}" title="${action.tooltip}">
                            <i class="fas fa-${action.icon}"></i>
                        </button>
                    `).join('')}
                </div>
            </li>
        `).join('');
        
        const addButton = addAction ? `
            <button class="panel-add-btn" data-action="${addAction}">
                <i class="fas fa-plus"></i>
                Adicionar ${title.slice(0, -1)}
            </button>
        ` : '';
        
        return `
            <div class="card-panel ${collapsed ? 'collapsed' : ''}" data-panel="${id}">
                <div class="panel-header">
                    <div class="panel-title">
                        <i class="fas fa-${icon}"></i>
                        ${title} (${count})
                    </div>
                    <i class="fas fa-chevron-down panel-toggle"></i>
                </div>
                <div class="panel-content">
                    ${items.length > 0 ? `<ul class="panel-list">${itemsHtml}</ul>` : '<p class="panel-empty">Nenhum item</p>'}
                    ${addButton}
                </div>
            </div>
        `;
    }
    
    renderConnectionPoints() {
        return `
            <div class="connection-points">
                <div class="connection-point input" data-type="input" title="Entrada"></div>
                <div class="connection-point output" data-type="output" title="Saída"></div>
            </div>
        `;
    }
    
    setupEventListeners() {
        if (!this.element) return;
        
        // Card selection
        this.element.addEventListener('click', (e) => {
            e.stopPropagation();
            this.systemWeaver.selectCard(this.classData.id);
        });
        
        // Panel toggles
        this.element.querySelectorAll('.panel-header').forEach(header => {
            header.addEventListener('click', (e) => {
                e.stopPropagation();
                const panel = header.parentElement;
                panel.classList.toggle('collapsed');
                this.saveCollapsedState(panel.dataset.panel, panel.classList.contains('collapsed'));
            });
        });
        
        // Action buttons
        this.element.addEventListener('click', (e) => {
            const actionBtn = e.target.closest('[data-action]');
            if (actionBtn) {
                e.stopPropagation();
                this.handleAction(actionBtn.dataset.action, actionBtn);
            }
        });
        
        // Title editing
        const title = this.element.querySelector('.card-title');
        title.addEventListener('dblclick', () => this.startTitleEdit());
        
        // Drag and drop
        this.setupDragAndDrop();
        
        // Context menu
        this.element.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            this.showContextMenu(e.clientX, e.clientY);
        });
    }
    
    setupDragAndDrop() {
        let isDragging = false;
        let startPos = { x: 0, y: 0 };
        let currentPos = { x: 0, y: 0 };
        
        this.element.addEventListener('mousedown', (e) => {
            if (e.target.closest('.card-action-btn, .item-btn, .panel-add-btn, .panel-header')) {
                return;
            }
            
            isDragging = true;
            startPos = { x: e.clientX, y: e.clientY };
            
            const rect = this.element.getBoundingClientRect();
            currentPos = { 
                x: rect.left, 
                y: rect.top 
            };
            
            this.element.style.zIndex = '1000';
            this.element.classList.add('dragging');
            
            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleMouseUp);
        });
        
        const handleMouseMove = (e) => {
            if (!isDragging) return;
            
            const deltaX = e.clientX - startPos.x;
            const deltaY = e.clientY - startPos.y;
            
            const newX = currentPos.x + deltaX;
            const newY = currentPos.y + deltaY;
            
            this.element.style.transform = `translate(${newX}px, ${newY}px)`;
        };
        
        const handleMouseUp = () => {
            if (isDragging) {
                isDragging = false;
                this.element.style.zIndex = '';
                this.element.classList.remove('dragging');
                
                // Salvar nova posição
                const transform = this.element.style.transform;
                const matches = transform.match(/translate\(([^,]+),\s*([^)]+)\)/);
                if (matches) {
                    this.classData.position = {
                        x: parseFloat(matches[1]),
                        y: parseFloat(matches[2])
                    };
                }
                
                document.removeEventListener('mousemove', handleMouseMove);
                document.removeEventListener('mouseup', handleMouseUp);
            }
        };
    }
    
    handleAction(action, button) {
        const itemContent = button.closest('.panel-item')?.querySelector('.item-content')?.textContent;
        const itemName = itemContent ? itemContent.split(':')[0].split('(')[0].trim() : '';
        
        switch (action) {
            case 'rename':
                this.startTitleEdit();
                break;
            case 'duplicate':
                this.systemWeaver.duplicateClass(this.classData.id);
                break;
            case 'delete':
                this.systemWeaver.deleteClass(this.classData.id);
                break;
            case 'editFunction':
                this.systemWeaver.editFunction(this.classData.id, itemName);
                break;
            case 'createSetter':
                this.systemWeaver.createSetter(this.classData.id, itemName);
                break;
            case 'createMissingClass':
                this.systemWeaver.createMissingClass(this.classData.id, itemName);
                break;
            default:
                // Delegar para o SystemWeaver
                if (typeof this.systemWeaver[action] === 'function') {
                    this.systemWeaver[action](this.classData.id, itemName);
                } else {
                    this.systemWeaver.showComingSoon(action);
                }
                break;
        }
    }
    
    startTitleEdit() {
        const title = this.element.querySelector('.card-title');
        const currentName = title.textContent;
        
        title.contentEditable = true;
        title.focus();
        
        // Selecionar todo o texto
        const range = document.createRange();
        range.selectNodeContents(title);
        const selection = window.getSelection();
        selection.removeAllRanges();
        selection.addRange(range);
        
        const finishEdit = () => {
            title.contentEditable = false;
            const newName = title.textContent.trim();
            
            if (newName && newName !== currentName) {
                this.classData.name = newName;
                this.systemWeaver.addToUndoStack('rename_class', {
                    id: this.classData.id,
                    oldName: currentName,
                    newName: newName
                });
                this.systemWeaver.render();
            } else {
                title.textContent = currentName;
            }
        };
        
        title.addEventListener('blur', finishEdit, { once: true });
        title.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                title.blur();
            } else if (e.key === 'Escape') {
                title.textContent = currentName;
                title.blur();
            }
        }, { once: true });
    }
    
    showContextMenu(x, y) {
        // TODO: Implementar menu de contexto
        console.log('Context menu at', x, y);
    }
    
    saveCollapsedState(panelId, collapsed) {
        // Salvar estado dos painéis colapsados
        if (!this.classData.panelStates) {
            this.classData.panelStates = {};
        }
        this.classData.panelStates[panelId] = { collapsed };
    }
    
    isBaseModelFunction(funcName) {
        const baseFunctions = [
            '_ready', '_process', '_physics_process', '_input', '_unhandled_input',
            '_draw', '_notification', '_enter_tree', '_exit_tree', '_get_configuration_warning'
        ];
        return baseFunctions.includes(funcName);
    }
    
    // Métodos de atualização
    updatePosition(x, y) {
        this.classData.position = { x, y };
        if (this.element) {
            this.element.style.transform = `translate(${x}px, ${y}px)`;
        }
    }
    
    updateData(newData) {
        this.classData = { ...this.classData, ...newData };
        if (this.element) {
            this.element.innerHTML = this.generateHTML();
            this.setupEventListeners();
        }
    }
    
    highlight(highlight = true) {
        if (this.element) {
            this.element.classList.toggle('highlighted', highlight);
        }
    }
    
    select(selected = true) {
        if (this.element) {
            this.element.classList.toggle('selected', selected);
        }
    }
    
    // Cleanup
    destroy() {
        if (this.element) {
            this.element.remove();
            this.element = null;
        }
        this.connections.clear();
    }
}

// Export para uso global
window.ClassCard = ClassCard;

