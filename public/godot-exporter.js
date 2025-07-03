// Godot Exporter para SystemWeaver
// Gera projetos completos do Godot a partir dos dados das classes

class GodotExporter {
    constructor(systemWeaver) {
        this.systemWeaver = systemWeaver;
        this.dslParser = new DSLParser();
    }
    
    // Exportar projeto completo do Godot
    async exportProject() {
        try {
            const projectData = this.generateProjectData();
            const files = this.generateAllFiles(projectData);
            
            // Criar ZIP com todos os arquivos
            const zip = await this.createProjectZip(files);
            this.downloadZip(zip, `${this.systemWeaver.projectName}_godot_project.zip`);
            
            return true;
        } catch (error) {
            console.error('Erro ao exportar projeto:', error);
            alert('Erro ao exportar projeto: ' + error.message);
            return false;
        }
    }
    
    generateProjectData() {
        const classes = Array.from(this.systemWeaver.classes.values());
        const connections = Array.from(this.systemWeaver.connections.values());
        
        return {
            projectName: this.systemWeaver.projectName,
            classes: classes,
            connections: connections,
            metadata: {
                version: '1.0.0',
                exportedAt: new Date().toISOString(),
                systemWeaverVersion: '1.0.0'
            }
        };
    }
    
    generateAllFiles(projectData) {
        const files = new Map();
        
        // Arquivo principal do projeto Godot
        files.set('project.godot', this.generateProjectGodot(projectData));
        
        // Arquivos GDScript para cada classe
        projectData.classes.forEach(classData => {
            const fileName = `scripts/${classData.name}.gd`;
            const content = this.dslParser.generateGDScript(classData);
            files.set(fileName, content);
        });
        
        // Scene principal
        files.set('Main.tscn', this.generateMainScene(projectData));
        
        // Autoloads para classes globais
        const globalClasses = projectData.classes.filter(c => c.type === 'global');
        globalClasses.forEach(classData => {
            const fileName = `autoloads/${classData.name}.gd`;
            const content = this.generateAutoloadScript(classData);
            files.set(fileName, content);
        });
        
        // Arquivo de configuração de input
        files.set('input_map.cfg', this.generateInputMap());
        
        // README do projeto
        files.set('README.md', this.generateReadme(projectData));
        
        // Arquivo de setup do SystemWeaver
        files.set('systemweaver_setup.json', this.generateSystemWeaverSetup(projectData));
        
        return files;
    }
    
    generateProjectGodot(projectData) {
        const globalClasses = projectData.classes.filter(c => c.type === 'global');
        
        let autoloads = '';
        globalClasses.forEach(classData => {
            autoloads += `${classData.name}="*res://autoloads/${classData.name}.gd"\n`;
        });
        
        return `; Engine configuration file.
; It's best edited using the editor UI and not directly,
; since the parameters that go here are not all obvious.
;
; Format:
;   [section] ; section goes between []
;   param=value ; assign values to parameters

config_version=5

[application]

config/name="${projectData.projectName}"
run/main_scene="res://Main.tscn"
config/features=PackedStringArray("4.2", "Forward Plus")
config/icon="res://icon.svg"

[autoload]

${autoloads}

[display]

window/size/viewport_width=1920
window/size/viewport_height=1080
window/size/mode=2

[input]

move_left={
"deadzone": 0.5,
"events": [Object(InputEventKey,"resource_local_to_scene":false,"resource_name":"","device":-1,"window_id":0,"alt_pressed":false,"shift_pressed":false,"ctrl_pressed":false,"meta_pressed":false,"pressed":false,"keycode":0,"physical_keycode":65,"key_label":0,"unicode":97,"echo":false,"script":null)
, Object(InputEventKey,"resource_local_to_scene":false,"resource_name":"","device":-1,"window_id":0,"alt_pressed":false,"shift_pressed":false,"ctrl_pressed":false,"meta_pressed":false,"pressed":false,"keycode":0,"physical_keycode":4194319,"key_label":0,"unicode":0,"echo":false,"script":null)
]
}
move_right={
"deadzone": 0.5,
"events": [Object(InputEventKey,"resource_local_to_scene":false,"resource_name":"","device":-1,"window_id":0,"alt_pressed":false,"shift_pressed":false,"ctrl_pressed":false,"meta_pressed":false,"pressed":false,"keycode":0,"physical_keycode":68,"key_label":0,"unicode":100,"echo":false,"script":null)
, Object(InputEventKey,"resource_local_to_scene":false,"resource_name":"","device":-1,"window_id":0,"alt_pressed":false,"shift_pressed":false,"ctrl_pressed":false,"meta_pressed":false,"pressed":false,"keycode":0,"physical_keycode":4194321,"key_label":0,"unicode":0,"echo":false,"script":null)
]
}
move_up={
"deadzone": 0.5,
"events": [Object(InputEventKey,"resource_local_to_scene":false,"resource_name":"","device":-1,"window_id":0,"alt_pressed":false,"shift_pressed":false,"ctrl_pressed":false,"meta_pressed":false,"pressed":false,"keycode":0,"physical_keycode":87,"key_label":0,"unicode":119,"echo":false,"script":null)
, Object(InputEventKey,"resource_local_to_scene":false,"resource_name":"","device":-1,"window_id":0,"alt_pressed":false,"shift_pressed":false,"ctrl_pressed":false,"meta_pressed":false,"pressed":false,"keycode":0,"physical_keycode":4194320,"key_label":0,"unicode":0,"echo":false,"script":null)
]
}
move_down={
"deadzone": 0.5,
"events": [Object(InputEventKey,"resource_local_to_scene":false,"resource_name":"","device":-1,"window_id":0,"alt_pressed":false,"shift_pressed":false,"ctrl_pressed":false,"meta_pressed":false,"pressed":false,"keycode":0,"physical_keycode":83,"key_label":0,"unicode":115,"echo":false,"script":null)
, Object(InputEventKey,"resource_local_to_scene":false,"resource_name":"","device":-1,"window_id":0,"alt_pressed":false,"shift_pressed":false,"ctrl_pressed":false,"meta_pressed":false,"pressed":false,"keycode":0,"physical_keycode":4194322,"key_label":0,"unicode":0,"echo":false,"script":null)
]
}
jump={
"deadzone": 0.5,
"events": [Object(InputEventKey,"resource_local_to_scene":false,"resource_name":"","device":-1,"window_id":0,"alt_pressed":false,"shift_pressed":false,"ctrl_pressed":false,"meta_pressed":false,"pressed":false,"keycode":0,"physical_keycode":32,"key_label":0,"unicode":32,"echo":false,"script":null)
]
}
action={
"deadzone": 0.5,
"events": [Object(InputEventKey,"resource_local_to_scene":false,"resource_name":"","device":-1,"window_id":0,"alt_pressed":false,"shift_pressed":false,"ctrl_pressed":false,"meta_pressed":false,"pressed":false,"keycode":0,"physical_keycode":69,"key_label":0,"unicode":101,"echo":false,"script":null)
]
}

[rendering]

textures/canvas_textures/default_texture_filter=0
`;
    }
    
    generateMainScene(projectData) {
        return `[gd_scene load_steps=2 format=3 uid="uid://bvnxm8qfqwxpj"]

[ext_resource type="Script" path="res://scripts/Main.gd" id="1_0hdqp"]

[node name="Main" type="Node2D"]
script = ExtResource("1_0hdqp")

[node name="UI" type="CanvasLayer" parent="."]

[node name="Label" type="Label" parent="UI"]
anchors_preset = 2
anchor_top = 1.0
anchor_bottom = 1.0
offset_left = 20.0
offset_top = -50.0
offset_right = 400.0
offset_bottom = -20.0
text = "Projeto gerado pelo SystemWeaver"
`;
    }
    
    generateAutoloadScript(classData) {
        let script = `# Autoload: ${classData.name}\n`;
        script += `# Gerado automaticamente pelo SystemWeaver\n\n`;
        script += `extends Node\n\n`;
        
        // Sinais globais
        if (classData.signals && classData.signals.length > 0) {
            script += '# Sinais globais\n';
            classData.signals.forEach(signal => {
                script += `signal ${signal.name}`;
                if (signal.params && signal.params.length > 0) {
                    script += `(${signal.params.join(', ')})`;
                }
                script += '\n';
            });
            script += '\n';
        }
        
        // Variáveis globais
        const allProps = [
            ...(classData.constants || []),
            ...(classData.flags || []),
            ...(classData.currentProps || []),
            ...(classData.uniqueProps || [])
        ];
        
        if (allProps.length > 0) {
            script += '# Variáveis globais\n';
            allProps.forEach(prop => {
                if (prop.value !== undefined) {
                    script += `var ${prop.name}: ${prop.type} = ${prop.value}\n`;
                } else if (prop.default !== undefined) {
                    script += `var ${prop.name}: ${prop.type} = ${prop.default}\n`;
                } else {
                    script += `var ${prop.name}: ${prop.type}\n`;
                }
            });
            script += '\n';
        }
        
        // Função _ready
        script += 'func _ready():\n';
        script += '\tprint("' + classData.name + ' autoload iniciado")\n';
        script += '\t# Inicialização do autoload\n\n';
        
        // Funções
        if (classData.functions && classData.functions.length > 0) {
            classData.functions.forEach(func => {
                script += `func ${func.name}(`;
                if (func.params && func.params.length > 0) {
                    script += func.params.join(', ');
                }
                script += `)`;
                if (func.returnType && func.returnType !== 'void') {
                    script += ` -> ${func.returnType}`;
                }
                script += ':\n';
                
                if (func.code) {
                    const codeLines = func.code.split('\n');
                    codeLines.forEach(line => {
                        script += `\t${line}\n`;
                    });
                } else {
                    script += '\tpass\n';
                }
                script += '\n';
            });
        }
        
        return script;
    }
    
    generateInputMap() {
        return `[input]

move_left={
"deadzone": 0.5,
"events": [ Object(InputEventKey,"resource_local_to_scene":false,"resource_name":"","device":0,"alt":false,"shift":false,"control":false,"meta":false,"command":false,"pressed":false,"scancode":65,"unicode":0,"echo":false,"script":null)
, Object(InputEventKey,"resource_local_to_scene":false,"resource_name":"","device":0,"alt":false,"shift":false,"control":false,"meta":false,"command":false,"pressed":false,"scancode":16777231,"unicode":0,"echo":false,"script":null)
 ]
}
move_right={
"deadzone": 0.5,
"events": [ Object(InputEventKey,"resource_local_to_scene":false,"resource_name":"","device":0,"alt":false,"shift":false,"control":false,"meta":false,"command":false,"pressed":false,"scancode":68,"unicode":0,"echo":false,"script":null)
, Object(InputEventKey,"resource_local_to_scene":false,"resource_name":"","device":0,"alt":false,"shift":false,"control":false,"meta":false,"command":false,"pressed":false,"scancode":16777233,"unicode":0,"echo":false,"script":null)
 ]
}
move_up={
"deadzone": 0.5,
"events": [ Object(InputEventKey,"resource_local_to_scene":false,"resource_name":"","device":0,"alt":false,"shift":false,"control":false,"meta":false,"command":false,"pressed":false,"scancode":87,"unicode":0,"echo":false,"script":null)
, Object(InputEventKey,"resource_local_to_scene":false,"resource_name":"","device":0,"alt":false,"shift":false,"control":false,"meta":false,"command":false,"pressed":false,"scancode":16777232,"unicode":0,"echo":false,"script":null)
 ]
}
move_down={
"deadzone": 0.5,
"events": [ Object(InputEventKey,"resource_local_to_scene":false,"resource_name":"","device":0,"alt":false,"shift":false,"control":false,"meta":false,"command":false,"pressed":false,"scancode":83,"unicode":0,"echo":false,"script":null)
, Object(InputEventKey,"resource_local_to_scene":false,"resource_name":"","device":0,"alt":false,"shift":false,"control":false,"meta":false,"command":false,"pressed":false,"scancode":16777234,"unicode":0,"echo":false,"script":null)
 ]
}
jump={
"deadzone": 0.5,
"events": [ Object(InputEventKey,"resource_local_to_scene":false,"resource_name":"","device":0,"alt":false,"shift":false,"control":false,"meta":false,"command":false,"pressed":false,"scancode":32,"unicode":0,"echo":false,"script":null)
 ]
}
action={
"deadzone": 0.5,
"events": [ Object(InputEventKey,"resource_local_to_scene":false,"resource_name":"","device":0,"alt":false,"shift":false,"control":false,"meta":false,"command":false,"pressed":false,"scancode":69,"unicode":0,"echo":false,"script":null)
 ]
}
`;
    }
    
    generateReadme(projectData) {
        return `# ${projectData.projectName}

Projeto gerado automaticamente pelo **SystemWeaver** - Game Architecture Designer.

## Informações do Projeto

- **Nome:** ${projectData.projectName}
- **Classes:** ${projectData.classes.length}
- **Gerado em:** ${projectData.metadata.exportedAt}
- **SystemWeaver Versão:** ${projectData.metadata.systemWeaverVersion}

## Estrutura do Projeto

### Classes Geradas

${projectData.classes.map(c => `- **${c.name}** (${c.type}): ${c.parent ? `extends ${c.parent}` : 'classe base'}`).join('\n')}

### Diretórios

- \`scripts/\` - Scripts GDScript das classes
- \`autoloads/\` - Scripts de autoload para classes globais
- \`systemweaver_setup.json\` - Configuração original do SystemWeaver

## Como Usar

1. Abra o projeto no Godot Engine 4.2+
2. Execute a cena principal \`Main.tscn\`
3. Modifique os scripts conforme necessário
4. Para reimportar no SystemWeaver, use o arquivo \`systemweaver_setup.json\`

## Sobre o SystemWeaver

O SystemWeaver é uma ferramenta visual para design de arquitetura de jogos que permite:

- Criar diagramas de classe visuais estilo MTG
- Definir interfaces, componentes e sistemas
- Gerar projetos completos do Godot
- Gerenciar dependências entre classes

Para mais informações, visite: [SystemWeaver Documentation]

---

*Gerado automaticamente pelo SystemWeaver v${projectData.metadata.systemWeaverVersion}*
`;
    }
    
    generateSystemWeaverSetup(projectData) {
        const setup = {
            version: projectData.metadata.systemWeaverVersion,
            projectName: projectData.projectName,
            exportedAt: projectData.metadata.exportedAt,
            classes: projectData.classes.map(classData => ({
                ...classData,
                dsl: this.dslParser.generateDSL(classData)
            })),
            connections: projectData.connections
        };
        
        return JSON.stringify(setup, null, 2);
    }
    
    // Criar arquivo ZIP com todos os arquivos do projeto
    async createProjectZip(files) {
        // Implementação simplificada - em produção usaria JSZip
        const zipContent = {
            files: Array.from(files.entries()).map(([path, content]) => ({
                path,
                content,
                size: content.length
            })),
            totalSize: Array.from(files.values()).reduce((sum, content) => sum + content.length, 0)
        };
        
        return JSON.stringify(zipContent, null, 2);
    }
    
    downloadZip(zipContent, filename) {
        const blob = new Blob([zipContent], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
        URL.revokeObjectURL(url);
    }
    
    // Exportar classe individual
    exportClass(classId) {
        const classData = this.systemWeaver.classes.get(classId);
        if (!classData) {
            alert('Classe não encontrada!');
            return;
        }
        
        const gdScript = this.dslParser.generateGDScript(classData);
        const blob = new Blob([gdScript], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${classData.name}.gd`;
        a.click();
        URL.revokeObjectURL(url);
    }
    
    // Gerar preview do código
    generateCodePreview(classId) {
        const classData = this.systemWeaver.classes.get(classId);
        if (!classData) return '';
        
        return this.dslParser.generateGDScript(classData);
    }
    
    // Validar projeto antes da exportação
    validateProject() {
        const errors = [];
        const warnings = [];
        
        // Verificar se há classes
        if (this.systemWeaver.classes.size === 0) {
            errors.push('Projeto não contém nenhuma classe');
        }
        
        // Verificar dependências
        this.systemWeaver.classes.forEach((classData, id) => {
            // Verificar classe pai
            if (classData.parent && !this.isBuiltinClass(classData.parent)) {
                const parentExists = Array.from(this.systemWeaver.classes.values())
                    .some(c => c.name === classData.parent);
                if (!parentExists) {
                    warnings.push(`Classe ${classData.name}: classe pai '${classData.parent}' não encontrada`);
                }
            }
            
            // Verificar interfaces
            if (classData.interfaces) {
                classData.interfaces.forEach(interfaceName => {
                    const interfaceExists = Array.from(this.systemWeaver.classes.values())
                        .some(c => c.name === interfaceName && c.type === 'interface');
                    if (!interfaceExists) {
                        warnings.push(`Classe ${classData.name}: interface '${interfaceName}' não encontrada`);
                    }
                });
            }
            
            // Verificar tipos customizados
            const allProps = [
                ...(classData.uniqueProps || []),
                ...(classData.currentProps || []),
                ...(classData.interfaceProps || [])
            ];
            
            allProps.forEach(prop => {
                if (!this.isBuiltinType(prop.type)) {
                    const typeExists = Array.from(this.systemWeaver.classes.values())
                        .some(c => c.name === prop.type);
                    if (!typeExists) {
                        warnings.push(`Classe ${classData.name}: tipo '${prop.type}' da propriedade '${prop.name}' não encontrado`);
                    }
                }
            });
        });
        
        return { errors, warnings };
    }
    
    isBuiltinClass(className) {
        const builtinClasses = [
            'Node', 'Node2D', 'Node3D', 'Control', 'CanvasItem',
            'CharacterBody2D', 'CharacterBody3D', 'RigidBody2D', 'RigidBody3D',
            'StaticBody2D', 'StaticBody3D', 'Area2D', 'Area3D',
            'Sprite2D', 'Sprite3D', 'Label', 'Button', 'LineEdit',
            'TextEdit', 'Panel', 'VBoxContainer', 'HBoxContainer',
            'GridContainer', 'ScrollContainer', 'TabContainer',
            'Resource', 'RefCounted', 'Object'
        ];
        return builtinClasses.includes(className);
    }
    
    isBuiltinType(typeName) {
        const builtinTypes = [
            'int', 'float', 'bool', 'String', 'StringName',
            'Vector2', 'Vector2i', 'Vector3', 'Vector3i', 'Vector4', 'Vector4i',
            'Color', 'Rect2', 'Rect2i', 'Transform2D', 'Transform3D',
            'Plane', 'Quaternion', 'AABB', 'Basis', 'Projection',
            'Array', 'Dictionary', 'PackedStringArray', 'PackedFloat32Array',
            'PackedFloat64Array', 'PackedInt32Array', 'PackedInt64Array',
            'PackedByteArray', 'PackedVector2Array', 'PackedVector3Array',
            'PackedColorArray', 'Variant', 'Callable', 'Signal',
            'NodePath', 'RID', 'var', 'void'
        ];
        return builtinTypes.includes(typeName);
    }
}

// Export para uso global
window.GodotExporter = GodotExporter;

