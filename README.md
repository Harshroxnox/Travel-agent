# Travel Agent
This is a travel agent designed to handle your travel queries :)

# Setup Instructions
Clone the repo
```bash
git clone https://github.com/Harshroxnox/Travel-agent.git
```

Set environment variables from `sample.env`.<br> 
Just google for Ex:`How to get LANGSMITH_API_KEY`<br> 
Create virtual environment
```bash
python3 -m venv venv
```
```bash
source venv/bin/activate
```

Install dependencies
```bash
pip install -r requirements.txt
```
If this fails for some reason then use the minified requirements
```bash
pip install -r min_requirements.txt
```

Setup playwright/crawler(Crawl4AI)
```bash
crawl4ai-setup
```

Run the backend
```bash
fastapi dev app.py
```

Run the frontend
```bash
cd ui && npm install
```
```bash
npm run dev
```
Now you can use the chatbot at the given localhost link. <br>
Most likely: http://localhost:5173

# Other Things
## Langraph backend and studio startup for exploring chatbot
```bash
langgraph dev --allow-blocking
```

## Terminal based invoke 
Specify the input inside agent_stream function checkout `run.py`
```bash
python3 run.py
```

# Point of failures
- Plan a 5 day trip from Ludhiana to Washington DC
- What is my current place, date and time?
- What was my previous message?