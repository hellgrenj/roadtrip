using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text.Json;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;

// load capitals into memory
var jsonString = File.ReadAllText("./capitals.json");
var coordinates = JsonSerializer.Deserialize<List<Coordinates>>(jsonString);

// configure and start web server
await Host.CreateDefaultBuilder(args)
              .ConfigureLogging(logging =>
              {
                  // Add any 3rd party loggers like NLog or Serilog
              })
              .ConfigureServices((hostContext, services) =>
              {
                  services.AddRouting();
              })
              .ConfigureWebHost(webBuilder =>
              {
                  webBuilder.UseKestrel().ConfigureKestrel(options =>
                  {
                      options.Limits.MinRequestBodyDataRate = null;
                      options.ListenAnyIP(Environment.GetEnvironmentVariable("PORT") != null ? Convert.ToInt32(Environment.GetEnvironmentVariable("PORT")) : 8181);
                  });
                  webBuilder.Configure(app =>
                  {

                      app.UseRouting();
                      app.UseEndpoints(e => Routes(e));
                  });
              })
              .RunConsoleAsync();

IEndpointRouteBuilder Routes(IEndpointRouteBuilder e)
{
    e.MapPost("/location", context => LocationHandler(context));
    return e;
}
async Task LocationHandler(HttpContext context)
{
    if (!context.Request.HasJsonContentType())
    {
        context.Response.StatusCode = StatusCodes.Status415UnsupportedMediaType;
        return;
    }
    var places = await context.Request.ReadFromJsonAsync<List<string>>();
    List<Location> locations = new();
    foreach (var place in places)
    {
        var c = coordinates.Where(c => c.CapitalName.ToLower() == place.ToLower()).SingleOrDefault();
        if (c != null)
        {
            locations.Add(new Location(c.CapitalName, Convert.ToDouble(c.CapitalLatitude), Convert.ToDouble(c.CapitalLongitude)));
        }
    }
    await context.Response.WriteAsJsonAsync(locations);
}
public record Coordinates(string CapitalName, string CapitalLatitude, string CapitalLongitude);
public record Location(string Name, double Lat, double Long);




