import json
import os

with open("/Users/tannmaybaid/Desktop/Claude Projects/clat-gk-2026/data/static/generated_data.json", "r") as f:
    data = json.load(f)

topics = data["topics"]
passages = data["passages"]

# load topics_2
with open("/Users/tannmaybaid/Desktop/Claude Projects/clat-gk-2026/data/static/topics_2.json", "r") as f:
    topics_2 = json.load(f)

topics.extend(topics_2)

final_json = {
    "id": "legal-cases",
    "kind": "static",
    "label": "Landmark Supreme Court Judgments",
    "blurb": "A comprehensive compilation of landmark Supreme Court judgments that have shaped Indian constitutional law. These cases are essential for understanding the evolution of fundamental rights, basic structure, federalism, and judicial review.",
    "topics": topics,
    "passages": passages
}

output_path = "/Users/tannmaybaid/Desktop/Claude Projects/clat-gk-2026/data/static/legal-cases.json"
with open(output_path, "w") as f:
    json.dump(final_json, f, indent=2)

print(f"Successfully wrote {output_path} with {len(topics)} topics and {len(passages)} passages.")
