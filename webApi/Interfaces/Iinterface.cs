
using System.Linq;
using System.Collections.Generic;
using webApi.Models;


namespace webApi.Interfaces;

public interface Iinterface<T>
{
  List<T> Get();

  T Get(int id);

  void Create(T j);

  int Update(int id, T j);

  bool Delete(int id);
}
public interface IUserService : Iinterface<User>
{
  object GetEmailStatus(string email);
  IEnumerable<User> GetFiltered(bool isAdmin, string currentEmail);
  string ValidateAndCreate(User u);
  (int Result, string Error, bool IsSelf) ValidateAndUpdate(int id, User u, bool isAdmin, string currentEmail);
  (bool Success, string Error) ValidateAndDelete(int id, string currentEmail);
}