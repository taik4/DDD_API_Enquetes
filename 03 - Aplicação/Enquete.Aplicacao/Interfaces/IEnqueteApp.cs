using Enquete.Aplicacao.DTOs;

namespace Enquete.Aplicacao.Interfaces;

public interface IEnqueteApp : IAppBase<Dominio.Entidades.Enquete, EnqueteDTO>
{
    Task CriarEnqueteAsync(CriarEnqueteDTO dto);
    Task PublicarAsync(Guid id);
    Task EncerrarAsync(Guid id);
    Task VotarAsync(Guid enqueteId, VotarDTO dto);

    // Novos:
    Task EditarAsync(Guid id, EditarEnqueteDTO dto);
    Task<ResultadoEnqueteDTO> ObterResultadosAsync(Guid id);
}