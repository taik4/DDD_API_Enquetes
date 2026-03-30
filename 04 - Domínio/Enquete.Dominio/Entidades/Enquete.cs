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

    public void Editar(string novaPergunta, PrazoDeVotacao novoPrazo)
    {
        if (Status == StatusEnquete.Encerrada)
            throw new InvalidOperationException("Enquetes encerradas não podem ser editadas.");

        if (string.IsNullOrWhiteSpace(novaPergunta))
            throw new ArgumentException("A pergunta não pode ser vazia.");

        Pergunta = novaPergunta;
        Prazo = novoPrazo;
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