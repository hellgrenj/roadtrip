using System.Collections.Generic;

namespace api.Model
{
    public class Stop
    {
        public string Id { get; set; }
        public string Name { get; set; }
        public double Lat { get; set; }
        public double Long { get; set; }
        public int RouteStop { get; set; }
    }

}