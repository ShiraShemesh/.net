using Microsoft.AspNetCore.Mvc;
using webApi.Models;
using webApi.Interfaces;
using System.Security.Claims;
using webApi.Services;

namespace webApi.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class UserController : ControllerBase
    {
        Iinterface<User> service;
        public UserController(Iinterface<User> service)
        {
            this.service = service;
        }
        [HttpGet]
        public IEnumerable<User> Get()
        {
            return service.Get();
        }
        [HttpGet("{id}")]
        public ActionResult<User> Get(int id)
        {
            var u = service.Get(id);
            if (u == null)
                return NotFound();
            return u;
        }
        [HttpPost]
        public void Create(User u)
        {
            service.Create(u);
        }

        [HttpPost("login")]
        public ActionResult Login([FromBody] User login)
        {
            var u = service.Get().FirstOrDefault(x => x.Name == login.Name && x.Password == login.Password);
            if (u == null)
                return Unauthorized();
                
            var claims = new List<Claim>
            {
                new Claim(ClaimTypes.Name, u.Name),
                new Claim("userid", u.Id.ToString()),
                new Claim("usertype", "User")
            };

            var token = TokenService.WriteToken(TokenService.GetToken(claims));
            return Ok(new { token });
        }
        [HttpPut("{id}")]
        public ActionResult Update(int id, User u)
        {
            int i = service.Update(id, u);
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