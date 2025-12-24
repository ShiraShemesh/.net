
using System.Linq;
using System.Collections.Generic;
using webApi.Models;


namespace webApi.Interfaces;
 public interface Iinterface<T>
 {
      List<T > Get();

      T Get(int id);

      void Create(T j);

       int Update(int id, T j);

       bool Delete(int id);
 }