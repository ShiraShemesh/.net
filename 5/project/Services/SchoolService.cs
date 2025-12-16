using System.Collections.Generic;
using System.Linq;

namespace project.Services
{
    public class SchoolService
    {
        private static readonly List<Student> list = new List<Student>
        {
            new Student{ Id = 1, Name = "Tamar", Grade = 14, Age = 20 },
            new Student { Id = 2, Name = "Shira", Grade = 14, Age = 19 },
            new Student { Id = 3, Name = "Chana", Grade = 9, Age = 14 },
            new Student{ Id = 4, Name = "Nechama", Grade = 7, Age = 13 },
            new Student{ Id = 5, Name = "Tamar", Grade = 6, Age = 12 }
        };

        public List<Student> Get() => list;

        public Student Get(int id) => list.FirstOrDefault(p => p.Id == id);

        public Student Create(Student newStudent)
        {
            var maxId = list.Any() ? list.Max(p => p.Id) : 0;
            newStudent.Id = maxId + 1;
            list.Add(newStudent);
            return newStudent;
        }

        public void Update(Student student)
        {
            var index = list.FindIndex(p => p.Id == student.Id);
            if (index == -1) return;
            list[index] = student;
        }

        public void Delete(int id)
        {
            var student = Get(id);
            if (student == null) return;
            list.Remove(student);
        }

        public int Count => list.Count;
    }
}
