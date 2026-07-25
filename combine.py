import json
import os

def main():
    base_dir = "/Users/tannmaybaid/Desktop/Claude Projects/clat-gk-2026/data/static"
    topics = []
    for i in range(1, 6):
        file_path = os.path.join(base_dir, f"topics_{i}.json")
        try:
            with open(file_path, "r") as f:
                data = json.load(f)
                topics.extend(data)
        except Exception as e:
            print(f"Error reading {file_path}: {e}")

    passages = []
    for i in range(1, 3):
        file_path = os.path.join(base_dir, f"passages_{i}.json")
        try:
            with open(file_path, "r") as f:
                data = json.load(f)
                passages.extend(data)
        except Exception as e:
            print(f"Error reading {file_path}: {e}")

    final_json = {
        "id": "legal-cases",
        "kind": "static",
        "label": "Landmark Supreme Court Judgments",
        "blurb": "A comprehensive compilation of landmark Supreme Court judgments that have shaped Indian constitutional law. These cases are essential for understanding the evolution of fundamental rights, basic structure, federalism, and judicial review.",
        "topics": topics,
        "passages": passages
    }

    output_path = os.path.join(base_dir, "legal-cases.json")
    with open(output_path, "w") as f:
        json.dump(final_json, f, indent=2)
    print(f"Successfully wrote {output_path} with {len(topics)} topics and {len(passages)} passages.")

if __name__ == "__main__":
    main()
