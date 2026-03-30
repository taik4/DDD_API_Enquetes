using Enquete.Dominio.Entidades;

namespace Enquete.Dominio.Interfaces.Repositorios;

public interface IRepositorioBase<T> where T : EntidadeBase
{
    Task<T?> ObterPorIdAsync(Guid id);
    Task<IEnumerable<T>> ObterTodosAsync();
    Task AdicionarAsync(T entidade);
    void Atualizar(T entidade);
    void Remover(T entidade);
    Task<int> SalvarAlteracoesAsync();
}