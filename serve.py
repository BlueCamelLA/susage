import os, sys
from http.server import HTTPServer, SimpleHTTPRequestHandler

port = int(sys.argv[1]) if len(sys.argv) > 1 else 8090
os.chdir(os.path.dirname(os.path.abspath(__file__)))
print(f"Serving on http://localhost:{port}")
HTTPServer(("", port), SimpleHTTPRequestHandler).serve_forever()
