namespace Enquete.Dominio.ValueObjects;

public record PrazoDeVotacao
{
    public DateTime Inicio { get; }
    public DateTime Fim { get; }

    public PrazoDeVotacao(DateTime inicio, DateTime fim)
    {
        if (fim <= inicio)
            throw new ArgumentException("O prazo de fim deve ser após o prazo de início.");

        Inicio = inicio;
        Fim = fim;
    }
    
    public bool EstaAtivo()
        => DateTime.UtcNow >= Inicio && DateTime.UtcNow <= Fim;
}