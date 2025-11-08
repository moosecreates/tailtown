import sys
import json

data = json.load(sys.stdin)
reservations = data.get('data', {}).get('reservations', [])
total = data.get('pagination', {}).get('totalCount', 0)

print(f'Total in date range: {total}')
print(f'\nFirst 10 reservations:')
for r in reservations[:10]:
    resource_name = r.get('resource', {}).get('name', 'N/A')
    print(f'  {r["id"][:8]}... {r["startDate"][:10]} to {r["endDate"][:10]} Resource: {resource_name} Status: {r["status"]}')

# Check if all are on same resource
resource_ids = set()
for r in reservations:
    if r.get('resourceId'):
        resource_ids.add(r['resourceId'])

print(f'\nUnique resources used: {len(resource_ids)}')
if len(resource_ids) <= 3:
    print(f'Resource IDs: {list(resource_ids)}')
