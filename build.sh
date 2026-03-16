#!/usr/bin/env bash
set -euo pipefail

SITE_URL="https://www.cargoplan.co.kr"
CONF="pages.conf"
SOURCE="index.html"

if [[ ! -f "$SOURCE" ]]; then
  echo "ERROR: $SOURCE not found" >&2
  exit 1
fi

if [[ ! -f "$CONF" ]]; then
  echo "ERROR: $CONF not found" >&2
  exit 1
fi

generated=()

while IFS=$'\t' read -r filename title description keywords anchor; do
  # Skip comments and empty lines
  [[ "$filename" =~ ^#.*$ || -z "$filename" ]] && continue

  echo "Generating $filename ..."

  # Use awk for all replacements in a single pass
  awk \
    -v new_title="$title" \
    -v new_desc="$description" \
    -v new_kw="$keywords" \
    -v canonical="$SITE_URL/$filename" \
    -v anchor_id="$anchor" \
  '
  BEGIN { skip_next_desc = 0 }
  {
    # Skip the continuation line of multiline meta description
    if (skip_next_desc) {
      skip_next_desc = 0
      next
    }

    # Replace <title>
    if (/<title>/) {
      sub(/<title>[^<]*<\/title>/, "<title>" new_title "</title>")
    }

    # Replace meta keywords
    if (/name="keywords"/) {
      sub(/content="[^"]*"/, "content=\"" new_kw "\"")
    }

    # Replace meta description (handles multiline)
    if (/name="description"/) {
      print "    <meta content=\"" new_desc "\" name=\"description\">"
      next
    }
    if (/content=".*"$/ && !/name=/) {
      # Check if next line has name="description"
      # This is handled by the multiline detection below
    }
    # Detect start of multiline meta description
    if (/meta content="/ && !/name=/) {
      skip_next_desc = 1
      print "    <meta content=\"" new_desc "\" name=\"description\">"
      next
    }

    # Insert canonical after <meta charset>
    if (/<meta charset="utf-8">/) {
      print
      print "    <link rel=\"canonical\" href=\"" canonical "\">"
      next
    }

    # Insert scroll script before </body>
    if (/<\/body>/) {
      print "<script>"
      print "$(document).ready(function(){"
      print "  setTimeout(function(){"
      print "    var target = $(\"#" anchor_id "\");"
      print "    if (target.length) {"
      print "      $(\"html,body\").animate({scrollTop: target.offset().top - 55}, 800, \"easeInOutExpo\");"
      print "    }"
      print "  }, 500);"
      print "});"
      print "</script>"
    }

    print
  }
  ' "$SOURCE" > "$filename"

  generated+=("$filename")
done < "$CONF"

# Generate sitemap.xml
echo "Generating sitemap.xml ..."
{
  echo '<?xml version="1.0" encoding="UTF-8"?>'
  echo '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'
  echo "  <url>"
  echo "    <loc>${SITE_URL}/</loc>"
  echo "    <priority>1.0</priority>"
  echo "  </url>"

  for page in "${generated[@]}"; do
    echo "  <url>"
    echo "    <loc>${SITE_URL}/${page}</loc>"
    echo "    <priority>0.8</priority>"
    echo "  </url>"
  done

  echo "</urlset>"
} > sitemap.xml

echo "Done! Generated ${#generated[@]} pages + sitemap.xml"
