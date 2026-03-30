namespace Enquete.Aplicacao.DTOs;

public class ResultadoOpcaoDTO
{
    public string Texto { get; set; } = string.Empty;
    public int TotalVotos { get; set; }
    public double Percentual { get; set; }
}

public class ResultadoEnqueteDTO
{
    public Guid EnqueteId { get; set; }
    public string Pergunta { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public int TotalVotos { get; set; }
    public List<ResultadoOpcaoDTO> Resultados { get; set; } = new();
}