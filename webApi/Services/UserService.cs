using webApi.Models;
using webApi.Interfaces;
using System.Text.Json;

namespace webApi.Services
{
    public class UserService : IUserService
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
                new JsonSerializerOptions { PropertyNameCaseInsensitive = true }) ?? new List<User>();
            }
        }

        private void saveToFile() => File.WriteAllText(filePath, JsonSerializer.Serialize(list));

  
        public List<User> Get() => list;
        public User Get(int id) => list.FirstOrDefault(p => p.Id == id);
        
        public void Create(User newU)
        {
            var maxId = list.Any() ? list.Max(j => j.Id) : 0;
            newU.Id = maxId + 1;
            list.Add(newU);
            saveToFile();
        }

        public int Update(int id, User newU)
        {
            var u = Get(id);
            if (u == null) return 0;
            if (u.Id != newU.Id) return 1;
            var index = list.IndexOf(u);
            list[index] = newU;
            saveToFile();
            return 2;
        }

        public bool Delete(int id)
        {
            var u = Get(id);
            if (u == null) return false;
            list.Remove(u);
            saveToFile();
            return true;
        }


        public object GetEmailStatus(string email)
        {
            var u = list.FirstOrDefault(x => x.Email == email);
            if (u == null) return null;
            return new { 
                exists = true, 
                needsPassword = string.IsNullOrEmpty(u.Password) || u.Password.StartsWith("OAuth_User_"), 
                name = u.Name 
            };
        }

        public IEnumerable<User> GetFiltered(bool isAdmin, string currentEmail)
        {
            if (isAdmin) return list;
            return list.Where(u => u.Email.Equals(currentEmail, StringComparison.OrdinalIgnoreCase));
        }

        public string ValidateAndCreate(User u)
        {
            if (list.Any(x => x.Email.Equals(u.Email, StringComparison.OrdinalIgnoreCase)))
                return "שגיאה: קיים כבר משתמש עם כתובת המייל הזו.";
            Create(u);
            return null;
        }

        public (int Result, string Error, bool IsSelf) ValidateAndUpdate(int id, User u, bool isAdmin, string currentEmail)
        {
            var existingUser = Get(id);
            if (existingUser == null) return (0, null, false);

            bool isUpdatingSelf = existingUser.Email.Equals(currentEmail, StringComparison.OrdinalIgnoreCase);
            if (!isAdmin && !isUpdatingSelf) return (-1, null, false);

            if (!existingUser.Email.Equals(u.Email, StringComparison.OrdinalIgnoreCase))
            {
                if (list.Any(x => x.Id != id && x.Email.Equals(u.Email, StringComparison.OrdinalIgnoreCase)))
                    return (-2, "המייל החדש כבר קיים במערכת עבור משתמש אחר.", false);
            }

            if (!isAdmin) u.IsAdmin = false; 

            int res = Update(id, u);
            return (res, null, isUpdatingSelf);
        }

        public (bool Success, string Error) ValidateAndDelete(int id, string currentEmail)
        {
            var userToDelete = Get(id);
            if (userToDelete == null) return (false, "NotFound");
            if (userToDelete.Email.Equals(currentEmail, StringComparison.OrdinalIgnoreCase))
                return (false, "אינך יכול למחוק את המשתמש של עצמך!");

            return (Delete(id), null);
        }
    }

  
}