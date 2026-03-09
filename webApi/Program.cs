using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authentication.Google;
using webApi.Services;
using Microsoft.OpenApi;

var builder = WebApplication.CreateBuilder(args);
var googleId = builder.Configuration["GoogleClientId"];
var clientSecret = builder.Configuration["ClientSecret"];
// Add services to the container.
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.Converters.Add(new System.Text.Json.Serialization.JsonStringEnumConverter());
    });

// 1. הוספת תמיכה בגישה ל-HttpContext
builder.Services.AddHttpContextAccessor();

// 2. הגדרות Authentication - הוספת תמיכה בגוגל
builder.Services.AddAuthentication(options =>
{
    options.DefaultScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = GoogleDefaults.AuthenticationScheme; // הוספה: מאפשר לאפליקציה להשתמש בגוגל כשיטת אימות נוספת
})
.AddJwtBearer(cfg =>
{
    cfg.RequireHttpsMetadata = false;
    cfg.TokenValidationParameters = TokenService.GetTokenValidationParameters();
})
// --- הוספה עבור גוגל ---
.AddGoogle(options =>
{
    options.ClientId = builder.Configuration["GoogleAuth:ClientId"];
    options.ClientSecret = builder.Configuration["GoogleAuth:ClientSecret"];
});
// -----------------------

// 3. הגדרות Authorization (הרשאות)
builder.Services.AddAuthorization(cfg =>
{
    cfg.AddPolicy("Admin", policy => policy.RequireClaim("type", "Admin"));
});

builder.Services.AddJewelryService();
builder.Services.AddUserService();
builder.Services.AddScoped<IAuthService, AuthService>();

// 4. הגדרת Swagger (נשאר כפי שהיה אצלך)
// ... (קוד ה-Swagger המקושר שלך)

var app = builder.Build();

app.UseHttpsRedirection();

app.UseDefaultFiles(new DefaultFilesOptions
{
    DefaultFileNames = new List<string> { "Login.html", "Jewlery.html", "User.html" }
});
app.UseStaticFiles();

app.UseRouting();

// 5. סדר חובה: אימות ואז הרשאה
app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();
app.Run();