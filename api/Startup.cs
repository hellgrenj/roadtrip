using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Threading.Tasks;
using FluentValidation.AspNetCore;
using MediatR;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.HttpsPolicy;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Microsoft.OpenApi.Models;
using Polly;
using Polly.Extensions.Http;

namespace api
{
    public class Startup
    {
        public Startup(IConfiguration configuration)
        {
            Configuration = configuration;
        }

        public IConfiguration Configuration { get; }

        // This method gets called by the runtime. Use this method to add services to the container.
        public void ConfigureServices(IServiceCollection services)
        {
            // location http client with polly retry policy
            services.AddHttpClient("location", c =>
            {
                c.BaseAddress = new Uri("http://location:8181/");
            }).AddPolicyHandler(GetRetryPolicy());
            // route http client with polly retry policy
            services.AddHttpClient("route", c =>
           {
               c.BaseAddress = new Uri("http://route:8282/");
           }).AddPolicyHandler(GetRetryPolicy());

            services.AddCors(o => o.AddPolicy("corsPolicy", builder =>
                       {
                           builder.AllowAnyOrigin()
                                   .AllowAnyMethod()
                                   .AllowAnyHeader();
                       }));

            services.AddMediatR(typeof(Startup));
            services.AddControllers().AddFluentValidation(o => { o.RegisterValidatorsFromAssemblyContaining<Startup>(); });

            services.AddSwaggerGen(c =>
            {
                c.SwaggerDoc("v1", new OpenApiInfo { Title = "api", Version = "v1" });
            });
        }
        static IAsyncPolicy<HttpResponseMessage> GetRetryPolicy()
        {
            return HttpPolicyExtensions
                .HandleTransientHttpError()
                .OrResult(msg => msg.StatusCode == System.Net.HttpStatusCode.NotFound)
                .WaitAndRetryAsync(6, retryAttempt => TimeSpan.FromSeconds(Math.Pow(2, retryAttempt)));
        }
        // This method gets called by the runtime. Use this method to configure the HTTP request pipeline.
        public void Configure(IApplicationBuilder app, IWebHostEnvironment env)
        {
            app.UseDeveloperExceptionPage();
            app.UseSwagger();
            app.UseSwaggerUI(c => c.SwaggerEndpoint("/swagger/v1/swagger.json", "api v1"));
            app.UseRouting();
            app.UseCors("corsPolicy");
            app.UseEndpoints(endpoints =>
            {
                endpoints.MapControllers();
            });
        }
    }
}
