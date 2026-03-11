namespace webApi.Services
{
    public class LogMessage
    {
        public DateTime StartTime { get; set; }
        public string ControllerName { get; set; }
        public string ActionName { get; set; }
        public string? UserName { get; set; }
        public long DurationMs { get; set; }
    }
}
