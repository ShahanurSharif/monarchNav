#!/usr/bin/env python3

import os
import json
import pandas as pd
from office365.sharepoint.client_context import ClientContext
from office365.runtime.auth.client_credential import ClientCredential

def get_env(var, required=True):
    val = os.getenv(var)
    if required and not val:
        raise Exception(f"Missing required environment variable: {var}")
    return val

def read_excel_data(excel_file):
    try:
        df = pd.read_excel(excel_file)
    except Exception:
        df = pd.read_csv(excel_file.replace('.xlsx', '.csv'))
    return df.fillna('')

def build_navigation_items(df):
    items = []
    parent_items = df[df['parent_name'].str.strip() == '']
    all_parent_names = set(df['parent_name'].str.strip())
    all_parent_names.discard('')
    all_item_names = set(df['name'].str.strip())
    missing_parents = all_parent_names - all_item_names

    for _, row in parent_items.iterrows():
        parent_item = {
            "name": row['name'],
            "link": row['link'],
            "target": row['target'] if row['target'] else "_self",
            "description": row['description'] if row['description'] else ""
        }
        children = df[df['parent_name'].str.strip() == row['name'].strip()]
        if len(children) > 0:
            parent_item['children'] = []
            for _, child_row in children.iterrows():
                child_item = {
                    "name": child_row['name'],
                    "link": child_row['link'],
                    "target": child_row['target'] if child_row['target'] else "_self",
                    "description": child_row['description'] if child_row['description'] else ""
                }
                parent_item['children'].append(child_item)
        items.append(parent_item)
    for missing_parent in missing_parents:
        parent_item = {
            "name": missing_parent,
            "link": "",
            "target": "_self",
            "description": ""
        }
        children = df[df['parent_name'].str.strip() == missing_parent.strip()]
        if len(children) > 0:
            parent_item['children'] = []
            for _, child_row in children.iterrows():
                child_item = {
                    "name": child_row['name'],
                    "link": child_row['link'],
                    "target": child_row['target'] if child_row['target'] else "_self",
                    "description": child_row['description'] if child_row['description'] else ""
                }
                parent_item['children'].append(child_item)
        items.append(parent_item)
    return items

def main():
    # Load config from environment/pipeline vars
    TENANT_URL = get_env('SHAREPOINT_TENANT')
    SITE_PATH = get_env('SHAREPOINT_SITE_PATH', False) or "/sites/shan"
    SITE_URL = TENANT_URL + SITE_PATH
    CLIENT_ID = get_env('SHAREPOINT_CLIENT_ID')
    CLIENT_SECRET = get_env('SHAREPOINT_CLIENT_SECRET')
    FILE_PATH = get_env('SHAREPOINT_FILE_PATH', False) or "SiteAssets/monarchNavConfig.json"
    EXCEL_FILE = get_env('EXCEL_FILE', False) or "sample_top_nav.xlsx"
    OUTPUT_FILE = get_env('OUTPUT_FILE', False) or "updated_monarchNavConfig.json"

    # Auth as App-Only
    ctx = ClientContext(SITE_URL).with_credentials(ClientCredential(CLIENT_ID, CLIENT_SECRET))

    # Download JSON from SharePoint
    print("Downloading current JSON from SharePoint...")
    file = ctx.web.get_file_by_server_relative_url(FILE_PATH)
    ctx.load(file)
    ctx.execute_query()
    import io
    file_stream = io.BytesIO()
    file.download(file_stream)
    ctx.execute_query()
    file_stream.seek(0)
    content = file_stream.read().decode('utf-8')
    current_json = json.loads(content)
    print("✅ Downloaded monarchNavConfig.json")

    # Build items from Excel
    df = read_excel_data(EXCEL_FILE)
    new_items = build_navigation_items(df)

    # Update only 'items' property
    current_json['items'] = new_items

    # Save for artifact/debug
    with open(OUTPUT_FILE, 'w') as f:
        json.dump(current_json, f, indent=2)
    print(f"✅ Saved updated JSON to {OUTPUT_FILE}")

    # Upload back to SharePoint
    print("Uploading JSON to SharePoint...")
    target_folder = ctx.web.get_folder_by_server_relative_url(os.path.dirname(FILE_PATH))
    ctx.load(target_folder)
    ctx.execute_query()
    file_content = json.dumps(current_json, indent=2).encode('utf-8')
    target_folder.upload_file(os.path.basename(FILE_PATH), file_content).execute_query()
    print("✅ Uploaded updated monarchNavConfig.json to SharePoint")

if __name__ == "__main__":
    main()
