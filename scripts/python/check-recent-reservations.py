import sys
import json

data = json.load(sys.stdin)
reservations = data.get('data', {}).get('reservations', [])
total = data.get('pagination', {}).get('totalCount', 0)

print(f'Total reservations: {total}')
print('\nMost recent 5:')
for r in reservations[:5]:
    resource_name = r.get('resource', {}).get('name', 'N/A')
    pet_name = r.get('pet', {}).get('name', 'N/A')
    created = r['createdAt'][:19]
    print(f'  Created: {created} - Resource: {resource_name} - Pet: {pet_name}')
