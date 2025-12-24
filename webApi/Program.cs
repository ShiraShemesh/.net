using webApi.Services;
using Microsoft.OpenApi.Models;
var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.Converters.Add(new System.Text.Json.Serialization.JsonStringEnumConverter());
    });

builder.Services.AddJewelryService(); 
builder.Services.AddUserService();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
     app.UseSwaggerUI(options =>
    {
        options.SwaggerEndpoint("/openapi/v1.json", "v1");
    });
}

app.UseDefaultFiles(new DefaultFilesOptions
{
    DefaultFileNames = new List<string> {"Login.html", "Jewlery.html", "User.html" }
});
app.UseStaticFiles();
app.UseAuthorization();
app.MapControllers();
app.Run();