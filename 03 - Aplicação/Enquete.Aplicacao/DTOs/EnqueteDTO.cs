namespace Enquete.Aplicacao.DTOs;

public class EnqueteDTO : BaseDTO
{
    public string Pergunta { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public DateTime PrazoInicio { get; set; }
    public DateTime PrazoFim { get; set; }
    public List<string> Opcoes { get; set; } = new();
    public int TotalVotos { get; set; }
    public bool PrazoAtivo { get; set; }
}