import os

files_to_fix = [
    'src/components/Admin/Forms.jsx',
    'src/components/DepartmentDashboard.jsx'
]

for filepath in files_to_fix:
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    content = content.replace('<BorderGlow className="card">', '<div className="admin-flat-card">')
    content = content.replace('<BorderGlow className="card" style={{ display: \'flex\', flexDirection: \'column\' }}>', '<div className="admin-flat-card" style={{ display: \'flex\', flexDirection: \'column\' }}>')
    
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)

print('Fixed!')
