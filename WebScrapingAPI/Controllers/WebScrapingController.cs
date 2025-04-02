using HtmlAgilityPack;
using Microsoft.AspNetCore.Mvc;
using System.Net.Http;
using System.Text.Json;
using CsvHelper;
using System.IO;
using System.Globalization;
using System.Text;
using CsvHelper.Configuration;
using WebScrapingAPI.Models;
using Microsoft.Extensions.Logging;

namespace WebScrapingAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ScrapingController : ControllerBase
    {
        private readonly HttpClient _httpClient;
        private readonly ILogger<ScrapingController> _logger;

        public ScrapingController(HttpClient httpClient, ILogger<ScrapingController> logger)
        {
            _httpClient = httpClient;
            _logger = logger;
            _logger.LogInformation("ScrapingController inicializado.");
        }

        [HttpGet("scrape")]
        public async Task<IActionResult> ScrapeData(string entityName, string source)
        {
            _logger.LogInformation("Solicitud recibida: entityName={EntityName}, source={Source}", entityName, source);

            if (string.IsNullOrEmpty(entityName))
            {
                _logger.LogWarning("El nombre de la entidad es obligatorio.");
                return BadRequest("El nombre de la entidad es obligatorio.");
            }

            try
            {
                if (source == "offshore")
                {
                    _logger.LogInformation("Procesando solicitud para Offshore Leaks...");
                    // Scraping para Offshore Leaks
                    _httpClient.DefaultRequestHeaders.Add("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36");
                    var url = $"https://offshoreleaks.icij.org/search?q={Uri.EscapeDataString(entityName)}";
                    _logger.LogInformation("Haciendo solicitud HTTP a {Url}", url);
                    var html = await _httpClient.GetStringAsync(url);
                    _logger.LogInformation("Respuesta HTML recibida. Longitud: {Length}", html.Length);

                    var htmlDoc = new HtmlDocument();
                    htmlDoc.LoadHtml(html);

                    var entities = htmlDoc.DocumentNode.SelectNodes("//table[contains(@class, 'table')]//tr");
                    if (entities == null || !entities.Any())
                    {
                        _logger.LogWarning("No se encontraron resultados para Offshore Leaks con entityName: {EntityName}", entityName);
                        return Ok(new OffshoreLeaksResponse { Hits = 0, Results = new List<OffshoreLeaksEntity>() });
                    }

                    var results = entities.Skip(1).Select(entity => new OffshoreLeaksEntity
                    {
                        Name = GetEntityData(entity, source, "name"),
                        Jurisdiction = GetEntityData(entity, source, "jurisdiction"),
                        Country = GetEntityData(entity, source, "country"),
                        Source = GetEntityData(entity, source, "source")
                    }).Where(r => !string.IsNullOrEmpty(r.Name) && r.Name != "No disponible").ToList();

                    _logger.LogInformation("Resultados procesados para Offshore Leaks. Total: {Count}", results.Count);
                    return Ok(new OffshoreLeaksResponse { Hits = results.Count, Results = results });
                }
                else if (source == "worldbank")
                {
                    _logger.LogInformation("Procesando solicitud para World Bank...");
                    // API Call para World Bank
                    var request = new HttpRequestMessage(HttpMethod.Get, "https://apigwext.worldbank.org/dvsvc/v1.0/json/APPLICATION/ADOBE_EXPRNCE_MGR/FIRM/SANCTIONED_FIRM");
                    request.Headers.Add("apikey", "z9duUaFUiEUYSHs97CU38fcZO7ipOPvm");
                    var response = await _httpClient.SendAsync(request);
                    response.EnsureSuccessStatusCode();
                    var json = await response.Content.ReadAsStringAsync();
                    _logger.LogInformation("Respuesta de World Bank API: {Json}", json);

                    var data = JsonSerializer.Deserialize<WorldBankResponse>(json);
                    if (data?.response?.ZPROCSUPP == null)
                    {
                        _logger.LogWarning("No se encontraron datos de World Bank para entityName: {EntityName}", entityName);
                        return Ok(new WorldBankResponseModel { Hits = 0, Results = new List<WorldBankResult>() });
                    }

                    // Log para inspeccionar el número total de entidades antes de filtrar
                    _logger.LogInformation("Total de entidades en la respuesta de World Bank: {TotalEntities}", data.response.ZPROCSUPP.Count);

                    var normalizedEntityName = entityName.Replace(" ", "").ToLower();
                    var matchingFirms = data.response.ZPROCSUPP
                        .Where(f => (f.SUPP_NAME != null && f.SUPP_NAME.Replace(" ", "").ToLower().Contains(normalizedEntityName)) ||
                                    (f.COUNTRY_NAME != null && f.COUNTRY_NAME.Replace(" ", "").ToLower().Contains(normalizedEntityName)))
                        .Select(f => new WorldBankResult
                        {
                            FirmName = f.SUPP_NAME ?? "No disponible",
                            Address = string.IsNullOrWhiteSpace(f.SUPP_ADDR) ? "No disponible" : f.SUPP_ADDR,
                            Country = string.IsNullOrWhiteSpace(f.COUNTRY_NAME) ? "No disponible" : f.COUNTRY_NAME,
                            FromDate = string.IsNullOrWhiteSpace(f.DEBAR_FROM_DATE) ? "No disponible" : f.DEBAR_FROM_DATE,
                            ToDate = string.IsNullOrWhiteSpace(f.DEBAR_TO_DATE) ? "No disponible" : f.DEBAR_TO_DATE,
                            Grounds = string.IsNullOrWhiteSpace(f.DEBAR_REASON) ? "No disponible" : f.DEBAR_REASON
                        }).ToList();

                    _logger.LogInformation("Encontradas {Hits} entidades para World Bank con entityName: {EntityName}", matchingFirms.Count, entityName);
                    return Ok(new WorldBankResponseModel { Hits = matchingFirms.Count, Results = matchingFirms });
                }
                else if (source == "ofac")
                {
                    _logger.LogInformation("Procesando solicitud para OFAC...");
                    // Descarga y parsing de CSV para OFAC
                    var csvStream = await _httpClient.GetStreamAsync("https://www.treasury.gov/ofac/downloads/sdn.csv");
                    using var reader = new StreamReader(csvStream, Encoding.UTF8);
                    using var csv = new CsvReader(reader, new CsvConfiguration(CultureInfo.InvariantCulture)
                    {
                        HasHeaderRecord = false,
                        Delimiter = ",",
                        MissingFieldFound = null,
                        BadDataFound = null
                    });

                    var records = csv.GetRecords<OfacSdnRecord>().ToList();
                    if (!records.Any())
                    {
                        _logger.LogWarning("No se encontraron datos en el CSV de OFAC para entityName: {EntityName}", entityName);
                        return Ok(new OfacResponseModel { Hits = 0, Results = new List<OfacResult>() });
                    }

                    var results = new List<OfacResult>();
                    foreach (var record in records)
                    {
                        if (string.IsNullOrEmpty(record.SDN_Name)) continue;

                        if (record.SDN_Name.Contains(entityName, StringComparison.OrdinalIgnoreCase))
                        {
                            _logger.LogDebug("Fila OFAC encontrada: EntNum={EntNum}, SDN_Name={SDN_Name}, SDN_Type={SDN_Type}, Program={Program}",
                                record.EntNum, record.SDN_Name, record.SDN_Type, record.Program);

                            var program = record.Program;
                            if (string.IsNullOrWhiteSpace(program) || program == "-0- ")
                            {
                                program = "No disponible";
                            }

                            results.Add(new OfacResult
                            {
                                Name = record.SDN_Name ?? "No disponible",
                                Type = string.IsNullOrWhiteSpace(record.SDN_Type) ? "No disponible" : record.SDN_Type,
                                Program = program,
                                List = "SDN"
                            });
                        }
                    }

                    _logger.LogInformation("Encontrados {Hits} resultados para OFAC con entityName: {EntityName}", results.Count, entityName);
                    return Ok(new OfacResponseModel { Hits = results.Count, Results = results });
                }
                else
                {
                    _logger.LogWarning("Fuente no válida: {Source}", source);
                    return BadRequest("Fuente no válida.");
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al procesar la solicitud para entityName: {EntityName}, source: {Source}", entityName, source);
                return BadRequest($"Error en el procesamiento: {ex.Message}");
            }
        }

        private string GetEntityData(HtmlNode entity, string source, string type)
        {
            if (source != "offshore")
                throw new ArgumentException("Este método solo es para Offshore.");

            string xpath = type switch
            {
                "name" => ".//td[1]//a",
                "jurisdiction" => ".//td[2]",
                "country" => ".//td[3]",
                "source" => ".//td[4]",
                _ => throw new ArgumentException("Tipo no válido.")
            };

            var node = entity.SelectSingleNode(xpath);
            var value = node?.InnerText.Trim();
            return string.IsNullOrWhiteSpace(value) ? "No disponible" : value;
        }
    }
}