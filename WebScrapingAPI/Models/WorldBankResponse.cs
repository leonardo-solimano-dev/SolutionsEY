namespace WebScrapingAPI.Models
{
    public class WorldBankResponse
    {
        public ResponseData? response { get; set; }
    }

    public class ResponseData
    {
        public List<Firm>? ZPROCSUPP { get; set; }
    }

    public class Firm
    {
        public string? SUPP_NAME { get; set; }
        public string? SUPP_ADDR { get; set; }
        public string? COUNTRY_NAME { get; set; }
        public string? DEBAR_FROM_DATE { get; set; }
        public string? DEBAR_TO_DATE { get; set; }
        public string? DEBAR_REASON { get; set; }
    }

    public class WorldBankResult
    {
        public string FirmName { get; set; } = string.Empty;
        public string Address { get; set; } = string.Empty;
        public string Country { get; set; } = string.Empty;
        public string FromDate { get; set; } = string.Empty;
        public string ToDate { get; set; } = string.Empty;
        public string Grounds { get; set; } = string.Empty;
    }

    public class WorldBankResponseModel
    {
        public int Hits { get; set; }
        public List<WorldBankResult> Results { get; set; } = new List<WorldBankResult>();
    }
}