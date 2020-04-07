// Filename:  HttpServer.cs
// Author:    Benjamin N. Summerton <define-private-public>
// License:   Unlicense (http://unlicense.org/)

using System;
using System.IO;
using System.Linq;
using System.Text;
using System.Net;
using System.Threading.Tasks;
using System.Security.Cryptography;
using System.Runtime.Remoting.Metadata.W3cXsd2001;

namespace HttpListenerExample
{
    class HttpServer
    {
        public static byte[] key;
        public static HttpListener listener;
        public static string url = "http://localhost:8000/";

        static byte[] Sign(byte[] key, Stream body) {
            HMACSHA256 hash = new HMACSHA256(key);
            byte[] signature = hash.ComputeHash(body);

            body.Close();
            return signature;
        }

        public static async Task HandleIncomingConnections()
        {
            bool runServer = true;

            // While a user hasn't visited the `shutdown` url, keep on handling requests
            while (runServer)
            {
                HttpListenerContext ctx = await listener.GetContextAsync();

                HttpListenerRequest req = ctx.Request;
                HttpListenerResponse resp = ctx.Response;

                string providedSignature = req.Headers.Get("X-Lapin-Signature");
                byte[] providedSignatureBytes = SoapHexBinary.Parse(providedSignature).Value;

                byte[] signature = Sign(key, req.InputStream);
                bool signatureOk = providedSignatureBytes.SequenceEqual(signature);
                byte[] data = Encoding.UTF8.GetBytes("{\"signature\": " + (signatureOk ? "true" : "false")   +"}");
                resp.ContentType = "text/json";
                resp.ContentEncoding = Encoding.UTF8;
                resp.ContentLength64 = data.LongLength;

                await resp.OutputStream.WriteAsync(data, 0, data.Length);
                resp.Close();
            }
        }


        public static void Main(string[] args)
        {
            // Get key from arguments
            int keyPrefix = Array.IndexOf(args, "--key");
            key = Encoding.UTF8.GetBytes(args[keyPrefix+1]);

            // Create a Http server and start listening for incoming connections
            listener = new HttpListener();
            listener.Prefixes.Add(url);
            listener.Start();
            Console.WriteLine("Listening for connections on {0}", url);

            // Handle requests
            Task listenTask = HandleIncomingConnections();
            listenTask.GetAwaiter().GetResult();

            // Close the listener
            listener.Close();
        }
    }
}
