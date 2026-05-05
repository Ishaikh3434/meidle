import sqlite3
from api import LinkExtractor, DataExtractor

# Test mode toggle
TEST_MODE = False  # Set to False to process all links

def create_database():
    conn = sqlite3.connect('MEIPI/meileaf_products.db')
    cursor = conn.cursor()
    
    # Define the table with all columns
    create_table_query = """
    CREATE TABLE IF NOT EXISTS products (
        title TEXT,
        url TEXT UNIQUE,
        tea_type TEXT,
        body_sensation TEXT,
        eyes_dry_leaf TEXT,
        eyes_liquor TEXT,
        eyes_wet_leaf TEXT,
        mouth_finish TEXT,
        mouth_taste TEXT,
        mouth_texture TEXT,
        nose_dry_leaf TEXT,
        nose_empty_cup TEXT,
        nose_wet_leaf TEXT,
        cultivar TEXT,
        elevation TEXT,
        origin TEXT,
        picking_processing TEXT,
        season TEXT,
        gong_fu_1st_steep TEXT,
        gong_fu_grams_per_100ml TEXT,
        gong_fu_increase TEXT,
        gong_fu_number_of_steeps TEXT,
        gong_fu_water_temp_c TEXT,
        gong_fu_water_temp_f TEXT,
        western_1st_steep TEXT,
        western_grams_per_100ml TEXT,
        western_increase TEXT,
        western_number_of_steeps TEXT,
        western_water_temp_c TEXT,
        western_water_temp_f TEXT
    )
    """
    cursor.execute(create_table_query)
    conn.commit()
    return conn

def insert_product(conn, data, url):
    cursor = conn.cursor()
    
    # Extract product code from URL
    product_code = url.split('/')[-1]
    
    # Prepare values
    values = [
        data.get('title', ''),
        url,
        data.get('tea_type', ''),
        data.get('notes', {}).get('BODY SENSATION', ''),
        data.get('notes', {}).get('EYES - DRY LEAF', ''),
        data.get('notes', {}).get('EYES - LIQUOR', ''),
        data.get('notes', {}).get('EYES - WET LEAF', ''),
        data.get('notes', {}).get('MOUTH - FINISH', ''),
        data.get('notes', {}).get('MOUTH - TASTE', ''),
        data.get('notes', {}).get('MOUTH - TEXTURE', ''),
        data.get('notes', {}).get('NOSE - DRY LEAF', ''),
        data.get('notes', {}).get('NOSE - EMPTY CUP', ''),
        data.get('notes', {}).get('NOSE - WET LEAF', ''),
        data.get('details', {}).get('CULTIVAR', ''),
        data.get('details', {}).get('ELEVATION', ''),
        data.get('details', {}).get('ORIGIN', ''),
        data.get('details', {}).get('PICKING & PROCESSING', ''),
        data.get('details', {}).get('SEASON', ''),
        data.get('brewing', {}).get('gong fu', {}).get('1st STEEP', ''),
        data.get('brewing', {}).get('gong fu', {}).get('GRAMS PER 100ML', ''),
        data.get('brewing', {}).get('gong fu', {}).get('INCREASE', ''),
        data.get('brewing', {}).get('gong fu', {}).get('NUMBER OF STEEPS', ''),
        data.get('brewing', {}).get('gong fu', {}).get('WATER TEMP C', ''),
        data.get('brewing', {}).get('gong fu', {}).get('WATER TEMP F', ''),
        data.get('brewing', {}).get('western', {}).get('1st STEEP', ''),
        data.get('brewing', {}).get('western', {}).get('GRAMS PER 100ML', ''),
        data.get('brewing', {}).get('western', {}).get('INCREASE', ''),
        data.get('brewing', {}).get('western', {}).get('NUMBER OF STEEPS', ''),
        data.get('brewing', {}).get('western', {}).get('WATER TEMP C', ''),
        data.get('brewing', {}).get('western', {}).get('WATER TEMP F', '')
    ]
    
    # Insert query
    insert_query = """
    INSERT OR IGNORE INTO products (
        title, url, tea_type,
        body_sensation, eyes_dry_leaf, eyes_liquor, eyes_wet_leaf,
        mouth_finish, mouth_taste, mouth_texture,
        nose_dry_leaf, nose_empty_cup, nose_wet_leaf,
        cultivar, elevation, origin, picking_processing, season,
        gong_fu_1st_steep, gong_fu_grams_per_100ml, gong_fu_increase, gong_fu_number_of_steeps, gong_fu_water_temp_c, gong_fu_water_temp_f,
        western_1st_steep, western_grams_per_100ml, western_increase, western_number_of_steeps, western_water_temp_c, western_water_temp_f
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """
    cursor.execute(insert_query, values)
    conn.commit()

def main():
    # Get links
    link_extractor = LinkExtractor()
    links = link_extractor.get_filtered_links()
    
    if TEST_MODE:
        links = links[:5]
    
    # Create database
    conn = create_database()
    
    # Process each link
    data_extractor = DataExtractor()
    for url in links:
        try:
            data = data_extractor.get_product_tasting_notes(url)
            insert_product(conn, data, url)
            print(f"Inserted: {data.get('title', 'Unknown')}")
        except Exception as e:
            print(f"Error processing {url}: {e}")
    
    conn.close()
    print("Database creation complete.")

if __name__ == "__main__":
    main()