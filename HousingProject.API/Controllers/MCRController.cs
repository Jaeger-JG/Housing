using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using HousingProject.API.Data;
using HousingProject.API.Models;
using HousingProject.API.Services;

namespace HousingProject.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class MCRController : ControllerBase
{
    private readonly ApplicationDbContext _context;
    private readonly IEmailService _emailService;
    private readonly ILogger<MCRController> _logger;

    public MCRController(ApplicationDbContext context, IEmailService emailService, ILogger<MCRController> logger)
    {
        _context = context;
        _emailService = emailService;
        _logger = logger;
    }

    [HttpPost]
    public async Task<ActionResult<MCRForm>> SubmitMCRForm(MCRForm mcrForm)
    {
        try
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            // Set creation timestamp
            mcrForm.CreatedAt = DateTime.UtcNow;
            mcrForm.Status = "Pending";

            _context.MCRForms.Add(mcrForm);
            await _context.SaveChangesAsync();

            // Send email notification
            try
            {
                await _emailService.SendMCRNotificationAsync(
                    mcrForm.HousingSpecialistEmail,
                    mcrForm.TenantName,
                    mcrForm.MCRType
                );
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Failed to send email notification for MCR form {Id}", mcrForm.Id);
                // Don't fail the submission if email fails
            }

            return CreatedAtAction(nameof(GetMCRForm), new { id = mcrForm.Id }, mcrForm);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error submitting MCR form");
            return StatusCode(500, "An error occurred while submitting the form");
        }
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<MCRForm>> GetMCRForm(int id)
    {
        var mcrForm = await _context.MCRForms.FindAsync(id);

        if (mcrForm == null)
        {
            return NotFound();
        }

        return mcrForm;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<MCRForm>>> GetMCRForms()
    {
        return await _context.MCRForms
            .OrderByDescending(f => f.CreatedAt)
            .ToListAsync();
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateMCRForm(int id, MCRForm mcrForm)
    {
        if (id != mcrForm.Id)
        {
            return BadRequest();
        }

        var existingForm = await _context.MCRForms.FindAsync(id);
        if (existingForm == null)
        {
            return NotFound();
        }

        existingForm.UpdatedAt = DateTime.UtcNow;
        _context.Entry(existingForm).CurrentValues.SetValues(mcrForm);

        try
        {
            await _context.SaveChangesAsync();
        }
        catch (DbUpdateConcurrencyException)
        {
            if (!MCRFormExists(id))
            {
                return NotFound();
            }
            else
            {
                throw;
            }
        }

        return NoContent();
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteMCRForm(int id)
    {
        var mcrForm = await _context.MCRForms.FindAsync(id);
        if (mcrForm == null)
        {
            return NotFound();
        }

        _context.MCRForms.Remove(mcrForm);
        await _context.SaveChangesAsync();

        return NoContent();
    }

    private bool MCRFormExists(int id)
    {
        return _context.MCRForms.Any(e => e.Id == id);
    }
} 