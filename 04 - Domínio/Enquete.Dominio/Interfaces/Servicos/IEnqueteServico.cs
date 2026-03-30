using Enquete.Dominio.Entidades;
using Enquete.Dominio.ValueObjects;

namespace Enquete.Dominio.Interfaces.Servicos;

public interface IEnqueteServico : IServicoBase<Entidades.Enquete>
{
    Task PublicarAsync(Guid id);
    Task EncerrarAsync(Guid id);
    Task VotarAsync(Guid enqueteId, Guid participanteId, string opcaoTexto);

    // Novos:
    Task EditarAsync(Guid id, string novaPergunta, DateTime novoPrazoInicio, DateTime novoPrazoFim);
    Task<IReadOnlyList<ResultadoOpcao>> ObterResultadosAsync(Guid id);
}