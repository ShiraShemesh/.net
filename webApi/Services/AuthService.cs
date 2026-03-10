using Google.Apis.Auth;
using webApi.Interfaces;
using webApi.Models;
namespace webApi.Services
{
    public class AuthService : IAuthService
    {
        private readonly Iinterface<User> _userService;
        private string _GoogleClientId;
        private string _GoogleClientSecret;

        public AuthService(IUserService userService, IConfiguration configuration)
        {
            _GoogleClientId = configuration["GoogleAuth:ClientId"];
            _GoogleClientSecret = configuration["GoogleAuth:ClientSecret"];
            _userService = userService;
        }

        public async Task<(User user, bool isNewUser)> LoginWithGoogleAsync(string token)
        {
            // בדיקה אם Google מוגדר
            if (string.IsNullOrEmpty(_GoogleClientId) || string.IsNullOrEmpty(_GoogleClientSecret))
            {
                throw new InvalidOperationException("Google authentication is not configured. Please use email/password login.");
            }

            var settings = new GoogleJsonWebSignature.ValidationSettings()
            {
                Audience = new List<string> { _GoogleClientId }
            };

            var payload = await GoogleJsonWebSignature.ValidateAsync(token, settings);
            var user = _userService.Get().FirstOrDefault(x => x.Email == payload.Email);
            bool isNewUser = false;

            if (user == null)
            {
                user = new User
                {
                    Name = payload.Name,
                    Email = payload.Email,
                    Password = "OAuth_User_" + Guid.NewGuid().ToString("N"),
                    IsAdmin = false
                };
                _userService.Create(user);
                isNewUser = true;
                user = _userService.Get().FirstOrDefault(x => x.Email == payload.Email);
            }

            return (user, isNewUser);
        }

        public string GenerateToken(User user)
        {
            return TokenService.GenerateUserToken(user);
        }
    }
}