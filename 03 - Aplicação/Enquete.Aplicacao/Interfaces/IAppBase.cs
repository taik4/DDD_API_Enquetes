using Enquete.Aplicacao.DTOs;
using Enquete.Dominio.Entidades;

namespace Enquete.Aplicacao.Interfaces;

public interface IAppBase<TEntidade, TDTO>
    where TEntidade : EntidadeBase
    where TDTO : BaseDTO
{
    Task<TDTO?> ObterPorIdAsync(Guid id);
    Task<IEnumerable<TDTO>> ObterTodosAsync();
    Task AdicionarAsync(TDTO dto);
    Task AtualizarAsync(TDTO dto);
    Task RemoverAsync(Guid id);
}