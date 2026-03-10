using webApi.Models;

namespace webApi.Interfaces;

public interface IActiveUserService
{
    int? UserId { get; }
    string Email { get; }
    string Name { get; }
    bool IsAdmin { get; }
    User GetCurrentUser();
}
