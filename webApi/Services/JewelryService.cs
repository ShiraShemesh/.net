using webApi.Models;
using webApi.Interfaces;
using System.Text.Json;

namespace webApi.Services
{
    public class JewelryService : Iinterface<Jewelry>
    {
        private List<Jewelry> list {get;}

        private string filePath;
        public JewelryService(IWebHostEnvironment webHost)
        {
             this.filePath=Path.Combine(webHost.ContentRootPath,"Data","Jewelry.json");
              using (var jsonFile = File.OpenText(filePath))
            {
                var content = jsonFile.ReadToEnd();
                list = JsonSerializer.Deserialize<List<Jewelry>>(content,
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
        public List<Jewelry> Get()
        {
            return list;
        }

        public Jewelry Find(int id)
        {
            return list.FirstOrDefault(p => p.Id == id);
        }

        public Jewelry Get(int id) => Find(id);

        public void Create(Jewelry newJ)
        {   var maxId = list.Any() ? list.Max(j => j.Id) : 0;
            newJ.Id = maxId + 1;
            list.Add(newJ);
             saveToFile();
        }

        public int Update(int id, Jewelry newJ)
        {
            var jewelry = Find(id);
            if (jewelry == null)
                return 0;
            if (jewelry.Id != newJ.Id)
                return 1;
            var index = list.IndexOf(jewelry);
            list[index] = newJ;
            saveToFile();
            return 2;
        }

        public bool Delete(int id)
        {
            var jewelry = Find(id);
            if (jewelry == null)
                return false;
            list.Remove(jewelry);
            saveToFile();
            return true;
        }
    }

    public static class JewelryServiceExtension
    {
        public static void AddJewelryService(this IServiceCollection services)
        {
            services.AddSingleton<Iinterface<Jewelry>, JewelryService>();
        }
    }
}