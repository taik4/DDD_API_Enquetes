using AutoMapper;
using Enquete.Aplicacao.DTOs;

namespace Enquete.Aplicacao.Mapeamentos;

public class MappingProfile : Profile
{
    public MappingProfile()
    {
        CreateMap<Dominio.Entidades.Enquete, EnqueteDTO>()
            .ForMember(d => d.Status,      o => o.MapFrom(s => s.Status.ToString()))
            .ForMember(d => d.PrazoInicio, o => o.MapFrom(s => s.Prazo.Inicio))
            .ForMember(d => d.PrazoFim,    o => o.MapFrom(s => s.Prazo.Fim))
            .ForMember(d => d.PrazoAtivo,  o => o.MapFrom(s => s.Prazo.EstaAtivo()))
            .ForMember(d => d.Opcoes,      o => o.MapFrom(s => s.Opcoes.Select(op => op.Texto).ToList()))
            .ForMember(d => d.TotalVotos,  o => o.MapFrom(s => s.Votos.Count));
    }
}