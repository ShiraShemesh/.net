
using System.Linq;
using System.Collections.Generic;
using webApi.Models;


namespace webApi.Interfaces;
 public interface IJewelry 
 {
      List<Jewelry > Get();

      Jewelry Get(int id);

      Jewelry Create(Jewelry j);

       int Update(int id, Jewelry j);

       bool Delete(int id);
 }