from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import simpy, random

app = FastAPI()

# Allow JS fetch (if you later access APIs directly from browser)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# -------------------
# Simulation Classes
# -------------------
class Train:
    def __init__(self, env, train_id, train_type, priority, speed, entry_time, blocks, log):
        self.env = env
        self.id = train_id
        self.type = train_type
        self.priority = priority
        self.speed = speed
        self.entry_time = entry_time
        self.blocks = blocks
        self.log = log
        self.action = env.process(self.run())

    def run(self):
        yield self.env.timeout(self.entry_time)
        for i, block in enumerate(self.blocks):
            with block.request() as req:
                yield req
                travel_time = random.uniform(2, 4) * (60 / self.speed)
                start = self.env.now
                yield self.env.timeout(travel_time)
                end = self.env.now
                self.log.append({
                    "train": self.id,
                    "block": i+1,
                    "start": round(start, 2),
                    "end": round(end, 2)
                })

def simulate():
    env = simpy.Environment()
    blocks = [simpy.Resource(env, capacity=1) for _ in range(3)]
    log = []

    trains = [
        Train(env, "T1", "Express", 1, 60, 0, blocks, log),
        Train(env, "T2", "Freight", 3, 40, 2, blocks, log),
        Train(env, "T3", "Passenger", 2, 50, 4, blocks, log),
    ]

    env.run(until=50)
    return log

def calculate_metrics(log):
    trains = set(entry["train"] for entry in log)
    total_trains = len(trains)

    delays = {train: 0 for train in trains}
    for entry in log:
        delays[entry["train"]] += (entry["end"] - entry["start"])

    avg_delay = round(sum(delays.values()) / len(trains), 2) if trains else 0

    return {
        "active_trains": total_trains,
        "on_time": random.randint(70, 100),
        "avg_speed": random.randint(50, 90),
        "efficiency": random.randint(70, 95),
        "avg_delay": avg_delay,
        "alerts": [
            "Congestion detected near Block 2",
            "Express T1 given priority over Freight T2"
        ]
    }

# -------------------
# API Endpoints
# -------------------
@app.get("/metrics")
def get_metrics():
    log = simulate()
    metrics = calculate_metrics(log)
    return metrics

@app.get("/timeline")
def get_timeline():
    log = simulate()
    return {"timeline": log}

# -------------------
# Serve Frontend
# -------------------
# Put your index.html, style.css, script.js inside a "frontend" folder
app.mount("/", StaticFiles(directory="frontend", html=True), name="frontend")