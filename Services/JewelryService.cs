using webApi.Models;
using webApi.Interfaces;

namespace webApi.Services
{
    public class JewelryService : IJewelry
    {
        private List<Jewelry> list;

        public JewelryService()
        {
            list = new List<Jewelry>
            {
                new Jewelry { Id = 1, Name = "necklace", Category = Category.bracelet, Price = 100},
                new Jewelry { Id = 2, Name = "earrings", Category = Category.necklace, Price = 500},
                new Jewelry { Id = 3, Name = "bracelet", Category = Category.ring, Price = 420},
                new Jewelry { Id = 4, Name = "ring", Category = Category.watch, Price = 400}
            };
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

        public Jewelry Create(Jewelry newJ)
        {
            var maxId = list.Max(j => j.Id);
            newJ.Id = maxId + 1;
            list.Add(newJ);
            return newJ;
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
            return 2;
        }

        public bool Delete(int id)
        {
            var jewelry = Find(id);
            if (jewelry == null)
                return false;
            list.Remove(jewelry);
            return true;
        }
    }

    public static class JewelryServiceExtension
    {
        public static void AddJewelryService(this IServiceCollection services)
        {
            services.AddSingleton<IJewelry, JewelryService>();
        }
    }
}