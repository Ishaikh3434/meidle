from api import LinkExtractor, DataExtractor

# Get all links
fetchlinks = LinkExtractor()
links = fetchlinks.get_filtered_links()

# Collect all unique keys
all_notes_keys = set()
all_details_keys = set()
all_brewing_keys = set()

for link in links[:10]:  # Sample first 10 to avoid long runtime
    fetchdata = DataExtractor()
    data = fetchdata.get_product_tasting_notes(link)
    
    all_notes_keys.update(data['notes'].keys())
    all_details_keys.update(data['details'].keys())
    
    for method_dict in data['brewing'].values():
        if isinstance(method_dict, dict):
            all_brewing_keys.update(method_dict.keys())

print("Tasting Notes keys:", sorted(all_notes_keys))
print("Details keys:", sorted(all_details_keys))
print("Brewing keys:", sorted(all_brewing_keys))