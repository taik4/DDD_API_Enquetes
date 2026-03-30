using Enquete.Dominio.Entidades;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Enquete.Infra.Data.Mapeamentos;

public abstract class MapBase<T> : IEntityTypeConfiguration<T> where T : EntidadeBase
{
    public virtual void Configure(EntityTypeBuilder<T> builder)
    {
        builder.HasKey(e => e.Id);
        
        builder.Property(e => e.Id).ValueGeneratedNever();
    }
}