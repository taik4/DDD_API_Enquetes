using Enquete.Dominio.Entidades;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Enquete.Infra.Data.Mapeamentos;

public class VotoMap : MapBase<Voto>
{
    public override void Configure(EntityTypeBuilder<Voto> builder)
    {
        base.Configure(builder);

        builder.ToTable("Votos");

        builder.Property(v => v.ParticipanteId).IsRequired();
        builder.Property(v => v.VotadoEm).IsRequired();
        
        builder.OwnsOne(v => v.Opcao, opcao =>
        {
            opcao.Property(o => o.Texto)
                .HasColumnName("OpcaoTexto")
                .IsRequired()
                .HasMaxLength(200);
        });
    }
}