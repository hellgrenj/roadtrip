using System.Threading;
using System.Threading.Tasks;
using MediatR;
using FluentValidation;
using Microsoft.Extensions.Logging;
using System.Collections.Generic;
using api.Model;
using System.Net.Http;
using System.Text.Json;
using System;
using System.Text;

namespace api.Features.Itinerary
{

    public record CreateNewItineraryCommand(string[] Places) : IRequest<Model.Itinerary>;

    public class CreateNewItineraryCommandValidator : AbstractValidator<CreateNewItineraryCommand>
    {
        public CreateNewItineraryCommandValidator()
        {
            RuleFor(x => x.Places).NotEmpty();
        }
    }
    public class CreateNewItineraryHandler : IRequestHandler<CreateNewItineraryCommand, Model.Itinerary>
    {
        private readonly ILogger<CreateNewItineraryHandler> _logger;
        private readonly IHttpClientFactory _clientFactory;
        public CreateNewItineraryHandler(ILogger<CreateNewItineraryHandler> logger, IHttpClientFactory clientFactory)
        {
            _logger = logger;
            _clientFactory = clientFactory;
        }

        public async Task<Model.Itinerary> Handle(CreateNewItineraryCommand cmd, CancellationToken cancellationToken)
        {
            var locations = await GetLocationsWithCoordinatesAsync(cmd.Places);
            var route = await GetOptimalRouteAsync(locations);
            var itinerary = CreateItinerary(route);
            return itinerary;
        }
        private async Task<List<Location>> GetLocationsWithCoordinatesAsync(string[] places)
        {
            var client = _clientFactory.CreateClient("location");

            var jsonPayload = new StringContent(JsonSerializer.Serialize(places), Encoding.UTF8, "application/json");
            var response = await client.PostAsync("/location", jsonPayload);
            List<Location> locations = new();
            if (response.IsSuccessStatusCode)
            {
                using var responseStream = await response.Content.ReadAsStreamAsync();
                locations = await JsonSerializer.DeserializeAsync<List<Location>>(responseStream, new JsonSerializerOptions
                {
                    PropertyNameCaseInsensitive = true,
                });
            }
            return locations;
        }
        private async Task<Route> GetOptimalRouteAsync(List<Location> locations)
        {
            var client = _clientFactory.CreateClient("route");
            List<Point> points = new();
            foreach (var l in locations)
            {
                points.Add(new(l.Name, l.Lat, l.Long));
            }
            var jsonPayload = new StringContent(JsonSerializer.Serialize(points), Encoding.UTF8, "application/json");
            var response = await client.PostAsync("/optimalroute", jsonPayload);
            RouteResponse resp = new();
            if (response.IsSuccessStatusCode)
            {
                using var responseStream = await response.Content.ReadAsStreamAsync();
                resp = await JsonSerializer.DeserializeAsync<RouteResponse>(responseStream, new JsonSerializerOptions
                {
                    PropertyNameCaseInsensitive = true,
                });
            }
            return resp.Route;
        }
        private Model.Itinerary CreateItinerary(Route route)
        {
            var itinerary = new Model.Itinerary();
            for (var i = 0; i < route.Points.Count; i++)
            {
                Point p = route.Points[i];
                itinerary.Stops.Add(new() { Id = p.Label, Name = p.Label, Lat = p.X, Long = p.Y, RouteStop = i });
            }
            return itinerary;
        }


        private record Location(string Name, double Lat, double Long);

        private record Point(string Label, double X, double Y);
        private class RouteResponse
        {
            public Route Route { get; set; }
        }
        private class Route
        {
            public List<Point> Points { get; set; }
        }
    }
}