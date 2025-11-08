import sys
import json
from collections import Counter

data = json.load(sys.stdin)
reservations = data.get('data', {}).get('reservations', [])

# Find imported reservations (those with externalId from Gingr)
imported = [r for r in reservations if r.get('externalId')]

print(f'Total reservations: {len(reservations)}')
print(f'Imported (have externalId): {len(imported)}')

if imported:
    print(f'\nResource distribution for imported reservations:')
    resource_names = [r.get('resource', {}).get('name', 'Unknown') for r in imported]
    counter = Counter(resource_names)
    for name, count in counter.most_common(10):
        print(f'  {name}: {count}')
    
    print(f'\nSample imported reservation:')
    sample = imported[0]
    print(f'  ID: {sample["id"][:8]}...')
    print(f'  External ID: {sample.get("externalId", "N/A")}')
    print(f'  Resource: {sample.get("resource", {}).get("name", "N/A")}')
    print(f'  Date: {sample["startDate"][:10]} to {sample["endDate"][:10]}')
    print(f'  Status: {sample["status"]}')
