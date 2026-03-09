using System;
using System.Collections.Generic;
using System.IdentityModel.Tokens.Jwt;
using System.Net.Http.Headers;
using System.Security.Claims;
using System.Text;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;
using webApi.Models;

namespace webApi.Services
{
    public static class TokenService
    {
        private static SymmetricSecurityKey key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes("igvrueew2gdhfv82fgerkesjf54hwejhhegvdsbe55rgf3c4bnngfd"));
        private static string issuer = "https://Tamar&Shira-demo.com";
        public static SecurityToken GetToken(List<Claim> claims) =>
            new JwtSecurityToken(
                issuer,
                issuer,
                claims,
                expires: DateTime.Now.AddDays(30.0),
                signingCredentials: new SigningCredentials(key, SecurityAlgorithms.HmacSha256)
            );

        public static TokenValidationParameters GetTokenValidationParameters() =>
            new TokenValidationParameters
            {
                ValidIssuer = issuer,
                ValidAudience = issuer,
                IssuerSigningKey = key,
                ClockSkew = TimeSpan.Zero
            };


        public static string WriteToken(SecurityToken token) =>
            new JwtSecurityTokenHandler().WriteToken(token);
        public static string GenerateUserToken(User u)
        {
            var claims = new List<Claim>
            {
                new Claim(ClaimTypes.Name, u.Name),
                new Claim(ClaimTypes.Email, u.Email),
                new Claim("userid", u.Id.ToString()),
                new Claim("type", u.IsAdmin ? "Admin" : "User")
            };
            return TokenService.WriteToken(TokenService.GetToken(claims));
        }
    }
}