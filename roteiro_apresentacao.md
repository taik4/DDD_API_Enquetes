# Roteiro de Apresentação: Sistema de Enquetes com DDD

## Parte 1: Introdução (3-5 min)
- Apresente o tema: Domain-Driven Design (DDD)
- Explique as 4 camadas da arquitetura
- Mostre a estrutura de pastas do projeto

## Parte 2: Camada de DOMÍNIO (15-20 min)

### Passo 2.1: Entidade Enquete

```csharp
using Enquete.Dominio.Enums;
using Enquete.Dominio.ValueObjects;

namespace Enquete.Dominio.Entidades;

public class Enquete : EntidadeBase
{
    public string Pergunta { get; private set; } = null!;
    public StatusEnquete Status { get; private set; }
    public PrazoDeVotacao Prazo { get; private set; } = null!;
    
    private readonly List<OpcaoDeResposta> _opcoes = new();
    private readonly List<Voto> _votos = new();
    
    public IReadOnlyCollection<OpcaoDeResposta> Opcoes => _opcoes.AsReadOnly();
    public IReadOnlyCollection<Voto> Votos => _votos.AsReadOnly();

    protected Enquete() { }
    
    public Enquete(string pergunta, PrazoDeVotacao prazo, IEnumerable<string> opcoes) : base()
    {
        if (string.IsNullOrWhiteSpace(pergunta))
            throw new ArgumentException("A pergunta não pode ser vazia.");

        Pergunta = pergunta;
        Prazo = prazo;
        Status = StatusEnquete.Rascunho; 

        foreach (var texto in opcoes)
            _opcoes.Add(new OpcaoDeResposta(texto));
    }
    
    public void Publicar()
    {
        if (Status != StatusEnquete.Rascunho)
            throw new InvalidOperationException("Apenas rascunhos podem ser publicados.");
        if (!_opcoes.Any())
            throw new InvalidOperationException("A enquete deve ter ao menos uma opção.");

        Status = StatusEnquete.Publicada;
    }

    public void Encerrar()
    {
        if (Status != StatusEnquete.Publicada)
            throw new InvalidOperationException("Apenas enquetes publicadas podem ser encerradas.");

        Status = StatusEnquete.Encerrada;
    }
    
    public void Votar(Guid participanteId, OpcaoDeResposta opcao)
    {
        if (Status != StatusEnquete.Publicada)
            throw new InvalidOperationException("A enquete não está publicada.");
        
        if (!Prazo.EstaAtivo())
            throw new InvalidOperationException("O prazo de votação foi encerrado.");
        
        if (_votos.Any(v => v.ParticipanteId == participanteId))
            throw new InvalidOperationException("O participante já votou nesta enquete.");
        
        if (!_opcoes.Contains(opcao))
            throw new InvalidOperationException("A opção informada não pertence a esta enquete.");
        
        _votos.Add(new Voto(participanteId, opcao));
    }

    public IReadOnlyList<ResultadoOpcao> ObterResultados()
    {
        var total = _votos.Count;

        return _opcoes.Select(opcao =>
        {
            var contagem = _votos.Count(v => v.Opcao == opcao);
            var percentual = total > 0 ? (double)contagem / total * 100 : 0;
            return new ResultadoOpcao(opcao.Texto, contagem, Math.Round(percentual, 1));
        }).ToList().AsReadOnly();
    }
}
```

**Pontos para explicar:**
- A classe `Enquete` é uma **Entidade** (possui identidade única via `Id` herdado de `EntidadeBase`)
- Os setters são `private`, garantindo que o estado só mude através dos métodos públicos (encapsulamento)
- O construtor protege a criação de enquetes inválidas
- Os métodos `Publicar()`, `Encerrar()` e `Votar()` contém **regras de negócio**
- A coleção de votos e opções é protegida (`IReadOnlyCollection`)

---

### Passo 2.2: Value Objects

```csharp
namespace Enquete.Dominio.ValueObjects;

public record PrazoDeVotacao
{
    public DateTime Inicio { get; }
    public DateTime Fim { get; }

    public PrazoDeVotacao(DateTime inicio, DateTime fim)
    {
        if (fim <= inicio)
            throw new ArgumentException("O prazo de fim deve ser após o início.");

        Inicio = inicio;
        Fim = fim;
    }
    
    public bool EstaAtivo()
        => DateTime.UtcNow >= Inicio && DateTime.UtcNow <= Fim;
}
```

```csharp
namespace Enquete.Dominio.ValueObjects;

public record OpcaoDeResposta(string Texto);
```

**Pontos para explicar:**
- `PrazoDeVotacao` e `OpcaoDeResposta` são **Value Objects** (definidos por seus atributos, não por identidade)
- Usam `record` para imutabilidade por padrão
- Contêm lógica própria (ex: `EstaAtivo()`)
- Não possuem ID próprio

---

### Passo 2.3: Enum de Status

```csharp
namespace Enquete.Dominio.Enums;

public enum StatusEnquete
{
    Rascunho,
    Publicada,
    Encerrada
}
```

**Pontos para explicar:**
- Define os estados possíveis da enquete no ciclo de vida
- Usado para controle de fluxo nas regras de negócio

---

### Passo 2.4: Entidade Voto

```csharp
using Enquete.Dominio.ValueObjects;

namespace Enquete.Dominio.Entidades;

public class Voto : EntidadeBase
{
    public Guid ParticipanteId { get; private set; }
    public OpcaoDeResposta Opcao { get; private set; } = null!;
    public DateTime VotadoEm { get; private set; }
    
    protected Voto() { }

    public Voto(Guid participanteId, OpcaoDeResposta opcao) : base()
    {
        ParticipanteId = participanteId;
        Opcao = opcao;
        VotadoEm = DateTime.UtcNow;
    }
}
```

**Pontos para explicar:**
- `Voto` também é uma **Entidade** (tem identidade própria)
- Registra quem votou, em qual opção e quando
- O construtor garante que um voto sempre seja criado com dados válidos

---

### Passo 2.5: Serviços de Domínio

```csharp
using Enquete.Dominio.Interfaces.Repositorios;
using Enquete.Dominio.Interfaces.Servicos;
using Enquete.Dominio.ValueObjects;

namespace Enquete.Dominio.Servicos;

public class EnqueteServico : ServicoBase<Entidades.Enquete>, IEnqueteServico
{
    private readonly IEnqueteRepositorio _enqueteRepositorio;

    public EnqueteServico(IEnqueteRepositorio enqueteRepositorio)
        : base(enqueteRepositorio)
    {
        _enqueteRepositorio = enqueteRepositorio;
    }

    public async Task PublicarAsync(Guid id)
    {
        var enquete = await _enqueteRepositorio.ObterPorIdAsync(id)
                      ?? throw new KeyNotFoundException("Enquete não encontrada.");

        enquete.Publicar();

        _enqueteRepositorio.Atualizar(enquete);
        await _enqueteRepositorio.SalvarAlteracoesAsync();
    }

    public async Task EncerrarAsync(Guid id)
    {
        var enquete = await _enqueteRepositorio.ObterPorIdAsync(id)
                      ?? throw new KeyNotFoundException("Enquete não encontrada.");

        enquete.Encerrar();

        _enqueteRepositorio.Atualizar(enquete);
        await _enqueteRepositorio.SalvarAlteracoesAsync();
    }

    public async Task VotarAsync(Guid enqueteId, Guid participanteId, string opcaoTexto)
    {
        var enquete = await _enqueteRepositorio.ObterPorIdAsync(enqueteId)
                      ?? throw new KeyNotFoundException("Enquete não encontrada.");
        
        var opcao = new OpcaoDeResposta(opcaoTexto);
        
        enquete.Votar(participanteId, opcao);

        _enqueteRepositorio.Atualizar(enquete);
        await _enqueteRepositorio.SalvarAlteracoesAsync();
    }

    public async Task<IReadOnlyList<ResultadoOpcao>> ObterResultadosAsync(Guid id)
    {
        var enquete = await _enqueteRepositorio.ObterPorIdAsync(id)
                      ?? throw new KeyNotFoundException("Enquete não encontrada.");

        return enquete.ObterResultados();
    }
}
```

**Pontos para explicar:**
- Coordena operações que envolvem múltiplas entidades ou repositórios
- Usa interfaces (`IEnqueteRepositorio`) para não depender diretamente da infraestrutura (Inversão de Dependência)
- Chama os métodos de domínio (`enquete.Publicar()`) e persiste as mudanças

---

## Parte 3: Camada de APLICAÇÃO (10-15 min)

### Passo 3.1: DTOs (Data Transfer Objects)

```csharp
namespace Enquete.Aplicacao.DTOs;

public class CriarEnqueteDTO
{
    public string Pergunta { get; set; } = string.Empty;
    public DateTime PrazoInicio { get; set; }
    public DateTime PrazoFim { get; set; }
    public List<string> Opcoes { get; set; } = new();
}
```

```csharp
namespace Enquete.Aplicacao.DTOs;

public class VotarDTO
{
    public Guid ParticipanteId { get; set; }
    public string OpcaoTexto { get; set; } = string.Empty;
}
```

**Pontos para explicar:**
- DTOs transportam dados entre camadas e a API
- Evitam expor as entidades de domínio diretamente
- São classes simples (anêmicas), sem lógica de negócio

---

### Passo 3.2: Serviço de Aplicação

```csharp
using AutoMapper;
using Enquete.Aplicacao.DTOs;
using Enquete.Aplicacao.Interfaces;
using Enquete.Dominio.Interfaces.Servicos;
using Enquete.Dominio.ValueObjects;

namespace Enquete.Aplicacao.Servicos;

public class EnqueteApp : ServicoAppBase<Dominio.Entidades.Enquete, EnqueteDTO>, IEnqueteApp
{
    private readonly IEnqueteServico _enqueteServico;
    
    public EnqueteApp(IEnqueteServico enqueteServico, IMapper mapper)
        : base(enqueteServico, mapper)
    {
        _enqueteServico = enqueteServico;
    }

    public async Task CriarEnqueteAsync(CriarEnqueteDTO dto)
    {
        var prazo = new PrazoDeVotacao(dto.PrazoInicio, dto.PrazoFim);
        var enquete = new Dominio.Entidades.Enquete(dto.Pergunta, prazo, dto.Opcoes);

        await _enqueteServico.AdicionarAsync(enquete);
    }

    public async Task<ResultadoEnqueteDTO> ObterResultadosAsync(Guid id)
    {
        var enquete = await _enqueteServico.ObterPorIdAsync(id)
                      ?? throw new KeyNotFoundException("Enquete não encontrada.");

        var resultados = await _enqueteServico.ObterResultadosAsync(id);

        return new ResultadoEnqueteDTO
        {
            EnqueteId  = enquete.Id,
            Pergunta   = enquete.Pergunta,
            Status     = enquete.Status.ToString(),
            TotalVotos = enquete.Votos.Count,
            Resultados = resultados.Select(r => new ResultadoOpcaoDTO
            {
                Texto      = r.Texto,
                TotalVotos = r.TotalVotos,
                Percentual = r.Percentual
            }).ToList()
        };
    }

    public Task PublicarAsync(Guid id)
        => _enqueteServico.PublicarAsync(id);

    public Task EncerrarAsync(Guid id)
        => _enqueteServico.EncerrarAsync(id);

    public Task VotarAsync(Guid enqueteId, VotarDTO dto)
        => _enqueteServico.VotarAsync(enqueteId, dto.ParticipanteId, dto.OpcaoTexto);
}
```

**Pontos para explicar:**
- Orquestra os casos de uso da aplicação
- Converte DTOs em objetos de domínio e vice-versa
- Delega regras de negócio para o Serviço de Domínio
- Não contém regras de negócio complexas, apenas coordenação

---

## Parte 4: Camada de INFRAESTRUTURA (10-15 min)

### Passo 4.1: DbContext

```csharp
using Enquete.Dominio.Entidades;
using Microsoft.EntityFrameworkCore;

namespace Enquete.Infra.Data.Contextos;

public class EnqueteContexto : DbContext
{
    public EnqueteContexto(DbContextOptions<EnqueteContexto> options) : base(options) { }

    public DbSet<Dominio.Entidades.Enquete> Enquetes { get; set; }
    public DbSet<Voto> Votos { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(EnqueteContexto).Assembly);
        base.OnModelCreating(modelBuilder);
    }
}
```

**Pontos para explicar:**
- Representa a sessão com o banco de dados
- Mapeia entidades para tabelas
- Usa Code-First para criar/migrar o schema

---

### Passo 4.2: Mapeamento

```csharp
using Enquete.Dominio.Enums;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Enquete.Infra.Data.Mapeamentos;

public class EnqueteMap : MapBase<Dominio.Entidades.Enquete>
{
    public override void Configure(EntityTypeBuilder<Dominio.Entidades.Enquete> builder)
    {
        base.Configure(builder);

        builder.ToTable("Enquetes");

        builder.Property(e => e.Pergunta)
            .IsRequired()
            .HasMaxLength(500);
        
        builder.Property(e => e.Status)
            .HasConversion<string>()
            .HasMaxLength(20);
        
        builder.OwnsOne(e => e.Prazo, prazo =>
        {
            prazo.Property(p => p.Inicio).HasColumnName("PrazoInicio").IsRequired();
            prazo.Property(p => p.Fim).HasColumnName("PrazoFim").IsRequired();
        });
        
        builder.OwnsMany(e => e.Opcoes, opcao =>
        {
            opcao.ToTable("EnqueteOpcoes");
            opcao.WithOwner().HasForeignKey("EnqueteId");
            opcao.Property<int>("Id").ValueGeneratedOnAdd();
            opcao.HasKey("Id");
            opcao.Property(o => o.Texto).IsRequired().HasMaxLength(200);
        });
        
        builder.HasMany(e => e.Votos)
            .WithOne()
            .HasForeignKey("EnqueteId")
            .OnDelete(DeleteBehavior.Cascade);
    }
}
```

**Pontos para explicar:**
- Define como as entidades são persistidas no banco
- Configura tipos próprios (`PrazoDeVotacao`, `OpcaoDeResposta`)
- Mantém a camada de domínio limpa (sem atributos de ORM)

---

### Passo 4.3: Repositório

```csharp
using Enquete.Dominio.Enums;
using Enquete.Dominio.Interfaces.Repositorios;
using Enquete.Infra.Data.Contextos;
using Microsoft.EntityFrameworkCore;

namespace Enquete.Infra.Data.Repositorios;

public class EnqueteRepositorio : RepositorioBase<Dominio.Entidades.Enquete>, IEnqueteRepositorio
{
    public EnqueteRepositorio(EnqueteContexto contexto) : base(contexto) { }
    
    public override async Task<Dominio.Entidades.Enquete?> ObterPorIdAsync(Guid id)
        => await _contexto.Enquetes
            .Include(e => e.Opcoes)
            .Include(e => e.Votos)
            .FirstOrDefaultAsync(e => e.Id == id);

    public async Task<IEnumerable<Dominio.Entidades.Enquete>> ObterPublicadasAsync()
        => await _contexto.Enquetes
            .Include(e => e.Opcoes)
            .AsNoTracking()
            .Where(e => e.Status == StatusEnquete.Publicada)
            .ToListAsync();
}
```

**Pontos para explicar:**
- Implementa a interface definida no Domínio (`IEnqueteRepositorio`)
- Usa Entity Framework Core para acessar o banco
- Garante que o domínio não dependa do EF (depende apenas da interface)

---

### Passo 4.4: Injeção de Dependência

```csharp
using Enquete.Aplicacao.Interfaces;
using Enquete.Aplicacao.Servicos;
using Enquete.Dominio.Interfaces.Repositorios;
using Enquete.Dominio.Interfaces.Servicos;
using Enquete.Dominio.Servicos;
using Enquete.Infra.Data.Contextos;
using Enquete.Infra.Data.Repositorios;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace Enquete.Infra.IoC;

public static class InjetorDependencias
{
    public static IServiceCollection AddInfrastructure(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        var connectionString = configuration.GetConnectionString("DefaultConnection");

        services.AddDbContext<EnqueteContexto>(options =>
            options.UseMySql(
                connectionString,
                ServerVersion.AutoDetect(connectionString)
            ));
        
        services.AddScoped<IEnqueteRepositorio, EnqueteRepositorio>();
        services.AddScoped<IEnqueteServico, EnqueteServico>();
        services.AddScoped<IEnqueteApp, EnqueteApp>();

        return services;
    }
}
```

**Pontos para explicar:**
- Configura o ciclo de vida das dependências (Scoped, Singleton, Transient)
- Registra o DbContext com a conexão do banco
- Conecta as interfaces às implementações concretas

---

## Parte 5: Camada de APRESENTAÇÃO/API (5-10 min)

### Passo 5.1: Controller

```csharp
using Enquete.Aplicacao.DTOs;
using Enquete.Aplicacao.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace Enquete.Servicos.Api.Controllers;

[ApiController]
[Route("api/enquetes")]
public class EnqueteController : ControllerBase
{
    private readonly IEnqueteApp _enqueteApp;

    public EnqueteController(IEnqueteApp enqueteApp)
    {
        _enqueteApp = enqueteApp;
    }

    [HttpGet]
    public async Task<IActionResult> ObterTodas()
        => Ok(await _enqueteApp.ObterTodosAsync());

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> ObterPorId(Guid id)
    {
        var enquete = await _enqueteApp.ObterPorIdAsync(id);
        return enquete is null ? NotFound() : Ok(enquete);
    }

    [HttpPost]
    public async Task<IActionResult> Criar([FromBody] CriarEnqueteDTO dto)
    {
        await _enqueteApp.CriarEnqueteAsync(dto);
        return StatusCode(201);
    }
    
    [HttpPatch("{id:guid}/publicar")]
    public async Task<IActionResult> Publicar(Guid id)
    {
        await _enqueteApp.PublicarAsync(id);
        return NoContent();
    }

    [HttpPatch("{id:guid}/encerrar")]
    public async Task<IActionResult> Encerrar(Guid id)
    {
        await _enqueteApp.EncerrarAsync(id);
        return NoContent();
    }

    [HttpPost("{id:guid}/votar")]
    public async Task<IActionResult> Votar(Guid id, [FromBody] VotarDTO dto)
    {
        try
        {
            await _enqueteApp.VotarAsync(id, dto);
            return NoContent();
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { erro = ex.Message });
        }
    }
    
    [HttpGet("{id:guid}/resultados")]
    public async Task<IActionResult> ObterResultados(Guid id)
    {
        try
        {
            var resultado = await _enqueteApp.ObterResultadosAsync(id);
            return Ok(resultado);
        }
        catch (KeyNotFoundException)
        {
            return NotFound();
        }
    }
}
```

**Pontos para explicar:**
- Recebe requisições HTTP e delega para a camada de Aplicação
- Retorna respostas HTTP apropriadas (200, 201, 400, 404, etc.)
- Não contém regras de negócio, apenas trata entrada/saída

---

### Passo 5.2: Program.cs

```csharp
using Enquete.Infra.IoC;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new() { Title = "Enquete API", Version = "v1" });
});

builder.Services.AddInfrastructure(builder.Configuration);

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();
app.UseAuthorization();
app.MapControllers();

using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider
        .GetRequiredService<Enquete.Infra.Data.Contextos.EnqueteContexto>();
    db.Database.Migrate();
}

app.Run();
```

**Pontos para explicar:**
- Ponto de entrada da aplicação
- Configura serviços e middleware
- Aplica migrações do banco ao iniciar

---

## Resumo Visual das Camadas

```
┌─────────────────────────────────────────────────────────┐
│                    APRESENTAÇÃO (API)                   │
│  Controller → Recebe HTTP, valida input, retorna JSON  │
└────────────────────┬────────────────────────────────────┘
                     │ usa
┌────────────────────▼────────────────────────────────────┐
│                    APLICAÇÃO                            │
│  DTOs ↔ Serviços App → Orquestra casos de uso          │
└────────────────────┬────────────────────────────────────┘
                     │ usa
┌────────────────────▼────────────────────────────────────┐
│                    DOMÍNIO ⭐                           │
│  Entidades + Value Objects + Serviços de Domínio       │
│  REGRAS DE NEGÓCIO ESTÃO AQUI!                         │
└────────────────────┬────────────────────────────────────┘
                     │ depende de interfaces
┌────────────────────▼────────────────────────────────────┐
│                    INFRAESTRUTURA                       │
│  Repositórios + EF Core + Banco de Dados               │
└─────────────────────────────────────────────────────────┘
```

## Dicas para a Demonstração Prática

1. **Comece pelo Domínio**: Apague o código e reescreva a entidade `Enquete` explicando cada propriedade e método.
2. **Mostre a Proteção**: Tente criar uma enquete sem pergunta ou votar em uma enquete encerrada para mostrar as validações.
3. **Suba a Camada**: Mostre como o Controller chama o Serviço de Aplicação, que chama o Serviço de Domínio.
4. **Explique a Inversão**: Destaque que o Domínio só conhece interfaces, não o Entity Framework.
5. **Teste no Swagger**: Use o Swagger UI para fazer requisições reais e mostrar o fluxo completo.

Boa apresentação!
