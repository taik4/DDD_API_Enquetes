# 🗳️ Sistema de Enquetes (Pesquisas) - DDD

Um sistema de votação e pesquisa de **Domain-Driven Design (DDD)** implementado em .NET 8, seguindo princípios de arquitetura limpa e demonstrando boas práticas em engenharia de software.

## 📋 Sumário

- [O que é o Sistema?](#-o-que-é-o-sistema)
- [Arquitetura](#-arquitetura)
- [Estrutura de Camadas](#-estrutura-de-camadas)
- [Entidades Principais](#-entidades-principais)
- [API REST - Endpoints](#-api-rest---endpoints)
- [Stack Tecnológico](#-stack-tecnológico)
- [Banco de Dados](#-banco-de-dados)
- [Fluxos de Negócio](#-fluxos-de-negócio)
- [Regras de Negócio](#-regras-de-negócio)
- [Como Usar](#-como-usar)

---

## 🎯 O que é o Sistema?

O **Sistema de Enquetes** é uma aplicação REST API que permite:

✅ **Criar** pesquisas/enquetes com múltiplas opções de resposta  
✅ **Gerenciar** status das enquetes (Rascunho → Publicada → Encerrada)  
✅ **Votar** em enquetes publicadas dentro de um período de votação  
✅ **Visualizar** resultados das votações com porcentagens  
✅ **Editar** enquetes em rascunho ou publicadas  
✅ **Enforçar** regras de negócio no nível de domínio  

### Termos do Negócio (Ubiquitous Language)

| Termo | Significado |
|-------|------------|
| **Enquete** | Uma pesquisa/votação com uma pergunta e múltiplas opções |
| **Opção** | Uma resposta possível para a enquete |
| **Voto** | Um voto de um participante em uma opção |
| **Prazo de Votação** | Período entre início e fim durante o qual votos são aceitos |
| **Status** | Estado da enquete (Rascunho, Publicada, Encerrada) |
| **Publicar** | Transição de Rascunho para Publicada (abre votação) |
| **Encerrar** | Transição para Encerrada (fecha votação) |

---

## 🏗️ Arquitetura

O projeto segue **arquitetura em camadas (Layered Architecture)** com **princípios de Domain-Driven Design**:

```
┌──────────────────────────────────────────────┐
│  02 - CAMADA DE APRESENTAÇÃO (API)           │
│  Enquete.Servicos.Api                        │
│  • Controllers HTTP                          │
│  • Roteamento REST                           │
│  • Validação de entrada                      │
└─────────────────┬──────────────────────────┘
                  │ depende
┌─────────────────▼──────────────────────────┐
│  03 - CAMADA DE APLICAÇÃO                   │
│  Enquete.Aplicacao                          │
│  • Serviços de aplicação                    │
│  • DTOs (Data Transfer Objects)             │
│  • Mapeamento de dados (AutoMapper)         │
│  • Orquestração de casos de uso             │
└─────────────────┬──────────────────────────┘
                  │ depende
┌─────────────────▼──────────────────────────┐
│  04 - CAMADA DE DOMÍNIO                     │
│  Enquete.Dominio                            │
│  • Entidades de negócio                     │
│  • Value Objects                            │
│  • Serviços de domínio                      │
│  • Interfaces de repositório                │
│  • ❌ SEM DEPENDÊNCIAS EXTERNAS             │
└─────────────────┬──────────────────────────┘
                  │ implementado por
┌─────────────────▼──────────────────────────┐
│  05 - CAMADA DE INFRAESTRUTURA              │
│  Enquete.Infra.Data (Dados)                 │
│  Enquete.Infra.IoC (DI)                     │
│  • Repositórios (EF Core)                   │
│  • DbContext (MySQL)                        │
│  • Migrações de banco de dados              │
│  • Configuração de injeção de dependência   │
└──────────────────────────────────────────┘
```

### Regra de Ouro do DDD: Sentido das Dependências

```
✅ PERMITIDO:  Apresentação → Aplicação → Domínio
✅ PERMITIDO:  Infraestrutura → Domínio
✅ PERMITIDO:  Infraestrutura ← IoC → TODAS as camadas
❌ PROIBIDO:   Domínio → Qualquer coisa
❌ PROIBIDO:   Domínio → Banco de dados direto
❌ PROIBIDO:   Domínio → Framework externo
```

**Benefício**: O Domínio (lógica de negócio) é **independente, testável e reutilizável**.

---

## 📁 Estrutura de Camadas

### **02 - Serviços (Apresentação / API)**
```
Enquete.Servicos.Api/
├── Program.cs                 ← Configuração e inicialização
├── Controllers/
│   └── EnqueteController.cs   ← Endpoints REST
└── Propriedades do Projeto
```

**Responsabilidade**: Expor endpoints HTTP, validar entrada, retornar respostas.

---

### **03 - Aplicação**
```
Enquete.Aplicacao/
├── Servicos/
│   ├── ServicosAppBase.cs     ← Base com operações CRUD genéricas
│   └── EnqueteApp.cs          ← Serviço específico de enquetes
├── Interfaces/
│   ├── IAppBase.cs
│   └── IEnqueteApp.cs
├── DTOs/                      ← Objetos de transferência de dados
│   ├── CriarEnqueteDTO.cs
│   ├── EditarEnqueteDTO.cs
│   ├── EnqueteDTO.cs
│   ├── VotarDTO.cs
│   ├── ResultadoEnqueteDTO.cs
│   └── BaseDTO.cs
└── Mapeamentos/
    └── MappingProfile.cs      ← Configuração AutoMapper
```

**Responsabilidade**: Orquestração de casos de uso, conversão Entidade ↔ DTO.

---

### **04 - Domínio (Coração da Aplicação)**
```
Enquete.Dominio/
├── Entidades/
│   ├── EntidadeBase.cs        ← Classe base com ID
│   ├── Enquete.cs             ← Aggregate Root (entidade principal)
│   └── Voto.cs                ← Entidade dentro do agregado
├── ValueObjects/              ← Objetos de valor imutáveis
│   ├── OpcaoDeResposta.cs
│   ├── PrazoDeVotacao.cs
│   └── ResultadoOpcao.cs
├── Enums/
│   └── StatusEnquete.cs       ← Estados possíveis
├── Servicos/
│   ├── ServicoBase.cs
│   └── EnqueteServico.cs      ← Lógica de domínio
└── Interfaces/
    ├── Repositorios/
    │   ├── IRepositorioBase.cs
    │   └── IEnqueteRepositorio.cs
    └── Servicos/
        ├── IServicoBase.cs
        └── IEnqueteServico.cs
```

**Responsabilidade**: Encapsular regras de negócio, manter invariantes.

---

### **05 - Infraestrutura**

#### **Enquete.Infra.Data** (Dados)
```
Enquete.Infra.Data/
├── Contextos/
│   └── EnqueteContexto.cs     ← DbContext (EF Core)
├── Repositorios/
│   ├── RepositorioBase.cs     ← Operações genéricas
│   └── EnqueteRepositorio.cs  ← Operações específicas
├── Mapeamentos/               ← Configuração EF Core Fluent API
│   ├── MapBase.cs
│   ├── EnqueteMap.cs
│   └── VotoMap.cs
└── Migrations/                ← Histórico de esquema do DB
    ├── 20260329023005_InitialCreate.cs
    ├── 20260329023005_InitialCreate.Designer.cs
    └── EnqueteContextoModelSnapshot.cs
```

#### **Enquete.Infra.IoC** (Injeção de Dependência)
```
Enquete.Infra.IoC/
└── InjetorDependencias.cs    ← Registro de serviços no container
```

**Responsabilidade**: Acesso a dados, persistência, configuração de DI.

---

## 🔑 Entidades Principais

### **Enquete** (Aggregate Root - Raiz do Agregado)

Representa uma enquete/pesquisa completa.

```csharp
public class Enquete : EntidadeBase
{
    public string Pergunta { get; private set; }           // Max 500 chars
    public StatusEnquete Status { get; private set; }      // Rascunho|Publicada|Encerrada
    public PrazoDeVotacao Prazo { get; private set; }      // Value Object
    private readonly List<OpcaoDeResposta> _opcoes;        // Opções de resposta
    private readonly List<Voto> _votos;                    // Votos registrados
    
    // Métodos de negócio
    public void Publicar()                                 // Valida e transiciona estado
    public void Encerrar()                                 // Transiciona estado
    public void Votar(Guid participanteId, 
                      OpcaoDeResposta opcao)              // Registra voto com validações
    public void Editar(string pergunta, 
                       PrazoDeVotacao prazo)              // Edita informações
    public IEnumerable<ResultadoOpcao> ObterResultados() // Calcula percentuais
}
```

**Propriedades**:
- `Id`: GUID único
- `Pergunta`: Texto da pergunta (até 500 caracteres)
- `Status`: Um dos 3 estados possíveis
- `Prazo`: Value Object com data/hora início e fim
- `Opcoes`: Coleção de opções de resposta
- `Votos`: Coleção de votos registrados

**Métodos Importantes**:

| Método | Descrição | Validações |
|--------|-----------|-----------|
| `Publicar()` | Abre para votação | Status deve ser Rascunho, deve ter ≥1 opção |
| `Encerrar()` | Encerra votação | Status deve ser Publicada |
| `Votar()` | Registra um voto | Status Publicada, dentro do prazo, opção existe, sem duplicata |
| `Editar()` | Modifica pergunta/prazo | Status não pode ser Encerrada |
| `ObterResultados()` | Calcula resultados | Retorna totais e percentuais por opção |

---

### **Voto** (Entidade Filha)

Representa um voto individual.

```csharp
public class Voto : EntidadeBase
{
    public Guid ParticipanteId { get; private set; }      // ID de quem votou
    public OpcaoDeResposta Opcao { get; private set; }    // Value Object: opção votada
    public DateTime VotadoEm { get; private set; }        // Timestamp
}
```

---

### **Value Objects** (Imutáveis)

#### **OpcaoDeResposta**
```csharp
public record OpcaoDeResposta(string Texto);
```
Uma opção de resposta. Imutável, sem identidade própria, igualdade por valor.

#### **PrazoDeVotacao**
```csharp
public record PrazoDeVotacao(DateTime Inicio, DateTime Fim)
{
    // Garante que Fim > Inicio (invariante)
    // Método: EstaAtivo() → verifica se agora está dentro do período
}
```
Define o período de votação. **Invariante**: `Fim > Inicio` é garantido no construtor.

#### **ResultadoOpcao**
```csharp
public record ResultadoOpcao(
    string Texto,              // Texto da opção
    int TotalVotos,            // Quantos votos
    double Percentual          // Percentual (0-100)
);
```
Resultado calculado de uma opção em uma enquete.

---

### **Enum: StatusEnquete**

```csharp
public enum StatusEnquete
{
    Rascunho = 0,              // Enquete em rascunho, não aceita votos
    Publicada = 1,             // Publicada, aceita votos no prazo
    Encerrada = 2              // Encerrada, não aceita mais votos
}
```

---

## 🌐 API REST - Endpoints

**Base URL**: `https://localhost:5000/api/enquetes`

### **1. Listar todas as enquetes**
```http
GET /api/enquetes
```
**Resposta (200 OK)**:
```json
[
  {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "pergunta": "Qual sua linguagem favorita?",
    "status": "Publicada",
    "prazoInicio": "2024-03-30T18:00:00",
    "prazoFim": "2024-03-31T18:00:00",
    "opcoes": ["C#", "Python", "JavaScript"],
    "totalVotos": 42,
    "prazoAtivo": true
  }
]
```

---

### **2. Obter enquete por ID**
```http
GET /api/enquetes/{id}
```
**Resposta (200 OK)**: Mesma estrutura acima para uma enquete.

---

### **3. Criar nova enquete**
```http
POST /api/enquetes
Content-Type: application/json

{
  "pergunta": "Qual sua linguagem favorita?",
  "prazoInicio": "2024-03-30T18:00:00Z",
  "prazoFim": "2024-03-31T18:00:00Z",
  "opcoes": ["C#", "Python", "JavaScript"]
}
```
**Resposta (201 Created)**:
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "pergunta": "Qual sua linguagem favorita?",
  "status": "Rascunho",
  "prazoInicio": "2024-03-30T18:00:00",
  "prazoFim": "2024-03-31T18:00:00",
  "opcoes": ["C#", "Python", "JavaScript"],
  "totalVotos": 0,
  "prazoAtivo": false
}
```

---

### **4. Editar enquete**
```http
PUT /api/enquetes/{id}
Content-Type: application/json

{
  "pergunta": "Qual sua linguagem preferida?",
  "prazoInicio": "2024-03-30T18:00:00Z",
  "prazoFim": "2024-04-01T18:00:00Z"
}
```
**Resposta (204 No Content)**

---

### **5. Deletar enquete**
```http
DELETE /api/enquetes/{id}
```
**Resposta (204 No Content)**

---

### **6. Publicar enquete**
```http
PATCH /api/enquetes/{id}/publicar
```
Transiciona de **Rascunho** → **Publicada** (abre votação).

**Validações**:
- Status deve ser Rascunho
- Deve ter ≥1 opção

**Resposta (204 No Content)** ou **(400 Bad Request)** com erro.

---

### **7. Encerrar enquete**
```http
PATCH /api/enquetes/{id}/encerrar
```
Transiciona de **Publicada** → **Encerrada** (fecha votação).

**Resposta (204 No Content)** ou **(400 Bad Request)**.

---

### **8. Votar em uma opção**
```http
POST /api/enquetes/{id}/votar
Content-Type: application/json

{
  "participanteId": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
  "opcaoTexto": "C#"
}
```

**Validações de Domínio**:
- Enquete deve estar em status **Publicada**
- Data/hora atual deve estar dentro do **Prazo de Votação**
- Opção deve existir na enquete
- Mesmo participante não pode votar 2x

**Resposta (204 No Content)** ou **(400 Bad Request)** com mensagem de erro.

---

### **9. Obter resultados da enquete**
```http
GET /api/enquetes/{id}/resultados
```

**Resposta (200 OK)**:
```json
{
  "enqueteId": "550e8400-e29b-41d4-a716-446655440000",
  "pergunta": "Qual sua linguagem favorita?",
  "status": "Publicada",
  "totalVotos": 42,
  "resultados": [
    {
      "texto": "C#",
      "totalVotos": 20,
      "percentual": 47.62
    },
    {
      "texto": "Python",
      "totalVotos": 15,
      "percentual": 35.71
    },
    {
      "texto": "JavaScript",
      "totalVotos": 7,
      "percentual": 16.67
    }
  ]
}
```

---

## 💻 Stack Tecnológico

| Componente | Tecnologia | Versão | Propósito |
|---|---|---|---|
| **Runtime** | .NET | 8.0 | Framework moderno com async/await nativo |
| **Framework Web** | ASP.NET Core Web API | 8.0 | Endpoints HTTP, roteamento, controllers |
| **ORM** | Entity Framework Core | Latest | Abstração de banco de dados |
| **Banco de Dados** | MySQL | 8.0+ | Persistência relacional |
| **Driver MySQL** | Pomelo.EntityFrameworkCore.MySql | Latest | Conector MySQL para EF Core |
| **Mapeamento** | AutoMapper | Latest | Converte Entidades ↔ DTOs |
| **CORS** | Built-in | - | Suporte a requisições cross-origin |
| **Documentação** | Swagger / OpenAPI | - | Exploração interativa de API |

### **Dependências NuGet Principais**

```xml
<ItemGroup>
    <PackageReference Include="Microsoft.EntityFrameworkCore" Version="8.0" />
    <PackageReference Include="Microsoft.EntityFrameworkCore.Tools" Version="8.0" />
    <PackageReference Include="Pomelo.EntityFrameworkCore.MySql" Version="8.0" />
    <PackageReference Include="AutoMapper.Extensions.Microsoft.DependencyInjection" Version="12.0" />
</ItemGroup>
```

---

## 🗄️ Banco de Dados

### **Diagrama de Tabelas**

```
┌─────────────────────────────┐
│  Enquetes                   │
├─────────────────────────────┤
│ Id (PK)                     │
│ Pergunta (VARCHAR 500)      │
│ Status (VARCHAR 20)         │
│ PrazoInicio (DATETIME)      │
│ PrazoFim (DATETIME)         │
└────────┬────────────────────┘
         │ 1:N
         │
    ┌────▼────────────────────┐
    │ EnqueteOpcoes           │
    ├─────────────────────────┤
    │ Id (PK)                 │
    │ EnqueteId (FK)          │
    │ Texto (VARCHAR 200)     │
    └────────────────────────┘

┌─────────────────────────────┐
│  Votos                      │
├─────────────────────────────┤
│ Id (PK)                     │
│ EnqueteId (FK)              │
│ ParticipanteId (GUID)       │
│ Opcao_Texto (VARCHAR 200)   │
│ VotadoEm (DATETIME)         │
└─────────────────────────────┘
```

### **Tabela: Enquetes**

| Coluna | Tipo | Constraints | Descrição |
|--------|------|-------------|-----------|
| `Id` | CHAR(36) | PRIMARY KEY | UUID único da enquete |
| `Pergunta` | VARCHAR(500) | NOT NULL | Texto da pergunta |
| `Status` | VARCHAR(20) | NOT NULL | Enum: Rascunho, Publicada, Encerrada |
| `PrazoInicio` | DATETIME | NOT NULL | Início do período de votação |
| `PrazoFim` | DATETIME | NOT NULL | Fim do período de votação |

### **Tabela: EnqueteOpcoes**

| Coluna | Tipo | Constraints | Descrição |
|--------|------|-------------|-----------|
| `Id` | INT | PRIMARY KEY, AUTO_INCREMENT | ID sequencial |
| `EnqueteId` | CHAR(36) | FOREIGN KEY, NOT NULL | Referência a Enquetes |
| `Texto` | VARCHAR(200) | NOT NULL | Texto da opção |

### **Tabela: Votos**

| Coluna | Tipo | Constraints | Descrição |
|--------|------|-------------|-----------|
| `Id` | CHAR(36) | PRIMARY KEY | UUID único do voto |
| `EnqueteId` | CHAR(36) | FOREIGN KEY, NOT NULL, CASCADE | Referência a Enquetes |
| `ParticipanteId` | CHAR(36) | NOT NULL | UUID do votante (sem FK) |
| `Opcao_Texto` | VARCHAR(200) | NOT NULL | Texto da opção votada |
| `VotadoEm` | DATETIME | NOT NULL | Timestamp do voto |

### **Relacionamentos**

- **Enquete 1:N EnqueteOpcoes** - Uma enquete tem múltiplas opções
- **Enquete 1:N Votos** (com Cascade Delete) - Uma enquete pode receber múltiplos votos
- **Opções e Votos** se relacionam por valor (texto), não por FK

---

## 🔄 Fluxos de Negócio

### **Fluxo 1: Criar e Publicar uma Enquete**

```
1. POST /api/enquetes
   └─→ CriarEnqueteDTO { pergunta, prazoInicio, prazoFim, opcoes }
   
2. EnqueteApp.CriarEnqueteAsync()
   ├─→ Cria PrazoDeVotacao (Value Object)
   │   └─→ Valida: prazoFim > prazoInicio
   ├─→ Cria Enquete (Aggregate Root)
   │   └─→ Valida: pergunta não vazia
   │   └─→ Status = Rascunho (padrão)
   └─→ EnqueteServico.AdicionarAsync()
       └─→ IEnqueteRepositorio.AdicionarAsync()
           └─→ INSERT INTO Enquetes + EnqueteOpcoes

3. Retorna EnqueteDTO com Status = Rascunho

4. PATCH /api/enquetes/{id}/publicar
   └─→ EnqueteApp.PublicarAsync(id)
       ├─→ Busca enquete com opções (Include)
       ├─→ Chama enquete.Publicar()
       │   └─→ Valida: Status == Rascunho
       │   └─→ Valida: Existe ≥1 opção
       │   └─→ Status = Publicada
       └─→ Salva no banco
       
5. Enquete agora aceita votos durante o prazo
```

---

### **Fluxo 2: Votar e Visualizar Resultados**

```
1. POST /api/enquetes/{id}/votar
   └─→ VotarDTO { participanteId, opcaoTexto }

2. EnqueteApp.VotarAsync()
   ├─→ Busca enquete (com votos, opções)
   ├─→ Cria OpcaoDeResposta VO
   └─→ EnqueteServico.VotarAsync()
       └─→ Chama enquete.Votar(participanteId, opcao)
           ├─→ Valida: Status == Publicada
           ├─→ Valida: Agora ∈ [PrazoInicio, PrazoFim]
           ├─→ Valida: Opção existe em _opcoes
           ├─→ Valida: ParticipanteId não votou antes
           └─→ Adiciona à coleção _votos
       └─→ UPDATE Enquete + INSERT Voto

3. Retorna 204 No Content

4. GET /api/enquetes/{id}/resultados
   ├─→ Busca enquete com votos
   ├─→ Chama enquete.ObterResultados()
   │   └─→ Agrupa votos por opção
   │   └─→ Calcula total e percentual por opção
   └─→ Retorna ResultadoEnqueteDTO com breakdown de votos
```

---

### **Fluxo 3: Editar Enquete em Rascunho**

```
1. PUT /api/enquetes/{id}
   └─→ EditarEnqueteDTO { pergunta, prazoInicio, prazoFim }

2. EnqueteApp.EditarAsync()
   ├─→ Busca enquete
   └─→ Chama enquete.Editar(novaPergunta, novoPrazo)
       ├─→ Valida: Status != Encerrada
       ├─→ Atualiza Pergunta
       └─→ Atualiza Prazo

3. Salva no banco e retorna 204 No Content
```

---

## ⚙️ Regras de Negócio

Todas estas regras são **enforçadas no nível de domínio** (classe `Enquete` e services):

### **1. Ciclo de Vida da Enquete**

```
┌──────────┐     ┌────────────┐      ┌──────────┐
│ Rascunho │────→│ Publicada  │─────→│Encerrada │
└──────────┘     └────────────┘      └──────────┘
  (inicial)      (aceita votos)      (fim votação)
  
- Apenas transições válidas na ordem acima
- Não é possível voltar a estado anterior
- Não é possível pular estados
```

### **2. Publicação**

```
Pré-condições para PUBLICAR:
✓ Status DEVE ser Rascunho
✓ Deve haver pelo menos 1 opção
✓ Pergunta não pode estar vazia

Consequência:
→ Status muda para Publicada
→ Abre período de votação
```

### **3. Votação**

```
Pré-condições para VOTAR:
✓ Status DEVE ser Publicada
✓ Data/hora atual DEVE estar dentro de [PrazoInicio, PrazoFim]
✓ Opção votada DEVE existir na enquete
✓ Mesmo ParticipanteId NÃO PODE votar 2x

Se qualquer validação falhar:
→ Voto é rejeitado com mensagem de erro
→ Nenhuma mudança no banco
```

### **4. Edição**

```
Pré-condições para EDITAR:
✓ Status NÃO PODE ser Encerrada
✓ É possível editar Pergunta e Prazo

Notas:
- Editável em Rascunho (total liberdade)
- Editável em Publicada (permite ajustes)
- NÃO editável em Encerrada
```

### **5. Invariantes de Value Objects**

```
PrazoDeVotacao:
✓ Fim DEVE ser > Inicio (rigorosamente maior)
✓ Se violado no construtor: lança exceção

Consequência: Impossível criar Prazo inválido
```

---

## 🚀 Como Usar

### **Pré-requisitos**

- **.NET 8.0 SDK** instalado
- **MySQL 8.0+** rodando
- **Visual Studio 2022** ou **VS Code**

### **Configuração Inicial**

1. **Clonar/abrir o projeto**
   ```bash
   cd C:\Users\Usuario\Desktop\Faculdade\3-Semestre\Desenvolvimento-de-Sistemas\Trabalhos\DDD
   ```

2. **Configurar string de conexão** em `appsettings.json`
   ```json
   {
     "ConnectionStrings": {
       "DefaultConnection": "Server=localhost;Database=enquete_db;User=root;Password=sua_senha;"
     }
   }
   ```

3. **Aplicar migrações e criar banco de dados**
   ```bash
   dotnet ef database update
   ```
   Ou via Package Manager Console (Visual Studio):
   ```powershell
   Update-Database
   ```

4. **Iniciar a aplicação**
   ```bash
   dotnet run --project "02 - Serviços\Enquete.Servicos.Api"
   ```
   A API estará em `https://localhost:5000` ou `http://localhost:5001`

5. **Acessar Swagger UI**
   ```
   https://localhost:5000/swagger
   ```

### **Exemplo de Teste com cURL**

```bash
# 1. Criar enquete
curl -X POST https://localhost:5000/api/enquetes \
  -H "Content-Type: application/json" \
  -d '{
    "pergunta": "Qual seu SO preferido?",
    "prazoInicio": "2024-03-30T18:00:00Z",
    "prazoFim": "2024-03-31T18:00:00Z",
    "opcoes": ["Windows", "Linux", "macOS"]
  }'

# Copia o ID retornado (ex: "abc123...")

# 2. Publicar enquete
curl -X PATCH https://localhost:5000/api/enquetes/abc123.../publicar

# 3. Votar
curl -X POST https://localhost:5000/api/enquetes/abc123.../votar \
  -H "Content-Type: application/json" \
  -d '{
    "participanteId": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
    "opcaoTexto": "Linux"
  }'

# 4. Obter resultados
curl https://localhost:5000/api/enquetes/abc123.../resultados
```

---

## 🎓 Princípios DDD Aplicados

| Princípio | Implementação |
|-----------|---------------|
| **Linguagem Ubíqua** | Termos: Enquete, Votar, Publicar, Prazo - usados em código, specs, docs |
| **Núcleo Orientado ao Domínio** | Toda lógica de negócio está em `Enquete.cs` e `EnqueteServico.cs` |
| **Raízes de Agregado** | `Enquete` como raiz controlando `Voto` e `OpcaoDeResposta` |
| **Value Objects** | `PrazoDeVotacao`, `OpcaoDeResposta`, `ResultadoOpcao` imutáveis |
| **Repositórios** | `IEnqueteRepositorio` abstrai acesso a dados do domínio |
| **Arquitetura em Camadas** | Separação clara: Apresentação → Aplicação → Domínio ← Infraestrutura |
| **Camada Anti-Corrupção** | DTOs isolam API de mudanças no modelo de domínio |
| **Proteção de Invariantes** | Value Objects garantem constraints em construtor, Domínio valida regras |

---

## 📚 Estrutura de Arquivos Completa

```
DDD/
├── 01 - Apresentação/                    ← Slides/materiais teóricos
├── 02 - Serviços/
│   └── Enquete.Servicos.Api/
│       ├── Program.cs
│       ├── Controllers/
│       │   └── EnqueteController.cs
│       ├── appsettings.json
│       └── appsettings.Development.json
│
├── 03 - Aplicação/
│   └── Enquete.Aplicacao/
│       ├── Servicos/
│       │   ├── ServicosAppBase.cs
│       │   └── EnqueteApp.cs
│       ├── Interfaces/
│       ├── DTOs/
│       │   └── (6 DTOs)
│       └── Mapeamentos/
│           └── MappingProfile.cs
│
├── 04 - Domínio/
│   └── Enquete.Dominio/
│       ├── Entidades/
│       │   ├── EntidadeBase.cs
│       │   ├── Enquete.cs        ⭐ Coração
│       │   └── Voto.cs
│       ├── ValueObjects/
│       │   ├── OpcaoDeResposta.cs
│       │   ├── PrazoDeVotacao.cs
│       │   └── ResultadoOpcao.cs
│       ├── Enums/
│       │   └── StatusEnquete.cs
│       ├── Servicos/
│       │   └── EnqueteServico.cs  ⭐ Lógica
│       └── Interfaces/
│
├── 05 - Infra/
│   ├── Enquete.Infra.Data/
│   │   ├── Contextos/
│   │   │   └── EnqueteContexto.cs
│   │   ├── Repositorios/
│   │   │   ├── RepositorioBase.cs
│   │   │   └── EnqueteRepositorio.cs
│   │   ├── Mapeamentos/
│   │   │   ├── MapBase.cs
│   │   │   ├── EnqueteMap.cs
│   │   │   └── VotoMap.cs
│   │   └── Migrations/
│   │       └── (histórico)
│   │
│   └── Enquete.Infra.IoC/
│       └── InjetorDependencias.cs
│
├── Enquete.sln                           ← Solução Visual Studio
├── README.md                             ← Este arquivo
└── guia2_ddd_enquete.md                  ← Especificações
```

---

## ✅ Checklist: O que você aprendeu

- [x] Arquitetura em camadas com DDD
- [x] Separação clara de responsabilidades
- [x] Domínio livre de dependências externas
- [x] Aggregate Roots e Value Objects
- [x] Repositories para abstração de dados
- [x] Services para lógica de negócio
- [x] DTOs para API contracts
- [x] AutoMapper para mapeamento
- [x] Entity Framework Core com MySQL
- [x] Validações e invariantes no domínio
- [x] Transições de estado seguras
- [x] API REST RESTful com validações

---

## 📖 Referências

- [Domain-Driven Design - Eric Evans](https://www.domainlanguage.com/ddd/)
- [Clean Architecture - Uncle Bob](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)
- [Microsoft Docs: DDD in .NET](https://learn.microsoft.com/en-us/archive/msdn-magazine/2015/march/fsharp-domain-driven-design-with-fsharp)
- [Entity Framework Core Docs](https://learn.microsoft.com/en-us/ef/core/)

---

**Autor**: Seu Nome  
**Última atualização**: Março 2026  
**Versão**: 1.0  

**Desenvolvido com 💙 seguindo princípios de Domain-Driven Design**
