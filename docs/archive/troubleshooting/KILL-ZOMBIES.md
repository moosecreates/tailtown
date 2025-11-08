# Quick Zombie Process Cleanup

## Manual Kill Commands (Run in Terminal)

```bash
# Kill all ts-node-dev processes
pkill -9 -f "ts-node-dev"

# Kill all react-scripts processes  
pkill -9 -f "react-scripts"

# Kill by port if needed
lsof -ti :4004 | xargs kill -9 2>/dev/null
lsof -ti :4003 | xargs kill -9 2>/dev/null
lsof -ti :3000 | xargs kill -9 2>/dev/null
lsof -ti :3001 | xargs kill -9 2>/dev/null
```

## Restart Servers

```bash
# Terminal 1 - Customer Service
cd services/customer
source ~/.nvm/nvm.sh
PORT=4004 npm run dev

# Terminal 2 - Reservation Service
cd services/reservation-service
source ~/.nvm/nvm.sh
PORT=4003 npm run dev

# Terminal 3 - Frontend
cd frontend
source ~/.nvm/nvm.sh
npm start
```

## Check for Zombies

```bash
# Count zombie processes
ps aux | grep -E "(ts-node-dev|react-scripts)" | grep -v grep | wc -l

# List them
ps aux | grep -E "(ts-node-dev|react-scripts)" | grep -v grep
```
