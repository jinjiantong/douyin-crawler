import zipfile
with zipfile.ZipFile('crawler.zip', 'r') as zf:
    zf.extractall('.')
print('Extraction completed')