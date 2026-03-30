using Enquete.Dominio.Interfaces.Repositorios;
using Enquete.Dominio.Interfaces.Servicos;
using Enquete.Dominio.ValueObjects;

namespace Enquete.Dominio.Servicos;

public class EnqueteServico : ServicoBase<Entidades.Enquete>, IEnqueteServico
{
    private readonly IEnqueteRepositorio _enqueteRepositorio;

    public EnqueteServico(IEnqueteRepositorio enqueteRepositorio)
        : base(enqueteRepositorio)
    {
        _enqueteRepositorio = enqueteRepositorio;
    }

    public async Task PublicarAsync(Guid id)
    {
        var enquete = await _enqueteRepositorio.ObterPorIdAsync(id)
                      ?? throw new KeyNotFoundException("Enquete não encontrada.");

        enquete.Publicar(); 

        _enqueteRepositorio.Atualizar(enquete);
        await _enqueteRepositorio.SalvarAlteracoesAsync();
    }

    public async Task EncerrarAsync(Guid id)
    {
        var enquete = await _enqueteRepositorio.ObterPorIdAsync(id)
                      ?? throw new KeyNotFoundException("Enquete não encontrada.");

        enquete.Encerrar();

        _enqueteRepositorio.Atualizar(enquete);
        await _enqueteRepositorio.SalvarAlteracoesAsync();
    }

    public async Task VotarAsync(Guid enqueteId, Guid participanteId, string opcaoTexto)
    {
        var enquete = await _enqueteRepositorio.ObterPorIdAsync(enqueteId)
                      ?? throw new KeyNotFoundException("Enquete não encontrada.");
        
        var opcao = new OpcaoDeResposta(opcaoTexto);
        
        enquete.Votar(participanteId, opcao);

        _enqueteRepositorio.Atualizar(enquete);
        await _enqueteRepositorio.SalvarAlteracoesAsync();
    }
    

    public async Task EditarAsync(Guid id, string novaPergunta,
        DateTime novoPrazoInicio, DateTime novoPrazoFim)
    {
        var enquete = await _enqueteRepositorio.ObterPorIdAsync(id)
                      ?? throw new KeyNotFoundException("Enquete não encontrada.");

        var novoPrazo = new PrazoDeVotacao(novoPrazoInicio, novoPrazoFim);
        
        enquete.Editar(novaPergunta, novoPrazo);

        _enqueteRepositorio.Atualizar(enquete);
        await _enqueteRepositorio.SalvarAlteracoesAsync();
    }

    public async Task<IReadOnlyList<ResultadoOpcao>> ObterResultadosAsync(Guid id)
    {
        var enquete = await _enqueteRepositorio.ObterPorIdAsync(id)
                      ?? throw new KeyNotFoundException("Enquete não encontrada.");

        return enquete.ObterResultados();
    }
}