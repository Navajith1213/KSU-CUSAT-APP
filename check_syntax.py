import re

def check_unmatched():
    filepath = r"c:\Users\lenovo\Downloads\KSU CUSAT APP\v2.html"
    with open(filepath, "r", encoding="utf-8") as f:
        html = f.read()

    # Extract babel script content
    start_tag = '<script type="text/babel">'
    end_tag = '</script>'
    
    start_idx = html.find(start_tag)
    if start_idx == -1:
        print("Babel script tag not found")
        return
        
    code_start = start_idx + len(start_tag)
    end_idx = html.find(end_tag, code_start)
    if end_idx == -1:
        print("Closing script tag not found")
        return
        
    code = html[code_start:end_idx]
    
    # We want to trace curly braces, square brackets, parentheses
    # Let's count them and also keep a stack of positions to find unmatched ones.
    # To be accurate, we should ignore brackets inside comments and string literals (single/double quotes, backticks).
    
    stack = []
    in_string = None # None, 'single', 'double', 'backtick'
    in_comment = None # None, 'line', 'block'
    escape = False
    
    lines = code.split('\n')
    
    for line_num, line in enumerate(lines, 1):
        i = 0
        while i < len(line):
            char = line[i]
            
            # Handle comments
            if in_comment == 'line':
                # Line comment ends at the end of the line
                break
            elif in_comment == 'block':
                if i < len(line) - 1 and line[i:i+2] == '*/':
                    in_comment = None
                    i += 2
                    continue
                i += 1
                continue
                
            # Handle escape in strings
            if escape:
                escape = False
                i += 1
                continue
                
            # Handle strings
            if in_string:
                if char == '\\':
                    escape = True
                elif in_string == 'single' and char == "'":
                    in_string = None
                elif in_string == 'double' and char == '"':
                    in_string = None
                elif in_string == 'backtick' and char == '`':
                    in_string = None
                i += 1
                continue
                
            # Check comment start
            if i < len(line) - 1 and line[i:i+2] == '//':
                in_comment = 'line'
                break
            elif i < len(line) - 1 and line[i:i+2] == '/*':
                in_comment = 'block'
                i += 2
                continue
                
            # Check string start
            if char == "'":
                in_string = 'single'
                i += 1
                continue
            elif char == '"':
                in_string = 'double'
                i += 1
                continue
            elif char == '`':
                in_string = 'backtick'
                i += 1
                continue
                
            # Check brackets
            if char in '({[':
                stack.append((char, line_num, i + 1, line))
            elif char in ')}]':
                if not stack:
                    print(f"Extra closing bracket '{char}' at line {line_num}, col {i+1}:")
                    print(f"  {line.strip()}")
                else:
                    top_char, top_line, top_col, top_src = stack.pop()
                    matching = {'}': '{', ')': '(', ']': '['}
                    if matching[char] != top_char:
                        print(f"Mismatched bracket: opened '{top_char}' at line {top_line}, col {top_col} but closed with '{char}' at line {line_num}, col {i+1}:")
                        print(f"  Opened line: {top_src.strip()}")
                        print(f"  Closed line: {line.strip()}")
            i += 1
            
        if in_comment == 'line':
            in_comment = None

    # Print remaining open brackets in stack
    if stack:
        print(f"Unclosed brackets remaining ({len(stack)}):")
        for char, line_num, col, src in stack[-10:]: # print last 10
            print(f"  '{char}' opened at line {line_num}, col {col}:")
            print(f"    {src.strip()}")
    else:
        print("All brackets match correctly!")

if __name__ == '__main__':
    check_unmatched()
