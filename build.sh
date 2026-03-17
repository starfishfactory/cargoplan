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

while IFS=$'\t' read -r filename title description keywords anchor content_file; do
  # Skip comments and empty lines
  [[ "$filename" =~ ^#.*$ || -z "$filename" ]] && continue

  echo "Generating $filename ..."

  # Prepare content insertion
  content_snippet=""
  if [[ -n "${content_file:-}" && -f "$content_file" ]]; then
    content_snippet=$(cat "$content_file")
    echo "  -> Inserting content from $content_file"
  elif [[ -n "${content_file:-}" ]]; then
    echo "  WARNING: content file not found: $content_file" >&2
  fi

  # Prepare OG tags
  og_tags="    <meta property=\"og:type\" content=\"website\">\n"
  og_tags+="    <meta property=\"og:title\" content=\"${title}\">\n"
  og_tags+="    <meta property=\"og:description\" content=\"${description}\">\n"
  og_tags+="    <meta property=\"og:url\" content=\"${SITE_URL}/${filename}\">\n"
  og_tags+="    <meta property=\"og:site_name\" content=\"카고플랜\">\n"
  og_tags+="    <meta property=\"og:locale\" content=\"ko_KR\">"

  # Use awk for all replacements in a single pass
  awk \
    -v new_title="$title" \
    -v new_desc="$description" \
    -v new_kw="$keywords" \
    -v canonical="$SITE_URL/$filename" \
    -v anchor_id="$anchor" \
    -v og_tags="$og_tags" \
    -v content_snippet="$content_snippet" \
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

    # Replace OG tags placeholder
    if (/<!-- OG_TAGS -->/) {
      printf "%s\n", og_tags
      next
    }

    # Replace PAGE_CONTENT placeholder
    if (/<!-- PAGE_CONTENT -->/) {
      if (content_snippet != "") {
        print content_snippet
      }
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
