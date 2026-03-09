using Microsoft.AspNetCore.Mvc;
using webApi.Models;
using webApi.Interfaces;
using System.Security.Claims;
using webApi.Services;
using Microsoft.AspNetCore.Authorization;
using Google.Apis.Auth;

namespace webApi.Controllers
{
     //לצמצםםםםםםםם
    [ApiController]
    [Route("[controller]")]
    public class UserController : ControllerBase
    {
        Iinterface<User> service;
        public UserController(Iinterface<User> service)
        {
            this.service = service;
        }
        private string GetUserEmail() => User.FindFirst(ClaimTypes.Email)?.Value;
        private bool IsAdmin() => User.FindFirst("type")?.Value == "Admin" || User.IsInRole("Admin");
        [HttpGet("check-email/{email}")]
        public ActionResult CheckEmail(string email)
        {
            var u = service.Get().FirstOrDefault(x => x.Email == email);
            if (u == null) return NotFound();
            bool needsPassword = string.IsNullOrEmpty(u.Password) || u.Password.StartsWith("OAuth_User_");
            return Ok(new { exists = true, needsPassword = needsPassword, name = u.Name });
        }
        [HttpGet]
        [Authorize]
        public IEnumerable<User> Get()
        {
            if (IsAdmin()) return service.Get();
            string myEmail = GetUserEmail();
            return service.Get().Where(u => u.Email.Equals(myEmail, StringComparison.OrdinalIgnoreCase));
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
        [Authorize(Policy = "Admin")]
        public ActionResult Create(User u)
        {
            var isEmailTaken = service.Get().Any(x => x.Email.Equals(u.Email, StringComparison.OrdinalIgnoreCase));

            if (isEmailTaken)
            {
                return BadRequest("שגיאה: קיים כבר משתמש עם כתובת המייל הזו.");
            }

            service.Create(u);
            return Ok();
        }

        [HttpPut("{id}")]
        [Authorize]
        public ActionResult Update(int id, [FromBody] User u)
        {
            var existingUser = service.Get(id);
            if (existingUser == null) return NotFound();
            string currentUserEmail = GetUserEmail();
            bool isUpdatingSelf = existingUser.Email.Equals(currentUserEmail, StringComparison.OrdinalIgnoreCase);
            if (!IsAdmin() && !isUpdatingSelf)
            {
                return Forbid();
            }
            if (!existingUser.Email.Equals(u.Email, StringComparison.OrdinalIgnoreCase))
            {
                var emailAlreadyExists = service.Get().Any(x =>
                    x.Id != id && x.Email.Equals(u.Email, StringComparison.OrdinalIgnoreCase));

                if (emailAlreadyExists)
                {
                    return BadRequest("המייל החדש כבר קיים במערכת עבור משתמש אחר.");
                }
            }

            if (!IsAdmin())
            {
                u.IsAdmin = false;
            }
            int result = service.Update(id, u);
            if (result == 1) return BadRequest("חלה שגיאה בעדכון הנתונים.");
            if (result == 0) return NotFound();
            if (isUpdatingSelf)
            {
                var newToken = TokenService.GenerateUserToken(u);
                return Ok(new { token = newToken });
            }
            return NoContent();
        }
        [HttpDelete("{id}")]
        [Authorize(Policy = "Admin")]
        public ActionResult Delete(int id)
        {
            var userToDelete = service.Get(id);
            if (userToDelete == null) return NotFound();
            if (userToDelete.Email.Equals(GetUserEmail(), StringComparison.OrdinalIgnoreCase))
            {
                return BadRequest("אינך יכול למחוק את המשתמש של עצמך!");
            }

            bool flag = service.Delete(id);
            return flag ? NoContent() : NotFound();
        }

        public class GoogleLoginRequest
        {
            public string Token { get; set; }
        }
        public class SetPasswordRequest
        {
            public string Email { get; set; } = string.Empty;
            public string Password { get; set; } = string.Empty;
        }
    }
}