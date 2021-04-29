using System.Collections.Generic;
using System.Threading.Tasks;
using MediatR;
using Microsoft.AspNetCore.Mvc;


namespace api.Features.Itinerary
{
    [ExceptionHandling]
    [ApiController]
    [Route("itinerary")]
    public class Controller : ControllerBase
    {
        private readonly IMediator _mediator;
        public Controller(IMediator mediator) => _mediator = mediator;
       
        [HttpPost]
        public async Task<Model.Itinerary> Create(CreateNewItineraryCommand command) => await _mediator.Send(command); 


    }
}
