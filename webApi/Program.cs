using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.OpenApi;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using webApi.Services;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.Converters.Add(new System.Text.Json.Serialization.JsonStringEnumConverter());
    });

// 1. הוספת תמיכה בגישה ל-HttpContext
builder.Services.AddHttpContextAccessor();

// 2. הגדרות Authentication ו-JWT
builder.Services.AddAuthentication(options =>
{
    options.DefaultScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(cfg =>
{
    cfg.RequireHttpsMetadata = false;
    // שימי לב: תצטרכי לוודא שהפונקציה הזו קיימת בפרויקט שלך ומותאמת אליו
    cfg.TokenValidationParameters = TokenService.GetTokenValidationParameters();
});

// 3. הגדרות Authorization (הרשאות)
builder.Services.AddAuthorization(cfg =>
{
    cfg.AddPolicy("Admin", policy => policy.RequireClaim("type", "Admin"));
});

builder.Services.AddJewelryService(); 
builder.Services.AddUserService();
builder.Services.AddEndpointsApiExplorer();

// 4. הגדרת Swagger לתמיכה בטוקנים (JWT)
// builder.Services.AddSwaggerGen(c =>
// {
//     c.AddSecurityDefinition("bearer", new OpenApiSecurityScheme
//     {
//         Type = SecuritySchemeType.Http,
//         Scheme = "bearer",
//         BearerFormat = "JWT",
//         Description = "JWT Authorization header using the Bearer scheme."
//     });
//     c.AddSecurityRequirement(new OpenApiSecurityRequirement
//     {
//         {
//             new OpenApiSecurityScheme
//             {
//                 Reference = new OpenApiReference
//                 {
//                     Type = ReferenceType.SecurityScheme,
//                     Id = "bearer"
//                 }
//             },
//             Array.Empty<string>()
//         }
//     });
// });

var app = builder.Build();

// Configure the HTTP request pipeline.
// if (app.Environment.IsDevelopment())
// {
//     app.UseSwagger(); // הוספתי את הפעלת הסוואגר עצמו
//     app.UseSwaggerUI(options =>
//     {
//         options.SwaggerEndpoint("/swagger/v1/swagger.json", "v1");
//     });
// }

app.UseHttpsRedirection();

app.UseDefaultFiles(new DefaultFilesOptions
{
    DefaultFileNames = new List<string> { "Login.html", "Jewlery.html", "User.html" }
});
app.UseStaticFiles();

app.UseRouting();

// 5. סדר חובה: קודם אימות (מי המשתמש) ואז הרשאה (מה מותר לו לעשות)
app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();
app.Run();