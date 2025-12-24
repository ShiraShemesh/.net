using webApi.Models;
using webApi.Interfaces;
using System.Text.Json;

namespace webApi.Services
{
    public class UserService : Iinterface<User>
    {
        private List<User> list { get; }
        private string filePath;

        public UserService(IWebHostEnvironment webHost)
        {
            this.filePath = Path.Combine(webHost.ContentRootPath, "Data", "User.json");
            using (var jsonFile = File.OpenText(filePath))
            {
                var content = jsonFile.ReadToEnd();
                list = JsonSerializer.Deserialize<List<User>>(content,
                new JsonSerializerOptions
                {
                    PropertyNameCaseInsensitive = true
                });
            }
        }

        private void saveToFile()
        {
            var text = JsonSerializer.Serialize(list);
            File.WriteAllText(filePath, text);
        }  
        public List<User> Get()
        {
            return list;
        }

        public User Find(int id)
        {
            return list.FirstOrDefault(p => p.Id == id);
        }

        public User Get(int id) => Find(id);

        public void Create(User newU)
        {
            var maxId = list.Any() ? list.Max(j => j.Id) : 0;
            newU.Id = maxId + 1;
            list.Add(newU);
             saveToFile();
        }

        public int Update(int id, User newU)
        {
            var u = Find(id);
            if (u == null)
                return 0;
            if (u.Id != newU.Id)
                return 1;
            var index = list.IndexOf(u);
            list[index] = newU;
             saveToFile();
            return 2;
        }

        public bool Delete(int id)
        {
            var u = Find(id);
            if (u == null)
                return false;
            list.Remove(u);
             saveToFile();
            return true;
        }
    }
    public static class UseryServiceExtension
    {
        public static void AddUserService(this IServiceCollection services)
        {
            services.AddSingleton<Iinterface<User>, UserService>();
        }
    }
}