// Canvas Engine para SystemWeaver
class CanvasEngine {
    constructor(containerId) {
        this.viewport = document.getElementById('canvasViewport');
        this.content = document.getElementById('canvasContent');
        this.grid = document.querySelector('.canvas-grid');
        
        this.zoom = 1;
        this.panX = 0;
        this.panY = 0;
        this.isDragging = false;
        this.dragStart = { x: 0, y: 0 };
        this.selectedElements = new Set();
        
        this.setupEventListeners();
        this.updateTransform();
        this.createGrid();
    }
    
    setupEventListeners() {
        // Pan and zoom
        this.viewport.addEventListener('wheel', this.handleWheel.bind(this));
        this.viewport.addEventListener('mousedown', this.handleMouseDown.bind(this));
        this.viewport.addEventListener('mousemove', this.handleMouseMove.bind(this));
        this.viewport.addEventListener('mouseup', this.handleMouseUp.bind(this));
        this.viewport.addEventListener('mouseleave', this.handleMouseUp.bind(this));
        
        // Prevent context menu
        this.viewport.addEventListener('contextmenu', e => e.preventDefault());
        
        // Keyboard shortcuts
        document.addEventListener('keydown', this.handleKeyDown.bind(this));
        
        // Toolbar buttons
        document.getElementById('zoomIn')?.addEventListener('click', () => this.zoomIn());
        document.getElementById('zoomOut')?.addEventListener('click', () => this.zoomOut());
        document.getElementById('resetZoom')?.addEventListener('click', () => this.resetView());
        document.getElementById('toggleGrid')?.addEventListener('click', () => this.toggleGrid());
        document.getElementById('autoLayout')?.addEventListener('click', () => this.autoLayout());
    }
    
    handleWheel(e) {
        e.preventDefault();
        
        const rect = this.viewport.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;
        
        const delta = e.deltaY > 0 ? 0.9 : 1.1;
        const newZoom = Math.max(0.1, Math.min(3, this.zoom * delta));
        
        if (newZoom !== this.zoom) {
            // Zoom towards mouse position
            const factor = newZoom / this.zoom - 1;
            this.panX -= (mouseX - this.panX) * factor;
            this.panY -= (mouseY - this.panY) * factor;
            this.zoom = newZoom;
            
            this.updateTransform();
            this.updateZoomDisplay();
        }
    }
    
    handleMouseDown(e) {
        if (e.button === 1 || (e.button === 0 && e.ctrlKey)) { // Middle mouse or Ctrl+Left
            this.isDragging = true;
            this.dragStart = { x: e.clientX - this.panX, y: e.clientY - this.panY };
            this.viewport.style.cursor = 'grabbing';
            e.preventDefault();
        }
    }
    
    handleMouseMove(e) {
        if (this.isDragging) {
            this.panX = e.clientX - this.dragStart.x;
            this.panY = e.clientY - this.dragStart.y;
            this.updateTransform();
        }
    }
    
    handleMouseUp(e) {
        if (this.isDragging) {
            this.isDragging = false;
            this.viewport.style.cursor = 'default';
        }
    }
    
    handleKeyDown(e) {
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
        
        switch(e.key) {
            case '0':
                if (e.ctrlKey) {
                    e.preventDefault();
                    this.resetView();
                }
                break;
            case '=':
            case '+':
                if (e.ctrlKey) {
                    e.preventDefault();
                    this.zoomIn();
                }
                break;
            case '-':
                if (e.ctrlKey) {
                    e.preventDefault();
                    this.zoomOut();
                }
                break;
        }
    }
    
    updateTransform() {
        this.content.style.transform = `translate(${this.panX}px, ${this.panY}px) scale(${this.zoom})`;
        this.grid.style.transform = `translate(${this.panX}px, ${this.panY}px) scale(${this.zoom})`;
    }
    
    updateZoomDisplay() {
        const zoomDisplay = document.querySelector('.zoom-level');
        if (zoomDisplay) {
            zoomDisplay.textContent = `${Math.round(this.zoom * 100)}%`;
        }
    }
    
    createGrid() {
        const gridSize = 20;
        const gridPattern = `
            <svg width="100%" height="100%" style="position: absolute; top: 0; left: 0;">
                <defs>
                    <pattern id="grid-pattern" width="${gridSize}" height="${gridSize}" patternUnits="userSpaceOnUse">
                        <path d="M ${gridSize} 0 L 0 0 0 ${gridSize}" fill="none" stroke="rgba(255,255,255,0.1)" stroke-width="1"/>
                    </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#grid-pattern)" />
            </svg>
        `;
        
        this.grid.innerHTML = gridPattern;
    }
    
    zoomIn() {
        this.zoom = Math.min(3, this.zoom * 1.2);
        this.updateTransform();
        this.updateZoomDisplay();
    }
    
    zoomOut() {
        this.zoom = Math.max(0.1, this.zoom / 1.2);
        this.updateTransform();
        this.updateZoomDisplay();
    }
    
    resetView() {
        this.zoom = 1;
        this.panX = 0;
        this.panY = 0;
        this.updateTransform();
        this.updateZoomDisplay();
    }
    
    addElement(element, x = 100, y = 100) {
        element.style.position = 'absolute';
        element.style.left = `${x}px`;
        element.style.top = `${y}px`;
        element.classList.add('canvas-element');
        
        this.content.appendChild(element);
        this.makeElementDraggable(element);
        
        return element;
    }
    
    makeElementDraggable(element) {
        let isDragging = false;
        let dragOffset = { x: 0, y: 0 };
        
        element.addEventListener('mousedown', (e) => {
            if (e.button === 0 && !e.ctrlKey) { // Left mouse, no Ctrl
                isDragging = true;
                const rect = element.getBoundingClientRect();
                const contentRect = this.content.getBoundingClientRect();
                
                dragOffset.x = (e.clientX - rect.left) / this.zoom;
                dragOffset.y = (e.clientY - rect.top) / this.zoom;
                
                element.style.zIndex = '1000';
                e.preventDefault();
                e.stopPropagation();
            }
        });
        
        document.addEventListener('mousemove', (e) => {
            if (isDragging) {
                const contentRect = this.content.getBoundingClientRect();
                const x = (e.clientX - contentRect.left) / this.zoom - dragOffset.x;
                const y = (e.clientY - contentRect.top) / this.zoom - dragOffset.y;
                
                element.style.left = `${x}px`;
                element.style.top = `${y}px`;
            }
        });
        
        document.addEventListener('mouseup', () => {
            if (isDragging) {
                isDragging = false;
                element.style.zIndex = '';
            }
        });
    }
    
    getElementPosition(element) {
        return {
            x: parseInt(element.style.left) || 0,
            y: parseInt(element.style.top) || 0
        };
    }
    
    setElementPosition(element, x, y) {
        element.style.left = `${x}px`;
        element.style.top = `${y}px`;
    }
    
    autoLayout() {
        const elements = this.content.querySelectorAll('.canvas-element');
        const cols = Math.ceil(Math.sqrt(elements.length));
        const spacing = 350;
        
        elements.forEach((element, index) => {
            const row = Math.floor(index / cols);
            const col = index % cols;
            
            this.setElementPosition(element, col * spacing + 50, row * spacing + 50);
        });
    }
    
    toggleGrid() {
        this.grid.style.display = this.grid.style.display === 'none' ? 'block' : 'none';
    }
    
    exportLayout() {
        const elements = this.content.querySelectorAll('.canvas-element');
        const layout = {};
        
        elements.forEach(element => {
            const id = element.dataset.id || element.id;
            if (id) {
                layout[id] = this.getElementPosition(element);
            }
        });
        
        return layout;
    }
    
    importLayout(layout) {
        Object.entries(layout).forEach(([id, position]) => {
            const element = this.content.querySelector(`[data-id="${id}"], #${id}`);
            if (element) {
                this.setElementPosition(element, position.x, position.y);
            }
        });
    }
}

