import re

def strip_code_fences(text: str) -> str:
    # Remove leading fence
    text = re.sub(r"^```[a-zA-Z0-9]*\n?", "", text.strip())

    # Remove trailing fence
    text = re.sub(r"```$", "", text.strip())

    return text.strip()