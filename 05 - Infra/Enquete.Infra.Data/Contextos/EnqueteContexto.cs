using Enquete.Dominio.Entidades;
using Microsoft.EntityFrameworkCore;

namespace Enquete.Infra.Data.Contextos;

public class EnqueteContexto : DbContext
{
    public EnqueteContexto(DbContextOptions<EnqueteContexto> options) : base(options) { }

    public DbSet<Dominio.Entidades.Enquete> Enquetes { get; set; }
    public DbSet<Voto> Votos { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(EnqueteContexto).Assembly);
        base.OnModelCreating(modelBuilder);
    }
}