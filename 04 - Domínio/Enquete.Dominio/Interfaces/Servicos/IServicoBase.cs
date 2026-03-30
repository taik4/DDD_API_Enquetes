using Enquete.Dominio.Entidades;

namespace Enquete.Dominio.Interfaces.Servicos;

public interface IServicoBase<T> where T : EntidadeBase
{
    Task<T?> ObterPorIdAsync(Guid id);
    Task<IEnumerable<T>> ObterTodosAsync();
    Task AdicionarAsync(T entidade);
    Task AtualizarAsync(T entidade);
    Task RemoverAsync(Guid id);
}