using Enquete.Dominio.Enums;
using Enquete.Dominio.Interfaces.Repositorios;
using Enquete.Infra.Data.Contextos;
using Microsoft.EntityFrameworkCore;

namespace Enquete.Infra.Data.Repositorios;

public class EnqueteRepositorio : RepositorioBase<Dominio.Entidades.Enquete>, IEnqueteRepositorio
{
    public EnqueteRepositorio(EnqueteContexto contexto) : base(contexto) { }
    
    public override async Task<Dominio.Entidades.Enquete?> ObterPorIdAsync(Guid id)
        => await _contexto.Enquetes
            .Include(e => e.Opcoes)
            .Include(e => e.Votos)
            .FirstOrDefaultAsync(e => e.Id == id);

    public async Task<IEnumerable<Dominio.Entidades.Enquete>> ObterPublicadasAsync()
        => await _contexto.Enquetes
            .Include(e => e.Opcoes)
            .AsNoTracking()
            .Where(e => e.Status == StatusEnquete.Publicada)
            .ToListAsync();
}