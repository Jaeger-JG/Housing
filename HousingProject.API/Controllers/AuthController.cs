using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization; 

namespace HousingProject.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize] 
public class AuthController : ControllerBase
{
    [HttpGet("user")]
    public IActionResult GetCurrentUser()
    {
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
}