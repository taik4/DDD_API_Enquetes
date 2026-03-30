using Enquete.Aplicacao.Mapeamentos;
using Enquete.Aplicacao.Interfaces;
using Enquete.Aplicacao.Servicos;
using Enquete.Dominio.Interfaces.Repositorios;
using Enquete.Dominio.Interfaces.Servicos;
using Enquete.Dominio.Servicos;
using Enquete.Infra.Data.Contextos;
using Enquete.Infra.Data.Repositorios;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace Enquete.Infra.IoC;

public static class InjetorDependencias
{
    public static IServiceCollection AddInfrastructure(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        var connectionString = configuration.GetConnectionString("DefaultConnection");

        services.AddDbContext<EnqueteContexto>(options =>
            options.UseMySql(
                connectionString,
                ServerVersion.AutoDetect(connectionString)
            ));
        
        services.AddScoped<IEnqueteRepositorio, EnqueteRepositorio>();
        
        services.AddScoped<IEnqueteServico, EnqueteServico>();
        
        services.AddScoped<IEnqueteApp, EnqueteApp>();
        
        services.AddAutoMapper(typeof(MappingProfile));

        return services;
    }
}