using AutoMapper;
using Enquete.Aplicacao.DTOs;
using Enquete.Aplicacao.Interfaces;
using Enquete.Dominio.Interfaces.Servicos;
using Enquete.Dominio.ValueObjects;

namespace Enquete.Aplicacao.Servicos;

public class EnqueteApp : ServicoAppBase<Dominio.Entidades.Enquete, EnqueteDTO>, IEnqueteApp
{
    private readonly IEnqueteServico _enqueteServico;
    
    public EnqueteApp(IEnqueteServico enqueteServico, IMapper mapper)
        : base(enqueteServico, mapper)
    {
        _enqueteServico = enqueteServico;
    }

    public async Task CriarEnqueteAsync(CriarEnqueteDTO dto)
    {
        var prazo = new PrazoDeVotacao(dto.PrazoInicio, dto.PrazoFim);
        var enquete = new Dominio.Entidades.Enquete(dto.Pergunta, prazo, dto.Opcoes);

        await _enqueteServico.AdicionarAsync(enquete);
    }

    public async Task EditarAsync(Guid id, EditarEnqueteDTO dto)
    {
        await _enqueteServico.EditarAsync(id, dto.Pergunta, dto.PrazoInicio, dto.PrazoFim);
    }

    public async Task<ResultadoEnqueteDTO> ObterResultadosAsync(Guid id)
    {
        var enquete = await _enqueteServico.ObterPorIdAsync(id)
                      ?? throw new KeyNotFoundException("Enquete não encontrada.");

        var resultados = await _enqueteServico.ObterResultadosAsync(id);

        return new ResultadoEnqueteDTO
        {
            EnqueteId  = enquete.Id,
            Pergunta   = enquete.Pergunta,
            Status     = enquete.Status.ToString(),
            TotalVotos = enquete.Votos.Count,
            Resultados = resultados.Select(r => new ResultadoOpcaoDTO
            {
                Texto      = r.Texto,
                TotalVotos = r.TotalVotos,
                Percentual = r.Percentual
            }).ToList()
        };
    }

    public Task PublicarAsync(Guid id)
        => _enqueteServico.PublicarAsync(id);

    public Task EncerrarAsync(Guid id)
        => _enqueteServico.EncerrarAsync(id);

    public Task VotarAsync(Guid enqueteId, VotarDTO dto)
        => _enqueteServico.VotarAsync(enqueteId, dto.ParticipanteId, dto.OpcaoTexto);
}