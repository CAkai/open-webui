import json

from fetch.models import Stats

d = json.load(open("ex.json"))
# print(d)
# print(d['chat'])
# print(d['chat']['chat'])
# print(d['chat']['chat']['history']['messages']['content'])
y = d['chat']['chat']['messages'][0]['content']
d.get('chat')
print(y)

