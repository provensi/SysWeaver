# SystemWeaver - Game Architecture Designer

Uma ferramenta visual moderna para design de arquitetura de jogos que gera projetos completos do Godot.

## 🎯 Características Principais

### ✨ Interface Visual Moderna
- **Cards MTG-Style**: Interface inspirada em cartas de Magic: The Gathering
- **Design Responsivo**: Funciona perfeitamente em desktop e mobile
- **Animações Suaves**: Micro-interações e transições elegantes
- **Cores por Tipo**: Cada tipo de classe tem sua própria cor distintiva

### 🎨 Tipos de Classe Suportados
- **Classe Normal** (cinza): Classes padrão do jogo
- **Classe Abstrata** (roxo): Classes base para herança
- **Interface** (azul): Contratos e definições de comportamento
- **Componente** (verde): Sistemas modulares reutilizáveis
- **Classe Global** (laranja): Singletons e autoloads

### 🔧 Painéis de Propriedades (11 painéis conforme especificação)
1. **Sinais** - Eventos e comunicação entre objetos
2. **Constantes** - Valores imutáveis da classe
3. **Enums** - Enumerações e tipos customizados
4. **Dicionários** - Estruturas de dados chave-valor
5. **Flags** - Propriedades booleanas com prefixo `is_`
6. **Props Atuais** - Propriedades com prefixo `cur_`
7. **Props Interface** - Propriedades definidas por interfaces
8. **Props Únicas** - Propriedades específicas da classe
9. **Funções** - Métodos e comportamentos
10. **Componentes** - Sistema de componentes (quando aplicável)

### 🚀 Funcionalidades Avançadas
- **Sistema de Filtros**: Visualize apenas os tipos de classe desejados
- **Múltiplas Visualizações**: Classes, Instâncias, Atividades, Sistemas
- **Painéis Colapsáveis**: Minimize painéis para economizar espaço
- **Drag & Drop**: Mova cards livremente pelo canvas
- **Edição Inline**: Renomeie classes com duplo-clique ou F2
- **Sidebar de Propriedades**: Edite detalhes das classes selecionadas

### 📦 Sistema de Exportação
- **Exportação Completa**: Gera projetos Godot prontos para uso
- **Validação Automática**: Verifica dependências e tipos
- **Estrutura Completa**: Inclui scripts, scenes, autoloads e configurações
- **DSL Compacta**: Formato interno otimizado para armazenamento

## 🛠️ Tecnologias Utilizadas

- **HTML5/CSS3/JavaScript**: Aplicação web pura, sem dependências
- **Monaco Editor**: Editor de código integrado (carregado via CDN)
- **Font Awesome**: Ícones modernos e consistentes
- **Google Fonts**: Tipografia profissional (Inter + JetBrains Mono)

## 📁 Estrutura de Arquivos

```
systemweaver-standalone/
├── index.html              # Arquivo principal da aplicação
├── styles.css              # Estilos CSS modernos
├── app.js                  # Lógica principal da aplicação
├── class-card.js           # Gerenciamento de cards de classe
├── dsl-parser.js           # Parser e gerador DSL/GDScript
├── godot-exporter.js       # Sistema de exportação para Godot
└── README.md               # Esta documentação
```

## 🚀 Como Usar

### Instalação
1. Baixe todos os arquivos para uma pasta
2. Abra `index.html` em qualquer navegador moderno
3. Pronto! Não há dependências para instalar

### Criando Classes
1. Clique no botão **"Nova Classe"** ou no **FAB** (botão flutuante)
2. Preencha o nome, tipo, classe pai e interfaces
3. Clique em **"Criar Classe"**

### Editando Propriedades
1. Clique em qualquer card para selecioná-lo
2. Use o sidebar de propriedades para editar detalhes
3. Ou clique nos botões **"Adicionar"** em cada painel

### Organizando o Projeto
- **Arraste** cards para reorganizar o layout
- Use os **filtros** no header para mostrar/ocultar tipos
- **Minimize painéis** clicando no cabeçalho
- Alterne entre **visualizações** usando as abas

### Exportando para Godot
1. Clique em **"Exportar Godot"** no header
2. O sistema validará o projeto automaticamente
3. Um arquivo ZIP será baixado com o projeto completo
4. Extraia e abra no Godot Engine 4.2+

## 🎮 Exemplos Incluídos

A aplicação vem com classes de exemplo:

- **Player** (Classe Normal): Personagem jogável com movimento e vida
- **Enemy** (Classe Abstrata): Base para diferentes tipos de inimigos
- **IMovable** (Interface): Contrato para objetos que se movem
- **IDamageable** (Interface): Contrato para objetos que recebem dano

## 🔧 Funcionalidades Técnicas

### DSL (Domain Specific Language)
Formato compacto para armazenamento:
```
Cl'Player'CharacterBody2D'IMovable,IDamageable;sg'health_changed,died''new_health:int,;fn'_ready,take_damage''void,void
```

### Geração de GDScript
Converte automaticamente para código Godot:
```gdscript
class_name Player
extends CharacterBody2D

signal health_changed(new_health: int)
signal died()

var cur_health: int = 100

func _ready():
    # Inicialização do player
    pass

func take_damage(amount: int) -> void:
    # Receber dano
    pass
```

### Validação de Projeto
- Verifica dependências entre classes
- Valida tipos customizados
- Detecta referências circulares
- Sugere correções automáticas

## 🎨 Personalização Visual

### Cores dos Cards
- **Normal**: Gradiente cinza escuro
- **Abstrata**: Gradiente roxo vibrante
- **Interface**: Gradiente azul ciano
- **Componente**: Gradiente verde esmeralda
- **Global**: Gradiente laranja dourado

### Temas
- **Dark Theme**: Tema escuro moderno (padrão)
- **Responsive**: Adapta-se automaticamente ao tamanho da tela
- **Animations**: Transições suaves e micro-interações

## 🔮 Funcionalidades Futuras

- [ ] Sistema de conexões visuais entre classes
- [ ] Editor de código Monaco integrado
- [ ] Sistema de undo/redo completo
- [ ] Importação de projetos Godot existentes
- [ ] Templates de projeto pré-configurados
- [ ] Sistema de plugins e extensões
- [ ] Colaboração em tempo real
- [ ] Versionamento de projetos

## 📝 Licença

Este projeto é open source e está disponível sob a licença MIT.

## 🤝 Contribuindo

Contribuições são bem-vindas! Sinta-se à vontade para:
- Reportar bugs
- Sugerir novas funcionalidades
- Melhorar a documentação
- Enviar pull requests

## 📞 Suporte

Para dúvidas, sugestões ou problemas:
- Abra uma issue no repositório
- Entre em contato com a equipe de desenvolvimento

---

**SystemWeaver v1.0.0** - Criado com ❤️ para a comunidade de desenvolvimento de jogos

