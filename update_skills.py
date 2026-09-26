import re

with open('skills.html', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Image extensions
content = content.replace('linecalapp-bx03_1.png', 'linecalapp-bx03_1.jpg')
content = content.replace('linecalapp-bx04_1.png', 'linecalapp-bx04_1.jpg')

# 2. Card 19 text
content = content.replace('アッパー構造・各画面のUI設計', '画面の構造・各画面のUI設計')

# 3. Global replacement of caption
content = content.replace('※機密保持の観点から、縮小を行っています。各ケースの詳細は、ご面談の際紹介します。', '※機密保持の観点から、一部縮小を行っています。各ケースの詳細は、ご面談の際紹介します。')

# 4. Remove caption from Card 3, 4, 5, 14
# Card 3 is linecalapp-bx03, Card 4 is linecalapp-bx04, Card 5 is linecalapp-bx05
# Card 14 is ymail-bx01
def remove_caption_near(content, image_name):
    # Find the image tag, then find the following caption and remove it
    idx = content.find(image_name)
    if idx != -1:
        start_caption = content.find('<p class="gallery-caption">※機密保持の観点から', idx)
        if start_caption != -1 and start_caption - idx < 500: # Ensure it's close
            end_caption = content.find('</p>', start_caption) + 4
            # Also remove leading spaces/newlines if needed
            while content[start_caption-1] in (' ', '\t', '\n'):
                start_caption -= 1
            content = content[:start_caption] + content[end_caption:]
    return content

content = remove_caption_near(content, 'linecalapp-bx03_1.jpg')
content = remove_caption_near(content, 'linecalapp-bx04_1.jpg')
content = remove_caption_near(content, 'linecalapp-bx05_1.png')
content = remove_caption_near(content, 'ymail-bx01_1.JPG')

with open('skills.html', 'w', encoding='utf-8') as f:
    f.write(content)
