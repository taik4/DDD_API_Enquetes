using Enquete.Dominio.Entidades;
using Enquete.Dominio.Interfaces.Repositorios;
using Enquete.Infra.Data.Contextos;
using Microsoft.EntityFrameworkCore;

namespace Enquete.Infra.Data.Repositorios;

public abstract class RepositorioBase<T> : IRepositorioBase<T> where T : EntidadeBase
{
    protected readonly EnqueteContexto _contexto;
    protected readonly DbSet<T> _dbSet;

    protected RepositorioBase(EnqueteContexto contexto)
    {
        _contexto = contexto;
        _dbSet = contexto.Set<T>();
    }

    public virtual async Task<T?> ObterPorIdAsync(Guid id)
        => await _dbSet.FindAsync(id);
    
    public virtual async Task<IEnumerable<T>> ObterTodosAsync()
        => await _dbSet.AsNoTracking().ToListAsync();

    public async Task AdicionarAsync(T entidade)
        => await _dbSet.AddAsync(entidade);

    public void Atualizar(T entidade)
        => _dbSet.Update(entidade);

    public void Remover(T entidade)
        => _dbSet.Remove(entidade);

    public async Task<int> SalvarAlteracoesAsync()
        => await _contexto.SaveChangesAsync();
}