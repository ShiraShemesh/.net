using webApi.Models;

public interface IAuthService
    {
        Task<(User user, bool isNewUser)> LoginWithGoogleAsync(string token);
        string GenerateToken(User user);
    }