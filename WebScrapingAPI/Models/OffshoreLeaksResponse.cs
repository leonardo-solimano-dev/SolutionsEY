namespace WebScrapingAPI.Models
{
    public class OffshoreLeaksResponse
    {
        public int Hits { get; set; }
        public List<OffshoreLeaksEntity> Results { get; set; } = new List<OffshoreLeaksEntity>();
    }

    public class OffshoreLeaksEntity
    {
        public string Name { get; set; } = string.Empty;
        public string Jurisdiction { get; set; } = string.Empty;
        public string Country { get; set; } = string.Empty;
        public string Source { get; set; } = string.Empty;
    }
}