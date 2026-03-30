using Enquete.Dominio.Enums;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Enquete.Infra.Data.Mapeamentos;

public class EnqueteMap : MapBase<Dominio.Entidades.Enquete>
{
    public override void Configure(EntityTypeBuilder<Dominio.Entidades.Enquete> builder)
    {
        base.Configure(builder);

        builder.ToTable("Enquetes");

        builder.Property(e => e.Pergunta)
            .IsRequired()
            .HasMaxLength(500);
        
        builder.Property(e => e.Status)
            .HasConversion<string>()
            .HasMaxLength(20);
        
        builder.OwnsOne(e => e.Prazo, prazo =>
        {
            prazo.Property(p => p.Inicio).HasColumnName("PrazoInicio").IsRequired();
            prazo.Property(p => p.Fim).HasColumnName("PrazoFim").IsRequired();
        });
        
        builder.OwnsMany(e => e.Opcoes, opcao =>
        {
            opcao.ToTable("EnqueteOpcoes");
            opcao.WithOwner().HasForeignKey("EnqueteId");
            opcao.Property<int>("Id").ValueGeneratedOnAdd();
            opcao.HasKey("Id");
            opcao.Property(o => o.Texto).IsRequired().HasMaxLength(200);
        });
        
        builder.HasMany(e => e.Votos)
            .WithOne()
            .HasForeignKey("EnqueteId")
            .OnDelete(DeleteBehavior.Cascade);
    }
}