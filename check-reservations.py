import sys
import json

data = json.load(sys.stdin)
reservations = data.get('data', {}).get('reservations', [])
recent = reservations[:20]

print('Recent 20 reservations:')
for r in recent:
    res_id = r.get('resourceId', 'NONE')
    res_display = res_id[:8] if res_id and res_id != 'NONE' else 'NONE'
    print(f"  {r['id'][:8]}... Start: {r['startDate'][:10]} Resource: {res_display} Status: {r['status']}")

no_resource = [r for r in reservations if not r.get('resourceId')]
print(f'\nReservations without resourceId: {len(no_resource)} / {len(reservations)}')
