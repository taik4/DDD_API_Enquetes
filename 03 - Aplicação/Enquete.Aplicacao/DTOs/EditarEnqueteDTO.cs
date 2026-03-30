namespace Enquete.Aplicacao.DTOs;

public class EditarEnqueteDTO
{
    public string Pergunta { get; set; } = string.Empty;
    public DateTime PrazoInicio { get; set; }
    public DateTime PrazoFim { get; set; }
}