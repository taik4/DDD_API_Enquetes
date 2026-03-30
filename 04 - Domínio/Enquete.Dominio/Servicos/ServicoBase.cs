using Enquete.Dominio.Entidades;
using Enquete.Dominio.Interfaces.Repositorios;
using Enquete.Dominio.Interfaces.Servicos;

namespace Enquete.Dominio.Servicos;

public abstract class ServicoBase<T> : IServicoBase<T> where T : EntidadeBase
{
    protected readonly IRepositorioBase<T> _repositorio;

    protected ServicoBase(IRepositorioBase<T> repositorio)
    {
        _repositorio = repositorio;
    }

    public Task<T?> ObterPorIdAsync(Guid id)
        => _repositorio.ObterPorIdAsync(id);

    public Task<IEnumerable<T>> ObterTodosAsync()
        => _repositorio.ObterTodosAsync();

    public async Task AdicionarAsync(T entidade)
    {
        await _repositorio.AdicionarAsync(entidade);
        await _repositorio.SalvarAlteracoesAsync();
    }

    public async Task AtualizarAsync(T entidade)
    {
        _repositorio.Atualizar(entidade);
        await _repositorio.SalvarAlteracoesAsync();
    }

    public async Task RemoverAsync(Guid id)
    {
        var entidade = await _repositorio.ObterPorIdAsync(id)
                       ?? throw new KeyNotFoundException($"Entidade com id '{id}' não foi encontrada.");

        _repositorio.Remover(entidade);
        await _repositorio.SalvarAlteracoesAsync();
    }
}