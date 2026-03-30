using AutoMapper;
using Enquete.Aplicacao.DTOs;
using Enquete.Aplicacao.Interfaces;
using Enquete.Dominio.Entidades;
using Enquete.Dominio.Interfaces.Servicos;

namespace Enquete.Aplicacao.Servicos;

public abstract class ServicoAppBase<TEntidade, TDTO> : IAppBase<TEntidade, TDTO>
    where TEntidade : EntidadeBase
    where TDTO : BaseDTO
{
    protected readonly IServicoBase<TEntidade> _servico;
    protected readonly IMapper _mapper;

    protected ServicoAppBase(IServicoBase<TEntidade> servico, IMapper mapper)
    {
        _servico = servico;
        _mapper = mapper;
    }

    public async Task<TDTO?> ObterPorIdAsync(Guid id)
    {
        var entidade = await _servico.ObterPorIdAsync(id);
        return entidade is null ? null : _mapper.Map<TDTO>(entidade);
    }

    public async Task<IEnumerable<TDTO>> ObterTodosAsync()
    {
        var entidades = await _servico.ObterTodosAsync();
        return _mapper.Map<IEnumerable<TDTO>>(entidades);
    }

    public async Task AdicionarAsync(TDTO dto)
    {
        var entidade = _mapper.Map<TEntidade>(dto);
        await _servico.AdicionarAsync(entidade);
    }

    public async Task AtualizarAsync(TDTO dto)
    {
        var entidade = _mapper.Map<TEntidade>(dto);
        await _servico.AtualizarAsync(entidade);
    }

    public Task RemoverAsync(Guid id) => _servico.RemoverAsync(id);
}