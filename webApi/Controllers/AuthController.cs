using Microsoft.AspNetCore.Mvc;
using webApi.Interfaces;
using webApi.Models;
using webApi.Services;

namespace webApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly IAuthService _authService;
        private readonly Iinterface<User> _userService;
        private readonly IConfiguration _configuration;
        public AuthController(IAuthService authService, Iinterface<User> userService, IConfiguration configuration)
        {
            _authService = authService;
            _userService = userService;
            _configuration = configuration;
        }
        [HttpGet("google-id")]
        public IActionResult GetGoogleId()
        {
            return Ok(new { clientId = _configuration["GoogleAuth:ClientId"] });
        }
        [HttpPost("login")]
        public ActionResult Login([FromBody] User login)
        {
            var u = _userService.Get().FirstOrDefault(x =>
                x.Name == login.Name && x.Password == login.Password && x.Email == login.Email);

            if (u == null) return Unauthorized();
            return Ok(new { token = _authService.GenerateToken(u) });
        }

        [HttpPost("google-login")]
        public async Task<ActionResult> GoogleLogin([FromBody] GoogleLoginRequest request)
        {
            try
            {
                var (user, isNewUser) = await _authService.LoginWithGoogleAsync(request.Token);
                return Ok(new
                {
                    token = _authService.GenerateToken(user),
                    isNewUser = isNewUser,
                    email = user.Email
                });
            }
            catch (Exception ex)
            {
                return BadRequest(new { error = "Google authentication failed: " + ex.Message });
            }
        }

        [HttpPost("set-password")]
        public ActionResult SetPassword([FromBody] SetPasswordRequest request)
        {
            var u = _userService.Get().FirstOrDefault(x => x.Email == request.Email);
            if (u == null) return NotFound();

            u.Password = request.Password;
            _userService.Update(u.Id, u);

            return Ok(new { token = _authService.GenerateToken(u) });
        }

    }

    public class GoogleLoginRequest { public string Token { get; set; } }
    public class SetPasswordRequest
    {
        public string Email { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
    }
}