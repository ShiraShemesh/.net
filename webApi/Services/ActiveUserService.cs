using System.Security.Claims;
using webApi.Interfaces;
using webApi.Models;

namespace webApi.Services;

public class ActiveUserService : IActiveUserService
{
    private readonly IHttpContextAccessor _httpContextAccessor;

    public ActiveUserService(IHttpContextAccessor httpContextAccessor)
    {
        _httpContextAccessor = httpContextAccessor;
    }

    private ClaimsPrincipal User => _httpContextAccessor.HttpContext?.User;

    public int? UserId
    {
        get
        {
            var userIdClaim = User?.FindFirst("userid")?.Value;
            return int.TryParse(userIdClaim, out var id) ? id : null;
        }
    }

    public string Email => User?.FindFirst(ClaimTypes.Email)?.Value;

    public string Name => User?.FindFirst(ClaimTypes.Name)?.Value;

    public bool IsAdmin => User?.FindFirst("type")?.Value == "Admin" || User?.IsInRole("Admin") == true;

    public User GetCurrentUser()
    {
        return new User
        {
            Id = UserId ?? 0,
            Email = Email,
            Name = Name,
            IsAdmin = IsAdmin
        };
    }
}
