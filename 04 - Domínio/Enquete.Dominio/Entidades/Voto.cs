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