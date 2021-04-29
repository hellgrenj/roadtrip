using System;
using System.Net;

using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;

namespace api
{
    [AttributeUsage(AttributeTargets.Class | AttributeTargets.Method)]
    public class ExceptionHandling : ExceptionFilterAttribute
    {
        public override void OnException(ExceptionContext context)
        {
            var statusCode = HttpStatusCode.InternalServerError;

            // if (context.Exception is EntityNotFoundException) // custom exceptions logic goes here... 
            // {
            //     statusCode = HttpStatusCode.NotFound;
            // }

            context.HttpContext.Response.ContentType = "application/json";
            context.HttpContext.Response.StatusCode = (int)statusCode;
            context.Result = new JsonResult(new
            {
                error = new[] { context.Exception.Message }
            });
        }
    }
}
