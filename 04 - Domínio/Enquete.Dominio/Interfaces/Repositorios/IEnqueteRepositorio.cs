using Enquete.Dominio.Entidades;

namespace Enquete.Dominio.Interfaces.Repositorios;

public interface IEnqueteRepositorio : IRepositorioBase<Entidades.Enquete>
{
    Task<IEnumerable<Entidades.Enquete>> ObterPublicadasAsync();
}