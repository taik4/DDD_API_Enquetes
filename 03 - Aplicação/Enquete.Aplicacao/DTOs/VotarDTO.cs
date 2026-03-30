namespace Enquete.Aplicacao.DTOs;

public class VotarDTO
{
    public Guid ParticipanteId { get; set; }
    public string OpcaoTexto { get; set; } = string.Empty;
}