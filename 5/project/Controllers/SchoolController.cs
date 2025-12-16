using Microsoft.AspNetCore.Mvc;
using project.Services;
using System.Collections.Generic;

namespace project.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class SchoolController : ControllerBase
    {
        private readonly SchoolService service = new SchoolService();

        [HttpGet]
        public ActionResult<List<Student>> Get()
        {
            return service.Get();
        }

        [HttpGet("{id}")]
        public ActionResult<Student> Get(int id)
        {
            var student = service.Get(id);
            if (student == null)
                return NotFound();
            return student;
        }

        [HttpPost]
        public ActionResult Create(Student newStudent)
        {
            var s = service.Create(newStudent);
            return CreatedAtAction(nameof(Get), new { id = s.Id }, s);
        }

        [HttpPut("{id}")]
        public IActionResult Update(int id, Student student)
        {
            if (id != student.Id)
                return BadRequest();

            var existingStudent = service.Get(id);
            if (existingStudent == null)
                return NotFound();

            service.Update(student);
            return NoContent();
        }

        [HttpDelete("{id}")]
        public IActionResult Delete(int id)
        {
            var student = service.Get(id);
            if (student == null)
                return NotFound();

            service.Delete(id);
            return NoContent();
        }
    }
}
