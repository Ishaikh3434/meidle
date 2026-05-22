
import urllib.request
from urllib.parse import urljoin
from bs4 import BeautifulSoup

PAGE_URLS = [
    "https://meileaf.com/teas/pure/",
    "https://meileaf.com/teas/blends/",
]
PAGE_URL = PAGE_URLS[0]

def fetch_page(link: str = PAGE_URL) -> str:
    request = urllib.request.Request(link, headers={"User-Agent": "Mozilla/5.0"})
    with urllib.request.urlopen(request, timeout=20) as response:
        return response.read().decode("utf-8", errors="replace")


class LinkExtractor:
    def get_filtered_links(self):
        links = []
        for page_url in PAGE_URLS:
            soup = BeautifulSoup(fetch_page(page_url), "html.parser")
            links.extend(urljoin(page_url, a["href"]) for a in soup.find_all("a", href=True)) #type:ignore
        filtered = list(set(
            link for link in links
            if link.startswith("https://meileaf.com/p/") and "tea-" in link
        ))
        return filtered


class DataExtractor:
    KEY_MAPPING = {
        "WaterTemp": "WATER TEMP",
        "Amountg per 100ml": "GRAMS PER 100ML",
        "1st\xa0Infusionseconds": "1st STEEP",
        "+\xa0Infusionsseconds": "INCREASE",
        "+ Infusionsseconds": "INCREASE",
        "Number ofInfusions": "NUMBER OF STEEPS",
    }
    
    def parse_water_temp(self, temp_str: str) -> dict:
        """Parse temperature string into C and F components."""
        temp_dict = {}
        temp_parts = temp_str.split('°c')
        if len(temp_parts) >= 1:
            temp_dict["WATER TEMP C"] = temp_parts[0].strip() + "°c"
        if len(temp_parts) >= 2:
            temp_dict["WATER TEMP F"] = temp_parts[1].strip()
        return temp_dict

    def get_product_tasting_notes(self, link: str):
        soup = BeautifulSoup(fetch_page(link), "html.parser")

        # Title
        h1 = soup.find("h1", class_="product-info__title", itemprop="name")
        title = h1.get_text(strip=True) if h1 else ""

        # Tea type — the <a> with itemscope, itemtype, itemprop="name"
        breadcrumb = soup.find("ol", itemtype="https://schema.org/BreadcrumbList")
        item2 = breadcrumb.find("meta", itemprop="position", content="2").parent #type:ignore
        tea_type = item2.find("span", itemprop="name").get_text(strip=True) #type:ignore

        # Tasting notes
        notes = {}
        notes_dl = soup.find("dl", class_="product-tasting-notes__list")
        if notes_dl:
            dts = notes_dl.find_all("dt")
            dds = notes_dl.find_all("dd")
            notes = {dt.get_text(strip=True): dd.get_text(strip=True) for dt, dd in zip(dts, dds)}

        # Product details
        details = {}
        detail_dl = soup.find("dl", class_="product-detail")
        if detail_dl:
            dts = detail_dl.find_all("dt")
            dds = detail_dl.find_all("dd")
            details = {dt.get_text(strip=True): dd.get_text(strip=True) for dt, dd in zip(dts, dds)}

        # Brewing instructions
        brewing = {}
        brewing_div = soup.find("div", class_="brewing-instructions__container container")
        if brewing_div:
            ths = [th.get_text(strip=True) for th in brewing_div.find_all("th", class_="brewing-instructions__th")]
            ths=ths[2:]
            spans = [sp.get_text(strip=True) for sp in brewing_div.find_all("span", class_="brewing-instructions__value")]

            mapped_ths = [self.KEY_MAPPING.get(th, th) for th in ths]
            brewing = {
                "gong fu": dict(zip(mapped_ths[:5], spans[:5])),
                "western": dict(zip(mapped_ths[5:9], spans[5:9])),
            }

            for method in ["gong fu", "western"]:
                if "WATER TEMP" in brewing[method]:
                    temp_str = brewing[method]["WATER TEMP"]
                    temp_parsed = self.parse_water_temp(temp_str)
                    del brewing[method]["WATER TEMP"]
                    brewing[method].update(temp_parsed)

        return {"title": title, "notes": notes, "details": details, "brewing": brewing, "tea_type": tea_type}


if __name__ == "__main__":
    fetchlinks = LinkExtractor()
    links = fetchlinks.get_filtered_links()
    link = links[1]
    print(links)
    input("Press Enter to continue...")
    fetchdata = DataExtractor()
    data = fetchdata.get_product_tasting_notes(link)
    print(f"Title: {data['title']}")
    print("TEA-TYPE:", data['tea_type'])
    print("Tasting Notes:", data['notes'])
    print("Details:", data['details'])
    print("Brewing Instructions:", data['brewing'])
    print()