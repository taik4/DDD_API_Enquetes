namespace Enquete.Aplicacao.DTOs;

public class CriarEnqueteDTO
{
    public string Pergunta { get; set; } = string.Empty;
    public DateTime PrazoInicio { get; set; }
    public DateTime PrazoFim { get; set; }
    public List<string> Opcoes { get; set; } = new();
}