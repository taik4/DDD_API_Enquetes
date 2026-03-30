using Enquete.Aplicacao.DTOs;
using Enquete.Aplicacao.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace Enquete.Servicos.Api.Controllers;

[ApiController]
[Route("api/enquetes")]
public class EnqueteController : ControllerBase
{
    private readonly IEnqueteApp _enqueteApp;

    public EnqueteController(IEnqueteApp enqueteApp)
    {
        _enqueteApp = enqueteApp;
    }

    [HttpGet]
    public async Task<IActionResult> ObterTodas()
        => Ok(await _enqueteApp.ObterTodosAsync());

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> ObterPorId(Guid id)
    {
        var enquete = await _enqueteApp.ObterPorIdAsync(id);
        return enquete is null ? NotFound() : Ok(enquete);
    }

    [HttpPost]
    public async Task<IActionResult> Criar([FromBody] CriarEnqueteDTO dto)
    {
        await _enqueteApp.CriarEnqueteAsync(dto);
        return StatusCode(201);
    }
    
    [HttpPut("{id:guid}")]
    public async Task<IActionResult> Editar(Guid id, [FromBody] EditarEnqueteDTO dto)
    {
        try
        {
            await _enqueteApp.EditarAsync(id, dto);
            return NoContent();
        }
        catch (InvalidOperationException ex)
        {
            
            return BadRequest(new { erro = ex.Message });
        }
        catch (KeyNotFoundException)
        {
            return NotFound();
        }
    }
    
    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Remover(Guid id)
    {
        try
        {
            await _enqueteApp.RemoverAsync(id);
            return NoContent();
        }
        catch (KeyNotFoundException)
        {
            return NotFound();
        }
    }
    
    [HttpGet("{id:guid}/resultados")]
    public async Task<IActionResult> ObterResultados(Guid id)
    {
        try
        {
            var resultado = await _enqueteApp.ObterResultadosAsync(id);
            return Ok(resultado);
        }
        catch (KeyNotFoundException)
        {
            return NotFound();
        }
    }

    [HttpPatch("{id:guid}/publicar")]
    public async Task<IActionResult> Publicar(Guid id)
    {
        await _enqueteApp.PublicarAsync(id);
        return NoContent();
    }

    [HttpPatch("{id:guid}/encerrar")]
    public async Task<IActionResult> Encerrar(Guid id)
    {
        await _enqueteApp.EncerrarAsync(id);
        return NoContent();
    }

    [HttpPost("{id:guid}/votar")]
    public async Task<IActionResult> Votar(Guid id, [FromBody] VotarDTO dto)
    {
        try
        {
            await _enqueteApp.VotarAsync(id, dto);
            return NoContent();
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { erro = ex.Message });
        }
    }
}