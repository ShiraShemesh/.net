using Microsoft.AspNetCore.Mvc;
using webApi.Models;
using webApi.Interfaces;
using webApi.Services;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;

namespace webApi.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class UserController : ControllerBase
    {
        private readonly IUserService service;

        public UserController(IUserService service)
        {
            this.service = service;
        }

        private string GetUserEmail() => User.FindFirst(ClaimTypes.Email)?.Value;
        private bool IsAdmin() => User.FindFirst("type")?.Value == "Admin" || User.IsInRole("Admin");

        [HttpGet("check-email/{email}")]
        public ActionResult CheckEmail(string email)
        {
            var result = service.GetEmailStatus(email);
            return result == null ? NotFound() : Ok(result);
        }
        [HttpGet]
        [Authorize]
       public IEnumerable<User> Get() => service.GetFiltered(IsAdmin(), GetUserEmail());

    [HttpGet("{id}")]
        public ActionResult<User> Get(int id)
        {
            var u = service.Get(id);
            return u == null ? NotFound() : u;
        }

        [HttpPost]
        [Authorize(Policy = "Admin")]
        public ActionResult Create(User u)
        {
            var error = service.ValidateAndCreate(u);
            return error != null ? BadRequest(error) : Ok();
        }

        [HttpPut("{id}")]
        [Authorize]
        public ActionResult Update(int id, [FromBody] User u)
        {
            var (res, error, isSelf) = service.ValidateAndUpdate(id, u, IsAdmin(), GetUserEmail());

            if (res == 0) return NotFound();
            if (res == -1) return Forbid();
            if (res == -2) return BadRequest(error);
            if (res == 1) return BadRequest("חלה שגיאה בעדכון הנתונים.");

            return isSelf ? Ok(new { token = TokenService.GenerateUserToken(u) }) : NoContent();
        }

        [HttpDelete("{id}")]
        [Authorize(Policy = "Admin")]
        public ActionResult Delete(int id)
        {
            var (success, error) = service.ValidateAndDelete(id, GetUserEmail());
            if (!success) return error == "NotFound" ? NotFound() : BadRequest(error);
            return NoContent();
        }
    }
}