import sys
import json
from collections import Counter

data = json.load(sys.stdin)
reservations = data.get('data', {}).get('reservations', [])

resources = [r.get('resource', {}).get('name', 'Unknown') for r in reservations]
counter = Counter(resources)

print(f'Total reservations checked: {len(reservations)}')
print(f'Unique kennels used: {len(counter)}')
print('\nKennel distribution:')
for name, count in counter.most_common(20):
    print(f'  {name}: {count}')
