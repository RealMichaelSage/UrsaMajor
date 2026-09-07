import urllib.request, os, re, shutil
from urllib.parse import urljoin

base = 'http://localhost:3000'
deploy_dir = '/Users/michaelsage/Desktop/Vibes/Projects/UrsaMajor/deploy_beget/ursa-major'
os.makedirs(deploy_dir, exist_ok=True)

# 1. Prerender main landing
html_main = urllib.request.urlopen(base).read().decode('utf-8')
# 2. Prerender events
html_events = urllib.request.urlopen(f"{base}/events").read().decode('utf-8')
# 3. Prerender news
html_news = urllib.request.urlopen(f"{base}/news").read().decode('utf-8')

# Copy .next/static to deploy_dir/_next/static
next_static_src = '/Users/michaelsage/Desktop/Vibes/Projects/UrsaMajor/.next/static'
next_static_dst = os.path.join(deploy_dir, '_next', 'static')
if os.path.exists(next_static_src):
    shutil.rmtree(next_static_dst, ignore_errors=True)
    shutil.copytree(next_static_src, next_static_dst)
    print("Copied .next/static successfully")

# Copy public folder
public_dir = '/Users/michaelsage/Desktop/Vibes/Projects/UrsaMajor/public'
if os.path.exists(public_dir):
    for root, dirs, files in os.walk(public_dir):
        rel_root = os.path.relpath(root, public_dir)
        target_root = os.path.join(deploy_dir, rel_root) if rel_root != '.' else deploy_dir
        os.makedirs(target_root, exist_ok=True)
        for file in files:
            src = os.path.join(root, file)
            dst = os.path.join(target_root, file)
            shutil.copy2(src, dst)
    print("Copied public assets successfully")

# Rewrite main HTML
def rewrite_main(html):
    rewritten = html
    rewritten = re.sub(r'\"/_next/', '"./_next/', rewritten)
    rewritten = re.sub(r'href=\"/_next/', 'href="./_next/', rewritten)
    rewritten = re.sub(r'\"/assets/', '"./assets/', rewritten)
    rewritten = re.sub(r'href=\"/assets/', 'href="./assets/', rewritten)
    rewritten = rewritten.replace('href="/events"', 'href="events/"')
    rewritten = rewritten.replace('href="/news"', 'href="news/"')
    return rewritten

# Rewrite subpage HTML (events, news)
def rewrite_subpage(html):
    rewritten = html
    rewritten = re.sub(r'\"/_next/', '"../_next/', rewritten)
    rewritten = re.sub(r'href=\"/_next/', 'href="../_next/', rewritten)
    rewritten = re.sub(r'\"/assets/', '"../assets/', rewritten)
    rewritten = re.sub(r'href=\"/assets/', 'href="../assets/', rewritten)
    rewritten = rewritten.replace('href="/"', 'href="../"')
    rewritten = rewritten.replace('href="/#', 'href="../#')
    rewritten = rewritten.replace('href="/events"', 'href="./"')
    rewritten = rewritten.replace('href="/news"', 'href="../news/"')
    return rewritten

with open(os.path.join(deploy_dir, 'index.html'), 'w', encoding='utf-8') as f:
    f.write(rewrite_main(html_main))
print("Saved index.html")

events_dir = os.path.join(deploy_dir, 'events')
os.makedirs(events_dir, exist_ok=True)
with open(os.path.join(events_dir, 'index.html'), 'w', encoding='utf-8') as f:
    f.write(rewrite_subpage(html_events))
print("Saved events/index.html")

news_dir = os.path.join(deploy_dir, 'news')
os.makedirs(news_dir, exist_ok=True)
with open(os.path.join(news_dir, 'index.html'), 'w', encoding='utf-8') as f:
    f.write(rewrite_subpage(html_news))
print("Saved news/index.html")

print("Static bundle generation complete!")
