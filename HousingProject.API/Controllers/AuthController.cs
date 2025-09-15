using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Cors; 
using System.DirectoryServices.AccountManagement;

namespace HousingProject.API.Controllers;

public class LoginRequest
{
    public string Username { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
}

[ApiController]
[Route("api/[controller]")]
[Authorize] 
[EnableCors("AllowReactApp")]
public class AuthController : ControllerBase
{
    [HttpOptions("user")]
    [AllowAnonymous]
    public IActionResult OptionsUser()
    {
        Response.Headers.Add("Access-Control-Allow-Origin", "http://housing-forms.cityofvallejo.net");
        Response.Headers.Add("Access-Control-Allow-Methods", "GET, OPTIONS");
        Response.Headers.Add("Access-Control-Allow-Headers", "Content-Type, Authorization");
        Response.Headers.Add("Access-Control-Allow-Credentials", "true");
        
        return Ok();
    }

    [HttpOptions("login")]
    [AllowAnonymous]
    public IActionResult OptionsLogin()
    {
        Response.Headers.Add("Access-Control-Allow-Origin", "http://housing-forms.cityofvallejo.net");
        Response.Headers.Add("Access-Control-Allow-Methods", "POST, OPTIONS");
        Response.Headers.Add("Access-Control-Allow-Headers", "Content-Type, Authorization");
        Response.Headers.Add("Access-Control-Allow-Credentials", "true");
        
        return Ok();
    }

    [HttpPost("login")]
    [AllowAnonymous]
    public IActionResult Login([FromBody] LoginRequest request)
    {
        Response.Headers.Add("Access-Control-Allow-Origin", "http://housing-forms.cityofvallejo.net");
        Response.Headers.Add("Access-Control-Allow-Credentials", "true");
        Response.Headers.Add("Access-Control-Allow-Headers", "Content-Type");

        try
        {
            if (string.IsNullOrEmpty(request.Username) || string.IsNullOrEmpty(request.Password))
            {
                return BadRequest(new { message = "Username and password are required" });
            }

            using (var context = new PrincipalContext(ContextType.Domain))
            {
                bool isValid = context.ValidateCredentials(request.Username, request.Password);
                
                if (isValid)
                {
                    // Get user details from AD
                    using (var user = UserPrincipal.FindByIdentity(context, IdentityType.SamAccountName, request.Username))
                    {
                        if (user != null)
                        {
                            var userInfo = new
                            {
                                Username = user.SamAccountName,
                                DisplayName = user.DisplayName,
                                Email = user.EmailAddress,
                                Domain = user.Context.Name,
                                IsAuthenticated = true
                            };
                            
                            return Ok(userInfo);
                        }
                    }
                }
                
                return Unauthorized(new { message = "Invalid username or password" });
            }
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Authentication error", error = ex.Message });
        }
    }

    [HttpGet("user")]
    public IActionResult GetCurrentUser()
    {
        Response.Headers.Add("Access-Control-Allow-Origin", "http://housing-forms.cityofvallejo.net");
        Response.Headers.Add("Access-Control-Allow-Credentials", "true");
        Response.Headers.Add("Access-Control-Allow-Headers", "Content-Type");
        
        if (User.Identity?.IsAuthenticated == true)
        {
            var userInfo = new
            {
                Username = User.Identity.Name,
                DisplayName = User.Identity.Name?.Split('\\').LastOrDefault(),
                Domain = User.Identity.Name?.Split('\\').FirstOrDefault(),
                IsAuthenticated = true
            };
            return Ok(userInfo);
        }
        
        return Unauthorized();
    }

    [HttpGet("test")]
    [AllowAnonymous]
    public IActionResult TestEndpoint()
    {
        return Ok(new { 
            message = "API is working", 
            timestamp = DateTime.UtcNow,
            user = User.Identity?.Name ?? "Anonymous"
        });
    }
}