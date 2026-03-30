namespace Enquete.Dominio.Entidades;

public class EntidadeBase
{
    public Guid Id { get; protected set; }

    protected EntidadeBase()
    {
        Id = Guid.NewGuid();
    }
}