import urllib.request
import urllib.error
import sys

base_url = "http://localhost:4321"

urls = [
    "/en/",
    "/en/about",
    "/en/solutions",
    "/en/blog",
    "/en/contact",
    "/en/terms",
    "/en/privacy",
    "/en/cookies",
    "/en/greenhouses",
    "/en/greenhouses/high-tech",
    "/en/greenhouses/accessories",
    "/en/irrigation",
    "/en/irrigation/drip-systems",
    "/en/irrigation/sprinklers",
    "/en/irrigation/controllers",
    "/en/substrates",
    "/en/substrates/growing-solutions",
    "/en/projects",
    "/en/company",
    # Also check French to be sure
    "/fr/",
    "/fr/contact"
]

print(f"Verifying URLs on {base_url}...\n")

failed = False
for url in urls:
    full_url = f"{base_url}{url}"
    try:
        req = urllib.request.Request(full_url, method='HEAD')
        with urllib.request.urlopen(req) as response:
            if response.status == 200:
                print(f"✅ {url}: 200 OK")
            else:
                print(f"❌ {url}: {response.status}")
                failed = True
    except urllib.error.HTTPError as e:
        print(f"❌ {url}: {e.code} {e.reason}")
        failed = True
    except urllib.error.URLError as e:
        print(f"❌ {url}: Failed to connect ({e.reason})")
        failed = True
    except Exception as e:
        print(f"❌ {url}: Error ({e})")
        failed = True

if failed:
    print("\nSome URLs failed verification.")
    sys.exit(1)
else:
    print("\nAll URLs verified successfully!")
    sys.exit(0)
