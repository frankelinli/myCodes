---
id: 262
title: 批量自动填充多个模板文件vs
date: '2025-05-09T00:14:38'
author: haoye
categories:
  - notes
tags: []
---

制作一个excel表格，作为数据收集中心，所有用到的数据都填充到这个表格里。然后用python读取这个表格，执行批量替换模板文件里的占位符。

:::info

此为初版。问题很多。已经废弃不用。因为在word里查找文字、替换，是很不靠谱的。后来改为邮件合并

main.py

```
import pandas as pd
import os
import docx
from openpyxl import load_workbook
from data_readerv2 import read_data_from_excel

def replace_text_in_runs(runs, replacements):
    full_text = ''.join(run.text for run in runs)
    for key, value in replacements.items():
        if key in full_text:
            print(f"Replacing {key} with {value} in paragraph.")
            full_text = full_text.replace(key, value)
    for run in runs:
        run.text = ''  # 清空每个 run 的文本
    if len(runs) > 0:
        runs[0].text = full_text  # 将替换后的文本放入第一个 run 中

def replace_paragraph_placeholders(paragraphs, replacements):
    for paragraph in paragraphs:
        replace_text_in_runs(paragraph.runs, replacements)

def replace_table_placeholders(tables, replacements):
    for table in tables:
        for row in table.rows:
            for cell in row.cells:
                replace_paragraph_placeholders(cell.paragraphs, replacements)

def replace_header_footer_placeholders(headers_footers, replacements):
    for header_footer in headers_footers:
        replace_paragraph_placeholders(header_footer.paragraphs, replacements)
        replace_table_placeholders(header_footer.tables, replacements)

def replace_word_placeholders(template_path, output_path, replacements):
    doc = docx.Document(template_path)

    # Replace in body paragraphs
    replace_paragraph_placeholders(doc.paragraphs, replacements)

    # Replace in tables
    replace_table_placeholders(doc.tables, replacements)

    # Replace in headers and footers
    for section in doc.sections:
        replace_header_footer_placeholders([section.header], replacements)
        replace_header_footer_placeholders([section.footer], replacements)

    doc.save(output_path)

def replace_excel_placeholders(template_path, output_path, replacements):
    workbook = load_workbook(template_path)
    for sheet in workbook.worksheets:
        for row in sheet.iter_rows():
            for cell in row:
                if cell.value and isinstance(cell.value, str):
                    for key, value in replacements.items():
                        if key in cell.value:
                            print(f"Replacing {key} with {value} in cell {cell.coordinate}.")
                            cell.value = cell.value.replace(key, value)
    workbook.save(output_path)

# 获取当前工作目录
current_directory = os.getcwd()

# 检查 data.xlsx 文件是否存在
data_file = os.path.join(current_directory, 'data.xlsx')
all_replacements = read_data_from_excel(data_file)

for table_name, replacements in all_replacements.items():
    # 获取工厂名字作为动态目录名
    factory_name = replacements.get('{{工厂名字}}')
    print(f"Factory name: {factory_name}")

    if not factory_name:
        raise ValueError(f"工厂名字未找到，请检查 {table_name} 表中的数据。")

    # 定义模板目录
    template_directory = os.path.join(current_directory, '资料')

    # 扫描模板目录，排除临时文件
    word_files = []
    excel_files = []

    for root, _, files in os.walk(template_directory):
        for file in files:
            if file.endswith('.docx') or file.endswith('.doc'):
                if not file.startswith('~$'):
                    word_files.append(os.path.join(root, file))
            elif file.endswith('.xlsx') or file.endswith('.xls'):
                if not file.startswith('~$'):
                    excel_files.append(os.path.join(root, file))

    # 创建输出目录，使用工厂名字作为目录名
    output_directory = os.path.join(current_directory, factory_name)
    os.makedirs(output_directory, exist_ok=True)

    print(f"Output directory: {output_directory}")

    # 替换并保存Word文件
    for word_file in word_files:
        relative_path = os.path.relpath(word_file, template_directory)
        word_output_path = os.path.join(output_directory, relative_path)
        os.makedirs(os.path.dirname(word_output_path), exist_ok=True)
        print(f"Processing Word file: {word_file}")
        replace_word_placeholders(word_file, word_output_path, replacements)

    # 替换并保存Excel文件
    for excel_file in excel_files:
        relative_path = os.path.relpath(excel_file, template_directory)
        excel_output_path = os.path.join(output_directory, relative_path)
        os.makedirs(os.path.dirname(excel_output_path), exist_ok=True)
        print(f"Processing Excel file: {excel_file}")
        replace_excel_placeholders(excel_file, excel_output_path, replacements)

    print(f"所有文件已生成在目录: {output_directory}")
```

读取data.xlsx， data\_reader.py

```
import os
import pandas as pd

def read_data_from_excel(data_file):
    # 检查 data.xlsx 文件是否存在
    if not os.path.exists(data_file):
        raise FileNotFoundError(f"{data_file} 文件不存在。请检查文件路径。")

    # 读取中央数据表
    xls = pd.ExcelFile(data_file)

    # 创建一个字典来存储每个表的替换字典
    all_replacements = {}

    for sheet_name in xls.sheet_names:
        df = pd.read_excel(xls, sheet_name=sheet_name)

        # 假设每个表格块之间有空行隔开
        is_table = False
        table_name = None
        table_data = []

        for index, row in df.iterrows():
            if not row.dropna().empty:
                if not is_table:
                    # 开始一个新的表
                    table_name = row[0]
                    is_table = True
                else:
                    # 收集表数据
                    table_data.append(row)
            else:
                # 空行表示当前表结束
                if is_table:
                    is_table = False
                    if table_data:
                        # 将表数据转换成DataFrame
                        table_df = pd.DataFrame(table_data)
                        table_df.columns = table_df.iloc[0]
                        table_df = table_df[1:]

                        # 动态创建替换字典
                        replacements = {f'{{{{{column}}}}}': str(value) for column, value in table_df.iloc[0].items()}
                        all_replacements[table_name] = replacements
                    table_data = []

    # 打印所有替换字典用于调试
    print("All replacements dictionaries:")
    for table_name, replacements in all_replacements.items():
        print(f"{table_name}:")
        print(replacements)

    return all_replacements
```
