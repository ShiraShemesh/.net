using Microsoft.AspNetCore.Mvc;
using webApi.Models;
using webApi.Interfaces;

namespace webApi.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class JewelryController : ControllerBase
    {
        IJewelry service;
        public JewelryController(IJewelry service)
        {
            this.service = service;
        }
        [HttpGet]
        public IEnumerable<Jewelry> Get()
        {
            return service.Get();
        }
        [HttpGet("{id}")]
        public ActionResult<Jewelry> Get(int id)
        {
            var j = service.Get(id);
            if (j == null)
                return NotFound();
            return j;
        }
        [HttpPost]
        public void Create(Jewelry j)
        {
            service.Create(j);
        }
        [HttpPut("{id}")]
        public ActionResult Update(int id, Jewelry j)
        {
            int i = service.Update(id, j);
            if (i == 1)
                return BadRequest();
            if (i == 0)
                return NotFound();
            return NoContent();
        }
        [HttpDelete("{id}")]
        public ActionResult Delete(int id)
        {
            bool flag = service.Delete(id);
            if (!flag)
                return NotFound();
            return NoContent();
        }
    }

}