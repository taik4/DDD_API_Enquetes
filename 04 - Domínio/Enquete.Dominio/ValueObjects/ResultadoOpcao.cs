namespace Enquete.Dominio.ValueObjects;

public record ResultadoOpcao(
    string Texto,
    int TotalVotos,
    double Percentual
);