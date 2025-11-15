# Travel Agent
This is a travel agent designed to handle your travel queries :)

# Setup Instructions
Clone the repo
```bash
git clone https://github.com/Harshroxnox/Travel-agent.git
```

Set environment variables. Create virtual environment
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

Run 
UI based
```bash
langgraph dev
```
OR Terminal based. Specify the input inside agent_stream function
```bash
python3 app.py
```

# Point of failures
- What is my current place, date and time?
- What was my previous message?
- What are your features?