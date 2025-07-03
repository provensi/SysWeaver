// DSL Parser para SystemWeaver
// Formato: Cl'Name'Parent'Interfaces;cv'vars''types;sg'signals''params;fn'funcs''returns

class DSLParser {
    constructor() {
        this.version = '1.0.0';
    }
    
    // Parse DSL string para objeto de classe
    parseClass(dslString) {
        try {
            const sections = dslString.split(';');
            const classData = {
                id: this.generateId(),
                signals: [],
                constants: [],
                enums: [],
                dictionaries: [],
                flags: [],
                currentProps: [],
                interfaceProps: [],
                uniqueProps: [],
                functions: [],
                components: [],
                position: { x: 0, y: 0 }
            };
            
            sections.forEach(section => {
                if (section.startsWith('Cl\'')) {
                    this.parseClassHeader(section, classData);
                } else if (section.startsWith('cv\'')) {
                    this.parseClassVars(section, classData);
                } else if (section.startsWith('sg\'')) {
                    this.parseSignals(section, classData);
                } else if (section.startsWith('fn\'')) {
                    this.parseFunctions(section, classData);
                } else if (section.startsWith('cn\'')) {
                    this.parseConstants(section, classData);
                } else if (section.startsWith('en\'')) {
                    this.parseEnums(section, classData);
                } else if (section.startsWith('fl\'')) {
                    this.parseFlags(section, classData);
                } else if (section.startsWith('cp\'')) {
                    this.parseCurrentProps(section, classData);
                } else if (section.startsWith('ip\'')) {
                    this.parseInterfaceProps(section, classData);
                } else if (section.startsWith('up\'')) {
                    this.parseUniqueProps(section, classData);
                } else if (section.startsWith('cm\'')) {
                    this.parseComponents(section, classData);
                }
            });
            
            return classData;
        } catch (error) {
            console.error('Erro ao fazer parse da DSL:', error);
            return null;
        }
    }
    
    parseClassHeader(section, classData) {
        // Cl'Name'Parent'Interfaces
        const parts = section.split('\'');
        if (parts.length >= 2) {
            classData.name = parts[1];
        }
        if (parts.length >= 3 && parts[2]) {
            classData.parent = parts[2];
        }
        if (parts.length >= 4 && parts[3]) {
            classData.interfaces = parts[3].split(',').map(s => s.trim()).filter(s => s);
        }
        
        // Determinar tipo baseado no nome e interfaces
        if (classData.name.startsWith('I') && classData.name.length > 1 && classData.name[1] === classData.name[1].toUpperCase()) {
            classData.type = 'interface';
        } else if (classData.name.endsWith('Component')) {
            classData.type = 'component';
        } else if (classData.name.startsWith('Global')) {
            classData.type = 'global';
        } else {
            classData.type = 'normal';
        }
    }
    
    parseClassVars(section, classData) {
        // cv'vars''types
        const parts = section.split('\'\'');
        if (parts.length >= 2) {
            const vars = parts[0].substring(3).split(','); // Remove 'cv'
            const types = parts[1].split(',');
            
            for (let i = 0; i < vars.length && i < types.length; i++) {
                if (vars[i] && types[i]) {
                    classData.uniqueProps.push({
                        name: vars[i].trim(),
                        type: types[i].trim(),
                        default: this.getDefaultValue(types[i].trim())
                    });
                }
            }
        }
    }
    
    parseSignals(section, classData) {
        // sg'signals''params
        const parts = section.split('\'\'');
        if (parts.length >= 2) {
            const signals = parts[0].substring(3).split(','); // Remove 'sg'
            const params = parts[1].split('|');
            
            for (let i = 0; i < signals.length; i++) {
                if (signals[i]) {
                    classData.signals.push({
                        name: signals[i].trim(),
                        params: params[i] ? params[i].split(',').map(s => s.trim()).filter(s => s) : []
                    });
                }
            }
        }
    }
    
    parseFunctions(section, classData) {
        // fn'funcs''returns
        const parts = section.split('\'\'');
        if (parts.length >= 2) {
            const funcs = parts[0].substring(3).split(','); // Remove 'fn'
            const returns = parts[1].split(',');
            
            for (let i = 0; i < funcs.length; i++) {
                if (funcs[i]) {
                    const funcName = funcs[i].trim();
                    const returnType = returns[i] ? returns[i].trim() : 'void';
                    
                    classData.functions.push({
                        name: funcName,
                        params: [],
                        returnType: returnType,
                        code: `# Implementar ${funcName}`
                    });
                }
            }
        }
    }
    
    parseConstants(section, classData) {
        // cn'names''types''values
        const parts = section.split('\'\'');
        if (parts.length >= 3) {
            const names = parts[0].substring(3).split(','); // Remove 'cn'
            const types = parts[1].split(',');
            const values = parts[2].split(',');
            
            for (let i = 0; i < names.length; i++) {
                if (names[i]) {
                    classData.constants.push({
                        name: names[i].trim(),
                        type: types[i] ? types[i].trim() : 'var',
                        value: values[i] ? values[i].trim() : '0'
                    });
                }
            }
        }
    }
    
    parseEnums(section, classData) {
        // en'enumName''values
        const parts = section.split('\'\'');
        if (parts.length >= 2) {
            const enumName = parts[0].substring(3); // Remove 'en'
            const values = parts[1].split(',').map(s => s.trim()).filter(s => s);
            
            if (enumName && values.length > 0) {
                classData.enums.push({
                    name: enumName.trim(),
                    values: values
                });
            }
        }
    }
    
    parseFlags(section, classData) {
        // fl'flags''types''defaults
        const parts = section.split('\'\'');
        if (parts.length >= 3) {
            const flags = parts[0].substring(3).split(','); // Remove 'fl'
            const types = parts[1].split(',');
            const defaults = parts[2].split(',');
            
            for (let i = 0; i < flags.length; i++) {
                if (flags[i]) {
                    classData.flags.push({
                        name: flags[i].trim(),
                        type: types[i] ? types[i].trim() : 'bool',
                        default: defaults[i] ? defaults[i].trim() : 'false'
                    });
                }
            }
        }
    }
    
    parseCurrentProps(section, classData) {
        // cp'props''types''defaults
        const parts = section.split('\'\'');
        if (parts.length >= 3) {
            const props = parts[0].substring(3).split(','); // Remove 'cp'
            const types = parts[1].split(',');
            const defaults = parts[2].split(',');
            
            for (let i = 0; i < props.length; i++) {
                if (props[i]) {
                    classData.currentProps.push({
                        name: props[i].trim(),
                        type: types[i] ? types[i].trim() : 'var',
                        default: defaults[i] ? defaults[i].trim() : this.getDefaultValue(types[i])
                    });
                }
            }
        }
    }
    
    parseInterfaceProps(section, classData) {
        // ip'props''types
        const parts = section.split('\'\'');
        if (parts.length >= 2) {
            const props = parts[0].substring(3).split(','); // Remove 'ip'
            const types = parts[1].split(',');
            
            for (let i = 0; i < props.length; i++) {
                if (props[i]) {
                    classData.interfaceProps.push({
                        name: props[i].trim(),
                        type: types[i] ? types[i].trim() : 'var'
                    });
                }
            }
        }
    }
    
    parseUniqueProps(section, classData) {
        // up'props''types''defaults
        const parts = section.split('\'\'');
        if (parts.length >= 3) {
            const props = parts[0].substring(3).split(','); // Remove 'up'
            const types = parts[1].split(',');
            const defaults = parts[2].split(',');
            
            for (let i = 0; i < props.length; i++) {
                if (props[i]) {
                    classData.uniqueProps.push({
                        name: props[i].trim(),
                        type: types[i] ? types[i].trim() : 'var',
                        default: defaults[i] ? defaults[i].trim() : this.getDefaultValue(types[i])
                    });
                }
            }
        }
    }
    
    parseComponents(section, classData) {
        // cm'components''types
        const parts = section.split('\'\'');
        if (parts.length >= 2) {
            const components = parts[0].substring(3).split(','); // Remove 'cm'
            const types = parts[1].split(',');
            
            for (let i = 0; i < components.length; i++) {
                if (components[i]) {
                    classData.components.push({
                        name: components[i].trim(),
                        type: types[i] ? types[i].trim() : 'Component'
                    });
                }
            }
            
            if (classData.components.length > 0) {
                classData.hasComponents = true;
            }
        }
    }
    
    // Gerar DSL string a partir de objeto de classe
    generateDSL(classData) {
        const sections = [];
        
        // Class header
        let classHeader = `Cl'${classData.name}'`;
        if (classData.parent) {
            classHeader += `${classData.parent}'`;
        } else {
            classHeader += `'`;
        }
        if (classData.interfaces && classData.interfaces.length > 0) {
            classHeader += classData.interfaces.join(',');
        }
        sections.push(classHeader);
        
        // Constants
        if (classData.constants && classData.constants.length > 0) {
            const names = classData.constants.map(c => c.name).join(',');
            const types = classData.constants.map(c => c.type).join(',');
            const values = classData.constants.map(c => c.value).join(',');
            sections.push(`cn'${names}''${types}''${values}`);
        }
        
        // Enums
        if (classData.enums && classData.enums.length > 0) {
            classData.enums.forEach(enumData => {
                sections.push(`en'${enumData.name}''${enumData.values.join(',')}`);
            });
        }
        
        // Flags
        if (classData.flags && classData.flags.length > 0) {
            const names = classData.flags.map(f => f.name).join(',');
            const types = classData.flags.map(f => f.type).join(',');
            const defaults = classData.flags.map(f => f.default).join(',');
            sections.push(`fl'${names}''${types}''${defaults}`);
        }
        
        // Current Props
        if (classData.currentProps && classData.currentProps.length > 0) {
            const names = classData.currentProps.map(p => p.name).join(',');
            const types = classData.currentProps.map(p => p.type).join(',');
            const defaults = classData.currentProps.map(p => p.default).join(',');
            sections.push(`cp'${names}''${types}''${defaults}`);
        }
        
        // Interface Props
        if (classData.interfaceProps && classData.interfaceProps.length > 0) {
            const names = classData.interfaceProps.map(p => p.name).join(',');
            const types = classData.interfaceProps.map(p => p.type).join(',');
            sections.push(`ip'${names}''${types}`);
        }
        
        // Unique Props
        if (classData.uniqueProps && classData.uniqueProps.length > 0) {
            const names = classData.uniqueProps.map(p => p.name).join(',');
            const types = classData.uniqueProps.map(p => p.type).join(',');
            const defaults = classData.uniqueProps.map(p => p.default || this.getDefaultValue(p.type)).join(',');
            sections.push(`up'${names}''${types}''${defaults}`);
        }
        
        // Signals
        if (classData.signals && classData.signals.length > 0) {
            const names = classData.signals.map(s => s.name).join(',');
            const params = classData.signals.map(s => s.params.join(',')).join('|');
            sections.push(`sg'${names}''${params}`);
        }
        
        // Functions
        if (classData.functions && classData.functions.length > 0) {
            const names = classData.functions.map(f => f.name).join(',');
            const returns = classData.functions.map(f => f.returnType).join(',');
            sections.push(`fn'${names}''${returns}`);
        }
        
        // Components
        if (classData.components && classData.components.length > 0) {
            const names = classData.components.map(c => c.name).join(',');
            const types = classData.components.map(c => c.type).join(',');
            sections.push(`cm'${names}''${types}`);
        }
        
        return sections.join(';');
    }
    
    // Gerar GDScript a partir de objeto de classe
    generateGDScript(classData) {
        let script = '';
        
        // Class declaration
        if (classData.type === 'interface') {
            script += `# Interface ${classData.name}\n`;
            script += `# This is an interface definition - implement in concrete classes\n\n`;
        } else {
            script += `class_name ${classData.name}\n`;
            if (classData.parent) {
                script += `extends ${classData.parent}\n`;
            }
            script += '\n';
        }
        
        // Signals
        if (classData.signals && classData.signals.length > 0) {
            script += '# Signals\n';
            classData.signals.forEach(signal => {
                script += `signal ${signal.name}`;
                if (signal.params && signal.params.length > 0) {
                    script += `(${signal.params.join(', ')})`;
                }
                script += '\n';
            });
            script += '\n';
        }
        
        // Constants
        if (classData.constants && classData.constants.length > 0) {
            script += '# Constants\n';
            classData.constants.forEach(constant => {
                script += `const ${constant.name}: ${constant.type} = ${constant.value}\n`;
            });
            script += '\n';
        }
        
        // Enums
        if (classData.enums && classData.enums.length > 0) {
            script += '# Enums\n';
            classData.enums.forEach(enumData => {
                script += `enum ${enumData.name} {\n`;
                enumData.values.forEach((value, index) => {
                    script += `\t${value}${index < enumData.values.length - 1 ? ',' : ''}\n`;
                });
                script += '}\n';
            });
            script += '\n';
        }
        
        // Variables
        const allProps = [
            ...(classData.flags || []),
            ...(classData.currentProps || []),
            ...(classData.interfaceProps || []),
            ...(classData.uniqueProps || [])
        ];
        
        if (allProps.length > 0) {
            script += '# Variables\n';
            allProps.forEach(prop => {
                script += `var ${prop.name}: ${prop.type}`;
                if (prop.default !== undefined) {
                    script += ` = ${prop.default}`;
                }
                script += '\n';
            });
            script += '\n';
        }
        
        // Functions
        if (classData.functions && classData.functions.length > 0) {
            script += '# Functions\n';
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
    
    // Utility methods
    getDefaultValue(type) {
        const defaults = {
            'int': '0',
            'float': '0.0',
            'bool': 'false',
            'String': '""',
            'Vector2': 'Vector2.ZERO',
            'Vector3': 'Vector3.ZERO',
            'Color': 'Color.WHITE',
            'Array': '[]',
            'Dictionary': '{}'
        };
        
        return defaults[type] || 'null';
    }
    
    generateId() {
        return 'dsl_' + Math.random().toString(36).substr(2, 9);
    }
    
    // Validar DSL
    validateDSL(dslString) {
        try {
            const parsed = this.parseClass(dslString);
            return {
                valid: parsed !== null,
                errors: parsed === null ? ['Erro de sintaxe na DSL'] : [],
                warnings: []
            };
        } catch (error) {
            return {
                valid: false,
                errors: [error.message],
                warnings: []
            };
        }
    }
    
    // Comprimir DSL (remover espaços desnecessários)
    compressDSL(dslString) {
        return dslString
            .replace(/\s+/g, ' ')
            .replace(/\s*;\s*/g, ';')
            .replace(/\s*'\s*/g, "'")
            .trim();
    }
    
    // Expandir DSL (adicionar espaços para legibilidade)
    expandDSL(dslString) {
        return dslString
            .replace(/;/g, ';\n')
            .replace(/''/g, "' '")
            .replace(/'/g, " ' ");
    }
}

// Export para uso global
window.DSLParser = DSLParser;

