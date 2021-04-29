using System.Collections.Generic;

namespace api.Model
{
    public class Itinerary
    {
        public List<Stop> Stops { get; set; } = new();
    }
}