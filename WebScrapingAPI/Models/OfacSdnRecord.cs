namespace WebScrapingAPI.Models
{
    public class OfacSdnRecord
    {
        [CsvHelper.Configuration.Attributes.Index(0)]
        public string? EntNum { get; set; }

        [CsvHelper.Configuration.Attributes.Index(1)]
        public string? SDN_Name { get; set; }

        [CsvHelper.Configuration.Attributes.Index(2)]
        public string? SDN_Type { get; set; }

        [CsvHelper.Configuration.Attributes.Index(4)]
        public string? Program { get; set; }
    }

    public class OfacResult
    {
        public string Name { get; set; } = string.Empty;
        public string Type { get; set; } = string.Empty;
        public string Program { get; set; } = string.Empty;
        public string List { get; set; } = string.Empty;
    }

    public class OfacResponseModel
    {
        public int Hits { get; set; }
        public List<OfacResult> Results { get; set; } = new List<OfacResult>();
    }
}