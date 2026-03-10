using webApi.Services;
using webApi.Interfaces;
using webApi.Models;

namespace webApi.Extensions
{
    public static class DependencyInjectionExtensions
    {
        public static IServiceCollection AddProjectServices(this IServiceCollection services)
        {
            services.AddSingleton<JewelryService>();
            services.AddSingleton<Iinterface<Jewelry>, JewelryService>();
            services.AddSingleton<UserService>();
            services.AddSingleton<IUserService>(sp => sp.GetRequiredService<UserService>());
            services.AddSingleton<Iinterface<User>>(sp => sp.GetRequiredService<UserService>());
            services.AddScoped<IAuthService, AuthService>();
            services.AddScoped<IActiveUserService, ActiveUserService>();
            services.AddHttpContextAccessor();

            return services;
        }
    }
}