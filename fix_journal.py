with open('src/pages/Journal.tsx', 'r') as f:
    content = f.read()

import re

# Fix screenshot URLs
old_ss = """      let sbUrl = null, sdUrl = null, saUrl = null;
      if (screenshotBeforeFile) sbUrl = await uploadScreenshot(screenshotBeforeFile, user.id);
      if (screenshotDuringFile) sdUrl = await uploadScreenshot(screenshotDuringFile, user.id);
      if (screenshotAfterFile) saUrl = await uploadScreenshot(screenshotAfterFile, user.id);"""

new_ss = """      const existingTrade = editingTradeId ? trades.find(t => t.id === editingTradeId) : null;
      let sbUrl = existingTrade ? existingTrade.screenshotBefore : null;
      let sdUrl = existingTrade ? existingTrade.screenshotDuring : null;
      let saUrl = existingTrade ? existingTrade.screenshotAfter : null;
      
      if (screenshotBeforeFile) sbUrl = await uploadScreenshot(screenshotBeforeFile, user.id);
      if (screenshotDuringFile) sdUrl = await uploadScreenshot(screenshotDuringFile, user.id);
      if (screenshotAfterFile) saUrl = await uploadScreenshot(screenshotAfterFile, user.id);"""

content = content.replace(old_ss, new_ss)

# Fix tags array
content = content.replace(
    'strategy, timeframe, session, tags, emotion_before: emotionBefore',
    'strategy, timeframe, session, tags: tags ? tags.split(\',\').map(t => t.trim()).filter(Boolean) : [], emotion_before: emotionBefore'
)

with open('src/pages/Journal.tsx', 'w') as f:
    f.write(content)
