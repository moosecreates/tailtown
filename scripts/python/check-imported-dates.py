import sys
import json
from datetime import datetime

data = json.load(sys.stdin)
reservations = data.get('data', {}).get('reservations', [])
imported = [r for r in reservations if r.get('externalId')]

print(f'Total reservations: {len(reservations)}')
print(f'Imported (with externalId): {len(imported)}')

if imported:
    dates = [datetime.fromisoformat(r['startDate'].replace('Z', '+00:00')) for r in imported]
    print(f'Date range: {min(dates).date()} to {max(dates).date()}')
    
    print(f'\nFirst 10 imported reservations:')
    for r in imported[:10]:
        resource_name = r.get('resource', {}).get('name', 'N/A')
        print(f'  {r["startDate"][:10]} to {r["endDate"][:10]} - Resource: {resource_name} - Status: {r["status"]}')
    
    # Check resource distribution
    from collections import Counter
    resources = [r.get('resource', {}).get('name', 'Unknown') for r in imported]
    counter = Counter(resources)
    print(f'\nResource distribution (top 5):')
    for name, count in counter.most_common(5):
        print(f'  {name}: {count} reservations')
