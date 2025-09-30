import datetime
import os

def create_markdown():
    now = datetime.datetime.now()
    filename = now.strftime("%Y-%m-%d-%H%M%S") + ".md"
    yaml_header = """---
title: 
slug: 
categories:
  - notes
tags: []
---

"""
    with open(filename, "w", encoding="utf-8") as f:
        f.write(yaml_header)
    print(f"已创建文件: {filename}")

if __name__ == "__main__":
    create_markdown()